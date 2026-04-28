import React from "react";
import { Input, Label } from "reactstrap";

export type FieldType = "text" | "number" | "textarea" | "select" | "checkbox";

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  options?: Array<{ label: string; value: string | number }>;
}

interface FormBuilderProps {
  fields: FormField[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ fields, values, onChange }) => {
  return (
    <div className="row g-3">
      {fields.map((field) => (
        <div key={field.name} className="col-12 col-md-6">
          <Label className="form-label" for={field.name}>
            {field.label}
          </Label>
          {field.type === "textarea" ? (
            <Input
              id={field.name}
              type="textarea"
              value={values[field.name] ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
          ) : field.type === "select" ? (
            <Input
              id={field.name}
              type="select"
              value={values[field.name] ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            >
              <option value="">Seçiniz</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Input>
          ) : field.type === "checkbox" ? (
            <div>
              <Input
                id={field.name}
                type="checkbox"
                checked={Boolean(values[field.name])}
                onChange={(e) => onChange(field.name, e.target.checked)}
              />
            </div>
          ) : (
            <Input
              id={field.name}
              type={field.type}
              value={values[field.name] ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default FormBuilder;
