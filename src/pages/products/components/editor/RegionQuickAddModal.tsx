import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { FormModal } from "@/components/shared/FormModal";
import { TextInput, Checkbox } from "@/components/shared";
import { showApiError, showSuccess } from "@/components/shared/NotificationAlert";
import { useRegionMutations } from "@/application/hooks/useRegions";
import { queryKeys } from "@/services/query/queryKeys";
import type { LookupItem } from "@/domain/types/lookup.types";
import type { RegionDto } from "@/domain/types/productOperations.types";

interface RegionQuickAddValues {
  name: string;
  description?: string;
  isActive: boolean;
}

interface RegionQuickAddModalProps {
  open: boolean;
  toggle: () => void;
  onCreated: (region: RegionDto) => void;
}

const DEFAULT_VALUES: RegionQuickAddValues = {
  name: "",
  description: "",
  isActive: true,
};

const RegionQuickAddModal: React.FC<RegionQuickAddModalProps> = ({ open, toggle, onCreated }) => {
  const queryClient = useQueryClient();
  const { create } = useRegionMutations();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegionQuickAddValues>({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (open) reset(DEFAULT_VALUES);
  }, [open, reset]);

  const handleToggle = () => {
    if (create.isPending) return;
    toggle();
  };

  const onSubmit = async (values: RegionQuickAddValues) => {
    try {
      const created = await create.mutateAsync({
        name: values.name,
        description: values.description || undefined,
        isActive: values.isActive,
        sortOrder: 0,
      });
      const nextRegions = (current: RegionDto[] = []) =>
        current.some((item) => item.id === created.id) ? current : [...current, created];
      // useRegions keys are ["catalog", "regions", includeInactive], not the prefix alone.
      queryClient.setQueryData<RegionDto[]>([...queryKeys.catalog.regions, false], nextRegions);
      queryClient.setQueryData<RegionDto[]>([...queryKeys.catalog.regions, true], nextRegions);
      queryClient.setQueryData<LookupItem[]>(["lookups", "regions", false], (current = []) =>
        current.some((item) => item.id === created.id)
          ? current
          : [...current, { id: created.id, name: created.name }]
      );
      showSuccess("Bölge tanımı oluşturuldu.");
      onCreated(created);
      toggle();
    } catch (err) {
      showApiError(err);
    }
  };

  return (
    <FormModal
      open={open}
      toggle={handleToggle}
      title="Yeni Bölge Tanımı"
      centered
      loading={create.isPending}
      submitLabel="Oluştur"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="row g-3">
        <div className="col-12">
          <TextInput
            label="Ad"
            required
            placeholder="Türkiye"
            error={errors.name?.message}
            {...register("name", { required: "Ad zorunludur" })}
          />
        </div>
        <div className="col-12">
          <TextInput label="Açıklama" placeholder="Opsiyonel açıklama..." {...register("description")} />
        </div>
        <div className="col-12">
          <Checkbox label="Aktif" switchStyle {...register("isActive")} />
        </div>
      </div>
    </FormModal>
  );
};

export default RegionQuickAddModal;
