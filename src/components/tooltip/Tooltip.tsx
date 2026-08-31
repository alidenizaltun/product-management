import React from "react";
import { UncontrolledTooltip } from "reactstrap";
import Icon from "@/components/icon/Icon";
import type { TaggableProps } from "@/components/component.types";

type TooltipDirection = React.ComponentProps<typeof UncontrolledTooltip>["placement"];

type TooltipComponentProps = TaggableProps & {
  iconClass?: string;
  /** Icon koşulsuz render edildiği için zorunlu. */
  icon: string;
  /** UncontrolledTooltip hedefi; benzersiz olmalı. */
  id: string;
  direction?: TooltipDirection;
  text?: React.ReactNode;
  containerClassName?: string;
};

const TooltipComponent = ({
  iconClass,
  icon,
  id,
  direction,
  text,
  containerClassName,
  ...props
}: TooltipComponentProps) => {
  return (
    <React.Fragment>
      {props.tag ? (
        <props.tag className={containerClassName} id={id}>
          {" "}
          <Icon className={`${iconClass ? iconClass : ""}`} name={icon}></Icon>
        </props.tag>
      ) : (
        <Icon className={`${iconClass ? iconClass : ""}`} name={icon} id={id}></Icon>
      )}
      <UncontrolledTooltip autohide={false} placement={direction} target={id}>
        {text}
      </UncontrolledTooltip>
    </React.Fragment>
  );
};
export default TooltipComponent;
