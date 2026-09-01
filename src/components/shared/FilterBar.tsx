import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Row,
  Col,
  Button,
  Input,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Collapse,
  Badge,
} from "reactstrap";
import Icon from "@/components/icon/Icon";

// --- Types ---

export interface FilterOption {
  value: string | number;
  label: string;
}

export interface FilterItem {
  key: string;
  label: string;
  type: "select" | "date" | "dateRange" | "toggle";
  value: any;
  options?: FilterOption[];
  placeholder?: string;
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterItem[];
  onFilterChange?: (key: string, value: any) => void;
  onReset?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

interface FilterGroupProps {
  children: React.ReactNode;
  title?: string;
  collapsible?: boolean;
}

// --- Utilities ---

function hasActiveFilters(filters: FilterItem[]): boolean {
  return filters.some((f) => {
    if (f.type === "toggle") return f.value === true;
    if (f.type === "dateRange") return f.value?.start || f.value?.end;
    return f.value !== "" && f.value !== null && f.value !== undefined;
  });
}

function getFilterDisplayValue(filter: FilterItem): string | null {
  if (filter.type === "toggle") {
    return filter.value ? "Evet" : null;
  }
  if (filter.type === "select" && filter.options) {
    const opt = filter.options.find((o) => String(o.value) === String(filter.value));
    return opt?.label ?? null;
  }
  if (filter.type === "date") {
    return filter.value || null;
  }
  if (filter.type === "dateRange") {
    if (filter.value?.start && filter.value?.end) {
      return `${filter.value.start} - ${filter.value.end}`;
    }
    if (filter.value?.start) return `${filter.value.start} -`;
    if (filter.value?.end) return `- ${filter.value.end}`;
    return null;
  }
  return null;
}

// --- SearchInput ---

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Ara...",
  debounceMs = 300,
}) => {
  const [internal, setInternal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInternal(value);
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInternal(val);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onChange(val), debounceMs);
    },
    [onChange, debounceMs]
  );

  const handleClear = useCallback(() => {
    setInternal("");
    onChange("");
  }, [onChange]);

  return (
    <div className="form-control-wrap">
      <div className="form-icon form-icon-left">
        <Icon name="search" />
      </div>
      <input
        type="text"
        className="form-control ps-4"
        placeholder={placeholder}
        value={internal}
        onChange={handleChange}
      />
      {internal && (
        <a
          href="#clear"
          className="form-icon form-icon-right"
          onClick={(e) => {
            e.preventDefault();
            handleClear();
          }}
        >
          <Icon name="cross" />
        </a>
      )}
    </div>
  );
};

// --- FilterChip ---

export const FilterChip: React.FC<FilterChipProps> = ({ label, value, onRemove }) => (
  <Badge color="light" className="d-inline-flex align-items-center gap-1 px-2 py-1 me-1 mb-1">
    <span className="text-dark fw-medium">{label}:</span>
    <span>{value}</span>
    <a
      href="#remove"
      className="ms-1 text-muted"
      onClick={(e) => {
        e.preventDefault();
        onRemove();
      }}
    >
      <Icon name="cross-sm" />
    </a>
  </Badge>
);

// --- FilterGroup ---

export const FilterGroup: React.FC<FilterGroupProps> = ({
  children,
  title,
  collapsible = false,
}) => {
  const [isOpen, setIsOpen] = useState(!collapsible);

  return (
    <div className="card card-bordered">
      <div className="card-inner">
        {title && (
          <div
            className={`d-flex align-items-center justify-content-between ${collapsible ? "mb-0" : "mb-3"}`}
          >
            <span className="overline-title">{title}</span>
            {collapsible && (
              <a
                href="#toggle"
                className="text-soft"
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(!isOpen);
                }}
              >
                <Icon name={isOpen ? "chevron-up" : "chevron-down"} />
              </a>
            )}
          </div>
        )}
        {collapsible ? (
          <Collapse isOpen={isOpen}>
            <div className="pt-3">{children}</div>
          </Collapse>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

// --- Filter Renderers ---

const SelectFilter: React.FC<{
  filter: FilterItem;
  onChange: (key: string, value: any) => void;
}> = ({ filter, onChange }) => (
  <UncontrolledDropdown>
    <DropdownToggle
      tag="a"
      href="#toggle"
      onClick={(e: React.MouseEvent) => e.preventDefault()}
      className="btn btn-dim btn-outline-light btn-sm"
    >
      <span>{filter.value ? getFilterDisplayValue(filter) || filter.label : filter.label}</span>
      <Icon name="chevron-down" />
    </DropdownToggle>
    <DropdownMenu>
      <ul className="link-list-opt no-bdr">
        {filter.placeholder && (
          <li>
            <DropdownItem
              tag="a"
              href="#item"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                onChange(filter.key, "");
              }}
            >
              <span>{filter.placeholder}</span>
            </DropdownItem>
          </li>
        )}
        {filter.options?.map((opt) => (
          <li key={opt.value}>
            <DropdownItem
              tag="a"
              href="#item"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                onChange(filter.key, opt.value);
              }}
              className={String(filter.value) === String(opt.value) ? "active" : ""}
            >
              <span>{opt.label}</span>
            </DropdownItem>
          </li>
        ))}
      </ul>
    </DropdownMenu>
  </UncontrolledDropdown>
);

