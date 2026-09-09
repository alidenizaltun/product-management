import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "reactstrap";
import Icon from "@/components/icon/Icon";
import {
  ConfirmDialog,
  DataTableServer,
  DetailCard,
  DetailPage,
  DetailSection,
  EMPTY_DETAIL_VALUE,
  InlineAlert,
  MetricRow,
  formatDetailDate,
  showApiError,
  showSuccess,
  showWarning,
} from "@/components/shared";
import type { DataColumn } from "@/components/shared";
import {
  usePriceRevision,
  usePriceRevisionLines,
  usePriceRevisionMutations,
} from "@/application/hooks/usePriceRevisions";
import PriceRevisionScopePanel from "@/pages/pricing/components/PriceRevisionScopePanel";
import {
  RevisionStatusBadge,
  TARGET_TYPE_OPTIONS,
  describeAdjustment,
  describeTargetType,
  formatMoney,
  revisionCan,
  ROUNDING_MODE_OPTIONS,
} from "@/pages/pricing/components/revisionDisplay";
import type { PriceRevisionLineDto } from "@/domain/types/productOperations.types";

const PAGE_SIZE = 25;

const PriceRevisionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [page, setPage] = useState(1);
  const [targetTypeFilter, setTargetTypeFilter] = useState<number | undefined>(undefined);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [confirmApply, setConfirmApply] = useState(false);
  const [confirmRollback, setConfirmRollback] = useState(false);

  const { data: revision, isLoading, refetch } = usePriceRevision(id);
  const { data: linePage, isLoading: linesLoading } = usePriceRevisionLines(id, {
    targetType: targetTypeFilter ?? null,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const actions = usePriceRevisionMutations(id);
  const can = revisionCan(revision);
  const summary = revision?.summary;
  const missing = !isLoading && !revision;

  const run = async (task: () => Promise<unknown>, message: string) => {
    try {
      await task();
      showSuccess(message);
    } catch (error) {
      showApiError(error);
    }
  };

  const columns: DataColumn<PriceRevisionLineDto>[] = [
    { key: "product", title: "Ürün", render: (it) => it.productName || EMPTY_DETAIL_VALUE },
    {
      key: "target",
      title: "Hedef",
      render: (it) => (
        <>
          <span className="d-block">{it.targetLabel || EMPTY_DETAIL_VALUE}</span>
          <span className="text-soft small">{describeTargetType(it.targetType)}</span>
        </>
      ),
    },
    {
      key: "old",
      title: "Eski",
      render: (it) => <span className="text-soft">{formatMoney(it.oldValue, it.currencyCode)}</span>,
    },
    {
      key: "new",
      title: "Yeni",
      render: (it) => (
        <span className={it.isExcluded ? "text-soft" : "fw-medium"}>
          {formatMoney(it.newValue, it.currencyCode)}
        </span>
      ),
    },
    {
      key: "diff",
      title: "Fark",
      render: (it) => {
        const difference = it.newValue - it.oldValue;
        if (difference === 0) return <span className="text-soft">{EMPTY_DETAIL_VALUE}</span>;
        return (
          <span className={difference > 0 ? "text-danger" : "text-success"}>
            {difference > 0 ? "+" : ""}
            {formatMoney(difference, it.currencyCode)}
          </span>
        );
      },
    },
    {
      key: "state",
      title: "Durum",
      render: (it) => {
        if (it.skipReason) {
          return <span className="badge bg-warning-dim text-warning">{it.skipReason}</span>;
        }
        if (it.isExcluded) return <span className="badge bg-light text-soft">Hariç</span>;
        if (it.isApplied) return <span className="badge bg-success-dim text-success">Uygulandı</span>;
        return <span className="badge bg-info-dim text-info">Dahil</span>;
      },
    },
    {
      key: "actions",
      title: "",
      className: "nk-tb-col-tools",
      render: (it) =>
        can.editLines ? (
          <button
            type="button"
            className="btn btn-icon btn-trigger"
            title={it.isExcluded ? "Kapsama al" : "Kapsam dışına al"}
            onClick={() =>
              run(
                () =>
                  actions.updateLine.mutateAsync({
                    lineId: it.id,
                    payload: { isExcluded: !it.isExcluded },
                  }),
                it.isExcluded ? "Satır kapsama alındı." : "Satır kapsam dışına alındı."
              )
            }
          >
            <Icon name={it.isExcluded ? "plus-circle" : "cross-circle"} />
          </button>
        ) : null,
    },
  ];

  const roundingLabel =
    ROUNDING_MODE_OPTIONS.find((option) => option.value === revision?.roundingMode)?.label ??
    EMPTY_DETAIL_VALUE;

  return (
    <>
      <DetailPage
        title={revision ? revision.name : "Zam Detayı"}
        headTitle={revision ? `Zam: ${revision.name}` : "Zam Detayı"}
        subtitle={revision ? `${revision.code} · ${describeAdjustment(revision)}` : undefined}
        breadcrumbs={[
          { label: "Zam Yönetimi", to: "/pricing/revisions" },
          { label: revision?.name ?? "Detay" },
        ]}
        loading={isLoading}
        error={missing}
        errorMessage="Revizyon bulunamadı veya yüklenirken bir hata oluştu."
        onRetry={() => {
          void refetch();
        }}
        backTo="/pricing/revisions"
        headerActions={
          revision ? (
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <RevisionStatusBadge status={revision.status} />
              {can.edit && (
                <Button color="primary" size="sm" onClick={() => navigate(`/pricing/revisions/${revision.id}/edit`)}>
                  <Icon name="edit" className="me-1" />
                  Düzenle
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {revision ? (
          <>
            <div className="row g-3 mb-3">
              <div className="col-lg-6">
                <DetailCard title="Revizyon Bilgileri" icon="growth" fullHeight={false}>
                  <DetailSection
                    items={[
                      { label: "Kod", value: revision.code },
                      { label: "Ad", value: revision.name },
                      { label: "Açıklama", value: revision.description, fullWidth: true },
                      { label: "Ayar", value: describeAdjustment(revision) },
                      { label: "Yuvarlama", value: roundingLabel },
                      {
                        label: "Yuvarlama adımı",
                        value: revision.roundingStep != null ? String(revision.roundingStep) : EMPTY_DETAIL_VALUE,
                      },
                      { label: "Para birimi", value: revision.currencyCode },
                      { label: "Yürürlük", value: formatDetailDate(revision.effectiveDate) },
                      { label: "Oluşturulma", value: formatDetailDate(revision.createdAt) },
                    ]}
                  />
                </DetailCard>
              </div>
            </div>

            <PriceRevisionScopePanel
              scopes={revision.scopes}
              editable={can.edit}
              busy={actions.addScope.isPending || actions.removeScope.isPending}
              onAdd={(scope) => actions.addScope.mutateAsync(scope)}
              onRemove={(scopeId) => actions.removeScope.mutateAsync(scopeId)}
            />

            {summary && summary.lineCount > 0 ? (
              <div className="mt-3">
                <MetricRow
                  items={[
                    {
                      label:
                        summary.excludedLineCount > 0
                          ? `Etkilenen fiyat (${summary.excludedLineCount} hariç)`
                          : "Etkilenen fiyat",
                      value: summary.lineCount - summary.excludedLineCount,
                    },
                    { label: "Ürün", value: summary.productCount },
                    { label: "Eski toplam", value: formatMoney(summary.totalOldValue) },
                    {
                      label: "Yeni toplam",
                      value: (
                        <>
                          {formatMoney(summary.totalNewValue)}
                          <div className={summary.totalDifference > 0 ? "text-danger small" : "text-success small"}>
                            {summary.totalDifference > 0 ? "+" : ""}
                            {formatMoney(summary.totalDifference)}
                          </div>
                        </>
                      ),
                    },
                  ]}
                />
              </div>
            ) : null}

            {summary && summary.skippedRules.length > 0 ? (
              <InlineAlert
                color="warning"
                className="mt-3"
                title={`Zam uygulanamayan ${summary.skippedRules.length} kural`}
                message={
                  <ul className="mb-0 small">
                    {summary.skippedRules.map((rule) => (
                      <li key={rule.pricingRuleId}>
                        {rule.productName} · {rule.pricingRuleName} — {rule.reason}
                      </li>
                    ))}
                  </ul>
                }
              />
            ) : null}

            <div className="d-flex flex-wrap gap-2 align-items-center mt-3">
              {can.preview && (
                <Button
                  color="info"
                  disabled={actions.preview.isPending || revision.scopes.length === 0}
                  onClick={() =>
                    run(async () => {
                      const result = await actions.preview.mutateAsync();
                      setPage(1);
                      if (result.lineCount === 0) {
                        showWarning("Kapsama giren fiyat bulunamadı.");
                      }
                    }, "Önizleme tazelendi.")
                  }
                >
                  <Icon name="reload" className="me-1" />
                  {summary?.lineCount ? "Önizlemeyi Tazele" : "Önizle"}
                </Button>
              )}

              {can.submit && (
                <Button
                  color="primary"
                  disabled={actions.submit.isPending}
                  onClick={() => run(() => actions.submit.mutateAsync(), "Onaya gönderildi.")}
                >
                  <Icon name="send" className="me-1" />
                  Onaya Gönder
                </Button>
              )}

              {can.decide && (
                <>
                  <Button
                    color="success"
                    disabled={actions.approve.isPending}
                    onClick={() => run(() => actions.approve.mutateAsync(undefined), "Revizyon onaylandı.")}
                  >
                    <Icon name="check" className="me-1" />
                    Onayla
                  </Button>
                  <Button color="danger" outline onClick={() => setRejectOpen(true)}>
                    <Icon name="cross" className="me-1" />
                    Reddet
                  </Button>
                </>
              )}

              {can.apply && (
                <Button color="primary" onClick={() => setConfirmApply(true)}>
                  <Icon name="check-circle" className="me-1" />
                  Uygula
                </Button>
              )}

              {can.rollback && (
                <Button color="warning" onClick={() => setConfirmRollback(true)}>
                  <Icon name="undo" className="me-1" />
                  Geri Al
                </Button>
              )}

              {can.cancel && (
                <Button
                  color="light"
                  disabled={actions.cancel.isPending}
                  onClick={() => run(() => actions.cancel.mutateAsync(), "Revizyon iptal edildi.")}
                >
                  İptal Et
                </Button>
              )}
            </div>

            {revision.approvalNote ? (
              <InlineAlert
                color="info"
                className="mt-3"
                title="Onay notu"
                message={revision.approvalNote}
              />
            ) : null}

            <div className="mt-3">
              <DataTableServer
                title="Etkilenen Fiyatlar"
                toolbar={
                  <select
                    className="form-select"
                    value={targetTypeFilter ?? ""}
                    onChange={(event) => {
                      setTargetTypeFilter(event.target.value ? Number(event.target.value) : undefined);
                      setPage(1);
                    }}
                  >
                    <option value="">Tüm hedef türleri</option>
                    {TARGET_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                }
                columns={columns}
                items={linePage?.items ?? []}
                page={page}
                pageSize={PAGE_SIZE}
                totalItems={linePage?.totalCount ?? 0}
                onPageChange={setPage}
                isLoading={linesLoading}
                emptyTitle="Henüz önizleme yapılmadı"
                emptyIcon="growth"
                rowKey={(it) => it.id}
              />
            </div>
          </>
        ) : null}
      </DetailPage>

      <ConfirmDialog
        open={confirmApply}
        title="Zam Uygulansın mı?"
        message={`${(summary?.lineCount ?? 0) - (summary?.excludedLineCount ?? 0)} fiyat güncellenecek. İşlem sonradan geri alınabilir.`}
        loading={actions.apply.isPending}
        onCancel={() => setConfirmApply(false)}
        onConfirm={async () => {
          try {
            const result = await actions.apply.mutateAsync();
            showSuccess(`${result.affectedLineCount} fiyat güncellendi.`);
            if (result.skippedLineCount > 0) {
              showWarning(`${result.skippedLineCount} satır atlandı; ayrıntı için listeye bakın.`);
            }
          } catch (error) {
            showApiError(error);
          } finally {
            setConfirmApply(false);
          }
        }}
      />

      <ConfirmDialog
        open={confirmRollback}
        title="Zam Geri Alınsın mı?"
        message="Uygulanan tüm fiyatlar eski değerlerine döndürülecek. Arada elle değiştirilmiş fiyatlar atlanır."
        variant="danger"
        loading={actions.rollback.isPending}
        onCancel={() => setConfirmRollback(false)}
        onConfirm={async () => {
          try {
            const result = await actions.rollback.mutateAsync();
            showSuccess(`${result.affectedLineCount} fiyat geri alındı.`);
            if (result.skippedLineCount > 0) {
              showWarning(`${result.skippedLineCount} satır atlandı.`);
            }
          } catch (error) {
            showApiError(error);
          } finally {
            setConfirmRollback(false);
          }
        }}
      />

      <ConfirmDialog
        open={rejectOpen}
        title="Revizyon Reddedilsin mi?"
        message={
          <div>
            <p className="mb-2">Gerekçe zorunludur; hazırlayan kişi bunu görecek.</p>
            <textarea
              className="form-control"
              rows={3}
              value={rejectNote}
              onChange={(event) => setRejectNote(event.target.value)}
            />
          </div>
        }
        variant="danger"
        loading={actions.reject.isPending}
        onCancel={() => {
          setRejectOpen(false);
          setRejectNote("");
        }}
        onConfirm={async () => {
          if (!rejectNote.trim()) {
            showWarning("Ret gerekçesi zorunludur.");
            return;
          }
          try {
            await actions.reject.mutateAsync(rejectNote.trim());
            showSuccess("Revizyon reddedildi.");
            setRejectOpen(false);
            setRejectNote("");
          } catch (error) {
            showApiError(error);
          }
        }}
      />
    </>
  );
};

export default PriceRevisionDetailPage;
