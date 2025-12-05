import React from "react";

export default function Input({className = "", ...props}){
  return (
    <input
      {...props}
      className={`mt-2 block w-full rounded-lg border border-gray-200 shadow-sm p-3 ${className}`}
    />
  );
}
