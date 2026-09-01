import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { useRoles, usePermissionCatalog } from "@/application/hooks/useRoles";

const PermissionMatrixPage: React.FC = () => {
    const { data: roles = [], isLoading: rolesLoading } = useRoles();
    const { data: catalog = [], isLoading: catalogLoading } = usePermissionCatalog();

    const categories = useMemo(() => {
        const map = new Map<string, typeof catalog>();
        catalog.forEach((p) => {
            const list = map.get(p.category) ?? [];
            list.push(p);
            map.set(p.category, list);
        });
        return Array.from(map.entries());
    }, [catalog]);

    const isLoading = rolesLoading || catalogLoading;

    return (
        <>
            <Head title="Yetki Matrisi" />
            <Content>
                <PageHeader
                    title="Yetki Matrisi"
                    description="Tüm roller ve izinlerin salt-okunur genel görünümü. Düzenlemek için rol detayına gidin."
                />
                <Block className="" size="">
                    <div className="card card-bordered">
                        <div className="card-inner">
                            {isLoading ? (
                                <div className="d-flex align-items-center gap-2">
                                    <span className="spinner-border spinner-border-sm text-primary" />
                                    <span>Yükleniyor...</span>
                                </div>
                            ) : roles.length === 0 || catalog.length === 0 ? (
                                <EmptyState icon="shield-check" title="Görüntülenecek veri yok" />
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th className="bg-lighter" style={{ minWidth: 220 }}>
                                                    İzin
                                                </th>
                                                {roles.map((role) => (
                                                    <th key={role.id} className="text-center bg-lighter">
                                                        <Link to={`/identity/roles/${role.id}`}>{role.name}</Link>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {categories.map(([category, permissions]) => (
                                                <React.Fragment key={category}>
                                                    <tr>
                                                        <td
                                                            colSpan={roles.length + 1}
                                                            className="bg-lighter fw-medium text-primary-dim"
                                                        >
                                                            {category}
                                                        </td>
                                                    </tr>
                                                    {permissions.map((permission) => (
                                                        <tr key={permission.key}>
                                                            <td>{permission.displayName}</td>
                                                            {roles.map((role) => (
                                                                <td key={role.id} className="text-center">
                                                                    {role.permissions.includes(permission.key) ? (
                                                                        <Icon name="check-circle-fill" id="" className="text-success" style={{}} />
                                                                    ) : (
                                                                        <Icon name="cross-circle" id="" className="text-soft" style={{}} />
                                                                    )}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </Block>
            </Content>
        </>
    );
};

export default PermissionMatrixPage;
