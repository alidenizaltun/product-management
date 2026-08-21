import React, { useMemo, useState } from "react";
import { Button } from "reactstrap";
import Icon from "@/components/icon/Icon";
import LookupSelect from "@/modules/shared/components/selects/LookupSelect";
import { showApiError, showSuccess } from "@/modules/shared/components/NotificationAlert";
import {
  useCategoryLookups,
  usePriceListLookups,
  useProductLookups,
  useRegionLookups,
  useUnitDefinitionLookups,
} from "@/services/lookup/useLookups";
import { usePricingTemplates } from "@/modules/pricing/hooks/usePricingTemplates";
import { PRICE_REVISION_SCOPE_TYPE } from "@/shared/types/productOperations.types";
import type { PriceRevisionScopeDto } from "@/shared/types/productOperations.types";
import {
  PRODUCT_KIND_OPTIONS,
  SCOPE_TYPE_OPTIONS,
  describeScopeType,
} from "./revisionDisplay";

interface PriceRevisionScopePanelProps {
  scopes: PriceRevisionScopeDto[];
  editable: boolean;
  onAdd: (scope: {
    scopeType: number;
    targetId?: string | null;
    targetValue?: string | null;
    isExclude: boolean;
  }) => Promise<unknown>;
  onRemove: (scopeId: string) => Promise<unknown>;
  busy?: boolean;
}

