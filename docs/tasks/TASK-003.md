# TASK-003

## Title

Cover media upload and software advanced profile

## Goal

A software product can receive at least one media file and a filled software
profile (Gelişmiş Ayarlar), both of which persist after reload with no layout
or save regression.

## Context

Medya (`MediaPage` + `MediaUploadManager`) has no dedicated E2E; `ui-sweep`
only visits the route. Gelişmiş Ayarlar (`AdvancedSettingsPage` +
`ProfileEditor`) has a layout-only spec (`advanced-settings.spec.ts`) that
asserts the software/physical/service heading appears and that
`.pricing-form-grid` is absent. It does not fill or save `softwareProfile`.

Software profile fields that must be exercised: version, download URL,
supported platforms JSON, system requirements JSON, release notes.

Origin: User request for a software-product end-to-end verification backlog.

## Dependencies

```
Depends On: TASK-001
Blocks:     -
```

## Required Skills

- testing

## Recommended Skills

- NONE

## Validation / Review Skills

- review-code if upload or JSON-field save is fixed

## Relevant Areas

- `src/pages/products/sections/MediaPage.tsx`
- `src/pages/products/components/editor/MediaUploadManager.tsx`
- `src/application/hooks/useProductMedia.ts`
- `src/pages/products/sections/AdvancedSettingsPage.tsx`
- `src/pages/products/components/editor/ProfileEditor.tsx`
- `src/components/shared/JsonFieldEditor.tsx`
- `e2e/authenticated/advanced-settings.spec.ts`
- `e2e/authenticated/ui-sweep.spec.ts` (do not expand the sweep; keep a real spec)

## Implementation Notes

- Use the TASK-001 helper.
- Media: upload a small generated PNG (or a fixture under `e2e/`), wait for the
  upload request to succeed, assert the file appears in the gallery, reload,
  still present. If a cover/primary toggle exists, set it and assert it.
- Do not depend on a real user photo. Generate bytes in the test.
- Reject oversized files if the UI already enforces `MAX_FILE_SIZE`; one
  failure-path assertion is enough.
- Advanced: fill software profile fields, save, reload, values match. JSON
  editors must receive valid JSON the existing `JsonFieldEditor` accepts.
- Keep the existing layout assertion (no `.pricing-form-grid` on this page).
- Clean up uploaded media if the API allows delete; otherwise unique product
  names from TASK-001 isolate leftovers.
- Do not test physical/service/subscription profiles here.

## Acceptance Criteria

- [x] An image can be uploaded on Medya and is still listed after reload
- [x] Upload failure (too large or rejected type) is visible and does not corrupt the gallery
- [x] Software profile fields save and survive reload
- [x] Gelişmiş Ayarlar still does not render `.pricing-form-grid`
- [x] No 4xx/5xx on the successful save/upload path

## Testing Requirements

E2E writable:

- media upload happy path + reload
- one media rejection path
- software profile save + reload

Unit: `ProfileEditor.test.tsx` already checks that the software heading
renders. Add a save-payload unit test only if `productFormMapper` drops
`softwareProfile` fields.

## Potential Risks

- Upload hits a different host than `VITE_API_BASE_URL`; follow the existing
  media helper, do not invent a second client.
- JSON field editors can swallow invalid input silently; assert the saved
  payload or the reloaded form, not only that the save button was clicked.

## Definition of Done

- [x] Acceptance criteria met
- [x] Tests written and passing
- [x] Typecheck / lint / build pass where they exist
- [x] Diff self-reviewed
- [x] Independent Grok review skipped
- [x] No unrelated changes
- [x] Docs updated if this made them wrong
- [x] TASK-INDEX.md status set to DONE
