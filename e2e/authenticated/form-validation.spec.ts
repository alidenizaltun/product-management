import { test, expect } from "@playwright/test";

/**
 * Her ekleme formunu boş göndererek doğrulama davranışını sınar.
 *
 * Salt okunur: doğrulama istemci tarafında engellediği için hiçbir POST
 * çıkmaz - testler bunu ayrıca assert eder, böylece paylaşımlı dev DB'ye
 * çöp kayıt yazılmadığı garanti altına alınır.
 */

interface RequiredFieldForm {
  route: string;
  submitLabel: string;
  /** Boş gönderimde görünmesi beklenen doğrulama mesajı. */
  expectedMessage: string;
}

const REQUIRED_FIELD_FORMS: RequiredFieldForm[] = [
  { route: "/definitions/categories/new", submitLabel: "Kaydet", expectedMessage: "Ad zorunludur" },
  { route: "/definitions/suppliers/new", submitLabel: "Kaydet", expectedMessage: "Ad zorunludur" },
  { route: "/definitions/warehouses/new", submitLabel: "Kaydet", expectedMessage: "Ad zorunludur" },
  { route: "/definitions/regions/new", submitLabel: "Kaydet", expectedMessage: "Ad zorunludur" },
  { route: "/definitions/software-units/new", submitLabel: "Kaydet", expectedMessage: "Ad zorunludur" },
  { route: "/definitions/attributes/new", submitLabel: "Kaydet", expectedMessage: "Görünen ad zorunludur" },
  { route: "/pricing/price-lists/new", submitLabel: "Kaydet", expectedMessage: "Ad zorunludur" },
  { route: "/identity/users/new", submitLabel: "Kaydet", expectedMessage: "E-posta zorunludur" },
  { route: "/identity/roles/new", submitLabel: "Kaydet", expectedMessage: "Rol adı zorunludur" },
  { route: "/inventory/transactions/new", submitLabel: "Kaydet", expectedMessage: "Ürün seçiniz" },
  { route: "/products/new", submitLabel: "Oluştur ve Devam Et", expectedMessage: "Ürün adı zorunludur" },
];

// Bu iki form doğrulama mesajı yerine "koşullar sağlanana kadar butonu kilitle"
// kalıbını kullanıyor; boş formda kaydet butonu pasif olmalı.
const DISABLED_SUBMIT_FORMS = [
  { route: "/pricing/templates/new", submitLabel: "Oluştur" },
  { route: "/pricing/revisions/new", submitLabel: "Devam Et" },
];

test.describe("Form doğrulamaları", () => {
  for (const { route, submitLabel, expectedMessage } of REQUIRED_FIELD_FORMS) {
    test(`boş gönderimde uyarı veriyor ve kayıt oluşturmuyor: ${route}`, async ({ page }) => {
      const writeRequests: string[] = [];
      page.on("request", (request) => {
        if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method())) {
          writeRequests.push(`${request.method()} ${request.url()}`);
        }
      });

      await page.goto(route);
      const submit = page.getByRole("button", { name: submitLabel, exact: false }).first();
      await expect(submit).toBeVisible({ timeout: 20_000 });
      await submit.click();

      await expect(page.getByText(expectedMessage).first()).toBeVisible({ timeout: 10_000 });
      // Doğrulama engellediği için sayfa değişmemeli ve hiçbir yazma isteği çıkmamalı.
      await expect.poll(() => new URL(page.url()).pathname).toBe(route);
      expect(writeRequests, `Boş form yazma isteği gönderdi: ${writeRequests.join(", ")}`).toEqual([]);
    });
  }

  for (const { route, submitLabel } of DISABLED_SUBMIT_FORMS) {
    test(`boş formda kaydet butonu pasif: ${route}`, async ({ page }) => {
      await page.goto(route);
      const submit = page.getByRole("button", { name: submitLabel, exact: false }).first();
      await expect(submit).toBeVisible({ timeout: 20_000 });
      await expect(submit).toBeDisabled();
    });
  }
});
