# ProductUnits backend degisikligi icin frontend uygulama notlari

Bu dokuman, ProductManager backend'inde yapilan yeni birim modeline gore `D:\Projects\React\product-management` React uygulamasinda yapilmasi gereken degisiklikleri tarif eder.

Backend'de artik `UnitDefinitions` tek basina urun fiyatlandirma akisini tasimiyor. `UnitDefinitions` global birim sozlugu olarak kalir; urune ait kullanilabilir birimler `ProductUnits` tablosunda tutulur. `LicenseOfferings` ve `PricingRules` artik dogrudan global `unitDefinitionId` yerine urune ait `productUnitId` ile baglanmalidir.

## Backend kontrat ozeti

Yeni tablo ve alanlar:

- `ProductUnits`
- `ProductLicenseOfferings.productUnitId`
- `ProductPricingRules.productUnitId`

`ProductDetailDto` icine yeni koleksiyon gelir:

```ts
productUnits: ProductUnitDto[]
```

Yeni endpointler:

```txt
GET    /api/products/{productId}/units
GET    /api/products/units/{productUnitId}
POST   /api/products/{productId}/units
PUT    /api/products/units/{productUnitId}
DELETE /api/products/units/{productUnitId}
```

Full create/update payload artik `productUnits` alabilir. Ayni request icinde olusturulan product unit, license offering ve pricing rule arasinda gecici bag kurmak icin `_tempId` / `productUnitTempId` kullanilir.

Ornek full payload parcasi:

```json
{
  "productUnits": [
    {
      "_tempId": "unit-user",
      "unitDefinitionId": "GUID",
      "code": "USER",
      "name": "Kullanici",
      "role": 1,
      "isDefault": true,
      "isActive": true,
      "sortOrder": 0
    }
  ],
  "licenseOfferings": [
    {
      "_tempId": "offering-pro",
      "productUnitTempId": "unit-user",
      "licenseModel": 4,
      "name": "Pro Plan",
      "basePrice": 100,
      "currencyCode": "TRY",
      "autoRenew": true,
      "isActive": true
    }
  ],
  "pricingRules": [
    {
      "licenseOfferingTempId": "offering-pro",
      "productUnitTempId": "unit-user",
      "code": "USER_TIER",
      "name": "Kullanici kademesi",
      "priority": 10,
      "isActive": true,
      "priceAdjustment": {
        "mode": "unit",
        "operation": "add",
        "unit": { "field": "feature.userCount" },
        "tiers": [{ "from": 1, "to": null, "type": "fixed", "value": 100 }]
      }
    }
  ]
}
```

Kayitli veride temp id yerine normal id kullanilir:

```json
{
  "licenseOfferings": [{ "productUnitId": "PRODUCT_UNIT_GUID" }],
  "pricingRules": [{ "productUnitId": "PRODUCT_UNIT_GUID" }]
}
```

## Degisecek frontend dosyalari

### 1. `src/shared/types/productOperations.types.ts`

Yeni DTO'lari ekleyin:

```ts
export interface ProductUnitDto {
  id: Uuid;
  productId: Uuid;
  unitDefinitionId: Uuid;
  unitDefinitionCode?: string | null;
  unitDefinitionName?: string | null;
  code: string;
  name: string;
  description?: string | null;
  role: UnitRole;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateProductUnitRequestDto {
  id?: Uuid;
  _tempId?: string;
  unitDefinitionId: Uuid;
  code: string;
  name: string;
  description?: string | null;
  role: UnitRole;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

export type UpdateProductUnitRequestDto = Omit<CreateProductUnitRequestDto, "id" | "_tempId">;
```

`ProductDetailDto` icine ekleyin:

```ts
productUnits?: ProductUnitDto[];
```

`ProductLicenseOfferingDto` icine ekleyin:

```ts
productUnitId?: Uuid | null;
productUnitCode?: string | null;
productUnitName?: string | null;
unitDefinitionId?: Uuid | null;
unitDefinitionCode?: string | null;
unitDefinitionName?: string | null;
```

