import { NextResponse } from "next/server";
import type { ApiRuntimeSettings } from "@/types";

export const dynamic = "force-dynamic";

export function GET() {
  const settings: ApiRuntimeSettings = {
    provider: "openai",
    apiSurface: "responses",
    model: process.env.OPENAI_MODEL?.trim() || null,
    hasApiKey: Boolean(process.env.OPENAI_API_KEY?.trim()),
    keySource: "OPENAI_API_KEY",
    modelSource: "OPENAI_MODEL"
  };

  return NextResponse.json(settings);
}
