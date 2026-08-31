import React, { useState, useEffect } from "react";
import { Card, Button } from "reactstrap";
import { OverlineTitle } from "../text/Text";
import { CopyToClipboard } from "react-copy-to-clipboard";
import type { BaseComponentProps, SizeToken } from "@/components/component.types";

import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import  "highlight.js/styles/a11y-light.css";
hljs.registerLanguage('javascript', javascript);

type PreviewCardProps = BaseComponentProps & {
  bodyClass?: string;
};

type PreviewTableProps = BaseComponentProps & {
  size?: SizeToken;
};

type CodeBlockProps = BaseComponentProps & {
  language?: string;
  title?: React.ReactNode;
};

export const PreviewCard = ({ className, bodyClass, ...props }: PreviewCardProps) => {
  return (
    <Card className={`card-preview ${className ? className : ""}`}>
      <div className={`card-inner ${bodyClass ? bodyClass : ""}`}>{props.children}</div>
    </Card>
  );
};

export const PreviewAltCard = ({ className, bodyClass, ...props }: PreviewCardProps) => {
  return (
    <Card className={`${className ? className : ""}`}>
      <div className={`card-inner ${bodyClass ? bodyClass : ""}`}>{props.children}</div>
    </Card>
  );
};

export const PreviewTable = ({ ...props }: PreviewTableProps) => {
  return (
    <Card className="card-preview">
      <table className={`table preview-reference ${props.size ? `table-${props.size}` : ""}`}>{props.children}</table>
    </Card>
  );
};

export const CodeBlock = ({ language, ...props }: CodeBlockProps) => {
  const [copyText] = useState(props.children);
  const [copyState, setCopyState] = useState(false);
  const onCopyClick = () => {
    setCopyState(true);
    setTimeout(() => setCopyState(false), 2000);
  };

  useEffect(() => {
    document.querySelectorAll("pre code:not(.hljs)").forEach((el) => {
      hljs.highlightElement(el);
    });
  }, [props.children]);
  return (
    <div className={`code-block code-block-clean ${copyState ? "clipboard-success" : ""}`}>
      <OverlineTitle className="title">{props.title ? props.title : "Code Example"}</OverlineTitle>
      <CopyToClipboard text={copyText} onCopy={onCopyClick}>
        <Button color="blank" size="sm" className="clipboard-init">
          {copyState ? "Copied" : "Copy"}
        </Button>
      </CopyToClipboard>
      <pre>
        <code className="language-javascript bg-lighter h-max-150px m-0">{props.children}</code>
      </pre>
    </div>
  );
};