Full payload icindeki `licenseOfferings` inline tipine ekleyin:

```ts
productUnitId?: Uuid;
productUnitTempId?: string;
```

`ProductPricingRuleDto` ve `UpsertProductPricingRuleRequestDto` icine ekleyin:

```ts
productUnitId?: Uuid | null;
productUnitCode?: string | null;
productUnitName?: string | null;
unitDefinitionId?: Uuid | null;
unitDefinitionCode?: string | null;
unitDefinitionName?: string | null;
```

Full payload icine ekleyin:

```ts
productUnits?: CreateProductUnitRequestDto[];
```

Not: `SoftwarePricingTierDto` ve `softwarePricingTiers` artik yeni akis icin kullanilmamali. Hemen silmek riskliyse type'lar kalabilir, ama create/update payload'a gonderilmemeli.

### 2. `src/shared/config/apiEndpoints.ts`

`products` altina endpointleri ekleyin:

```ts
productUnits: (productId: string) => `/api/products/${productId}/units`,
productUnitById: (productUnitId: string) => `/api/products/units/${productUnitId}`,
```

### 3. `src/services/query/queryKeys.ts`

Product unit icin query key ekleyin:

```ts
units: (id: string) => ["products", id, "units"] as const,
unit: (id: string) => ["products", "units", id] as const,
```

Mutation sonrasi su query'ler invalidate edilmeli:

- `queryKeys.products.detail(productId)`
- `queryKeys.products.units(productId)`
- `queryKeys.products.all`

### 4. `src/modules/products/api/products.api.ts`

Import listesine yeni type'lari ekleyin:

```ts
ProductUnitDto,
CreateProductUnitRequestDto,
UpdateProductUnitRequestDto,
```

API helper'lari ekleyin:

```ts
getProductUnits: async (productId: string): Promise<ProductUnitDto[]> =>
  apiClient.get<ProductUnitDto[]>(apiEndpoints.products.productUnits(productId)),

createProductUnit: async (
  productId: string,
  payload: CreateProductUnitRequestDto
): Promise<ProductUnitDto> =>
  apiClient.post<ProductUnitDto>(apiEndpoints.products.productUnits(productId), payload),

updateProductUnit: async (
  productUnitId: string,
  payload: UpdateProductUnitRequestDto
): Promise<void> =>
  apiClient.put<void>(apiEndpoints.products.productUnitById(productUnitId), payload),

deleteProductUnit: async (productUnitId: string): Promise<void> =>
  apiClient.delete<void>(apiEndpoints.products.productUnitById(productUnitId)),
```

`createLicenseOffering` ve `updateLicenseOffering` payload tipleri `productUnitId` alanini kabul etmeli. `ProductLicenseOfferingDto` uzerinden `Omit<...>` kullanildigi icin DTO guncellemesi yeterli olabilir.

### 5. `src/modules/products/types/productEditor.types.ts`

Yeni form tipi ekleyin:

```ts
export interface ProductUnitForm {
  id?: string;
  _tempId?: string;
  unitDefinitionId: string;
  code: string;
  name: string;
  description?: string;
  role: 1 | 2 | 3;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}
```

`LicenseOfferingForm` icine ekleyin:

```ts
productUnitId?: string;
productUnitTempId?: string;
```

`ProductFormValues` icine ekleyin:

```ts
productUnits: ProductUnitForm[];
```

Eski `softwarePricingTiers` form alanini yeni akis icin kullanmayin. Pricing rule editor zaten `ProductPricingRulesPanel` uzerinden ilerlemeli.

### 6. `src/modules/products/pages/ProductFormPage.tsx`

Default value'a ekleyin:

```ts
productUnits: [],
```

Edit mapping'de backend detail'den gelen unitleri forma tasiyin:

