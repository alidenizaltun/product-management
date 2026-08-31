import React from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/icon/Icon";
import classNames from "classnames";
import type { BaseComponentProps, SizeToken, TaggableProps } from "@/components/component.types";

type BlockProps = BaseComponentProps & {
  size?: SizeToken;
};

type BlockHeadProps = BaseComponentProps & {
  size?: SizeToken;
  wide?: SizeToken;
};

type BlockTitleProps = TaggableProps & {
  page?: boolean;
};

type BackToProps = BaseComponentProps & {
  link: string;
  /** Icon koşulsuz render edildiği için zorunlu. */
  icon: string;
};

export const Block = ({ className, size, ...props }: BlockProps) => {
  const blockClass = classNames({
    "nk-block": true,
    [`nk-block-${size}`]: size,
    [`${className}`]: className,
  });
  return <div className={blockClass}>{props.children}</div>;
};
export const BlockContent = ({ className, ...props }: BaseComponentProps) => {
  const blockContentClass = classNames({
    "nk-block-content": true,
    [`${className}`]: className,
  });
  return <div className={blockContentClass}>{props.children}</div>;
};

export const BlockBetween = ({ className, ...props }: BaseComponentProps) => {
  return <div className={`nk-block-between ${className ? className : ""}`}>{props.children}</div>;
};
export const BlockHead = ({ className, size, wide, ...props }: BlockHeadProps) => {
  const blockHeadClass = classNames({
    "nk-block-head": true,
    [`nk-block-head-${size}`]: size,
    [`wide-${wide}`]: wide,
    [`${className}`]: className,
  });
  return <div className={blockHeadClass}>{props.children}</div>;
};
export const BlockHeadContent = ({ className, ...props }: BaseComponentProps) => {
  return <div className={`nk-block-head-content${className ? " " + className : ""}`}>{props.children}</div>;
};
export const BlockTitle = ({ className, page, ...props }: BlockTitleProps) => {
  const classes = `nk-block-title ${page ? "page-title" : "title"}${className ? " " + className : ""}`;
  return (
    <React.Fragment>
      {!props.tag ? (
        <h3 className={classes}>{props.children}</h3>
      ) : (
        <props.tag className={classes}>{props.children}</props.tag>
      )}
    </React.Fragment>
  );
};
export const BlockDes = ({ className, page, ...props }: BlockTitleProps) => {
  const classes = `nk-block-des${className ? " " + className : ""}`;
  return <div className={classes}>{props.children}</div>;
};

export const BackTo = ({ className, link, icon, ...props }: BackToProps) => {
  const classes = `back-to${className ? " " + className : ""}`;
  return (
    <div className="nk-block-head-sub">
      <Link className={classes} to={link}>
        <Icon name={icon} />
        <span>{props.children}</span>
      </Link>
    </div>
  );
};
