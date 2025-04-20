import { runGemini } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const geminiResponse = await runGemini(prompt);

    try {
      const parsedResponse = JSON.parse(geminiResponse);
      return NextResponse.json({ content: parsedResponse });
    } catch (parseError: any) {
      console.error("Error parsing Gemini response:", parseError);
      return NextResponse.json({ error: "Failed to parse Gemini response", rawResponse: geminiResponse }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error in /api/gemini route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}