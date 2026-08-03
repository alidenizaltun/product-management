import React, { useEffect, useMemo, useRef, useState } from "react";
import { useProducts } from "@/modules/products/hooks/useProducts";
import { KIND_LABELS } from "@/modules/products/components/detail/constants";
import type { ProductKind } from "@/modules/products/config/productSections";
import type { ProductDto } from "@/shared/types/productOperations.types";
import {
    readRecentProducts,
    rememberRecentProduct,
    type RecentProduct,
} from "@/modules/products/utils/recentProducts";

const RESULT_LIMIT = 20;

export interface ProductPickerProps {
    /** Bu sayfada seçilebilecek ürün tipleri; diğer tipler listede hiç görünmez. */
    allowedKinds: ProductKind[];
    value: string | null;
    onChange: (productId: string | null) => void;
    /** "Son kullanılanlar" kaydının sayfa bazlı anahtarı */
    storageKey: string;
    /** Seçili ürün listeye girmemiş olabilir; başlıkta göstermek için dışarıdan verilir. */
    selectedProduct?: Pick<ProductDto, "id" | "name" | "productCode" | "kind"> | null;
    disabled?: boolean;
}

const ProductPicker: React.FC<ProductPickerProps> = ({
    allowedKinds,
    value,
    onChange,
    storageKey,
    selectedProduct,
    disabled = false,
}) => {
    const [term, setTerm] = useState("");
    const [debouncedTerm, setDebouncedTerm] = useState("");
    const [open, setOpen] = useState(false);
    const [recents, setRecents] = useState<RecentProduct[]>(() => readRecentProducts(storageKey));
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedTerm(term.trim()), 300);
        return () => window.clearTimeout(timer);
    }, [term]);

    useEffect(() => {
        setRecents(readRecentProducts(storageKey));
    }, [storageKey, value]);

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    // Tek tip destekleyen sayfalarda filtre sunucuya taşınır; çoklu tipte istemcide uygulanır.
    const serverKind = allowedKinds.length === 1 ? allowedKinds[0] : undefined;
    const { data, isLoading } = useProducts({
        page: 1,
        pageSize: RESULT_LIMIT,
        search: debouncedTerm || undefined,
        kind: serverKind,
    });

    const results = useMemo(
        () => (data?.items ?? []).filter((product) => allowedKinds.includes(product.kind as ProductKind)),
        [data?.items, allowedKinds]
    );

    const visibleRecents = useMemo(
        () => recents.filter((item) => !item.kind || allowedKinds.includes(item.kind as ProductKind)),
        [recents, allowedKinds]
    );

    const allowedKindLabels = allowedKinds.map((kind) => KIND_LABELS[kind]?.label ?? String(kind)).join(", ");

    const handleSelect = (product: RecentProduct) => {
        rememberRecentProduct(storageKey, product);
        setRecents(readRecentProducts(storageKey));
        setTerm("");
        setOpen(false);
        onChange(product.id);
    };

    const selectedKind = selectedProduct ? KIND_LABELS[selectedProduct.kind ?? 0] : undefined;

    return (
        <div className="card card-bordered mb-4" ref={containerRef}>
            <div className="card-inner">
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                    <div>
                        <span className="overline-title text-primary">Ürün Seçici</span>
                        <p className="text-soft fs-13px mb-0">
                            Bu sayfada yalnızca <strong>{allowedKindLabels}</strong> tipindeki ürünler listelenir.
                        </p>
                    </div>
                    {selectedProduct && (
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="badge badge-dim bg-primary">
                                {selectedProduct.productCode} — {selectedProduct.name}
                            </span>
                            {selectedKind && (
                                <span className={`badge bg-${selectedKind.color}`}>
                                    <em className={`icon ni ni-${selectedKind.icon} me-1`} />
                                    {selectedKind.label}
                                </span>
                            )}
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-light"
                                disabled={disabled}
                                onClick={() => onChange(null)}
                            >
                                <em className="icon ni ni-cross me-1" />
                                Seçimi Temizle
                            </button>
                        </div>
                    )}
                </div>

                <div className="form-control-wrap mt-3 position-relative">
                    <div className="form-icon form-icon-left">
                        <em className="icon ni ni-search" />
                    </div>
                    <input
                        type="search"
                        className="form-control ps-5"
                        placeholder="Ürün adı veya kodu ile ara…"
                        value={term}
                        disabled={disabled}
                        onFocus={() => setOpen(true)}
                        onChange={(event) => {
                            setTerm(event.target.value);
                            setOpen(true);
                        }}
                    />

                    {open && (
                        <div
                            className="card card-bordered position-absolute w-100 shadow-sm"
                            style={{ zIndex: 20, top: "100%", marginTop: 4, maxHeight: 320, overflowY: "auto" }}
                        >
                            <ul className="link-list-plain">
                                {isLoading && (
                                    <li className="px-3 py-2 text-soft fs-13px">
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Ürünler yükleniyor…
                                    </li>
                                )}

                                {!isLoading && !debouncedTerm && visibleRecents.length > 0 && (
                                    <>
                                        <li className="px-3 pt-2">
                                            <span className="overline-title text-soft">Son kullanılanlar</span>
                                        </li>
                                        {visibleRecents.map((item) => (
                                            <li key={`recent-${item.id}`}>
                                                <button
                                                    type="button"
                                                    className="btn btn-block text-start px-3 py-2"
                                                    onClick={() => handleSelect(item)}
                                                >
                                                    <span className="d-block">{item.name}</span>
                                                    <span className="text-soft fs-12px">{item.productCode}</span>
                                                </button>
                                            </li>
                                        ))}
                                        <li className="divider" />
                                    </>
                                )}

                                {!isLoading && results.length === 0 && (
                                    <li className="px-3 py-3 text-soft fs-13px">
                                        Bu sayfada seçilebilecek uygun tipte ürün bulunamadı.
                                    </li>
                                )}

                                {!isLoading &&
                                    results.map((product) => {
                                        const kind = KIND_LABELS[product.kind];
                                        return (
                                            <li key={product.id}>
                                                <button
                                                    type="button"
                                                    className={`btn btn-block text-start px-3 py-2 ${
                                                        product.id === value ? "bg-lighter" : ""
                                                    }`}
                                                    onClick={() =>
                                                        handleSelect({
                                                            id: product.id,
                                                            name: product.name,
                                                            productCode: product.productCode,
                                                            kind: product.kind,
                                                        })
                                                    }
                                                >
                                                    <span className="d-flex justify-content-between align-items-center gap-2">
                                                        <span>
                                                            <span className="d-block">{product.name}</span>
                                                            <span className="text-soft fs-12px">{product.productCode}</span>
                                                        </span>
                                                        {kind && (
                                                            <span className={`badge badge-dim bg-${kind.color}`}>{kind.label}</span>
                                                        )}
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductPicker;
