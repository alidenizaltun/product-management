# Katmanlı Mimari

Bu doküman PM panelinin katman modelini tanımlar. B2B paneli (`D:\Projects\React\b2b`) ile aynı iskeleti
kullanır (bkz. o depodaki `docs/architecture/layered-architecture.md`); PM'e özgü sapmalar aşağıda ayrıca
işaretlenmiştir.

Numaralandırma bağımlılık sırasıdır: her katman yalnızca kendisinden önceki katmanlara bağımlı olabilir.

## 1. `domain/` — framework'süz çekirdek

- `entities/*.ts` — düz TypeScript tipleri (ör. `User.ts`).
- `repositories/I*.ts` — arayüzler. Yalnızca metot imzaları; implementasyon içermez.
- `types/*.ts` — çapraz-kesen DTO/enum tanımları.

**PM'e özgü istisna:** `domain/types/productOperations.types.ts` (~1400 satır) products/pricing/catalog/
inventory/attributes DTO'larının tamamını tek dosyada barındırıyor — B2B'nin "entity başına dosya" kuralının
istisnası. Faz 4 kapsamında bölünmedi (67 dosyada kullanılıyor, bölme ayrı bir temizlik kararı).

**İçe aktarabilir:** hiçbir şey (yaprak katman).

## 2. `infrastructure/` — dış dünya ile temas

- `api/apiClient.ts` — **tek** axios instance. Request interceptor token enjekte eder; response interceptor
  401'de refresh-token kuyruğu işletir, her hatayı normalize edip `errorStatusRegistry`'ye kaydeder.
- `api/errorStatusRegistry.ts` — B2B'den taşındı; `components/ui/reactstrap.tsx`'teki `Alert` override'ı bunu okur.
- `api/repositories/*.ts` — her biri `domain/repositories/I*.ts`'yi `implements` eder, `apiClient` + `apiEndpoints`
  kullanır, class + singleton instance export eder, `repositories/index.ts`'ten barrel export edilir.
  **Bir entity = bir repository** (ör. `catalog.api.ts`'teki 4 iç grup `CategoryRepository`/`SupplierRepository`/
  `WarehouseRepository`/`RegionRepository`'ye bölündü). İstisna: `ProductRepository.ts` — Product aggregate'inin
  tüm nested alt-kaynaklarını (modules, pricing tiers/rules, units, license offerings, unit conversions, module
  offering prices — ~30 metot) tek dosyada tutar; bunlar ayrı entity değil, tek bir Product'ın alt-koleksiyonları.
- `config/`, `storage/`, `helpers/navigationService.ts` — ortam ayarları, token/oturum depolama, interceptor'ın
  component ağacı dışından yönlendirme yapabilmesi için navigasyon köprüsü.

**İçe aktarabilir:** `domain/`.

## 3. `application/` — durum ve iş akışı orkestrasyonu

- `stores/*.ts` — zustand store'ları. **Sadece `authStore` için kullanılıyor** (PM'de client-state orkestrasyonu
  ihtiyacı auth dışında yok; diğer feature'lar sunucu state'ini React Query ile yönetiyor).
- `hooks/*.ts` — **PM'in ana veri katmanı burası.** Her feature'ın React Query hook'ları (`useProducts`,
  `useCatalog`, `usePricing`, `useInventory`, `useAttributes`, `useUsers`, `useRoles`, `useSystemSettings`,
  `useIntegrations`, `useLookups`, `useUnitDefinitions`, `useRegions`, `usePricingTemplates`,
  `usePriceRevisions`, `useAuth`, `usePermission`, `useUnsavedChangesGuard`) burada yaşar. Hepsi ilgili
  repository'yi çağırır, `apiClient`'ı asla doğrudan çağırmaz.
- `services/*.ts` — henüz boş; saf iş mantığı yardımcıları gerektiğinde buraya eklenir.
- `usecases/` — kullanılmıyor (B2B'de sadece Auth için var, PM'de o katman bile React Query hook'una sığdı).

**B2B'den sapma:** B2B'de zustand her feature için store; PM'de React Query her feature için hook. Bu, PM'nin
zaten React Query + MSW test altyapısına sahip olmasından kaynaklanan bilinçli bir tercih — iki ayrı state
yönetim aracını zorla birleştirmek yerine, "sunucu state'i her zaman repository üzerinden, asla apiClient'a
doğrudan değil" kuralı korunarak mevcut araç korundu.

**İçe aktarabilir:** `domain/`, `infrastructure/`.

## 4. `pages/<feature>/`

Sayfa bileşenleri. İlgili React Query hook'unu (`useXQuery`) veya `useXStore()`'u çağırır. PM'nin zengin iç
organizasyonu (`components/editor`, `components/pricing`, `sections/`, `schemas/`, `utils/`, `types/`,
`config/`, `__tests__/`) feature'lar taşınırken korundu, B2B'nin daha basit CRUD yapısına zorla benzetilmedi.

**İçe aktarabilir:** `application/`, `domain/`, `components/`, `shared/`. **`infrastructure/api` ve
`infrastructure/api/*`'ı doğrudan içe aktaramaz** — `eslint.config.js`'teki `no-restricted-imports` kuralıyla
zorlanır (bkz. §6). `infrastructure/config` istisnadır.

## 5. `components/` ve `shared/`

- `components/shared/` — eski `modules/shared/components/`'tan taşınan paylaşımlı UI kütüphanesi (28 bileşen +
  `selects/` alt klasörü). `components/ui/reactstrap.tsx` B2B'den taşındı: `vite.config.ts`'teki alias ile bare
  `reactstrap` import'unu buraya yönlendirir, yalnızca `Alert` bileşenini `errorStatusRegistry` entegrasyonuyla
  override eder.
- `shared/config/` — `branding.ts`, `currency.ts` (katman-bağımsız, çapraz-kesen sabitler).

## 6. Sınır kuralı (ESLint)

`eslint.config.js` içinde `src/pages/**/*.{ts,tsx}` için `no-restricted-imports` kuralı `@/infrastructure/api`
ve `@/infrastructure/api/*` desenini yasaklar. Şu an **`warn`** seviyesinde — 7 dosyada (çoğu ürün editörü
bileşeni: `UnitQuickAddModal`, `SalesPlanModal`, `SalesPlanManager`, `GeneralInfoTab`, `ProductUnitConversionTab`,
`productUnitSync.ts`, bir test dosyası) mevcut ihlal var, `error`'a yükseltmeden önce bunlar temizlenmeli.

## Bilinen istisnalar / henüz kapanmamış borç

- `productOperations.types.ts` tek-dosya istisnası (madde 1).
- `ProductRepository.ts` çok-metotlu istisnası (madde 2).
- `pages/` altında 7 dosya repository'yi doğrudan çağırıyor — `no-restricted-imports` bunları `warn` ile
  işaretliyor, tek tek temizlenmesi ayrı bir iş kalemidir.
- `src/pages/` altında (DashLite şablonundan miras) router'a hiç bağlı olmayan ~67 demo sayfası var — Faz 4
  kapsamı dışı bırakıldı, ayrı bir temizlik kararı gerektiriyor.
