import React from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/icon/Icon";
import classNames from "classnames";
import type { TaggableProps } from "@/components/component.types";

type LinkItemProps = TaggableProps & {
  link?: string;
  icon?: string;
  text?: React.ReactNode;
};

type LinkListProps = TaggableProps & {
  opt?: boolean;
};

export const LinkItem = ({ ...props }: LinkItemProps) => {
  return (
    <li>
      {props.tag !== "a" ? (
        <Link to={props.link} {...props}>
          {props.icon ? <Icon name={props.icon} /> : null} <span>{props.text || props.children}</span>
        </Link>
      ) : (
        <a href={props.link} onClick={props.onClick || ((ev) => ev.preventDefault())}>
          {props.icon ? <Icon name={props.icon} /> : null} <span>{props.text || props.children}</span>
        </a>
      )}
    </li>
  );
};

export const LinkList = ({ ...props }: LinkListProps) => {
  const listClasses = classNames({
    "link-list": !props.opt,
    "link-list-opt": props.opt,
    [`${props.className}`]: props.className,
  });
  return <ul className={listClasses}>{props.children}</ul>;
};
