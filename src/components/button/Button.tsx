import React from "react";
import classNames from "classnames";
import type { BaseComponentProps, SizeToken, ThemeToken } from "@/components/component.types";

type ButtonProps = BaseComponentProps & {
  color?: ThemeToken;
  size?: SizeToken;
  outline?: boolean;
  disabled?: boolean;
};

const Button = ({ color, size, className, outline, disabled, ...props }: ButtonProps) => {
  const buttonClass = classNames({
    btn: true,
    [`btn-${color}`]: !outline,
    [`btn-outline-${color}`]: outline,
    [`btn-${size}`]: size,
    disabled: disabled,
    [`${className}`]: className,
  });
  return (
    <button className={buttonClass} {...props}>
      {props.children}
    </button>
  );
};
export default Button;
