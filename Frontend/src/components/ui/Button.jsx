import React from "react";
export default function Button({children, className = "", ...props}){
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 ${className}`}
    >
      {children}
    </button>
  );
}
