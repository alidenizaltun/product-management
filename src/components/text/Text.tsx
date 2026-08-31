import React from "react";
import classNames from "classnames";
import type { TaggableProps } from "@/components/component.types";

type OverlineTitleProps = TaggableProps & {
  alt?: boolean;
};

export const OverlineTitle = ({ className, alt, ...props }: OverlineTitleProps) => {
  const classes = classNames({
    "overline-title": true,
    [`${className}`]: className,
    "overline-title-alt": alt,
  });
  return (
    <React.Fragment>
      {!props.tag ? (
        <h6 className={classes}>{props.children}</h6>
      ) : (
        <props.tag className={classes}>{props.children}</props.tag>
      )}
    </React.Fragment>
  );
};
