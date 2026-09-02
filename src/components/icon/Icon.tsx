import classNames from "classnames";
import React, { forwardRef } from "react";
import type { BaseComponentProps, StyleProps } from "@/components/component.types";

type IconProps = BaseComponentProps &
  StyleProps & {
    name: string;
  };

const Icon = forwardRef<HTMLElement, IconProps>(({ name, id, className, style, ...props }, ref) => {
  const iconClass = classNames({
    [`${className}`]: className,
    icon: true,
    ni: true,
    [`ni-${name}`]: true,
  });
  return <em ref={ref} className={iconClass} id={id} style={style} {...props}></em>;
});

Icon.displayName = "Icon";

export default Icon;
