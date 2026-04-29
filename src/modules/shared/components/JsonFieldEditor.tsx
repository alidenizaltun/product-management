/**
 * JsonFieldEditor
 *
 * A react-hook-form–integrated component that replaces raw JSON text inputs with
 * a visual dynamic form builder.  Supports two field types:
 *   - "object"  →  key-value pair builder
 *   - "array"   →  tag/chip list with optional preset suggestions
 *
 * An optional "JSON mode" toggle lets advanced users edit the raw JSON directly.
 *
 * Usage:
 *   <JsonFieldEditor name="metadataJson"        type="object" label="Metadata" />
 *   <JsonFieldEditor name="supportedPlatformsJson" type="array"
 *                   label="Platformlar" suggestions={PLATFORMS} />
 */
import React, { useCallback, useEffect, useId, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldType = "object" | "array";

interface Pair {
  key: string;
  value: string;
}

export interface JsonFieldEditorProps {
  /** react-hook-form field path, e.g. "metadataJson" or "variants.0.optionValuesJson" */
  name: string;
  label: string;
  type: FieldType;
  /** For array type: preset values shown as toggleable chips */
  suggestions?: string[];
  /** Extra className on the outer wrapper */
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseToObject(raw: string | undefined | null): Pair[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.entries(parsed).map(([key, value]) => ({
        key,
        value: typeof value === "string" ? value : JSON.stringify(value),
      }));
    }
  } catch {
    /* ignore – user edited raw JSON directly */
  }
  return [];
}

function parseToArray(raw: string | undefined | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    /* ignore */
  }
  return [];
}

function pairsToJson(pairs: Pair[]): string | undefined {
  if (pairs.length === 0) return undefined;
  const obj: Record<string, string> = {};
  pairs.forEach(({ key, value }) => {
    if (key.trim()) obj[key.trim()] = value;
  });
  return Object.keys(obj).length === 0 ? undefined : JSON.stringify(obj);
}

function arrayToJson(items: string[]): string | undefined {
  if (items.length === 0) return undefined;
  return JSON.stringify(items);
}

// ─── Object builder ───────────────────────────────────────────────────────────

interface ObjectBuilderProps {
  pairs: Pair[];
  onChange: (pairs: Pair[]) => void;
}

