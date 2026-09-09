import { DEFAULT_CURRENCY_CODE } from "@/shared/config/currency";
import type {
  AttributeValueForm,
  CategoryMapForm,
  ProductRegionForm,
} from "@/pages/products/types/productEditor.types";

export type AssignmentPlacement = "filled-empty" | "appended" | "already-present";

export interface AssignmentResult<T> {
  next: T[];
  placement: AssignmentPlacement;
}

/**
 * Places a newly created category onto the product form: fills the first empty
 * row, otherwise appends. Duplicate ids are left unchanged.
 */
export const placeCategoryAssignment = (
  current: CategoryMapForm[],
  categoryId: string
): AssignmentResult<CategoryMapForm> => {
  if (current.some((row) => row.productCategoryId === categoryId)) {
    return { next: current, placement: "already-present" };
  }

  const emptyIndex = current.findIndex((row) => !row.productCategoryId);
  if (emptyIndex >= 0) {
    return {
      next: current.map((row, index) =>
        index === emptyIndex ? { ...row, productCategoryId: categoryId } : row
      ),
      placement: "filled-empty",
    };
  }

  return {
    next: [
      ...current,
      {
        productCategoryId: categoryId,
        isPrimary: current.length === 0,
        sortOrder: current.length + 1,
      },
    ],
    placement: "appended",
  };
};

/**
 * Places a newly created attribute definition onto the product form. The value
 * is left empty so the user can fill it on the classification page.
 */
export const placeAttributeAssignment = (
  current: AttributeValueForm[],
  attributeDefinitionId: string
): AssignmentResult<AttributeValueForm> => {
  if (current.some((row) => row.attributeDefinitionId === attributeDefinitionId)) {
    return { next: current, placement: "already-present" };
  }

  const emptyIndex = current.findIndex((row) => !row.attributeDefinitionId);
  if (emptyIndex >= 0) {
    return {
      next: current.map((row, index) =>
        index === emptyIndex ? { ...row, attributeDefinitionId } : row
      ),
      placement: "filled-empty",
    };
  }

  return {
    next: [...current, { attributeDefinitionId, valueText: "" }],
    placement: "appended",
  };
};

/**
 * Places a newly created region onto the product form. The first region on an
 * empty list becomes the default sales region.
 */
export const placeRegionAssignment = (
  current: ProductRegionForm[],
  regionId: string
): AssignmentResult<ProductRegionForm> => {
  if (current.some((row) => row.regionId === regionId)) {
    return { next: current, placement: "already-present" };
  }

  const emptyIndex = current.findIndex((row) => !row.regionId);
  if (emptyIndex >= 0) {
    return {
      next: current.map((row, index) => (index === emptyIndex ? { ...row, regionId } : row)),
      placement: "filled-empty",
    };
  }

  return {
    next: [
      ...current,
      {
        regionId,
        currencyCode: DEFAULT_CURRENCY_CODE,
        taxRate: undefined,
        isDefault: current.length === 0,
        isActive: true,
        sortOrder: current.length,
      },
    ],
    placement: "appended",
  };
};
