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

/**
 * Interface for compatibility score response with detailed analysis
 */
export interface CompatibilityScore {
    score: number;
    "Key Strength": string[];
    "Concerns": string[];
    "Technical Skills": number;
    "Communication": number;
    "Leadership": number;
    "Culture Fit": number;
    "Bias Detection": string[];
}

/**
 * Parse the JSON text from a Flowise response that contains structured output.
 * The response.text field contains a JSON string with the actual data.
 * Handles the agentFlowExecutedData format where the text is nested in the response.
 * 
 * @param response - The Flowise response object (can be full response with agentFlowExecutedData or simple response)
 * @returns Parsed structured output object
 * 
 * @example
 * const response = await askFlowise(chatflowId, question);
 * const result = parseFlowiseStructuredOutput<CompatibilityScore>(response);
 * console.log(result.score, result["Key Strength"], result.Concerns);
 */
export function parseFlowiseStructuredOutput<T = any>(response: FlowiseResponse | any): T {
    let textToParse = "";

    // Handle different response formats
    if (typeof response === "string") {
        textToParse = response;
    } else if (response.text) {
        // The text field contains a JSON string that needs to be parsed
        textToParse = response.text;
    } else if (response.agentFlowExecutedData && Array.isArray(response.agentFlowExecutedData)) {
        // Find the LLM node that has the final output
        const llmNode = response.agentFlowExecutedData.find(
            (node: any) => node.nodeLabel?.includes("LLM") && node.data?.output?.content
        );
        if (llmNode?.data?.output?.content) {
            textToParse = llmNode.data.output.content;
        } else {
            throw new Error("Could not find LLM output in agentFlowExecutedData");
        }
    } else {
        throw new Error("Flowise response does not contain a 'text' field or recognizable structure");
    }

    try {
        // The text field contains a JSON string with escaped newlines (\n)
        // First parse the outer JSON string, then parse the inner JSON
        const parsed = JSON.parse(textToParse);
        return parsed;
    } catch (error) {
        // Fallback: try using the general JSON parser for markdown-wrapped JSON
        try {
            return parseJsonFromLLM<T>(textToParse);
        } catch (fallbackError) {
            console.error("Failed to parse Flowise response:", textToParse);
            throw new Error(`Could not parse JSON from Flowise response: ${error}`);
        }
    }
}

/**
 * Convenience function to parse compatibility score from Flowise response
 */
export function parseCompatibilityScore(response: FlowiseResponse | any): CompatibilityScore {
    return parseFlowiseStructuredOutput<CompatibilityScore>(response);
}

