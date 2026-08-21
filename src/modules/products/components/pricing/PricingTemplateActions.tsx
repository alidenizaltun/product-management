import React, { useMemo, useState } from "react";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import Icon from "@/components/icon/Icon";
import LookupSelect from "@/modules/shared/components/selects/LookupSelect";
import { showApiError, showSuccess, showWarning } from "@/modules/shared/components/NotificationAlert";
import { usePricingTemplateMutations, usePricingTemplates } from "@/modules/pricing/hooks/usePricingTemplates";
import type { ProductPricingRuleDto } from "@/shared/types/productOperations.types";

/**
 * Ürün fiyatlandırma kuralları panelinden çağrılan iki köprü:
 * bir kuralı şablona almak ve bir şablonu bu ürüne uygulamak.
 */

interface SaveAsTemplateModalProps {
  open: boolean;
  rule?: ProductPricingRuleDto;
  onClose: () => void;
}

export const SaveAsTemplateModal: React.FC<SaveAsTemplateModalProps> = ({ open, rule, onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { saveRuleAsTemplate } = usePricingTemplateMutations();

  const effectiveName = name.trim() || rule?.name || "";

  const handleSave = async () => {
    if (!rule?.id) {
      showWarning("Şablona almadan önce kuralı kaydedin.");
      return;
    }

    try {
      const template = await saveRuleAsTemplate.mutateAsync({
        ruleId: rule.id,
        payload: {
          name: effectiveName,
          description: description.trim() || null,
          isActive: true,
        },
      });
      showSuccess(`Şablon oluşturuldu: ${template.code}`);
      setName("");
      setDescription("");
      onClose();
    } catch (error) {
      showApiError(error);
    }
  };

  return (
    <Modal isOpen={open} toggle={onClose} size="md">
      <ModalHeader toggle={onClose}>Şablon Olarak Kaydet</ModalHeader>
      <ModalBody>
        <p className="text-soft small">
          Bu kuralın fiyat gövdesi ve birimi, ürün bağımsız bir şablon olarak saklanır.
          Sonrasında başka ürünlere tek tıkla uygulayabilirsiniz.
        </p>

        <div className="mb-3">
          <label className="form-label">Şablon adı</label>
          <input
            className="form-control"
            value={name}
            placeholder={rule?.name ?? "SMS Birim Fiyatı"}
            onChange={(event) => setName(event.target.value)}
          />
          <div className="form-note">Boş bırakılırsa kuralın adı kullanılır.</div>
        </div>

        <div className="mb-3">
          <label className="form-label">Açıklama</label>
          <textarea
            className="form-control"
            rows={2}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <Button color="light" onClick={onClose}>
            Vazgeç
          </Button>
          <Button
            color="primary"
            disabled={saveRuleAsTemplate.isPending || !effectiveName}
            onClick={handleSave}
          >
            {saveRuleAsTemplate.isPending ? "Kaydediliyor…" : "Şablona Al"}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

interface ApplyTemplateModalProps {
  open: boolean;
  productId?: string;
  licenseOfferingId?: string;
  onClose: () => void;
  onApplied?: () => void | Promise<unknown>;
}

export const ApplyTemplateModal: React.FC<ApplyTemplateModalProps> = ({
  open,
  productId,
  licenseOfferingId,
  onClose,
  onApplied,
}) => {
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [priority, setPriority] = useState("50");
  const [overrideValue, setOverrideValue] = useState("");

  const { data: templates = [], isLoading } = usePricingTemplates({ templateKind: 1 });
  const { apply } = usePricingTemplateMutations();

  const options = useMemo(
    () => templates.map((template) => ({ id: template.id, name: `${template.code} · ${template.name}` })),
    [templates]
  );

  const selected = templates.find((template) => template.id === templateId);
  const hasTiers = useMemo(() => {
    if (!selected?.payloadJson) return false;
    try {
      const payload = JSON.parse(selected.payloadJson) as { tiers?: unknown[] };
      return Array.isArray(payload.tiers) && payload.tiers.length > 0;
    } catch {
      return false;
    }
  }, [selected]);

  const handleApply = async () => {
    if (!templateId || !productId) return;

    try {
      const result = await apply.mutateAsync({
        id: templateId,
        payload: {
          productId,
          licenseOfferingId: licenseOfferingId ?? null,
          priority: Number(priority) || 0,
          isActive: true,
          overrideValue: overrideValue.trim() ? Number(overrideValue) : null,
        },
      });

      const notes: string[] = [];
      if (result.createdProductUnitId) notes.push("ürüne yeni birim oluşturuldu");
      if (result.linkedOfferingCount > 0) {
        notes.push(`birim ${result.linkedOfferingCount} satış planına eklendi`);
      }

      showSuccess(
        notes.length > 0
          ? `Kural eklendi (${result.pricingRuleCode}) · ${notes.join(", ")}.`
          : `Kural eklendi (${result.pricingRuleCode}).`
      );
      setTemplateId(null);
      setOverrideValue("");
      // Liste tazelenmeden kapatmak, kuralın "gelmemiş" görünmesine yol açıyordu.
      await onApplied?.();
      onClose();
    } catch (error) {
      showApiError(error);
    }
  };

  return (
    <Modal isOpen={open} toggle={onClose} size="md">
      <ModalHeader toggle={onClose}>Şablondan Kural Ekle</ModalHeader>
      <ModalBody>
        <div className="mb-3">
          <label className="form-label">Şablon</label>
          <LookupSelect
            items={options}
            isLoading={isLoading}
            value={templateId}
            onChange={setTemplateId}
            placeholder="Şablon seçin"
          />
          {selected?.unitDefinitionName && (
            <div className="form-note">
              Birim: {selected.unitDefinitionName}. Üründe bu birim yoksa otomatik oluşturulur.
            </div>
          )}
        </div>

        <div className="row g-3">
          <div className="col-6">
            <label className="form-label">Öncelik</label>
            <input
              type="number"
              className="form-control"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            />
          </div>
          <div className="col-6">
            <label className="form-label">Değer farkı</label>
            <input
              className="form-control"
              value={overrideValue}
              placeholder="Şablondaki değer"
              disabled={hasTiers}
              onChange={(event) => setOverrideValue(event.target.value)}
            />
            <div className="form-note">
              {hasTiers
                ? "Kademeli şablonda tek değer değiştirilemez."
                : "Boş bırakılırsa şablondaki değer kullanılır."}
            </div>
          </div>
        </div>

        {licenseOfferingId && (
          <div className="alert alert-light mt-3 mb-0">
            Kural yalnızca seçili satış planı için geçerli olacak.
          </div>
        )}

        <div className="d-flex justify-content-end gap-2 mt-3">
          <Button color="light" onClick={onClose}>
            Vazgeç
          </Button>
          <Button color="primary" disabled={!templateId || apply.isPending} onClick={handleApply}>
            {apply.isPending ? "Uygulanıyor…" : "Uygula"}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

interface TemplateOriginBadgeProps {
  rule: ProductPricingRuleDto;
}

/** Kural bir şablondan geldiyse kaynağı ve sürüm farkını gösterir. */
export const TemplateOriginBadge: React.FC<TemplateOriginBadgeProps> = ({ rule }) => {
  if (!rule.sourceTemplateId) return null;

  const isOutdated =
    rule.templateCurrentVersion != null &&
    rule.sourceTemplateVersion != null &&
    rule.templateCurrentVersion > rule.sourceTemplateVersion;

  return (
    <span
      className={`badge ms-2 ${isOutdated ? "bg-warning-dim text-warning" : "bg-light text-soft"}`}
      title={
        isOutdated
          ? `Şablon v${rule.templateCurrentVersion} sürümünde; bu kural v${rule.sourceTemplateVersion} kopyası.`
          : `Şablondan geldi: ${rule.sourceTemplateCode ?? ""}`
      }
    >
      <Icon name="tag" className="me-1" />
      {rule.sourceTemplateCode ?? "Şablon"}
      {isOutdated && ` · v${rule.sourceTemplateVersion}→v${rule.templateCurrentVersion}`}
    </span>
  );
};
