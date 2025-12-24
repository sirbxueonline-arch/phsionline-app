import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyToken } from "@/lib/firebaseAdmin";

const apiKey = process.env.GEMINI_API_KEY;
const USAGE_TYPE = "usage-log";
const USAGE_LIMIT = 20;
const UNLIMITED_EMAILS = ["studypilot.app@gmail.com"].map((e) => e.toLowerCase());

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const MODEL = GEMINI_MODEL;

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: any;
};

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    let uid: string | null = null;
    let tokenEmail: string | null = null;
    if (token) {
      const decoded = await verifyToken(token);
      uid = decoded?.uid || null;
      tokenEmail = decoded?.email?.toLowerCase() || null;
      // Fallback decode for local dev when admin SDK is not configured
      if (!uid) {
        try {
          const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
          uid = payload?.user_id || payload?.uid || payload?.sub || null;
          tokenEmail = tokenEmail || payload?.email?.toLowerCase() || null;
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

    const unlimited = await isUnlimitedUser(uid, tokenEmail);

    // Usage limit check (20 per month) unless unlimited
    let overLimit = false;
    if (adminDb && !unlimited) {
      try {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const snap = await adminDb
          .collection("resources")
          .where("userId", "==", uid)
          .where("type", "==", USAGE_TYPE)
          .where("createdAt", ">=", startOfMonth.toISOString())
          .get();
        if (snap.size >= USAGE_LIMIT) {
          overLimit = true;
        }
      } catch (err) {
        console.warn("Usage check skipped due to DB error", err);
      }
    }
    if (overLimit) {
      return NextResponse.json({ error: "Monthly limit reached" }, { status: 429 });
    }

    if (!apiKey) {
      console.warn("AI provider not configured");
      const fallback = mockPayload(tool, text, settings, true);
      return NextResponse.json(
        { ...fallback, error: "AI provider not configured", mocked: true },
        { status: 200 }
      );
    }

    const prompt = buildPrompt(tool, text, settings);
    const baseMessages: ChatMessage[] = [
      {
        role: "system",
        content:
          "You are an educational AI that must reply with strict JSON only. Do not include Markdown. Ensure all fields are populated and options are meaningful, not placeholders."
      },
      { role: "user", content: prompt }
    ];

    try {
      const parsed = await runGemini(apiKey, MODEL, baseMessages);
      // Log usage for this generation (best-effort, but await so limit stays accurate)
      if (adminDb && uid) {
        try {
          await logUsage(uid, tool, settings?.subject);
        } catch (err) {
          console.error("Usage log failed", err);
        }
        try {
          await logMaterial(uid, tool, text, settings, parsed);
        } catch (err) {
          console.error("Material log failed", err);
        }
      }
      return NextResponse.json(parsed);
    } catch (error: any) {
      console.error("Gemini error", error?.message || error);
      const fallback = mockPayload(tool, text, settings, true);
      return NextResponse.json(
        {
          ...fallback,
          error: "AI provider unavailable; returned sample output",
          detail: error?.message || "Model unavailable",
          mocked: true
        },
        { status: 200 }
      );
    }
  } catch (err) {
    console.error("Generate API error", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}

function buildPrompt(tool: string, text: string, settings: Record<string, any> = {}) {
  const common = `Return ONLY valid JSON with all fields filled. No Markdown.`;
  const difficulty = settings.difficulty || "medium";
  const mixHint =
    settings.questionMix === "concept"
      ? "Favor concept checks and why/how framing."
      : settings.questionMix === "recall"
      ? "Favor direct recall and definitions."
      : "Blend recall, concept checks, and light scenarios.";
  const itemCount = settings.count || 10;
  switch (tool) {
    case "flashcards":
      return `${common} Create ${itemCount} flashcards about: ${text}. Use ${difficulty} difficulty. ${mixHint} Respond with {"flashcards":[{"question":"","answer":""}]}. Keep answers concise.`;
    case "quiz":
      return `${common} Create a multiple-choice quiz with ${itemCount} questions about: ${text}. Use ${difficulty} difficulty. ${mixHint} Respond with {"quiz":[{"question":"","options":["",""],"answer":"","explanation":""}]}. Options must be distinct, meaningful, and non-empty. Answer must match one of the options.`;
    case "both":
      return `${common} Create ${itemCount} flashcards AND ${itemCount} mixed multiple-choice questions about: ${text}. Use ${difficulty} difficulty overall. ${mixHint} Respond with {"flashcards":[{"question":"","answer":""}],"quiz":[{"question":"","options":["",""],"answer":"","explanation":""}]}. Ensure quiz answers match options and flashcard answers stay concise.`;
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
    case "both":
      return {
        flashcards: [
          { question: `What is ${subject}?`, answer: `A concise overview of ${subject}.` },
          { question: `Why is ${subject} important?`, answer: `Because it underpins key concepts in this area.` }
        ],
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

function toText(content: any) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) return (part as any).text || "";
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  if (content && typeof content === "object" && "text" in content) {
    return (content as any).text || "";
  }
  return content ? String(content) : "";
}

async function runGemini(
  key: string,
  model: string,
  messages: ChatMessage[]
) {
  const normalized = model || "gemini-flash-latest";
  const maybeNonLatest = normalized.includes("-latest") ? normalized.replace("-latest", "") : normalized;
  const modelsToTry = Array.from(
    new Set([
      normalized,
      maybeNonLatest,
      "gemini-flash-latest",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-2.0-flash-001",
      "gemini-2.5-pro"
    ])
  );
  let lastError: { status?: number; body?: string; model?: string } = {};

  const systemInstruction = messages
    .filter((m) => m.role === "system")
    .map((m) => toText(m.content))
    .filter(Boolean)
    .join("\n");

  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: toText(m.content) }]
    }));

  for (const m of modelsToTry) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents,
          systemInstruction: systemInstruction
            ? { role: "system", parts: [{ text: systemInstruction }] }
            : undefined,
          generationConfig: {
            temperature: 0.7
          }
        })
      }
    );

    const body = await res.text();
    let json: any = null;
    try {
      json = body ? JSON.parse(body) : null;
    } catch (parseErr) {
      json = null;
    }

    if (res.ok && json) {
      const candidateText =
        json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || "").join("") || "";
      if (candidateText) {
        return safeJson(candidateText);
      }
      lastError = { status: res.status, body: "Empty Gemini response", model: m };
      continue;
    }

    lastError = { status: res.status, body, model: m };

    // If the model is not found, try the next fallback model.
    if (res.status === 404 && /not\s+found/i.test(body)) {
      continue;
    }

    console.error("Gemini error", res.status, body);
    throw new Error(`Gemini request failed: ${res.status} ${body}`);
  }

  console.error("Gemini error", lastError.status, lastError.body);
  throw new Error(
    `Gemini request failed (${lastError.model || model}): ${lastError.status || "unknown"} ${
      lastError.body || ""
    }`
  );
}

