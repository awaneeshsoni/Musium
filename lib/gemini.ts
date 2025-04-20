// import { GoogleGenAI } from "@google/genai";

// const MODEL_NAME = "gemini-2.0-flash"; // You can switch to "gemini-2.0-pro" if needed

// const generationConfig = {
//   temperature: 0.9,
//   topK: 1,
//   topP: 1,
//   maxOutputTokens: 2048,
// };

// const safetySettings = [
//   {
//     category: "HARM_CATEGORY_HARASSMENT",
//     threshold: "BLOCK_MEDIUM_AND_ABOVE",
//   },
//   {
//     category: "HARM_CATEGORY_HATE_SPEECH",
//     threshold: "BLOCK_MEDIUM_AND_ABOVE",
//   },
//   {
//     category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
//     threshold: "BLOCK_MEDIUM_AND_ABOVE",
//   },
//   {
//     category: "HARM_CATEGORY_DANGEROUS_CONTENT",
//     threshold: "BLOCK_MEDIUM_AND_ABOVE",
//   },
// ];

// export async function runGemini(prompt: string): Promise<any> {
//   const genAI = new GoogleGenAI({
//     apiKey: process.env.GEMINI_API_KEY || "",
//   });

//   const result = await genAI.models.generateContent({
//     model: MODEL_NAME,
//     contents: [
//       {
//         role: "user",
//         parts: [
//           {
//             text: `
// You are an assistant that helps with writing.

// ## Instructions:
// If the user asks for a new piece of writing, generate it clearly.
// If the user gives you existing content (e.g., selected text or context) and asks for a rewrite, only modify that part.

// ## Output format (MUST follow this JSON exactly):
// {
//   "editorContent": "...the actual text to insert or update in the editor...",
//   "chatSummary": "...a 1-line natural summary for chat history..."
// }

// ## User prompt:
// ${prompt}
//             `.trim(),
//           },
//         ],
//       },
//     ],
//     generationConfig,
//     safetySettings,
//   });

//   console.log('Gemini Response:', result.text);
//   return result.text; // Returning as-is because Gemini is already providing the right structure
// }
import { GoogleGenAI, Models } from "@google/genai";

const MODEL_NAME = "gemini-2.0-flash"; // You can switch to "gemini-2.0-pro" if needed

const generationConfig = {
  temperature: 0.7,  // Slightly lower temperature for more consistent results
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

const safetySettings = [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
];

function extractJson(text: string): string | null {
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = text.match(jsonRegex);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

export async function runGemini(prompt: string): Promise<any> {
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
      generationConfig,
      safetySettings,
    });

    let responseText = result.text || '';

    // Extract JSON from the response
    const extractedJson = extractJson(responseText);
    if (extractedJson) {
      responseText = extractedJson;
    } else {
      console.warn("Could not extract JSON from Gemini response. Returning raw response.");
    }

    console.log('Gemini Response:', responseText);
    return responseText;
  } catch (error: any) {
    console.error("Error in runGemini:", error);
    throw new Error(`Gemini API Error: ${error.message}`); // Re-throw for handling in API route
  }
}