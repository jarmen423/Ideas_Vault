/**
 * @module scripts/testDiscoveryPrompts
 * @description Test script for iterating on discovery prompts locally.
 * 
 * Run this script to simulate the discovery conversation flow with mock responses.
 * Use it to refine prompts in src/config/discoveryPrompts.ts before testing in the app.
 * 
 * @usage npx tsx scripts/testDiscoveryPrompts.ts
 * @purpose Enables rapid prompt iteration without full app deployment.
 */

import OpenAI from 'openai';
import * as readline from 'readline';
import {
    DISCOVERY_SYSTEM_PROMPT,
    PHASE_PROMPTS,
    DISCOVERY_WELCOME_MESSAGE,
    PHASE_TRANSITION_SIGNALS,
    DISCOVERY_PHASES,
    type DiscoveryPhase
} from '../src/config/discoveryPrompts';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: process.env.AI_BASE_URL || 'https://api.openai.com/v1'
});

const MODEL = process.env.AI_MODEL || 'gpt-4o';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

/**
 * Detects phase transition based on AI response.
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
 * Main interactive test loop.
 */
async function runDiscoveryTest() {
    console.log('\n🧪 Discovery Prompt Tester');
    console.log('═'.repeat(50));
    console.log('This script simulates the discovery conversation flow.');
    console.log('Type your messages as the user would, or use these commands:');
    console.log('  /phase     - Show current phase');
    console.log('  /advance   - Force advance to next phase');
    console.log('  /history   - Show conversation history');
    console.log('  /quit      - Exit the test');
    console.log('═'.repeat(50));

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let currentPhase: DiscoveryPhase = DISCOVERY_PHASES.VISION;
    const messages: Message[] = [];

    // Show welcome message
    console.log('\n🤖 Assistant:');
    console.log(DISCOVERY_WELCOME_MESSAGE);
    console.log();

    messages.push({
        role: 'assistant',
        content: DISCOVERY_WELCOME_MESSAGE
    });

    const prompt = (query: string): Promise<string> => {
        return new Promise(resolve => rl.question(query, resolve));
    };

    const phaseLabels: Record<DiscoveryPhase, string> = {
        vision: '💡 Vision Extraction',
        gaps: '🎯 Gap Analysis',
        founder_fit: '👤 Founder Fit',
        synthesis: '✨ Synthesis',
        complete: '✅ Complete'
    };

    while (true) {
        const userInput = await prompt(`\n[${phaseLabels[currentPhase]}] You: `);

        if (userInput.startsWith('/')) {
            const command = userInput.slice(1).toLowerCase();

            if (command === 'quit' || command === 'q') {
                console.log('\n👋 Goodbye!');
                rl.close();
                break;
            }

            if (command === 'phase') {
                console.log(`\n📍 Current Phase: ${phaseLabels[currentPhase]}`);
                continue;
            }

            if (command === 'advance') {
                const phases: DiscoveryPhase[] = ['vision', 'gaps', 'founder_fit', 'synthesis', 'complete'];
                const currentIndex = phases.indexOf(currentPhase);
                if (currentIndex < phases.length - 1) {
                    currentPhase = phases[currentIndex + 1];
                    console.log(`\n⏩ Advanced to: ${phaseLabels[currentPhase]}`);
                } else {
                    console.log('\n⚠️ Already at final phase');
                }
                continue;
            }

            if (command === 'history') {
                console.log('\n📜 Conversation History:');
                for (const msg of messages) {
                    const prefix = msg.role === 'user' ? '👤 You' : '🤖 AI';
                    console.log(`\n${prefix}:`);
                    console.log(msg.content.slice(0, 200) + (msg.content.length > 200 ? '...' : ''));
                }
                continue;
            }

            console.log('❓ Unknown command. Use /quit, /phase, /advance, or /history');
            continue;
        }

        // Add user message
        messages.push({
            role: 'user',
            content: userInput
        });

        // Build prompt for current phase
        const systemPrompt = `${DISCOVERY_SYSTEM_PROMPT}\n\n${PHASE_PROMPTS[currentPhase]}`;

        try {
            console.log('\n🔄 Thinking...');

            const isSynthesis = currentPhase === DISCOVERY_PHASES.SYNTHESIS;

            const response = await openai.chat.completions.create({
                model: MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages.filter(m => m.role !== 'system').map(m => ({
                        role: m.role as 'user' | 'assistant',
                        content: m.content
                    }))
                ],
                ...(isSynthesis && { response_format: { type: 'json_object' as const } })
            });

            const aiContent = response.choices[0].message.content || 'No response';

            // Add to history
            messages.push({
                role: 'assistant',
                content: aiContent
            });

            // Display response
            console.log('\n🤖 Assistant:');
            if (isSynthesis) {
                try {
                    const parsed = JSON.parse(aiContent);
                    console.log(JSON.stringify(parsed, null, 2));
                } catch {
                    console.log(aiContent);
                }
            } else {
                console.log(aiContent);
            }

            // Detect phase transition
            const newPhase = detectPhaseTransition(currentPhase, aiContent);
            if (newPhase !== currentPhase) {
                console.log(`\n🔄 Phase transition detected: ${phaseLabels[currentPhase]} → ${phaseLabels[newPhase]}`);
                currentPhase = newPhase;
            }

            if (currentPhase === DISCOVERY_PHASES.COMPLETE) {
                console.log('\n✅ Discovery complete! The synthesis output is ready.');
                console.log('\nType /quit to exit or continue the conversation.');
            }

        } catch (error) {
            console.error('\n❌ Error:', error);
        }
    }
}

// Run the test
runDiscoveryTest().catch(console.error);
