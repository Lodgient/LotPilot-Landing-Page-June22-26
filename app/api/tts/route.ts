import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Persona -> ElevenLabs voice. Keep in sync with VOICE in AgentConsole.tsx.
const VOICE_ID: Record<string, string> = {
  warm: "cgSgspJ2msm6clMCkdW9", // Jessica
  concise: "EXAVITQu4vr4xnSDxMaL", // Sarah
  luxury: "XrExE9yKIg1WjnnlVkGX", // Matilda
};

const MAX_CHARS = 600;

export async function POST(req: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  // No key configured -> tell the client to fall back to the static sample.
  if (!apiKey) {
    return NextResponse.json({ error: "tts_unavailable" }, { status: 503 });
  }

  let body: { text?: string; persona?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const text = (body.text || "").trim().slice(0, MAX_CHARS);
  const voiceId = VOICE_ID[body.persona ?? "warm"] ?? VOICE_ID.warm;
  if (!text) {
    return NextResponse.json({ error: "empty_text" }, { status: 422 });
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    },
  );

  if (!res.ok) {
    return NextResponse.json({ error: "tts_failed" }, { status: 502 });
  }

  const audio = await res.arrayBuffer();
  return new Response(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
