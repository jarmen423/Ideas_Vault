/**
 * @module actions/research
 * @description Server Action for generating AI-powered startup research.
 */

'use server';

import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
    baseURL: process.env.AI_BASE_URL || "https://api.openai.com/v1",
    apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY, // <--- REPLACE WITH YOUR ENV VAR FROM .ENV
});

const AI_MODEL = process.env.AI_MODEL || "gpt-4o";

const researchSchema = z.object({
    readinessScore: z.number().min(0).max(100),
    marketSize: z.string(),
    targetAudience: z.string(),
    topCompetitor: z.string(),
    trend: z.string(),
    growthMetrics: z.array(z.object({
        year: z.string(),
        value: z.number()
    })),
    competitors: z.array(z.object({
        name: z.string(),
        strength: z.string(),
        weakness: z.string()
    })),
    actionPlan: z.array(z.string())
});

/**
 * Analyzes a startup idea using GPT-4o.
 * 
 * Takes the user's title and description and returns a comprehensive 
 * research packet including market metrics and an action plan.
 * The response is forced into a valid JSON format via system prompting.
 * 
 * @param {string} title - The title of the startup concept
 * @param {string} description - Detailed description of the idea
 * @returns {Promise<any>} The generated research packet
 * @keyTechnologies OpenAI, GPT-4o, Zod
 */
export async function performResearch(title: string, description: string, config?: { apiKey?: string, baseURL?: string, model?: string }) {
    console.log('[Research] Starting research for:', title);

    const aiConfig = {
        apiKey: config?.apiKey || process.env.AI_API_KEY || process.env.OPENAI_API_KEY,
        baseURL: config?.baseURL || process.env.AI_BASE_URL || "https://api.openai.com/v1",
        model: config?.model || process.env.AI_MODEL || "gpt-4o"
    };

    console.log('[Research] Using config:', {
        baseURL: aiConfig.baseURL,
        model: aiConfig.model,
        hasApiKey: !!aiConfig.apiKey
    });

    const client = new OpenAI({
        apiKey: aiConfig.apiKey,
        baseURL: aiConfig.baseURL
    });
    const systemPrompt = `
        You are a Senior Venture Capital Analyst and Startup Architect.
        Analyze the following startup idea and return a detailed research packet in valid JSON format.
        
        The JSON must match this structure exactly:
        {
            "readinessScore": number (0-100),
            "marketSize": "string (e.g. $4.2B)",
            "targetAudience": "string",
            "topCompetitor": "string",
            "trend": "string (one sentence about current market trend)",
            "growthMetrics": [{ "year": "2024", "value": number }, ... for next 4 years],
            "competitors": [{ "name": "string", "strength": "string", "weakness": "string" }, ... at least 2],
            "actionPlan": ["string", "string", "string"]
        }
        
        Be realistic, data-driven, and critical yet encouraging.
    `;

    try {
        console.log('[Research] Calling AI API...');
        const response = await client.chat.completions.create({
            model: aiConfig.model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Idea Title: ${title}\nIdea Description: ${description}` }
            ],
            response_format: { type: "json_object" }
        });

        console.log('[Research] AI response received');
        const content = response.choices[0].message.content;
        if (!content) throw new Error("No response from AI");

        const result = JSON.parse(content);
        console.log('[Research] Parsed result, validating schema...');
        const validated = researchSchema.parse(result);
        console.log('[Research] Success! Readiness score:', validated.readinessScore);
        return validated;
    } catch (error) {
        console.error("[Research] FAILED:", error);
        throw new Error("Failed to process idea with AI");
    }
}
