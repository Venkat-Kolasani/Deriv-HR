/**
 * Flowise Prediction API helper
 * Calls a Flowise chatflow with a question and returns the AI response.
 *
 * Usage:
 *   const result = await askFlowise(CHATFLOW_IDS.FEEDBACK, prompt);
 */

const FLOWISE_BASE = process.env.NEXT_PUBLIC_FLOWISE_URL || "http://localhost:3000";

/**
 * Chatflow IDs — update these after creating the chatflows in Flowise UI.
 * Go to http://localhost:3000, create 4 chatflows, and paste their IDs here.
 */
export const CHATFLOW_IDS = {
    FEEDBACK: process.env.NEXT_PUBLIC_FLOWISE_FEEDBACK_ID || "YOUR_FEEDBACK_CHATFLOW_ID",
    COMPENSATION: process.env.NEXT_PUBLIC_FLOWISE_COMPENSATION_ID || "YOUR_COMPENSATION_CHATFLOW_ID",
    EXECUTIVE_BRIEF: process.env.NEXT_PUBLIC_FLOWISE_BRIEF_ID || "YOUR_BRIEF_CHATFLOW_ID",
    OFFER_LETTER: process.env.NEXT_PUBLIC_FLOWISE_OFFER_ID || "YOUR_OFFER_CHATFLOW_ID",
};

export interface FlowiseResponse {
    text: string;
    [key: string]: any;
}

export async function askFlowise(
    chatflowId: string,
    question: string
): Promise<FlowiseResponse> {
    const apiKey = process.env.NEXT_PUBLIC_FLOWISE_API_KEY;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const res = await fetch(`${FLOWISE_BASE}/api/v1/prediction/${chatflowId}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ question }),
    });

    if (!res.ok) {
        const errText = await res.text().catch(() => "Unknown error");
        throw new Error(`Flowise prediction failed (${res.status}): ${errText}`);
    }

    return res.json();
}

/**
 * Parse a JSON block from an LLM response string.
 * The LLM may wrap JSON in ```json ... ``` or return raw JSON.
 */
export function parseJsonFromLLM<T = any>(text: string): T {
    // Try to extract JSON from markdown code block
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = codeBlockMatch ? codeBlockMatch[1].trim() : text.trim();

    try {
        return JSON.parse(jsonStr);
    } catch {
        // Try to find the first { ... } or [ ... ] in the text
        const objectMatch = jsonStr.match(/(\{[\s\S]*\})/);
        const arrayMatch = jsonStr.match(/(\[[\s\S]*\])/);
        const match = objectMatch || arrayMatch;
        if (match) {
            return JSON.parse(match[1]);
        }
        throw new Error("Could not parse JSON from LLM response");
    }
}