async function logUsage(uid: string, tool: string, subject: string | undefined) {
  const title = `Generation - ${tool}`;
  await adminDb?.collection("resources").add({
    userId: uid,
    type: USAGE_TYPE,
    title,
    subject: subject || null,
    content: { tool, subject: subject || null, createdAt: new Date().toISOString() },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}

async function logMaterial(
  uid: string,
  tool: string,
  userPrompt: string,
  settings: Record<string, any> | undefined,
  content: any
) {
  const trimmedPrompt = (userPrompt || "").toString();
  const title = `Generated ${tool}`;
  await adminDb?.collection("resources").add({
    userId: uid,
    type: tool,
    title,
    subject: settings?.subject || null,
    content,
    prompt: trimmedPrompt,
    settings: settings || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}

async function isUnlimitedUser(uid: string, tokenEmail: string | null) {
  const allowlist = new Set(UNLIMITED_EMAILS);
  if (tokenEmail && allowlist.has(tokenEmail)) return true;
  if (!adminDb) return false;
  try {
    const snap = await adminDb.collection("users").doc(uid).get();
    const data = (snap.data() as any) || {};
    const email = data.email ? String(data.email).toLowerCase() : null;
    const role = data.role;
    const permissions: string[] = data.permissions || [];
    if (role === "admin") return true;
    if (permissions.includes("unlimited")) return true;
    if (email && allowlist.has(email)) return true;
  } catch (err) {
    console.warn("Unlimited check failed", err);
  }
  return false;
}
