# Project Initialization Prompt Template

Copy everything in the block below into a **new Claude Code session opened in
the new project's directory**. Replace only the Project Context section. Nothing
else changes, ever.

---

```text
/project-init

[PROJECT CONTEXT]

Şimdi product-management tafarını kapsamlı ele al. Yapacakların şunlar:

- Ürün genel bilgilerini düzenlerken kod üretim textinde "öner" diyince sürekli yeni bir kod önermeliyiz.

- Ürün genel bilgilerini düzenlerken Eğer tip olarak "Yazılım" seçilirse "Stok Takibi" switch hiç göstermemeliyiz.

- Ürün genel bilgilerini düzenlerken "Satılabilir" ve "Satın Alınabilir" isimlendirmelirini kullanım şekline göre yeniden isimlendirelim örnek "Bayiler Satın Alabilir" şeklinde veya tam olarak işlevi ne ise ona göre.

- "Kod sistem tarafından üretilir." tarzı yazıları kaldır heryerden. Sistemin bir şeyler yaptığını söylememize gerek yok.

- Modalların kenarına basınca modal kapanmasın sadece iptal tuşlarıyla kapansın.

- "Sıra" diye seçtirdiğimiz textBox'ları çok büyük yer kalpatıyoruz formlarda. Buna gerek yok onlar sadece sayı girilen küçük kutular bunları drag sistemi ile yapmalıyız örnekleri sınıflandırma sayfasında mevcut.

- Sayfalarda ürün seçimi yaparken localStorage'de silinmiş ürünler kalıyor ve bu da geçmişte gözüküyor silinen ürünleri orada göstermememiz lazım.

- Fiyatlandırma sayfasında plan ekliyoruz bildiğin üzere yazılım ürünlerine, burada plan kartlarını resimli kartlara çevirelim yani hepsinin basit resimleri olsun ve gerçek bir kart gibi dursun.

- Yeni fiyat şablonu oluşturma ekranı fiyatlandırma içindeki fiyatlandırma kuralı oluştur ile aynı olmalı şuan orası çok farklı.

- Tüm list sayfalarındaki table'lar b2b frontend projesindeki ile aynı tasarıma ve standarta sahip olsun. (D:\Projects\React\b2b)

- Son olarak senden şunu kesinlikle yapmanı istiyorum, tüm modal tarzları, form tarzları, liste tarzları, detay sayfaları, belirli bir standarta sahip olsun biri tamamen başka birisi tamamen başka olmasın.

[/PROJECT CONTEXT]
```

---

## What Happens Next

Claude will not write product code. It will:

1. Read the repository if one exists, otherwise work from your context alone
2. Reply with `PROJECT SUMMARY`, `ARCHITECTURE DIRECTION`, `KEY DECISIONS`,
   `ASSUMPTIONS`, `OPEN QUESTIONS`, `TASK SUMMARY`, `IMPLEMENTATION ORDER`,
   `RISKS`
3. Create `docs/PROJECT-BLUEPRINT.md`, `docs/ARCHITECTURE.md`,
   `docs/TASK-INDEX.md`, and `docs/tasks/TASK-XXX.md`
4. Stop and wait

Answer the `OPEN QUESTIONS` — especially the architectural ones — before
starting implementation. Then:

```text
TASK-001'i yap.
```

## Notes

- You do not need to type `/project-init`. Pasting a `[PROJECT CONTEXT]` block
  triggers the skill on its own. The explicit call just guarantees it.
- Incomplete context is fine. Unknowns get marked `UNKNOWN` and surfaced as open
  questions rather than silently invented.
- Do not paste the universal rules into this prompt. They load automatically
  from `~/.claude/CLAUDE.md` in every project.
- On complex or security-sensitive architecture, Claude may ask Grok 4.6 for a
  second opinion. Simple projects skip that. Grok does not write the plan.
