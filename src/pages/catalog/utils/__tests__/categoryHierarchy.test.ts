import { describe, expect, it } from "vitest";
import {
  formatCategoryTreeLabel,
  sortCategoriesHierarchically,
} from "@/pages/catalog/utils/categoryHierarchy";

const cat = (id: string, parentCategoryId?: string) => ({ id, parentCategoryId });

describe("sortCategoriesHierarchically", () => {
  it("returns an empty list unchanged", () => {
    expect(sortCategoriesHierarchically([])).toEqual([]);
  });

  it("keeps root-only lists in original order", () => {
    const input = [cat("b"), cat("a"), cat("c")];
    expect(sortCategoriesHierarchically(input).map((node) => node.item.id)).toEqual(["b", "a", "c"]);
  });

  it("places children immediately under their parent even when they arrive first", () => {
    const input = [cat("child", "parent"), cat("parent"), cat("other")];
    const ordered = sortCategoriesHierarchically(input);

    expect(ordered.map((node) => ({ id: node.item.id, depth: node.depth }))).toEqual([
      { id: "parent", depth: 0 },
      { id: "child", depth: 1 },
      { id: "other", depth: 0 },
    ]);
  });

  it("nests multiple levels and preserves sibling order", () => {
    const input = [
      cat("android", "phones"),
      cat("ios", "phones"),
      cat("shirts", "clothing"),
      cat("phones", "electronics"),
      cat("electronics"),
      cat("clothing"),
    ];

    expect(sortCategoriesHierarchically(input).map((node) => node.item.id)).toEqual([
      "electronics",
      "phones",
      "android",
      "ios",
      "clothing",
      "shirts",
    ]);
  });

  it("treats a missing parent as a root", () => {
    const ordered = sortCategoriesHierarchically([cat("orphan", "gone"), cat("root")]);
    expect(ordered.map((node) => ({ id: node.item.id, depth: node.depth }))).toEqual([
      { id: "orphan", depth: 0 },
      { id: "root", depth: 0 },
    ]);
  });

  it("does not loop on cycles and still emits every category", () => {
    const ordered = sortCategoriesHierarchically([cat("a", "b"), cat("b", "a")]);
    expect(ordered.map((node) => node.item.id).sort()).toEqual(["a", "b"]);
    expect(ordered).toHaveLength(2);
  });

  it("breaks a self-parent without duplicating the row", () => {
    const ordered = sortCategoriesHierarchically([cat("self", "self")]);
    expect(ordered).toEqual([{ item: cat("self", "self"), depth: 0 }]);
  });
});

describe("formatCategoryTreeLabel", () => {
  it("leaves roots unprefixed and indents descendants", () => {
    expect(formatCategoryTreeLabel("Electronics", 0)).toBe("Electronics");
    expect(formatCategoryTreeLabel("Phones", 1)).toBe("\u00A0\u00A0└ Phones");
  });
});