```ts
productUnits: (product.productUnits ?? []).map((unit) => ({
  id: unit.id,
  unitDefinitionId: unit.unitDefinitionId,
  code: unit.code,
  name: unit.name,
  description: unit.description ?? "",
  role: unit.role,
  isDefault: unit.isDefault,
  isActive: unit.isActive,
  sortOrder: unit.sortOrder,
})),
```

License offering mapping'e ekleyin:

```ts
productUnitId: lo.productUnitId ?? "",
```

Submit payload'da ekleyin:

```ts
productUnits: values.productUnits?.map((unit) => ({
  id: unit.id || undefined,
  _tempId: unit._tempId,
  unitDefinitionId: unit.unitDefinitionId,
  code: unit.code,
  name: unit.name,
  description: unit.description || undefined,
  role: unit.role,
  isDefault: unit.isDefault,
  isActive: unit.isActive,
  sortOrder: unit.sortOrder,
})),
```

License offering payload'da ekleyin:

```ts
productUnitId: lo.productUnitId || undefined,
productUnitTempId: lo.productUnitTempId || undefined,
```

Bu kisimda dikkat: `ProductUnits` full payload'da `LicenseOfferings` ve `PricingRules` ile birlikte gonderilecekse yeni unitlerde `_tempId`, offering/rule tarafinda `productUnitTempId` ayni string olmalidir.

### 7. Yeni editor: `src/modules/products/components/editor/ProductUnitsTab.tsx`

Mevcut `ProductUnitConversionTab` donusum tablosu icin kalmali. Yeni ihtiyac farkli: urune ait kullanilabilir birimleri tanimlayan bir editor lazim.

Onerilen UI alanlari:

- UnitDefinition secimi
- Urun ici kod
- Urun ici ad
- Rol: Satis / Stok / Satin Alma
- Varsayilan mi
- Aktif mi
- Sira

Yeni kayitta `_tempId` uretin:

```ts
_tempId: `product-unit-${Date.now()}`
```

`isDefault` icin ayni urunde sadece bir default birim kalacak sekilde digerlerini false yapin.

Bu editor `ProductFormPage` icinde `LicenseOfferingsTab`dan once gorunmeli; cunku plan secimi product unit listesine bagli olacak.

### 8. `src/modules/products/components/editor/LicenseOfferingsTab.tsx`

Bu component artik product unit secimi gostermeli.

Gerekli veri:

```ts
const productUnits = useWatch({ control, name: "productUnits" }) ?? [];
```

Offering formuna select ekleyin:

```tsx
<select {...register(`licenseOfferings.${index}.productUnitId`)}>
  <option value="">Varsayilan urun birimi</option>
  {productUnits
    .filter((unit) => unit.isActive)
    .map((unit) => (
      <option key={unit.id ?? unit._tempId} value={unit.id ?? ""}>
        {unit.name}
      </option>
    ))}
</select>
```

Yeni kaydedilmemis unit secilecekse sadece `productUnitId` yetmez. Bu durumda formda `productUnitTempId` tutulmali:

- Secilen option kayitli unit ise `productUnitId = unit.id`
- Secilen option yeni unit ise `productUnitTempId = unit._tempId`

Bu nedenle option value icin pratik model:

```ts
const value = unit.id ? `id:${unit.id}` : `temp:${unit._tempId}`;
```

Submit sirasinda bunu iki alana ayirin.

Standalone `createLicenseOffering(productId, payload)` akisi sadece kayitli `productUnitId` ile calisir. Henuz kaydedilmemis ProductUnit'e baglanacak planlar full save akisiyle gonderilmeli.

### 9. `src/modules/products/components/pricing-rules/ProductPricingRulesPanel.tsx`

Props'a product units ekleyin:

```ts
productUnits?: ProductUnitDto[];
```

`ProductFormPage` ve detail tab kullanirken su sekilde gecin:

```tsx
<ProductPricingRulesPanel
  productId={id}
  licenseOfferings={product?.licenseOfferings ?? []}
  productUnits={product?.productUnits ?? []}
/>
```

Rule form modeline ekleyin:

