import React, { useState } from "react";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import FormBuilder, { FormField } from "@/modules/shared/components/FormBuilder";

interface ModuleFormPageProps {
  title: string;
  fields: FormField[];
}

const ModuleFormPage: React.FC<ModuleFormPageProps> = ({ title, fields }) => {
  const [values, setValues] = useState<Record<string, unknown>>({});

  return (
    <>
      <Head title={title} />
      <Content>
        <div className="nk-block-head nk-block-head-sm">
          <div className="nk-block-head-content">
            <h3 className="nk-block-title page-title">{title}</h3>
          </div>
        </div>
        <div className="card card-bordered">
          <div className="card-inner">
            <FormBuilder
              fields={fields}
              values={values}
              onChange={(name, value) => setValues((prev) => ({ ...prev, [name]: value }))}
            />
          </div>
        </div>
      </Content>
    </>
  );
};

export default ModuleFormPage;
