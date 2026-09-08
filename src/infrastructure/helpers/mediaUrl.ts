import { config } from "@/infrastructure/config/appConfig";

const ABSOLUTE_URL = /^(https?:|blob:|data:)/i;

export const resolveMediaUrl = (url?: string | null, baseUrl: string = config.api.baseUrl): string => {
  if (!url) return "";

  const trimmed = url.trim();
  if (!trimmed) return "";
  if (ABSOLUTE_URL.test(trimmed)) return trimmed;

  const origin = baseUrl.replace(/\/$/, "");
  return trimmed.startsWith("/") ? `${origin}${trimmed}` : `${origin}/${trimmed}`;
};
