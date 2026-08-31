import React from "react";
import classNames from "classnames";
import Icon from "@/components/icon/Icon";
import type { BaseComponentProps, SizeToken, ThemeToken } from "@/components/component.types";

// Aviable sizes {xs,sm,md,lg,xl}
/* Aviable theme {blue-dim, blue, azure-dim, azure, indigo-dim, indigo, purple-dim, purple, pink-dim, pink, orange-dim, orange, teal-dim, teal,
    primary-dim, primary, secondary-dim, secondary, success-dim, success, info-dim, info, warning-dim, warning, danger-dim, danger, dark-dim, dark, gray-dim, gray, lighter, light} */

type UserAvatarProps = BaseComponentProps & {
  size?: SizeToken;
  theme?: ThemeToken;
  icon?: string;
  text?: string;
  image?: string;
  imageAlt?: string;
};

const UserAvatar = ({ className, size, theme, icon, text, image, imageAlt, ...props }: UserAvatarProps) => {
  const classes = classNames({
    "user-avatar": true,
    [`${className}`]: className,
    [`user-avatar-${size}`]: size,
    [`bg-${theme}`]: theme,
  });
  return (
    <div className={classes}>
      {icon ? <Icon name={icon} /> : null}
      {image && <img src={image} alt={imageAlt} />}
      {text && !image && <span>{text}</span>}
      {props.children}
    </div>
  );
};

export default UserAvatar;
