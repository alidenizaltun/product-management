import React from "react";
import classnames from "classnames";
import type { BaseComponentProps, GridSpan } from "@/components/component.types";

type ColProps = BaseComponentProps & {
  sm?: GridSpan;
  lg?: GridSpan;
  md?: GridSpan;
  xxl?: GridSpan;
  size?: GridSpan;
};

export const Col = ({ sm, lg, md, xxl, size, className, ...props }: ColProps) => {
  var classNames = classnames({
    [`col-sm-${sm}`]: sm,
    [`col-lg-${lg}`]: lg,
    [`col-md-${md}`]: md,
    [`col-xxl-${xxl}`]: xxl,
    [`col-${size}`]: size,
    [`${className}`]: className,
  });
  return <div className={classNames}>{props.children}</div>;
};
export const Row = ({ className, ...props }: BaseComponentProps) => {
  const rowClass = classnames({
    row: true,
    [`${className}`]: className,
  });
  return <div className={rowClass}>{props.children}</div>;
};