const DateFilter: React.FC<{
  filter: FilterItem;
  onChange: (key: string, value: any) => void;
}> = ({ filter, onChange }) => (
  <div className="form-group">
    <div className="form-control-wrap">
      <Input
        type="date"
        bsSize="sm"
        className="form-control"
        value={filter.value || ""}
        placeholder={filter.placeholder || filter.label}
        onChange={(e) => onChange(filter.key, e.target.value)}
      />
    </div>
  </div>
);

const DateRangeFilter: React.FC<{
  filter: FilterItem;
  onChange: (key: string, value: any) => void;
}> = ({ filter, onChange }) => (
  <div className="d-flex align-items-center gap-1">
    <Input
      type="date"
      bsSize="sm"
      className="form-control"
      value={filter.value?.start || ""}
      onChange={(e) => onChange(filter.key, { ...filter.value, start: e.target.value })}
    />
    <span className="text-soft">-</span>
    <Input
      type="date"
      bsSize="sm"
      className="form-control"
      value={filter.value?.end || ""}
      onChange={(e) => onChange(filter.key, { ...filter.value, end: e.target.value })}
    />
  </div>
);

const ToggleFilter: React.FC<{
  filter: FilterItem;
  onChange: (key: string, value: any) => void;
}> = ({ filter, onChange }) => (
  <div className="custom-control custom-switch">
    <input
      type="checkbox"
      className="custom-control-input"
      id={`filter-toggle-${filter.key}`}
      checked={!!filter.value}
      onChange={(e) => onChange(filter.key, e.target.checked)}
    />
    <label className="custom-control-label" htmlFor={`filter-toggle-${filter.key}`}>
      {filter.label}
    </label>
  </div>
);

// --- FilterBar ---

const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Ara...",
  filters = [],
  onFilterChange,
  onReset,
  actions,
  className = "",
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeFilters = filters.filter((f) => getFilterDisplayValue(f) !== null);
  const isFiltered = hasActiveFilters(filters);

  const renderFilter = (filter: FilterItem) => {
    if (!onFilterChange) return null;
    switch (filter.type) {
      case "select":
        return <SelectFilter key={filter.key} filter={filter} onChange={onFilterChange} />;
      case "date":
        return <DateFilter key={filter.key} filter={filter} onChange={onFilterChange} />;
      case "dateRange":
        return <DateRangeFilter key={filter.key} filter={filter} onChange={onFilterChange} />;
      case "toggle":
        return <ToggleFilter key={filter.key} filter={filter} onChange={onFilterChange} />;
      default:
        return null;
    }
  };

  return (
    <div className={`filter-bar ${className}`}>
      <div className="card-inner border-bottom py-2">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          {/* Search */}
          <div className="form-inline flex-nowrap gap-2" style={{ minWidth: 220 }}>
            <SearchInput
              value={searchValue}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
            />
          </div>

          <div className="d-flex align-items-center gap-2">
            {/* Mobile toggle */}
            {filters.length > 0 && (
              <Button
                size="sm"
                outline
                color="light"
                className="d-md-none"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                <Icon name="filter" />
                <span className="ms-1">Filtreler</span>
                {isFiltered && (
                  <Badge color="primary" pill className="ms-1">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            )}

            {/* Desktop filters */}
            <div className="d-none d-md-flex align-items-center gap-2">
              {filters.map((filter) => (
                <div key={filter.key} className="filter-item">
                  {renderFilter(filter)}
                </div>
              ))}
            </div>

            {/* Reset */}
            {isFiltered && onReset && (
              <Button size="sm" color="link" className="text-danger px-1" onClick={onReset}>
                <Icon name="reload" />
                <span className="ms-1">Temizle</span>
              </Button>
            )}

            {/* Actions */}
            {actions}
          </div>
        </div>

        {/* Mobile filters collapse */}
        {filters.length > 0 && (
          <Collapse isOpen={mobileOpen} className="d-md-none mt-2">
            <Row className="g-2">
              {filters.map((filter) => (
                <Col xs={12} sm={6} key={filter.key}>
                  <label className="form-label text-soft fs-12px">{filter.label}</label>
                  {renderFilter(filter)}
                </Col>
              ))}
            </Row>
          </Collapse>
        )}
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="card-inner py-1 border-bottom">
          <div className="d-flex align-items-center flex-wrap gap-1">
            <span className="text-soft fs-12px me-1">Filtrele:</span>
            {activeFilters.map((filter) => {
              const displayVal = getFilterDisplayValue(filter);
              if (!displayVal) return null;
              return (
                <FilterChip
                  key={filter.key}
                  label={filter.label}
                  value={displayVal}
                  onRemove={() => {
                    if (!onFilterChange) return;
                    if (filter.type === "toggle") onFilterChange(filter.key, false);
                    else if (filter.type === "dateRange") onFilterChange(filter.key, { start: "", end: "" });
                    else onFilterChange(filter.key, "");
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