```ts
productUnitId?: string;
productUnitTempId?: string;
```

UI'da rule scope alanina "Urun birimi" select'i ekleyin. Secenekler `productUnits` listesinden gelmeli. Bu alan `priceAdjustment.unit.field` ile karistirilmamali:

- `productUnitId`: kural hangi urun birimine aittir?
- `priceAdjustment.unit.field`: kullanicidan alinacak miktar hangi feature alanindan okunur? Ornek `feature.userCount`.

Payload olustururken:

```ts
productUnitId: form.productUnitId || undefined,
productUnitTempId: form.productUnitTempId || undefined,
```

Standalone rule create/update icin kayitli `productUnitId` kullanin. Yeni product unit ile ayni anda rule olusturulacaksa full payload gerekir.

### 10. Detail ekranlari

`src/modules/products/components/detail/ProductDetailTabs.tsx` icinde:

- ProductUnits icin yeni bir bolum/tab ekleyin veya mevcut genel bilgi bolumunde listeleyin.
- License offerings tablosunda planin `productUnitName` alanini gosterin.
- Pricing rules tablosunda rule'un `productUnitName` alanini gosterin.

`src/modules/products/components/detail/ProductDetailHero.tsx` icinde ana birim sinyali gerekiyorsa `product.productUnits?.find(u => u.isDefault)` kullanilabilir.

### 11. Mock ve testler

Guncellenecek dosyalar:

- `src/tests/mocks/fixtures.ts`
- `src/tests/mocks/handlers.ts`
- `src/modules/products/__tests__/productFormMapping.test.ts`

Fixture product detail icine ekleyin:

```ts
productUnits: [
  {
    id: "product-unit-user",
    productId: "product-001",
    unitDefinitionId: "unit-user",
    unitDefinitionCode: "USER",
    unitDefinitionName: "Kullanici",
    code: "USER",
    name: "Kullanici",
    role: 1,
    isDefault: true,
    isActive: true,
    sortOrder: 0,
    createdAt: new Date().toISOString(),
  },
],
```

Mapping testlerinde kontrol edin:

- `product.productUnits` formdaki `productUnits` alanina tasiniyor.
- `licenseOfferings[].productUnitId` korunuyor.
- Full submit payload `productUnits` ve offering/rule `productUnitId` alanlarini gonderiyor.

### 12. Eski unit conversion ile yeni product unit farki

Mevcut `ProductUnitConversionTab` su is icindir:

```txt
1 Kutu = 12 Adet
```

Yeni `ProductUnits` su is icindir:

```txt
Bu yazilim urununde fiyatlandirilabilir birimler: Kullanici, Sube, Cihaz
```

Bu nedenle conversion editor'u yeni product unit editor'u yerine kullanilmaz.

### 13. Uygulama sirasi

1. Type dosyalarini guncelleyin.
2. Endpoint ve API helper'larini ekleyin.
3. `ProductFormValues` ve `ProductFormPage` mapping/submit akisini guncelleyin.
4. `ProductUnitsTab` editor'unu ekleyin.
5. `LicenseOfferingsTab` icine product unit secimi ekleyin.
6. `ProductPricingRulesPanel` icine product unit scope secimi ekleyin.
7. Detail ekranlarinda product unit bilgisini gosterin.
8. Mock ve mapping testlerini guncelleyin.
9. `npm.cmd run build` ile dogrulayin.

### 14. Kabul kriterleri

- Bir urunde birden fazla ProductUnit tanimlanabiliyor.
- License offering bir ProductUnit'e baglanabiliyor.
- Pricing rule bir ProductUnit'e baglanabiliyor.
- Product detail refresh sonrasi bu baglar kaybolmuyor.
- Yeni product + yeni unit + yeni license offering + yeni pricing rule ayni full save ile olusturulabiliyor.
- Kayitli urunde standalone plan/rule kaydi yaparken kayitli `productUnitId` gonderiliyor.
- `softwarePricingTiers` yeni kayit akisi icin payload'a girmiyor.
