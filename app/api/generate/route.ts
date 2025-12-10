import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { verifyToken } from "@/lib/firebaseAdmin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseServer = supabaseUrl && supabaseServiceRole ? createClient(supabaseUrl, supabaseServiceRole) : null;

const aiProvider = process.env.AI_PROVIDER || "openai";

const apiKey = aiProvider === "gemini" ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY;

const openaiClient =
  apiKey && aiProvider === "openai"
    ? new OpenAI({ apiKey })
    : apiKey && aiProvider === "gemini"
      ? new OpenAI({ apiKey, baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/" })
      : null;

const MODEL = aiProvider === "gemini" ? "gemini-1.5-flash" : "gpt-4o-mini";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    let uid: string | null = null;
    if (token) {
      const decoded = await verifyToken(token);
      uid = decoded?.uid || null;
      // Fallback decode for local dev when admin SDK is not configured
      if (!uid) {
        try {
          const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
          uid = payload?.user_id || payload?.uid || payload?.sub || null;
        } catch (err) {
          uid = null;
        }
      }
    }
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tool, text, settings } = await req.json();
    if (!tool || !text) {
      return NextResponse.json({ error: "Missing tool or text" }, { status: 400 });
    }

    // Usage limit check (20 per month)
    if (supabaseServer) {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { count } = await supabaseServer
        .from("resources")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid)
        .gte("created_at", startOfMonth);
      if ((count ?? 0) >= 20) {
        return NextResponse.json({ error: "Monthly limit reached" }, { status: 429 });
      }
    }

    if (!apiKey) {
      console.warn("AI provider not configured");
      return NextResponse.json({ error: "AI provider not configured" }, { status: 500 });
    }

    const prompt = buildPrompt(tool, text, settings);
    const baseMessages = [
      {
        role: "system",
        content:
          "You are an educational AI that must reply with strict JSON only. Do not include Markdown. Ensure all fields are populated and options are meaningful, not placeholders."
      },
      { role: "user", content: prompt }
    ] as OpenAI.Chat.Completions.ChatCompletionMessageParam[];

    if (aiProvider === "gemini") {
      const parsed = await runGemini(apiKey, MODEL, baseMessages);
      return NextResponse.json(parsed);
    }

    if (!openaiClient) {
      return NextResponse.json({ error: "OpenAI client not configured" }, { status: 500 });
    }

    try {
      const response = await openaiClient.chat.completions.create({
        model: MODEL,
        messages: baseMessages,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const content = response.choices?.[0]?.message?.content || "{}";
      const parsed = safeJson(content);
      return NextResponse.json(parsed);
    } catch (error: any) {
      console.error("OpenAI error", error?.response?.status, await error?.response?.text?.());
      return NextResponse.json({ error: "AI request failed", detail: error?.message }, { status: 500 });
    }
  } catch (err) {
    console.error("Generate API error", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}

function buildPrompt(tool: string, text: string, settings: Record<string, any> = {}) {
  const common = `Return ONLY valid JSON with all fields filled. No Markdown.`;
  switch (tool) {
    case "flashcards":
      return `${common} Create ${settings.count || 6} flashcards about: ${text}. Respond with {"flashcards":[{"question":"","answer":""}]}. Keep answers concise.`;
    case "quiz":
      return `${common} Create a multiple-choice quiz with ${settings.count || 5} questions about: ${text}. Respond with {"quiz":[{"question":"","options":["",""],"answer":"","explanation":""}]}. Options must be distinct, meaningful, and non-empty. Answer must match one of the options.`;
    case "plan":
      return `${common} Build a study plan with ${settings.count || 5} steps for: ${text}. Respond with {"plan":["step 1","step 2"]}.`;
    default:
      return `${common} Provide a clear explanation for: ${text}. Respond with {"explanation":"..."} in markdown-friendly text.`;
  }
}

function safeJson(content: string) {
  try {
    return JSON.parse(content);
  } catch (err) {
    // Try to extract JSON substring
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const slice = content.slice(start, end + 1);
      try {
        return JSON.parse(slice);
      } catch (e) {
        console.error("Failed to parse fallback JSON", e);
      }
    }
    return { explanation: content };
  }
}

function mockPayload(tool: string, text: string, settings: Record<string, any> = {}, mocked = false) {
  const subject = text?.slice(0, 60) || "Your topic";
  switch (tool) {
    case "flashcards":
      return {
        flashcards: [
          { question: `What is ${subject}?`, answer: `A concise overview of ${subject}.` },
          { question: `Why is ${subject} important?`, answer: `Because it underpins key concepts in this area.` }
        ],
        mocked
      };
    case "quiz":
      return {
        quiz: [
          {
            question: `Core idea of ${subject}?`,
            options: [
              `${subject} is primarily about...`,
              `A secondary aspect of ${subject}`,
              `An unrelated detail to ${subject}`,
              `A historical note on ${subject}`
            ],
            answer: `${subject} is primarily about...`,
            explanation: `The main concept of ${subject} revolves around the core idea in the first option.`
          }
        ],
        mocked
      };
    case "plan":
      return {
        plan: [
          `Step 1: Outline the basics of ${subject}.`,
          `Step 2: Dive into examples and practice.`,
          `Step 3: Review and summarize key points.`
        ],
        mocked
      };
    default:
      return { explanation: `Here is a quick overview of ${subject}.`, mocked };
  }
}

async function runGemini(
  key: string,
  model: string,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
) {
  const url = `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Gemini error", res.status, body);
    throw new Error(`Gemini request failed: ${res.status} ${body}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || "{}";
  return safeJson(content);
}
