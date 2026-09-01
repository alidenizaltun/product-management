import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { unitDefinitionRepository } from "@/infrastructure/api/repositories";
import { queryKeys } from "@/services/query/queryKeys";
import { useUnitDefinitionMutations } from "@/application/hooks/useUnitDefinitions";
import { showApiError } from "@/components/shared/NotificationAlert";
import type { UnitDefinitionDto } from "@/domain/types/productOperations.types";

const TURKISH_CHAR_MAP: Record<string, string> = {
    ç: "c", Ç: "C",
    ğ: "g", Ğ: "G",
    ı: "i", İ: "I",
    ö: "o", Ö: "O",
    ş: "s", Ş: "S",
    ü: "u", Ü: "U",
};

const generateUnitCode = (name: string) =>
    name
        .split("")
        .map((char) => TURKISH_CHAR_MAP[char] ?? char)
        .join("")
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

interface UnitQuickAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Üründe zaten bir ProductUnit'a bağlı unitDefinitionId'ler — seçilemesin diye devre dışı bırakılır. */
    existingUnitDefinitionIds?: string[];
    onUnitSelected: (definition: UnitDefinitionDto) => void;
    adding?: boolean;
}

const UnitQuickAddModal: React.FC<UnitQuickAddModalProps> = ({
    isOpen,
    onClose,
    existingUnitDefinitionIds = [],
    onUnitSelected,
    adding = false,
}) => {
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState("");
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newName, setNewName] = useState("");

    const { data: unitDefinitions = [], isLoading } = useQuery({
        queryKey: queryKeys.catalog.unitDefinitions,
        queryFn: () => unitDefinitionRepository.getAll(),
        enabled: isOpen,
    });

    const { create } = useUnitDefinitionMutations();
    const isBusy = adding || create.isPending;

    const filtered = useMemo(() => {
        const term = search.trim().toLocaleLowerCase("tr-TR");
        if (!term) return unitDefinitions;
        return unitDefinitions.filter(
            (unit) => unit.name.toLocaleLowerCase("tr-TR").includes(term) || unit.code.toLocaleLowerCase("tr-TR").includes(term)
        );
    }, [unitDefinitions, search]);

    const resetNewUnitForm = () => {
        setIsCreatingNew(false);
        setNewName("");
    };

    const handleClose = () => {
        if (isBusy) return;
        setSearch("");
        setSelectedId("");
        resetNewUnitForm();
        onClose();
    };

    const handleAdd = () => {
        const definition = unitDefinitions.find((unit) => unit.id === selectedId);
        if (!definition) return;
        onUnitSelected(definition);
    };

    const handleCreateNewUnit = async () => {
        const trimmedName = newName.trim();
        if (!trimmedName) return;
        try {
            const definition = await create.mutateAsync({ code: generateUnitCode(trimmedName), name: trimmedName });
            resetNewUnitForm();
            onUnitSelected(definition);
        } catch (error) {
            showApiError(error);
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={handleClose} size="sm" centered>
            <ModalHeader toggle={handleClose}>Birim Ekle</ModalHeader>
            <ModalBody>
                {isCreatingNew ? (
                    <>
                        <label className="form-label">Yeni Evrensel Birim</label>
                        <input
                            className="form-control"
                            placeholder="Ad (örn: Adet)"
                            value={newName}
                            onChange={(event) => setNewName(event.target.value)}
                            disabled={isBusy}
                            autoFocus
                        />
                        {newName.trim() && (
                            <p className="text-soft fs-12px mt-1 mb-0">
                                Kod: <span className="fw-medium">{generateUnitCode(newName.trim())}</span>
                            </p>
                        )}
                    </>
                ) : (
                    <>
                        <label className="form-label">Evrensel Birim</label>
                        <input
                            className="form-control mb-2"
                            placeholder="Birim ara..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            disabled={isBusy}
                        />
                        <select
                            className="form-select"
                            size={6}
                            value={selectedId}
                            onChange={(event) => setSelectedId(event.target.value)}
                            disabled={isBusy || isLoading}
                        >
                            {filtered.map((unit) => {
                                const isExisting = existingUnitDefinitionIds.includes(unit.id);
                                if (!isExisting) {
                                    return (
                                        <option key={unit.id} value={unit.id} disabled={isExisting}>
                                            {unit.name} ({unit.code})
                                        </option>
                                    );
                                }
                            })}
                        </select>
                        {!isLoading && filtered.length === 0 && (
                            <p className="text-soft fs-12px mt-2 mb-0">Aramayla eşleşen evrensel birim bulunamadı.</p>
                        )}
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-primary mt-2"
                            onClick={() => setIsCreatingNew(true)}
                            disabled={isBusy}
                        >
                            + Yeni Evrensel Birim Ekle
                        </button>
                    </>
                )}
            </ModalBody>
            <ModalFooter>
                <Button
                    color="light"
                    onClick={isCreatingNew ? resetNewUnitForm : handleClose}
                    disabled={isBusy}
                >
                    {isCreatingNew ? "Vazgeç" : "İptal"}
                </Button>
                <Button
                    color="primary"
                    onClick={isCreatingNew ? () => void handleCreateNewUnit() : handleAdd}
                    disabled={isBusy || (isCreatingNew ? !newName.trim() : !selectedId)}
                >
                    {isBusy ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            {isCreatingNew ? "Oluşturuluyor..." : "Ekleniyor..."}
                        </>
                    ) : isCreatingNew ? (
                        "Oluştur ve Ekle"
                    ) : (
                        "Ekle"
                    )}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default UnitQuickAddModal;
