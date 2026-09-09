import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import ProfileEditor from "@/pages/products/components/editor/ProfileEditor";
import { buildDefaultValues } from "@/pages/products/utils/productFormMapper";
import type { ProductFormValues } from "@/pages/products/types/productEditor.types";

const FormHost: React.FC<{ kind: number }> = ({ kind }) => {
    const form = useForm<ProductFormValues>({
        defaultValues: { ...buildDefaultValues(), kind },
    });

    return (
        <FormProvider {...form}>
            <ProfileEditor />
        </FormProvider>
    );
};

function renderProfile(kind: number) {
    const router = createMemoryRouter(
        [{ path: "/product-info/advanced", element: <FormHost kind={kind} /> }],
        { initialEntries: ["/product-info/advanced?productId=prod-1"] }
    );

    return render(<RouterProvider router={router} />);
}

describe("ProfileEditor", () => {
    it("yazılım ürününde kimlik ve teknik alanları tam genişlikte gösterir", () => {
        renderProfile(2);

        expect(screen.getByText("Yazılım Kimliği")).toBeInTheDocument();
        expect(screen.getByLabelText("Sürüm")).toBeInTheDocument();
        expect(screen.getByLabelText("İndirme URL")).toBeInTheDocument();
        expect(screen.getByText("Teknik Detaylar")).toBeInTheDocument();
        expect(screen.getByText("Desteklenen Platformlar")).toBeInTheDocument();
        expect(screen.getByText("Sistem Gereksinimleri")).toBeInTheDocument();
        expect(screen.getByLabelText("Sürüm Notları")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Genel Bilgiler" })).toHaveAttribute(
            "href",
            "/product-info/general?productId=prod-1"
        );
    });

    it("fiziksel üründe boyut ve kargo anahtarlarını gösterir", () => {
        renderProfile(1);

        expect(screen.getByText("Boyutlar ve Ağırlık")).toBeInTheDocument();
        expect(screen.getByLabelText("Ağırlık (kg)")).toBeInTheDocument();
        expect(screen.getByLabelText("Kargo Gerektirir")).toBeInTheDocument();
        expect(screen.getByLabelText("Kırılgan")).toBeInTheDocument();
        expect(screen.queryByLabelText("Sürüm")).not.toBeInTheDocument();
    });

    it("hizmet ürününde teslimat ve rezervasyon alanlarını gösterir", () => {
        renderProfile(3);

        expect(screen.getByLabelText("Teslimat Modu")).toBeInTheDocument();
        expect(screen.getByLabelText("Süre (dakika)")).toBeInTheDocument();
        expect(screen.getByLabelText("Maks. Eşzamanlı Rezervasyon")).toBeInTheDocument();
        expect(screen.getByText("Hizmet Alanı")).toBeInTheDocument();
    });

    it("abonelik ürününde faturalama ve yenileme alanlarını gösterir", () => {
        renderProfile(4);

        expect(screen.getByLabelText("Faturalama Periyodu")).toBeInTheDocument();
        expect(screen.getByLabelText("Periyot Değeri")).toBeInTheDocument();
        expect(screen.getByLabelText("Otomatik Yenileme")).toBeInTheDocument();
        expect(screen.getByLabelText("İptal Politikası")).toBeInTheDocument();
    });

    it("ürün tipi yoksa boş durum gösterir", () => {
        renderProfile(0);

        expect(screen.getByText("Profil görüntülemek için ürün tipini seçin")).toBeInTheDocument();
        expect(screen.queryByText("Yazılım Kimliği")).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Genel Bilgiler" })).toHaveAttribute(
            "href",
            "/product-info/general?productId=prod-1"
        );
    });
});
