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

/** Browser FileReader wrapper used before posting media JSON (`url` is required). */
export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Dosya okunamadı."));
    reader.readAsDataURL(file);
  });
