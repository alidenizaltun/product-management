import React from "react";
import {
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
} from "@/components/Component";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => (
  <BlockHead size="sm">
    <BlockBetween>
      <BlockHeadContent>
        <BlockTitle page tag="h3">
          {title}
        </BlockTitle>
        {description ? (
          <BlockDes className="text-soft">
            <p>{description}</p>
          </BlockDes>
        ) : null}
      </BlockHeadContent>
      {actions ? <BlockHeadContent>{actions}</BlockHeadContent> : null}
    </BlockBetween>
  </BlockHead>
);

export { Block };
export default PageHeader;