const ObjectBuilder: React.FC<ObjectBuilderProps> = ({ pairs, onChange }) => {
  const uid = useId();

  const update = (index: number, field: keyof Pair, val: string) => {
    const next = pairs.map((p, i) => (i === index ? { ...p, [field]: val } : p));
    onChange(next);
  };

  return (
    <div>
      {pairs.length > 0 && (
        <div className="table-responsive mb-2">
          <table className="table table-sm table-bordered mb-0">
            <thead className="table-light">
              <tr>
                <th className="fw-semibold" style={{ width: "40%" }}>
                  Anahtar
                </th>
                <th className="fw-semibold">Değer</th>
                <th style={{ width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {pairs.map((pair, i) => (
                <tr key={`${uid}-${i}`}>
                  <td className="p-1">
                    <input
                      className="form-control form-control-sm"
                      placeholder="anahtar"
                      value={pair.key}
                      onChange={(e) => update(i, "key", e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      className="form-control form-control-sm"
                      placeholder="değer"
                      value={pair.value}
                      onChange={(e) => update(i, "value", e.target.value)}
                    />
                  </td>
                  <td className="p-1 text-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-icon btn-trigger text-danger"
                      title="Sil"
                      onClick={() =>
                        onChange(pairs.filter((_, idx) => idx !== i))
                      }
                    >
                      <em className="icon ni ni-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
        onClick={() => onChange([...pairs, { key: "", value: "" }])}
      >
        <em className="icon ni ni-plus me-1" />
        Alan Ekle
      </button>
    </div>
  );
};

// ─── Array / Tag builder ──────────────────────────────────────────────────────

interface ArrayBuilderProps {
  items: string[];
  suggestions?: string[];
  onChange: (items: string[]) => void;
}

const ArrayBuilder: React.FC<ArrayBuilderProps> = ({
  items,
  suggestions,
  onChange,
}) => {
  const [draft, setDraft] = useState("");
  const uid = useId();

  const toggleSuggestion = (val: string) => {
    if (items.includes(val)) {
      onChange(items.filter((i) => i !== val));
    } else {
      onChange([...items, val]);
    }
  };

  const addCustom = () => {
    const trimmed = draft.trim();
    if (!trimmed || items.includes(trimmed)) return;
    onChange([...items, trimmed]);
    setDraft("");
  };

  const removeItem = (val: string) => onChange(items.filter((i) => i !== val));

  return (
    <div>
      {/* Preset suggestion chips */}
      {suggestions && suggestions.length > 0 && (
        <div className="mb-2">
          <p className="text-soft fs-12px mb-1">Önerilen seçenekler:</p>
          <div className="d-flex flex-wrap gap-1 pb-4">
            {suggestions.map((s) => {
              const active = items.includes(s);
              return (
                <button
                  key={`${uid}-sug-${s}`}
                  type="button"
                  className={`btn btn-xs ${
                    active ? "btn-primary" : "btn-outline-secondary"
                  }`}
                  style={{ fontSize: 12, padding: "2px 10px" }}
                  onClick={() => toggleSuggestion(s)}
                >
                  {active && <em className="icon ni ni-check me-1" />}
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active item chips (non-suggestion items) */}
      {items.filter((i) => !suggestions?.includes(i)).length > 0 && (
        <div className="d-flex flex-wrap gap-1 mb-2">
          {items
            .filter((i) => !suggestions?.includes(i))
            .map((item) => (
              <span
                key={`${uid}-chip-${item}`}
                className="badge bg-outline-primary d-flex align-items-center gap-1"
                style={{ fontSize: 12 }}
              >
                {item}
                <button
                  type="button"
                  className="btn btn-icon p-0 lh-1 border-0 bg-transparent text-primary"
                  style={{ fontSize: 14, lineHeight: 1 }}
                  onClick={() => removeItem(item)}
                  aria-label={`${item} kaldır`}
                >
                  ×
                </button>
              </span>
            ))}
        </div>
      )}

      {/* Custom add row */}
      <div className="input-group input-group-sm" style={{ maxWidth: 320 }}>
        <input
          className="form-control"
          placeholder="Özel değer ekle..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
        />
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={addCustom}
        >
          Ekle
        </button>
      </div>

      {items.length === 0 && !suggestions?.length && (
        <p className="text-soft fs-12px mt-1 mb-0">
          Henüz öğe eklenmedi.
        </p>
      )}
    </div>
  );
};

// ─── JSON mode textarea ───────────────────────────────────────────────────────

interface JsonTextareaProps {
  value: string;
  onChange: (v: string) => void;
  error: string | null;
  type: FieldType;
}

const JsonTextarea: React.FC<JsonTextareaProps> = ({
  value,
  onChange,
  error,
  type,
}) => {
  const placeholder =
    type === "object"
      ? '{\n  "anahtar": "değer"\n}'
      : '[\n  "değer1",\n  "değer2"\n]';

  return (
    <div>
      <textarea
        className={`form-control font-monospace ${error ? "is-invalid" : ""}`}
        rows={6}
        style={{ fontSize: 12 }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const JsonFieldEditor: React.FC<JsonFieldEditorProps> = ({
  name,
  label,
  type,
  suggestions,
  className,
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <JsonFieldEditorInner
          value={field.value as string | undefined}
          onChange={field.onChange}
          label={label}
          type={type}
          suggestions={suggestions}
          className={className}
          externalError={fieldState.error?.message}
        />
      )}
    />
  );
};

// ─── Inner stateful component ─────────────────────────────────────────────────

interface InnerProps {
  value: string | undefined | null;
  onChange: (v: string | undefined) => void;
  label: string;
  type: FieldType;
  suggestions?: string[];
  className?: string;
  externalError?: string;
}

const JsonFieldEditorInner: React.FC<InnerProps> = ({
  value,
  onChange,
  label,
  type,
  suggestions,
  className,
  externalError,
}) => {
  const [advancedMode, setAdvancedMode] = useState(false);
  const [rawJson, setRawJson] = useState(value ?? "");
  const [jsonParseError, setJsonParseError] = useState<string | null>(null);

  // Object builder state
  const [pairs, setPairs] = useState<Pair[]>(() =>
    type === "object" ? parseToObject(value) : []
  );
  // Array builder state
  const [items, setItems] = useState<string[]>(() =>
    type === "array" ? parseToArray(value) : []
  );

  // Keep rawJson in sync when value changes externally (e.g. form reset)
  useEffect(() => {
    setRawJson(value ?? "");
    if (type === "object") setPairs(parseToObject(value));
    else setItems(parseToArray(value));
    setJsonParseError(null);
  }, [value, type]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const prettyPrint = useCallback(
    (v: string | undefined) => {
      if (!v) return "";
      try {
        return JSON.stringify(JSON.parse(v), null, 2);
      } catch {
        return v;
      }
    },
    []
  );

  // ── Visual mode change handlers ──────────────────────────────────────────

  const handlePairsChange = (next: Pair[]) => {
    setPairs(next);
    const json = pairsToJson(next);
    onChange(json);
  };

  const handleItemsChange = (next: string[]) => {
    setItems(next);
    const json = arrayToJson(next);
    onChange(json);
  };

  // ── JSON mode change handler ─────────────────────────────────────────────

  const handleRawChange = (raw: string) => {
    setRawJson(raw);
    setJsonParseError(null);
    if (raw.trim() === "") {
      onChange(undefined);
      return;
    }
    try {
      JSON.parse(raw);
      onChange(raw.trim());
    } catch (e: unknown) {
      const msg = e instanceof SyntaxError ? e.message : "Geçersiz JSON";
      setJsonParseError(`JSON hatası: ${msg}`);
      // Don't call onChange until valid
    }
  };

  // ── Toggle handlers ──────────────────────────────────────────────────────

  const switchToAdvanced = () => {
    setRawJson(prettyPrint(value) ?? "");
    setJsonParseError(null);
    setAdvancedMode(true);
  };

  const switchToVisual = () => {
    if (rawJson.trim() !== "") {
      try {
        const parsed = JSON.parse(rawJson.trim());
        if (type === "object") {
          if (typeof parsed !== "object" || Array.isArray(parsed)) {
            setJsonParseError("Obje JSON bekleniyor ({...}).");
            return;
          }
          setPairs(parseToObject(rawJson));
        } else {
          if (!Array.isArray(parsed)) {
            setJsonParseError("Dizi JSON bekleniyor ([...]).");
            return;
          }
          setItems(parseToArray(rawJson));
        }
        onChange(rawJson.trim());
      } catch (e: unknown) {
        const msg = e instanceof SyntaxError ? e.message : "Geçersiz JSON";
        setJsonParseError(
          `Görsel moda geçmek için geçerli JSON gereklidir: ${msg}`
        );
        return;
      }
    } else {
      if (type === "object") setPairs([]);
      else setItems([]);
      onChange(undefined);
    }
    setJsonParseError(null);
    setAdvancedMode(false);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={className}>
      {/* Header row: label + mode toggle */}
      <div className="d-flex align-items-center justify-content-between mb-1">
        <label className="form-label mb-0">{label}</label>
        <button
          type="button"
          className="btn btn-xs btn-dim btn-secondary"
          style={{ fontSize: 11, padding: "2px 8px" }}
          onClick={advancedMode ? switchToVisual : switchToAdvanced}
          title={
            advancedMode
              ? "Görsel moda geç"
              : "JSON moduna geç (Gelişmiş)"
          }
        >
          {advancedMode ? (
            <>
              <em className="icon ni ni-eye me-1" />
              Görsel Mod
            </>
          ) : (
            <>
              <em className="icon ni ni-code me-1" />
              JSON Modu
            </>
          )}
        </button>
      </div>

      {/* Field body */}
      {advancedMode ? (
        <JsonTextarea
          value={rawJson}
          onChange={handleRawChange}
          error={jsonParseError}
          type={type}
        />
      ) : type === "object" ? (
        <ObjectBuilder pairs={pairs} onChange={handlePairsChange} />
      ) : (
        <ArrayBuilder
          items={items}
          suggestions={suggestions}
          onChange={handleItemsChange}
        />
      )}

      {/* External (server-side) validation error */}
      {externalError && (
        <div className="text-danger fs-12px mt-1">{externalError}</div>
      )}
    </div>
  );
};

export default JsonFieldEditor;
