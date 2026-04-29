/**
 * Utilities for parsing structured validation errors from the .NET backend
 * and mapping them to react-hook-form field paths.
 */

export interface ParsedApiErrors {
  /** Field-keyed errors, e.g. { "product.name": ["Required"] } */
  fieldErrors: Record<string, string[]>;
  /** Non-field errors (general messages) */
  generalErrors: string[];
}

// ─── raw response shapes from ASP.NET Core ────────────────────────────────────

interface DotNetValidationProblem {
  title?: string;
  errors?: Record<string, string[]>;
  message?: string;
  messages?: string[];
}

interface CustomApiError {
  succeeded?: boolean;
  errors?: string[] | Record<string, string[]>;
  message?: string;
}

/**
 * Extracts field errors and general errors from an axios-rejected error value.
 * Handles:
 *  - ASP.NET Core ProblemDetails / ValidationProblemDetails (errors is object)
 *  - Custom { errors: string[] } shapes
 *  - Plain { message: string }
 */
export function parseApiErrors(error: unknown): ParsedApiErrors {
  const fieldErrors: Record<string, string[]> = {};
  const generalErrors: string[] = [];

  // Try to reach response.data from an axios-like error
  let data: unknown =
    (error as { response?: { data?: unknown } })?.response?.data ?? error;

  if (!data || typeof data !== "object") {
    if (typeof error === "string") generalErrors.push(error);
    return { fieldErrors, generalErrors };
  }

  const obj = data as DotNetValidationProblem & CustomApiError;

  // ASP.NET Core ValidationProblemDetails: errors is Record<field, string[]>
  if (obj.errors && typeof obj.errors === "object" && !Array.isArray(obj.errors)) {
    for (const [key, msgs] of Object.entries(
      obj.errors as Record<string, string[]>
    )) {
      fieldErrors[key] = Array.isArray(msgs) ? msgs : [String(msgs)];
    }
    return { fieldErrors, generalErrors };
  }

  // Custom API: errors is string[]
  if (Array.isArray(obj.errors)) {
    obj.errors.forEach((e: string) => generalErrors.push(e));
    return { fieldErrors, generalErrors };
  }

  // Fallback: top-level message
  if (obj.message) {
    generalErrors.push(obj.message);
  } else if (obj.title) {
    generalErrors.push(obj.title);
  }

  return { fieldErrors, generalErrors };
}

/**
 * Converts a dotnet-style field key into a react-hook-form path.
 *
 * Examples:
 *  "product.name"                              → "name"
 *  "CategoryMaps[0].ProductCategoryId"         → "categoryMaps.0.productCategoryId"
 *  "Variants[1].Sku"                           → "variants.1.sku"
 *  "inventories[0].warehouseId"                → "inventories.0.warehouseId"
 */
export function toFormPath(serverKey: string): string {
  return (
    serverKey
      // Remove leading "product." wrapper (the backend nests product fields there)
      .replace(/^product\./i, "")
      // Convert bracket notation [0] → .0
      .replace(/\[(\d+)\]/g, ".$1")
      // camelCase the first character of each segment
      .split(".")
      .map((seg) => seg.charAt(0).toLowerCase() + seg.slice(1))
      .join(".")
  );
}

/**
 * Returns a human-readable summary of all general errors joined as a single string.
 */
export function generalErrorMessage(errors: ParsedApiErrors): string {
  return errors.generalErrors.join(" ");
}
