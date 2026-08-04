// ─── Existing Components ──────────────────────────────────────────────────────
export { default as AppTabs } from "./AppTabs";
export type { TabItem } from "./AppTabs";
export { default as ConfirmDialog } from "./ConfirmDialog";
export { default as UnsavedChangesDialog } from "./UnsavedChangesDialog";
export { default as DataTableServer } from "./DataTableServer";
export type { DataColumn } from "./DataTableServer";
export { default as EmptyState } from "./EmptyState";
export { default as JsonFieldEditor } from "./JsonFieldEditor";
export { default as PageHeader } from "./PageHeader";
export { default as StatusBadge } from "./StatusBadge";

// ─── Loading / Skeleton ───────────────────────────────────────────────────────
export {
  Skeleton,
  TableSkeleton,
  CardSkeleton,
  FormSkeleton,
  DetailSkeleton,
  StatCardSkeleton,
  PageSkeleton,
  LoadingOverlay,
  InlineLoading,
} from "./LoadingSkeleton";

// ─── Filter & Search ──────────────────────────────────────────────────────────
export { default as FilterBar, FilterChip, SearchInput, FilterGroup } from "./FilterBar";
export type { FilterOption, FilterItem } from "./FilterBar";

// ─── Form Utilities ───────────────────────────────────────────────────────────
export { FormCard, FormRow, FormSection, FormActions } from "./FormCard";
export { default as FormField } from "./FormField";
export type { FormFieldProps } from "./FormField";
export { TextInput, NumberInput, Textarea, Checkbox } from "./TextInput";
export type { TextInputProps, NumberInputProps, TextareaProps, CheckboxProps } from "./TextInput";
export { LoadingButton, IconButton } from "./LoadingButton";
export type { LoadingButtonProps, IconButtonProps } from "./LoadingButton";
export { default as StickyActionBar } from "./StickyActionBar";
export type { StickyActionBarProps } from "./StickyActionBar";

// ─── Detail / Display ─────────────────────────────────────────────────────────
export { DetailSection, DetailCard, DetailRow, DetailBadge } from "./DetailSection";

// ─── Dashboard Widgets ────────────────────────────────────────────────────────
export {
  StatWidget,
  MiniStatCard,
  ProgressCard,
  PercentageCircle,
  QuickActionCard,
  ComparisonCard,
} from "./StatWidget";

// ─── Modals ───────────────────────────────────────────────────────────────────
export { FormModal, DetailModal, ImagePreviewModal } from "./FormModal";

// ─── Notifications & Alerts ───────────────────────────────────────────────────
export {
  InlineAlert,
  NotificationBanner,
  StatusAlert,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showApiError,
  parseApiError,
} from "./NotificationAlert";

// ─── Timeline ─────────────────────────────────────────────────────────────────
export { ActivityTimeline, TimelineCard } from "./ActivityTimeline";

// ─── Step Wizard ──────────────────────────────────────────────────────────────
export { StepWizard, StepNavigation } from "./StepWizard";

// ─── File Upload ──────────────────────────────────────────────────────────────
export { FileUploadZone, FilePreview, ImagePreviewGrid } from "./FileUploadZone";

// ─── Avatar & Profile ─────────────────────────────────────────────────────────
export { Avatar, AvatarGroup } from "./AvatarGroup";
export { ProfileCard, ProfileHeader } from "./ProfileCard";

// ─── Actions & Menus ──────────────────────────────────────────────────────────
export { ActionDropdown, ActionButtonGroup } from "./ActionDropdown";

// ─── Accordion ────────────────────────────────────────────────────────────────
export { default as AppAccordion } from "./AppAccordion";

// ─── Settings Layout ──────────────────────────────────────────────────────────
export { SettingsLayout, SettingsCard } from "./SettingsLayout";

// ─── Cards & Data Display ─────────────────────────────────────────────────────
export {
  InfoCard,
  SummaryCard,
  CountCard,
  EmptyCard,
  ErrorCard,
  Divider,
  SectionHeader,
} from "./InfoCard";

export { default as DataListCard, CardGrid, KanbanColumn } from "./DataListCard";

// ─── Page Layouts ─────────────────────────────────────────────────────────────
export {
  Breadcrumb,
  ListPage,
  DetailPage,
  FormPage,
  TwoColumnLayout,
  MetricRow,
} from "./PageLayout";

// ─── Badges & Display Utils ───────────────────────────────────────────────────
export {
  StatusDot,
  ColorBadge,
  BadgeGroup,
  TagList,
  PriorityBadge,
  TruncatedText,
  Currency,
  DateDisplay,
} from "./BadgeGroup";
