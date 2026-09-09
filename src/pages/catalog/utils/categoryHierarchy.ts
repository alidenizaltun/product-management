export type CategoryHierarchyItem = {
  id: string;
  parentCategoryId?: string | null;
};

export type CategoryTreeNode<T extends CategoryHierarchyItem> = {
  item: T;
  depth: number;
};

const isMissingParent = (parentId: string | null | undefined, knownIds: Set<string>) =>
  !parentId || !knownIds.has(parentId);

/**
 * Depth-first tree order: each parent is immediately followed by its children.
 * Sibling order matches the original array. Categories whose parent is missing
 * are treated as roots. Cycles are broken so every item appears once.
 */
export const sortCategoriesHierarchically = <T extends CategoryHierarchyItem>(
  categories: T[]
): CategoryTreeNode<T>[] => {
  const knownIds = new Set(categories.map((category) => category.id));
  const childrenByParent = new Map<string, T[]>();
  const roots: T[] = [];

  for (const category of categories) {
    if (isMissingParent(category.parentCategoryId, knownIds)) {
      roots.push(category);
      continue;
    }

    const parentId = category.parentCategoryId as string;
    const siblings = childrenByParent.get(parentId);
    if (siblings) {
      siblings.push(category);
    } else {
      childrenByParent.set(parentId, [category]);
    }
  }

  const ordered: CategoryTreeNode<T>[] = [];
  const visited = new Set<string>();

  const visit = (category: T, depth: number) => {
    if (visited.has(category.id)) return;
    visited.add(category.id);
    ordered.push({ item: category, depth });
    for (const child of childrenByParent.get(category.id) ?? []) {
      visit(child, depth + 1);
    }
  };

  for (const root of roots) {
    visit(root, 0);
  }

  for (const category of categories) {
    if (!visited.has(category.id)) visit(category, 0);
  }

  return ordered;
};

/** Non-breaking spaces so HTML <option> labels keep their indent. */
export const formatCategoryTreeLabel = (name: string, depth: number): string =>
  `${"\u00A0\u00A0".repeat(depth)}${depth > 0 ? "└ " : ""}${name}`;
