// src/components/landing/Glass.jsx
import React from "react";

const Glass = React.forwardRef(function Glass({ as: Tag = "div", className = "", children, ...rest }, ref) {
  return (
    <Tag
      ref={ref}
      className={`rounded-3xl border border-white/[0.12] bg-white/[0.055] backdrop-blur-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] overflow-hidden ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
});

export default Glass;