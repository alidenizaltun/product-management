import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { unitDefinitionsApi } from "@/services/unitDefinitions/unitDefinitions.api";
import { queryKeys } from "@/services/query/queryKeys";
import type { UnitDefinitionDto } from "@/shared/types/productOperations.types";

interface UnitQuickAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Üründe zaten bir ProductUnit'a bağlı unitDefinitionId'ler — sadece bilgilendirme için işaretlenir. */
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

    const { data: unitDefinitions = [], isLoading } = useQuery({
        queryKey: queryKeys.catalog.unitDefinitions,
        queryFn: () => unitDefinitionsApi.getAll(),
        enabled: isOpen,
    });

    const filtered = useMemo(() => {
        const term = search.trim().toLocaleLowerCase("tr-TR");
        if (!term) return unitDefinitions;
        return unitDefinitions.filter(
            (unit) => unit.name.toLocaleLowerCase("tr-TR").includes(term) || unit.code.toLocaleLowerCase("tr-TR").includes(term)
        );
    }, [unitDefinitions, search]);

    const handleClose = () => {
        if (adding) return;
        setSearch("");
        setSelectedId("");
        onClose();
    };

    const handleAdd = () => {
        const definition = unitDefinitions.find((unit) => unit.id === selectedId);
        if (!definition) return;
        onUnitSelected(definition);
    };

    return (
        <Modal isOpen={isOpen} toggle={handleClose} size="sm" centered>
            <ModalHeader toggle={handleClose}>Birim Ekle</ModalHeader>
            <ModalBody>
                <label className="form-label">Evrensel Birim</label>
                <input
                    className="form-control mb-2"
                    placeholder="Birim ara..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    disabled={adding}
                />
                <select
                    className="form-select"
                    size={6}
                    value={selectedId}
                    onChange={(event) => setSelectedId(event.target.value)}
                    disabled={adding || isLoading}
                >
                    {filtered.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                            {unit.name} ({unit.code})
                            {existingUnitDefinitionIds.includes(unit.id) ? " — üründe mevcut" : ""}
                        </option>
                    ))}
                </select>
                {!isLoading && filtered.length === 0 && (
                    <p className="text-soft fs-12px mt-2 mb-0">Aramayla eşleşen evrensel birim bulunamadı.</p>
                )}
            </ModalBody>
            <ModalFooter>
                <Button color="light" onClick={handleClose} disabled={adding}>
                    İptal
                </Button>
                <Button color="primary" onClick={handleAdd} disabled={adding || !selectedId}>
                    {adding ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Ekleniyor...
                        </>
                    ) : (
                        "Ekle"
                    )}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default UnitQuickAddModal;
