import { NextRequest, NextResponse } from "next/server";
import { HumanMessage, BaseMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { messageSchema } from "@/lib/validators/message";
import { CONFIG, SYSTEM_MESSAGES } from "@/lib/constants";
import { AppError, handleApiError, logError } from "@/lib/error-handler";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GOOGLE_API_KEY && !GROQ_API_KEY) {
  throw new Error(
    "Either GOOGLE_API_KEY or GROQ_API_KEY environment variable must be set",
  );
}

const groqLlm = GROQ_API_KEY
  ? new ChatGroq({
      model: CONFIG.GROQ_MODEL,
      apiKey: GROQ_API_KEY,
      temperature: 0.7,
      maxRetries: 2,
    })
  : null;

const googleLlm = GOOGLE_API_KEY
  ? new ChatGoogleGenerativeAI({
      model: CONFIG.GEMINI_MODEL,
      apiKey: GOOGLE_API_KEY,
      apiVersion: "v1beta",
      temperature: 0.7,
      maxRetries: 2,
    })
  : null;

const primaryLlm = GROQ_API_KEY
  ? new ChatGroq({
      model: "llama-3.1-8b-instant",
      apiKey: GROQ_API_KEY,
      temperature: 0.7,
      maxRetries: 1,
    })
  : googleLlm!;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const maybeStatus = "status" in error ? (error as { status?: unknown }).status : undefined;
  const maybeCode = "code" in error ? (error as { code?: unknown }).code : undefined;
  const message = getErrorMessage(error).toLowerCase();

  return (
    maybeStatus === 429 ||
    maybeCode === "rate_limit_exceeded" ||
    message.includes("rate limit") ||
    message.includes("429")
  );
}

function extractRetryAfterSeconds(error: unknown): number | null {
  const message = getErrorMessage(error);

  const retryInMatch = message.match(/retry in\s+([\d.]+)s/i);
  if (retryInMatch?.[1]) {
    return Math.max(1, Math.ceil(Number(retryInMatch[1])));
  }

  const retryDelayMatch = message.match(/"retryDelay":"(\d+)s"/i);
  if (retryDelayMatch?.[1]) {
    return Math.max(1, Number(retryDelayMatch[1]));
  }

  return null;
}

function toRateLimitAppError(error: unknown): AppError {
  const retryAfterSeconds = extractRetryAfterSeconds(error);
  const retryText = retryAfterSeconds
    ? ` Please retry in about ${retryAfterSeconds} seconds.`
    : " Please retry shortly.";

  return new AppError(
    `Rate limit reached across configured AI providers.${retryText}`,
    429,
    "rate_limit_exceeded",
  );
}

async function invokePrimaryWithRateLimitFallback(messages: BaseMessage[]) {
  try {
    return await primaryLlm.invoke(messages);
  } catch (error) {
    if (isRateLimitError(error) && googleLlm && primaryLlm !== googleLlm) {
      console.warn("Primary LLM rate-limited. Falling back to Gemini.");
      try {
        return await googleLlm.invoke(messages);
      } catch (fallbackError) {
        if (isRateLimitError(fallbackError)) {
          throw toRateLimitAppError(fallbackError);
        }
        throw fallbackError;
      }
    }

    if (isRateLimitError(error)) {
      throw toRateLimitAppError(error);
    }

    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.message,
        },
        { status: 400 },
      );
    }

    const { message } = parsed.data;

    const chatResponse = await invokePrimaryWithRateLimitFallback([
      new SystemMessage(SYSTEM_MESSAGES.GENERAL_CHAT),
      new HumanMessage(message),
    ]);

    return NextResponse.json({
      content: chatResponse.text || chatResponse.content,
    });
  } catch (error) {
    logError(error, "API /chat");
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json(
      { content: `Sorry, I encountered an error: ${message}` },
      { status: statusCode },
    );
  }
}