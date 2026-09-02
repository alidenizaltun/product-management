# Sayfa kalıpları / form davranışı — ortak kurallar

Bu dosya PM ve B2B panellerinde birebir aynıdır (Faz 6, kalite programı). Amaç: aynı UI durumunun her iki panelde de aynı bileşenle çözülmesi. Yeni bir sayfa yazarken veya var olan bir sayfaya dokunurken buradaki eşleşmeyi kullan; tüm mevcut sayfaları bu kalıba geçirmek ayrı ve kademeli bir iştir (bkz. proje memory'si `quality-program-phase6-progress`), bu dosya sadece **yeni/dokunulan** kod için bağlayıcıdır.

| Durum | Kullanılacak bileşen | Notlar |
|---|---|---|
| Liste boş | `EmptyState` (`icon`, `title`, `description`, `action`) | `action`'a genelde "Yeni X" butonu konur. Elle `<span className="text-soft">...</span>` yazma. |
| Veri yükleniyor (tam sayfa/tab) | `PageSkeleton`, `DetailSkeleton`, `FormSkeleton`, `TableSkeleton`, `CardSkeleton`, `StatCardSkeleton` (`LoadingSkeleton.tsx`) | Hangisi sayfanın kalıbına uyuyorsa o. Küçük/yerel bir alan için `LoadingOverlay`/`InlineLoading`. |
| Sorgu hatası (sayfa/panel seviyesi, tekrar denenebilir) | `StatusAlert status="error" onRetry={...}` | Kullanıcı "Tekrar Dene" ile aynı sorguyu yeniden tetikleyebiliyorsa bu. |
| Mutasyon sonucu (kaydet/sil/onayla vb.) | Toast: `showSuccess` / `showError` / `showWarning` / `showInfo` / `showApiError` (`notificationHelpers`/`NotificationAlert`) | Başarı her zaman toast; API hatasında `showApiError(err)` kullan (varsa alan bazlı mesajları da listeler). Sayfa içine kalıcı bir hata bandı gerekiyorsa `InlineAlert`/`StatusAlert`. |
| Form alanı (label + kontrol + hata/hint) | `FormField` + `TextInput`/`NumberInput`/`Textarea`/`Checkbox` | Zorunlu alan işareti, hata metni yeri, label hizası bu bileşenlerin içinde sabit — elle `<label className="form-label">*</label>` tekrar etme. react-select/tarih seçici gibi kendi kontrolünü getiren alanlarda `FormField`'i doğrudan sarmalayıcı olarak kullan. |
| Kaydet/Onayla butonu | `LoadingButton` (`loading`, `loadingText`) | Elle `{isLoading ? <Spinner/>+"..." : "Kaydet"}` deseni yazma; `LoadingButton` ayrıca yüklenirken çift tıklamayı da engeller. |
| Kaydet/Vazgeç düzeni | Birincil aksiyon (Kaydet/Oluştur) görsel olarak öne çıkan konumda (yatay düzende sağda, dikey `d-grid` yığında üstte); ikincil aksiyon (İptal/Vazgeç) daha soluk (`color="light" outline`). | Mevcut PM ve B2B formları bu düzeni zaten kullanıyor. |
| Onay istemi (sil, geri alınamaz işlem) | `ConfirmDialog` (`variant="danger"` silme için, `warning` diğer geri dönüşü zor işlemler için) | |
| Kaydedilmemiş değişiklik uyarısı | `useUnsavedChangesGuard` + `UnsavedChangesDialog` | Router'ın data-router (`createBrowserRouter`) modunda olmasını gerektirir — her iki panel de artık bu modda. |
| Detay sayfası veri çekme | Mümkünse React Query tabanlı bir hook (`useXxxDetail` gibi); yoksa mevcut `useEffect`+`useState` deseni kabul edilir ama yeni sayfalarda React Query tercih edilir. | Bu tek satır bir "kural" değil, yön — zorlayıcı değil. |

## Neden bağlayıcı değil (henüz)

B2B'nin ~40 sayfasının tamamını bu kalıba geçirmek büyük, çok oturumluk bir iş ve programın "küçük adımlar, dev-refactor commit'i yok" ilkesine aykırı düşer. Faz 6 kapsamında Siparişler (B2B) sayfaları örnek olarak bu kalıba geçirildi (EmptyState + LoadingButton) — kanıt bu. Geri kalan sayfalar dokunuldukça bu tabloya göre güncellenir.
