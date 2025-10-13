import { NextResponse } from "next/server";

export function withCORS(resp: NextResponse) {
  const origins = (process.env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
  resp.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  resp.headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
  resp.headers.set("Access-Control-Allow-Origin", origins.length ? origins[0] : "*");
  return resp;
}