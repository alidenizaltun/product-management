import classNames from "classnames";
import React from "react";
import type { BaseComponentProps, StyleProps } from "@/components/component.types";

type IconProps = BaseComponentProps &
  StyleProps & {
    name: string;
  };

const Icon = ({ name, id, className, style, ...props }: IconProps) => {
  const iconClass = classNames({
    [`${className}`]: className,
    icon: true,
    ni: true,
    [`ni-${name}`]: true,
  });
  return <em className={iconClass} id={id} style={style} {...props}></em>;
};
export default Icon;
