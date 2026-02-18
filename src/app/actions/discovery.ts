/**
 * @module actions/discovery
 * @description Server Actions for the Collaborative Discovery Mode.
 * 
 * This module handles the multi-turn conversation flow between the user and AI agent
 * to refine raw startup ideas, assess founder-fit, and generate optimized research prompts.
 * 
 * @purpose Enables a structured discovery process before research/validation begins.
 * @dependencies OpenAI API, Supabase, Zod for validation
 * @role Processes discovery conversations and manages session state in the database.
 */

'use server';

import OpenAI from 'openai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import {
    DISCOVERY_SYSTEM_PROMPT,
    PHASE_PROMPTS,
    DISCOVERY_WELCOME_MESSAGE,
    SYNTHESIS_OUTPUT_SCHEMA,
    PHASE_TRANSITION_SIGNALS,
    DISCOVERY_PHASES,
    type DiscoveryPhase
} from '@/config/discoveryPrompts';

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Message schema for conversation history.
 */
const messageSchema = z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.string()
});

/**
 * Schema for founder-fit assessment data.
 */
const founderFitSchema = z.object({
    technicalSkills: z.object({
        has: z.array(z.string()),
        needs: z.array(z.string())
    }),
    domainExpertise: z.string(),
    resources: z.object({
        time: z.string(),
        capital: z.string(),
        network: z.string()
    }),
    motivation: z.string(),
    learningPath: z.array(z.string()),
    hireRecommendations: z.array(z.string())
});

/**
 * Discovery session schema for database records.
 */
const sessionSchema = z.object({
    id: z.string().uuid(),
    idea_id: z.string().uuid().nullable(),
    user_id: z.string().uuid(),
    messages: z.array(messageSchema),
    current_phase: z.string(),
    founder_fit: founderFitSchema.nullable(),
    refined_prompt: z.any().nullable(),
    status: z.string(),
    created_at: z.string(),
    completed_at: z.string().nullable()
});

type DiscoverySession = z.infer<typeof sessionSchema>;
type Message = z.infer<typeof messageSchema>;

/**
 * Creates an OpenAI client with the provided or default configuration.
 * 
 * Uses environment variables for API configuration, allowing override
 * via the config parameter for user-specific settings.
 * 
 * @param config - Optional configuration for API key, base URL, and model
 * @returns Configured OpenAI client and model name
 */
function getAIClient(config?: { apiKey?: string; baseURL?: string; model?: string }) {
    const aiConfig = {
        apiKey: config?.apiKey || process.env.AI_API_KEY || process.env.OPENAI_API_KEY,
        baseURL: config?.baseURL || process.env.AI_BASE_URL || "https://api.openai.com/v1",
        model: config?.model || process.env.AI_MODEL || "gpt-4o"
    };

    const client = new OpenAI({
        apiKey: aiConfig.apiKey,
        baseURL: aiConfig.baseURL
    });

    return { client, model: aiConfig.model };
}

/**
 * Starts a new discovery session for a user.
 * 
 * Initializes a fresh conversation with the welcome message and stores
 * the session in the database. Can optionally be linked to an existing idea.
 * 
 * @param userId - The authenticated user's ID
 * @param ideaId - Optional ID of an existing idea to run discovery on
 * @param initialIdea - Optional initial idea text if starting fresh
 * @returns The created session with the welcome message
 * @keyTechnologies Supabase, Database Operations
 */
