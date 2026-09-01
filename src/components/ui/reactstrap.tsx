/* eslint-disable react-refresh/only-export-components */
import React, { ReactNode, useEffect, useMemo, useRef } from "react";
import { Alert as BaseAlert } from "reactstrap/esm";
export * from "reactstrap/esm";
import { getRecentErrorStatus, getRegisteredErrorStatus } from "@/infrastructure/api/errorStatusRegistry";

type AlertProps = React.ComponentProps<typeof BaseAlert> & {
    autoScroll?: boolean;
    errorStatusCode?: number;
};

const nodeToText = (node: ReactNode): string => {
    if (typeof node === "string" || typeof node === "number") {
        return String(node);
    }

    if (Array.isArray(node)) {
        return node.map(nodeToText).join(" ");
    }

    if (React.isValidElement(node)) {
        return nodeToText(node.props.children);
    }

    return "";
};

const isElementInViewport = (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    return rect.top >= 0 && rect.bottom <= viewportHeight;
};

const scrollAlertIntoView = (element: HTMLElement): void => {
    if (isElementInViewport(element)) return;

    element.scrollIntoView({
        behavior: "smooth",
        block: "center",
    });
};

export const Alert = ({
    autoScroll,
    children,
    color,
    errorStatusCode,
    innerRef,
    ...props
}: AlertProps) => {
    const localRef = useRef<HTMLElement | null>(null);
    const alertText = useMemo(() => nodeToText(children).replace(/\s+/g, " ").trim(), [children]);
    const isErrorAlert = color === "danger";
    const statusCode = errorStatusCode ?? getRegisteredErrorStatus(alertText) ?? getRecentErrorStatus();
    const resolvedColor = isErrorAlert && statusCode !== 500 ? "warning" : color;

    useEffect(() => {
        if (!localRef.current || !(autoScroll ?? isErrorAlert)) return;

        const frameId = window.requestAnimationFrame(() => {
            if (localRef.current) {
                scrollAlertIntoView(localRef.current);
            }
        });

        return () => window.cancelAnimationFrame(frameId);
    }, [autoScroll, alertText, isErrorAlert]);

    const setInnerRef = (element: HTMLElement | null) => {
        localRef.current = element;

        if (typeof innerRef === "function") {
            innerRef(element);
        } else if (innerRef && "current" in innerRef) {
            // Reactstrap supports object refs here; this mirrors React's own ref assignment.
            innerRef.current = element;
        }
    };

    return (
        <BaseAlert {...props} color={resolvedColor} innerRef={setInnerRef}>
            {children}
        </BaseAlert>
    );
};
