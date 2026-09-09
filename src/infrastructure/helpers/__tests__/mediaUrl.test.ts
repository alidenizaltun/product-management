import { describe, it, expect } from "vitest";
import { resolveMediaUrl } from "@/infrastructure/helpers/mediaUrl";

describe("resolveMediaUrl", () => {
  it("göreli yükleme yolunu API tabanına bağlar", () => {
    expect(resolveMediaUrl("/uploads/products/abc/kapak.png", "https://pmapi.deva.net.tr/")).toBe(
      "https://pmapi.deva.net.tr/uploads/products/abc/kapak.png"
    );
  });

  it("mutlak URL'yi olduğu gibi bırakır", () => {
    expect(resolveMediaUrl("https://cdn.example.com/a.jpg", "https://pmapi.deva.net.tr/")).toBe(
      "https://cdn.example.com/a.jpg"
    );
  });

  it("boş değeri boş string döndürür", () => {
    expect(resolveMediaUrl(undefined)).toBe("");
    expect(resolveMediaUrl("   ")).toBe("");
  });

  it("data URL'yi olduğu gibi bırakır", () => {
    const dataUrl = "data:image/png;base64,AAAA";
    expect(resolveMediaUrl(dataUrl, "https://pmapi.deva.net.tr/")).toBe(dataUrl);
  });
});
