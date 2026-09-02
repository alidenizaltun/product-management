import React from "react";
import Tippy from "@tippyjs/react";
import Icon from "@/components/icon/Icon";
import type { TaggableProps } from "@/components/component.types";

type TooltipComponentProps = TaggableProps & {
  iconClass?: string;
  icon: string;
  id?: string;
  text: string;
  containerClassName?: string;
};

const TooltipComponent = ({
  iconClass,
  icon,
  text,
  containerClassName,
  tag: Tag,
}: TooltipComponentProps) => {
  const content = <Icon className={iconClass ?? ""} name={icon} />;

  return (
    <Tippy content={text} placement="top">
      {Tag ? <Tag className={containerClassName}>{content}</Tag> : content}
    </Tippy>
  );
};

export default TooltipComponent;
