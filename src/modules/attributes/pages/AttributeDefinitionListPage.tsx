import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import DataTableServer, { DataColumn } from "@/modules/shared/components/DataTableServer";
import ConfirmDialog from "@/modules/shared/components/ConfirmDialog";
import { ProductAttributeDefinitionDto } from "@/shared/types/productOperations.types";
import {
  useAttributeDefinitions,
  useAttributeDefinitionMutations,
} from "@/modules/attributes/hooks/useAttributes";

const PAGE_SIZE = 10;

const DATA_TYPE_LABELS: Record<number, string> = {
  1: "Metin",
  2: "Sayı",
  3: "Boolean",
  4: "Tarih",
  5: "Liste",
};

const AttributeDefinitionListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<ProductAttributeDefinitionDto | null>(null);

  const { data: definitions = [], isLoading } = useAttributeDefinitions();
  const { remove } = useAttributeDefinitionMutations();

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return definitions.slice(start, start + PAGE_SIZE);
  }, [definitions, page]);

  const columns: DataColumn<ProductAttributeDefinitionDto>[] = useMemo(
    () => [
      { key: "key", title: "Anahtar", render: (it) => <span className="fw-medium">{it.key}</span> },
      { key: "displayName", title: "Görünen Ad", render: (it) => it.displayName },
      {
        key: "dataType",
        title: "Veri Tipi",
        render: (it) => (
          <span className="badge badge-dim bg-info">{DATA_TYPE_LABELS[it.dataType] ?? it.dataType}</span>
        ),
      },
      {
        key: "flags",
        title: "Özellikler",
        render: (it) => (
          <div className="d-flex gap-1 flex-wrap">
            {it.isRequired && <span className="badge bg-outline-danger">Zorunlu</span>}
            {it.isFilterable && <span className="badge bg-outline-primary">Filtrelenebilir</span>}
            {it.isVariantAxis && <span className="badge bg-outline-warning">Varyant Eksen</span>}
          </div>
        ),
      },
      {
        key: "actions",
        title: "İşlemler",
        className: "nk-tb-col-tools",
        render: (it) => (
          <ul className="nk-tb-actions gx-1 justify-content-end">
            <li>
              <Link to={`/attributes/definitions/${it.id}`} className="btn btn-icon btn-trigger" title="Detay">
                <Icon name="eye" />
              </Link>
            </li>
            <li>
              <Link to={`/attributes/definitions/${it.id}/edit`} className="btn btn-icon btn-trigger" title="Düzenle">
                <Icon name="edit" />
              </Link>
            </li>
            <li>
              <button
                type="button"
                className="btn btn-icon btn-trigger text-danger"
                title="Sil"
                onClick={() => setPendingDelete(it)}
              >
                <Icon name="trash" />
              </button>
            </li>
          </ul>
        ),
      },
    ],
    []
  );

  return (
    <>
      <Head title="Özellik Tanımları" />
      <Content>
        <PageHeader
          title="Özellik Tanımları"
          description="Ürünlere atanabilecek özellik alanlarını yönetin."
          actions={
            <Button color="primary" onClick={() => navigate("/attributes/definitions/new")}>
              <Icon name="plus" className="me-1" />
              Yeni Tanım
            </Button>
          }
        />
        <Block>
          <DataTableServer
            columns={columns}
            items={paginated}
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={definitions.length}
            onPageChange={setPage}
            isLoading={isLoading}
            emptyTitle="Henüz tanım yok"
            emptyIcon="list-check"
            rowKey={(it) => it.id}
            emptyAction={
              <Button color="primary" onClick={() => navigate("/attributes/definitions/new")}>
                <Icon name="plus" className="me-1" />
                Yeni Tanım
              </Button>
            }
          />
        </Block>
      </Content>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Tanım Silinsin mi?"
        message={`"${pendingDelete?.displayName}" tanımı kalıcı olarak silinecek.`}
        variant="danger"
        loading={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await remove.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </>
  );
};

export default AttributeDefinitionListPage;
