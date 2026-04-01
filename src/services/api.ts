import { Article, Analysis, Event, EventsResponse, SearchResponse } from "./types";

const BACKEND_SECRET = import.meta.env.VITE_BACKEND_SECRET || "vgUFaPFiiGuTCDEqGI22SiZLFJbZKVH0ckyhwRVpVgx6YshLfxk8Spn63bBHvTx28IsdIjco2hXzJsh98F09";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function generateSignature(secret: string, timestamp: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(timestamp)
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function fetchWithAuth(endpoint: string) {
  const timestamp = Date.now().toString();
  const signature = await generateSignature(BACKEND_SECRET, timestamp);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "X-Timestamp": timestamp,
      "X-Signature": signature,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchEvents(): Promise<EventsResponse> {
  return fetchWithAuth("/events");
}

export async function searchEvents(keyword: string, location?: string): Promise<SearchResponse> {
  const params = new URLSearchParams();
  params.append("keyword", keyword);
  if (location) {
    params.append("location", location);
  }
  return fetchWithAuth(`/events/search?${params.toString()}`);
}
