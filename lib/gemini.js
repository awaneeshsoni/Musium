import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = "gemini-2.0-flash";

function extractJson(text) {
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = text.match(jsonRegex);
    if (match && match[1]) {
        return match[1].trim();
    }
    return null;
}

export async function runGemini(prompt) {
    try {
        const genAI = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY || "",
        });

        const result = await genAI.models.generateContent({
            model: MODEL_NAME,
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `
You are an assistant that helps with writing.

## Instructions:
If the user asks for a new piece of writing, generate it clearly.
If the user gives you existing content (e.g., selected text or context) and asks for a rewrite, only modify that part.

## Output format (MUST follow this JSON exactly):
\`\`\`json
{
  "editorContent": "...the actual text to insert or update in the editor...",
  "chatSummary": "...a 1-line natural summary for chat history..."
}
\`\`\`

## User prompt:
${prompt}
              `.trim(),
                        },
                    ],
                },
            ],
        });

        let responseText = result.text || "";
        const extractedJson = extractJson(responseText);

        if (extractedJson) {
            responseText = extractedJson;
        } else {
            console.warn("Could not extract JSON from Gemini response. Returning raw response.");
        }
        return responseText;

    } catch (error) {
        console.error("Error in runGemini:", error);
        throw new Error(`Gemini API Error: ${error.message}`);
    }
}
