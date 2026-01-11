/**
 * @module actions/research
 * @description Server Action for generating AI-powered startup research.
 */

'use server';

import OpenAI from 'openai';
import { z } from 'zod';

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

    const systemPrompt = `You are an experienced startup advisor who gives PRACTICAL, GROUNDED advice. You've seen hundreds of startups fail and know the common traps.

## Your Analysis Approach:
1. **Be skeptical but constructive** - Point out real risks without being discouraging
2. **No hype** - Avoid buzzwords like "patent your idea", "disrupt the industry", "revolutionary"
3. **Concrete action items** - Every suggestion should be something a solo founder can do in 1-2 weeks
4. **Realistic market sizing** - Use actual comparable company data when possible, don't inflate numbers
5. **Honest competitor analysis** - Don't understate competition to make the idea seem better

## Scoring Guidelines:
- 0-30: Fundamental problems with the idea (no clear customer, saturated market, technically infeasible)
- 31-50: Interesting but major questions unanswered (unclear differentiation, unvalidated assumptions)
- 51-70: Solid concept with work to do (needs validation, has a path forward)
- 71-85: Well-thought-out idea with clear market (validated problem, reasonable approach)
- 86-100: Exceptional - only if there's evidence of traction or unique advantage

## Action Plan Rules:
- Start with VALIDATION (talk to customers, build landing page, etc.)
- NO legal/IP advice (no patents, trademarks, incorporation as first steps)
- NO hiring recommendations for solo founders
- Focus on de-risking the biggest unknowns first
- Be specific: "Interview 10 potential customers about X" not "validate the market"

Return your analysis as JSON matching this exact structure:
{
    "readinessScore": number (0-100, be conservative),
    "marketSize": "string (use TAM/SAM/SOM format if relevant, cite comparables)",
    "targetAudience": "string (be specific: job title, company size, situation)",
    "topCompetitor": "string (the ONE most direct competitor)",
    "trend": "string (honest assessment of market direction)",
    "growthMetrics": [{"year": "2024", "value": number}, {"year": "2025", "value": number}, {"year": "2026", "value": number}, {"year": "2027", "value": number}, {"year": "2028", "value": number}],
    "competitors": [{"name": "string", "strength": "string (why they're tough to beat)", "weakness": "string (realistic gap you could exploit)"}, ...at least 2-3],
    "actionPlan": ["string (week 1-2 action)", "string (week 3-4 action)", "string (month 2 action)"]
}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, no code blocks.`;

    try {
        console.log('[Research] Calling AI API...');

        // Note: response_format is OpenAI-specific, removed for compatibility with other providers
        const response = await client.chat.completions.create({
            model: aiConfig.model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Idea Title: ${title}\nIdea Description: ${description}\n\nRespond with ONLY the JSON object, no other text.` }
            ]
        });

        console.log('[Research] AI response received');
        const content = response.choices[0].message.content;
        console.log('[Research] Raw content length:', content?.length);

        if (!content) throw new Error("No response from AI");

        // Try to extract JSON from the response (handle markdown code blocks)
        let jsonStr = content.trim();

        // Remove markdown code blocks if present
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.slice(7);
        } else if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.slice(3);
        }
        if (jsonStr.endsWith('```')) {
            jsonStr = jsonStr.slice(0, -3);
        }
        jsonStr = jsonStr.trim();

        console.log('[Research] Attempting to parse JSON...');
        const result = JSON.parse(jsonStr);
        console.log('[Research] Parsed result, validating schema...');
        const validated = researchSchema.parse(result);
        console.log('[Research] Success! Readiness score:', validated.readinessScore);
        return validated;
    } catch (error) {
        console.error("[Research] FAILED:", error);
        throw new Error(`Failed to process idea with AI: ${error instanceof Error ? error.message : String(error)}`);
    }
}