export async function startDiscoverySession(
    userId: string,
    ideaId?: string,
    initialIdea?: { title: string; description: string }
) {
    const welcomeMessage: Message = {
        role: 'assistant',
        content: DISCOVERY_WELCOME_MESSAGE,
        timestamp: new Date().toISOString()
    };

    const { data: session, error } = await supabaseAdmin
        .from('discovery_sessions')
        .insert({
            user_id: userId,
            idea_id: ideaId || null,
            messages: [welcomeMessage],
            current_phase: DISCOVERY_PHASES.VISION,
            status: 'active'
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to create discovery session:', error);
        throw new Error('Failed to start discovery session');
    }

    // If there's an initial idea, we'll include it in the return for context
    return {
        session,
        welcomeMessage: welcomeMessage.content,
        initialIdea
    };
}

/**
 * Sends a user message and gets the AI's response.
 * 
 * This is the core conversation handler. It:
 * 1. Adds the user message to the session
 * 2. Builds the conversation context
 * 3. Gets AI response based on current phase
 * 4. Detects phase transitions
 * 5. Updates the session state
 * 
 * @param sessionId - The discovery session ID
 * @param userMessage - The user's message content
 * @param config - Optional AI configuration overrides
 * @returns AI response, updated phase, and any generated outputs
 * @keyTechnologies OpenAI Chat Completions, Multi-turn Conversation
 */
export async function sendDiscoveryMessage(
    sessionId: string,
    userMessage: string,
    config?: { apiKey?: string; baseURL?: string; model?: string }
) {
    // Fetch current session
    const { data: session, error: fetchError } = await supabaseAdmin
        .from('discovery_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

    if (fetchError || !session) {
        throw new Error('Session not found');
    }

    const currentPhase = session.current_phase as DiscoveryPhase;
    const messages: Message[] = session.messages || [];

    // Add user message
    const userMsg: Message = {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
    };
    messages.push(userMsg);

    // Build AI prompt with phase context
    const { client, model } = getAIClient(config);

    const systemPrompt = `${DISCOVERY_SYSTEM_PROMPT}\n\n${PHASE_PROMPTS[currentPhase]}`;

    // Convert to OpenAI message format
    const openAIMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content
        }))
    ];

    // Handle synthesis phase specially - request JSON output
    const isSynthesis = currentPhase === DISCOVERY_PHASES.SYNTHESIS;

    try {
        const response = await client.chat.completions.create({
            model,
            messages: openAIMessages,
            ...(isSynthesis && { response_format: { type: 'json_object' } })
        });

        const aiContent = response.choices[0].message.content || 'I apologize, I encountered an issue. Could you repeat that?';

        // Add AI response to messages
        const aiMsg: Message = {
            role: 'assistant',
            content: aiContent,
            timestamp: new Date().toISOString()
        };
        messages.push(aiMsg);

        // Detect phase transition
        let nextPhase = currentPhase;
        let synthesisOutput = null;

        if (isSynthesis) {
            // Parse the JSON output
            try {
                synthesisOutput = JSON.parse(aiContent);
                nextPhase = DISCOVERY_PHASES.COMPLETE;
            } catch {
                console.error('Failed to parse synthesis output');
            }
        } else {
            nextPhase = detectPhaseTransition(currentPhase, aiContent);
        }

        // Update session
        const updateData: Record<string, unknown> = {
            messages,
            current_phase: nextPhase
        };

        if (synthesisOutput) {
            updateData.refined_prompt = synthesisOutput.fullPrompt || synthesisOutput;
            updateData.founder_fit = synthesisOutput.founderFit;
            updateData.status = 'completed';
            updateData.completed_at = new Date().toISOString();
        }

        const { error: updateError } = await supabaseAdmin
            .from('discovery_sessions')
            .update(updateData)
            .eq('id', sessionId);

        if (updateError) {
            console.error('Failed to update session:', updateError);
        }

        return {
            response: aiContent,
            currentPhase: nextPhase,
            isComplete: nextPhase === DISCOVERY_PHASES.COMPLETE,
            synthesisOutput,
            messageCount: messages.length
        };
    } catch (error) {
        console.error('AI request failed:', error);
        throw new Error('Failed to process message');
    }
}

/**
 * Detects if the AI's response signals a phase transition.
 * 
 * Scans the AI response for predefined transition signals that indicate
 * readiness to move to the next discovery phase.
 * 
 * @param currentPhase - The current discovery phase
 * @param aiResponse - The AI's latest response
 * @returns The next phase (same as current if no transition detected)
 */
function detectPhaseTransition(currentPhase: DiscoveryPhase, aiResponse: string): DiscoveryPhase {
    const lowerResponse = aiResponse.toLowerCase();

    if (currentPhase === DISCOVERY_PHASES.VISION) {
        for (const signal of PHASE_TRANSITION_SIGNALS.vision_to_gaps) {
            if (lowerResponse.includes(signal.toLowerCase())) {
                return DISCOVERY_PHASES.GAPS;
            }
        }
    }

    if (currentPhase === DISCOVERY_PHASES.GAPS) {
        for (const signal of PHASE_TRANSITION_SIGNALS.gaps_to_founder_fit) {
            if (lowerResponse.includes(signal.toLowerCase())) {
                return DISCOVERY_PHASES.FOUNDER_FIT;
            }
        }
    }

    if (currentPhase === DISCOVERY_PHASES.FOUNDER_FIT) {
        for (const signal of PHASE_TRANSITION_SIGNALS.founder_fit_to_synthesis) {
            if (lowerResponse.includes(signal.toLowerCase())) {
                return DISCOVERY_PHASES.SYNTHESIS;
            }
        }
    }

    return currentPhase;
}

