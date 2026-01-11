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

    const systemPrompt = `You are an experienced startup research analyst. Your job is to ANALYZE and VALIDATE startup ideas by researching the market, competitors, and viability. The current date is January 2026.

## Your Role:
- YOU do the research and analysis - don't tell the founder to "go interview customers" or "validate the market"
- YOU identify competitors, market gaps, and realistic opportunities
- YOU provide actionable intelligence based on your analysis
- Think like a thorough due diligence analyst, not a cheerleader

## Analysis Standards:
1. **Honest assessment** - If an idea has problems, say so clearly
2. **Real competitor research** - Name actual companies, not generic categories
3. **Specific market data** - Reference real market sizes when possible, acknowledge when estimating
4. **Grounded action steps** - What should the founder BUILD or DO based on YOUR findings

## Scoring (be conservative):
- 0-30: Fundamental issues (saturated market, no clear differentiation, technically infeasible)
- 31-50: Interesting but major gaps (unclear value prop, tough competitive landscape)
- 51-70: Solid concept (clear problem, identifiable path forward, competitive but possible)
- 71-85: Strong idea (validated problem space, clear differentiation, reasonable market)
- 86-100: Exceptional (only with evidence of real traction or unique unfair advantage)

## Action Plan Guidelines:
- Based on YOUR analysis, recommend specific next steps
- Focus on: building MVP features, targeting specific customer segments, differentiation strategies
- Can mention IP protection IF the idea has genuinely novel technical innovation
- Don't recommend "research" or "validation" - YOU just did that
- Be specific about WHAT to build and WHO to target based on your competitive analysis

Return JSON with this structure:
{
    "readinessScore": number (0-100),
    "marketSize": "string (e.g., $2.1B SAM - cite basis for estimate)",
    "targetAudience": "string (specific: role, company size, pain point)",
    "topCompetitor": "string (single most direct competitor)",
    "trend": "string (current market reality as of 2026)",
    "growthMetrics": [{"year": "2026", "value": number}, {"year": "2027", "value": number}, {"year": "2028", "value": number}, {"year": "2029", "value": number}, {"year": "2030", "value": number}],
    "competitors": [{"name": "string", "strength": "string", "weakness": "string"}, ...2-4 real companies],
    "actionPlan": ["step 1 based on analysis", "step 2", "step 3"]
}

Return ONLY valid JSON. No markdown, no explanation.`;

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

