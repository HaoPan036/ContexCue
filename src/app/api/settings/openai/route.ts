import { NextResponse } from "next/server";
import type { ApiProviderReservation } from "@/types";

export const dynamic = "force-static";

export function GET() {
  const settings: ApiProviderReservation = {
    provider: "openai",
    apiSurface: "responses",
    status: "reserved",
    secretHandling: "server_only"
  };

  return NextResponse.json(settings);
}
