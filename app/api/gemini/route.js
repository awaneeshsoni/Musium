import { runGemini } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const geminiResponse = await runGemini(prompt);

    try {
      const parsedResponse = JSON.parse(geminiResponse);
      return NextResponse.json({ content: parsedResponse });
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      return NextResponse.json({
        error: "Failed to parse Gemini response",
        details: parseError instanceof Error ? parseError.message : String(parseError), 
        rawResponse: geminiResponse
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Error in /api/gemini route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}