const PriceRevisionScopePanel: React.FC<PriceRevisionScopePanelProps> = ({
  scopes,
  editable,
  onAdd,
  onRemove,
  busy,
}) => {
  const [scopeType, setScopeType] = useState<number>(PRICE_REVISION_SCOPE_TYPE.PricingTemplate);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [targetValue, setTargetValue] = useState<string>("2");
  const [isExclude, setIsExclude] = useState(false);

  const { data: products = [], isLoading: productsLoading } = useProductLookups(true);
  const { data: categories = [], isLoading: categoriesLoading } = useCategoryLookups();
  const { data: regions = [], isLoading: regionsLoading } = useRegionLookups(true);
  const { data: unitDefinitions = [], isLoading: unitsLoading } = useUnitDefinitionLookups(true);
  const { data: priceLists = [], isLoading: priceListsLoading } = usePriceListLookups(true);
  const { data: templates = [], isLoading: templatesLoading } = usePricingTemplates({
    includeInactive: true,
  });

  const templateLookups = useMemo(
    () => templates.map((template) => ({ id: template.id, name: `${template.code} · ${template.name}` })),
    [templates]
  );

  const isProductKind = scopeType === PRICE_REVISION_SCOPE_TYPE.ProductKind;

  const currentSource = useMemo(() => {
    switch (scopeType) {
      case PRICE_REVISION_SCOPE_TYPE.Product:
        return { items: products, loading: productsLoading, placeholder: "Ürün seçin" };
      case PRICE_REVISION_SCOPE_TYPE.Category:
        return { items: categories, loading: categoriesLoading, placeholder: "Kategori seçin" };
      case PRICE_REVISION_SCOPE_TYPE.Region:
        return { items: regions, loading: regionsLoading, placeholder: "Bölge seçin" };
      case PRICE_REVISION_SCOPE_TYPE.UnitDefinition:
        return { items: unitDefinitions, loading: unitsLoading, placeholder: "Birim seçin" };
      case PRICE_REVISION_SCOPE_TYPE.PriceList:
        return { items: priceLists, loading: priceListsLoading, placeholder: "Fiyat listesi seçin" };
      case PRICE_REVISION_SCOPE_TYPE.PricingTemplate:
      default:
        return { items: templateLookups, loading: templatesLoading, placeholder: "Şablon seçin" };
    }
  }, [
    scopeType,
    products,
    productsLoading,
    categories,
    categoriesLoading,
    regions,
    regionsLoading,
    unitDefinitions,
    unitsLoading,
    priceLists,
    priceListsLoading,
    templateLookups,
    templatesLoading,
  ]);

  const canAdd = isProductKind ? Boolean(targetValue) : Boolean(targetId);

  const handleAdd = async () => {
    try {
      await onAdd({
        scopeType,
        targetId: isProductKind ? null : targetId,
        targetValue: isProductKind ? targetValue : null,
        isExclude,
      });
      setTargetId(null);
      setIsExclude(false);
      showSuccess("Kapsam eklendi. Önizlemeyi tazeleyin.");
    } catch (error) {
      showApiError(error);
    }
  };

  const productScopes = scopes.filter((scope) =>
    SCOPE_TYPE_OPTIONS.find((option) => option.value === scope.scopeType)?.role === "product"
  );
  const targetScopes = scopes.filter((scope) =>
    SCOPE_TYPE_OPTIONS.find((option) => option.value === scope.scopeType)?.role === "target"
  );

  const renderScopeRow = (scope: PriceRevisionScopeDto) => (
    <li key={scope.id} className="d-flex align-items-center justify-content-between py-1">
      <span>
        {scope.isExclude && <span className="badge bg-danger-dim text-danger me-2">Hariç</span>}
        <span className="text-soft">{describeScopeType(scope.scopeType)}:</span>{" "}
        <span className="fw-medium">
          {scope.targetName ??
            (scope.scopeType === PRICE_REVISION_SCOPE_TYPE.ProductKind
              ? PRODUCT_KIND_OPTIONS.find((kind) => kind.value === scope.targetValue)?.label
              : null) ??
            scope.targetValue ??
            "—"}
        </span>
      </span>
      {editable && (
        <button
          type="button"
          className="btn btn-icon btn-trigger text-danger btn-sm"
          title="Kaldır"
          disabled={busy}
          onClick={async () => {
            try {
              await onRemove(scope.id);
            } catch (error) {
              showApiError(error);
            }
          }}
        >
          <Icon name="trash" />
        </button>
      )}
    </li>
  );

  return (
    <div className="card card-bordered">
      <div className="card-inner">
        <h6 className="title mb-1">Kapsam</h6>
        <p className="text-soft small">
          <strong>Ürün filtresi</strong> hangi ürünlerin, <strong>hedef filtresi</strong> hangi
          fiyat alanlarının zamlanacağını belirler. Ürün filtresi verilmezse tüm ürünler,
          hedef filtresi verilmezse altı fiyat alanının tamamı kapsama girer.
        </p>

        <div className="row g-3 mt-1">
          <div className="col-md-6">
            <h6 className="overline-title mb-2">Ürün filtreleri</h6>
            {productScopes.length ? (
              <ul className="list-unstyled mb-0">{productScopes.map(renderScopeRow)}</ul>
            ) : (
              <p className="text-soft small mb-0">Yok — tüm ürünler kapsamda.</p>
            )}
          </div>
          <div className="col-md-6">
            <h6 className="overline-title mb-2">Hedef filtreleri</h6>
            {targetScopes.length ? (
              <ul className="list-unstyled mb-0">{targetScopes.map(renderScopeRow)}</ul>
            ) : (
              <p className="text-soft small mb-0">Yok — tüm fiyat alanları kapsamda.</p>
            )}
          </div>
        </div>

        {editable && (
          <div className="row g-2 align-items-end mt-3 pt-3 border-top">
            <div className="col-md-3">
              <label className="form-label">Tür</label>
              <select
                className="form-select"
                value={scopeType}
                onChange={(event) => {
                  setScopeType(Number(event.target.value));
                  setTargetId(null);
                }}
              >
                <optgroup label="Ürün filtresi">
                  {SCOPE_TYPE_OPTIONS.filter((option) => option.role === "product").map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Hedef filtresi">
                  {SCOPE_TYPE_OPTIONS.filter((option) => option.role === "target").map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="col-md-5">
              <label className="form-label">Hedef</label>
              {isProductKind ? (
                <select
                  className="form-select"
                  value={targetValue}
                  onChange={(event) => setTargetValue(event.target.value)}
                >
                  {PRODUCT_KIND_OPTIONS.map((kind) => (
                    <option key={kind.value} value={kind.value}>
                      {kind.label}
                    </option>
                  ))}
                </select>
              ) : (
                <LookupSelect
                  items={currentSource.items}
                  isLoading={currentSource.loading}
                  value={targetId}
                  onChange={setTargetId}
                  placeholder={currentSource.placeholder}
                />
              )}
            </div>

            <div className="col-md-2">
              <div className="custom-control custom-switch">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="scope-exclude"
                  checked={isExclude}
                  onChange={(event) => setIsExclude(event.target.checked)}
                />
                <label className="custom-control-label" htmlFor="scope-exclude">
                  Hariç tut
                </label>
              </div>
            </div>

            <div className="col-md-2">
              <Button color="primary" className="w-100" disabled={!canAdd || busy} onClick={handleAdd}>
                <Icon name="plus" className="me-1" />
                Ekle
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceRevisionScopePanel;
