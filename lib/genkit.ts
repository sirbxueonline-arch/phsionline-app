import { genkit } from "genkit";
import { googleAI, gemini15Flash } from "@genkit-ai/googleai";

type Tool = "flashcards" | "quiz" | "explain" | "plan";

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY
    })
  ],
  model: gemini15Flash
});

export async function runStudyFlow({
  tool,
  text,
  count = 6
}: {
  tool: Tool;
  text: string;
  count?: number;
}) {
  const prompt = buildPrompt(tool, text, count);
  const { text: raw } = await ai.generate(prompt, { responseMimeType: "application/json" });
  return safeJson(raw);
}

function buildPrompt(tool: Tool, text: string, count: number) {
  const base = `You are a study assistant. Reply ONLY with JSON (no markdown) and fill all fields. Topic: ${text}`;
  switch (tool) {
    case "flashcards":
      return `${base}. Create ${count} flashcards. Format: {"flashcards":[{"question":"","answer":""}]}. Keep answers concise.`;
    case "quiz":
      return `${base}. Create ${count} multiple-choice questions. Format: {"quiz":[{"question":"","options":["",""],"answer":"","explanation":""}]}. Options must be distinct and non-empty; answer must be one of the options.`;
    case "plan":
      return `${base}. Create ${count} step study plan. Format: {"plan":["step 1","step 2"]}.`;
    default:
      return `${base}. Provide a concise explanation. Format: {"explanation":""}.`;
  }
}

function safeJson(content: string) {
  try {
    return JSON.parse(content);
  } catch (err) {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const slice = content.slice(start, end + 1);
      try {
        return JSON.parse(slice);
      } catch (inner) {
        return { explanation: slice, mocked: true };
      }
    }
    return { explanation: content, mocked: true };
  }
}
