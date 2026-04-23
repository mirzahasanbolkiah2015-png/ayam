import * as React from "react";

export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      style={{
        fontSize: "14px",
        fontWeight: 500,
        display: "block",
        marginBottom: "4px"
      }}
      {...props}
    />
  );
}
