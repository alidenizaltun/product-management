import React from "react";
import { Helmet } from "react-helmet";
import { PAGE_TITLE_SUFFIX } from "@/shared/config/branding";

const Head = ({ ...props }) => {
  return (
    <Helmet>
      <title>{props.title ? `${props.title} | ` : ""}{PAGE_TITLE_SUFFIX}</title>
    </Helmet>
  );
};
export default Head;