/**
 * Fetches an existing discovery session by ID.
 * 
 * Used when resuming a session or displaying session history.
 * 
 * @param sessionId - The discovery session ID
 * @returns The session data or null if not found
 */
export async function getDiscoverySession(sessionId: string) {
    const { data, error } = await supabaseAdmin
        .from('discovery_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

    if (error) {
        console.error('Failed to fetch session:', error);
        return null;
    }

    return data as DiscoverySession;
}

/**
 * Fetches active discovery sessions for a user.
 * 
 * Returns sessions that are still in progress, ordered by most recent.
 * 
 * @param userId - The user's ID
 * @returns Array of active sessions
 */
export async function getActiveDiscoverySessions(userId: string) {
    const { data, error } = await supabaseAdmin
        .from('discovery_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to fetch active sessions:', error);
        return [];
    }

    return data as DiscoverySession[];
}

/**
 * Manually advances the discovery phase.
 * 
 * Allows users to skip ahead or the system to force progression
 * when the AI doesn't naturally signal a transition.
 * 
 * @param sessionId - The discovery session ID
 * @param targetPhase - The phase to advance to
 * @returns Updated session data
 */
export async function advanceDiscoveryPhase(sessionId: string, targetPhase: DiscoveryPhase) {
    const { data, error } = await supabaseAdmin
        .from('discovery_sessions')
        .update({ current_phase: targetPhase })
        .eq('id', sessionId)
        .select()
        .single();

    if (error) {
        throw new Error('Failed to advance phase');
    }

    return data;
}

/**
 * Skips the discovery process and marks session as skipped.
 * 
 * For users who want to proceed directly to research without
 * completing the full discovery conversation.
 * 
 * @param sessionId - The discovery session ID
 * @returns Updated session data
 */
export async function skipDiscovery(sessionId: string) {
    const { data, error } = await supabaseAdmin
        .from('discovery_sessions')
        .update({
            status: 'skipped',
            completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

    if (error) {
        throw new Error('Failed to skip discovery');
    }

    return data;
}

/**
 * Gets the synthesis output (TL;DR and full prompt) from a completed session.
 * 
 * Retrieves the refined prompt and founder-fit assessment generated
 * at the end of successful discovery conversations.
 * 
 * @param sessionId - The discovery session ID
 * @returns Synthesis output or null if not available
 */
export async function getSessionSummary(sessionId: string) {
    const session = await getDiscoverySession(sessionId);

    if (!session || session.status !== 'completed') {
        return null;
    }

    return {
        tldr: session.refined_prompt?.tldr || null,
        fullPrompt: session.refined_prompt || null,
        founderFit: session.founder_fit || null,
        messageCount: session.messages?.length || 0
    };
}

/**
 * Forces synthesis generation for a session.
 * 
 * Useful when you want to generate the research prompt without
 * waiting for the AI to naturally transition. Takes all conversation
 * context and generates the structured output.
 * 
 * @param sessionId - The discovery session ID
 * @param config - Optional AI configuration
 * @returns Generated synthesis output
 */
export async function forceSynthesis(
    sessionId: string,
    config?: { apiKey?: string; baseURL?: string; model?: string }
) {
    const session = await getDiscoverySession(sessionId);
    if (!session) {
        throw new Error('Session not found');
    }

    const { client, model } = getAIClient(config);

    const synthesisPrompt = `${DISCOVERY_SYSTEM_PROMPT}

Based on the following conversation, generate a comprehensive output following this exact JSON schema:
${SYNTHESIS_OUTPUT_SCHEMA}

CONVERSATION:
${session.messages.map((m: Message) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}`;

    try {
        const response = await client.chat.completions.create({
            model,
            messages: [{ role: 'user', content: synthesisPrompt }],
            response_format: { type: 'json_object' }
        });

        const output = JSON.parse(response.choices[0].message.content || '{}');

        // Update session with synthesis
        await supabaseAdmin
            .from('discovery_sessions')
            .update({
                refined_prompt: output.fullPrompt || output,
                founder_fit: output.founderFit,
                current_phase: DISCOVERY_PHASES.COMPLETE,
                status: 'completed',
                completed_at: new Date().toISOString()
            })
            .eq('id', sessionId);

        return output;
    } catch (error) {
        console.error('Synthesis failed:', error);
        throw new Error('Failed to generate synthesis');
    }
}
