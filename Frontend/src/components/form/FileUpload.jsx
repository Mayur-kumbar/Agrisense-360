import React, { useState } from "react";

export default function FileUpload({ onChange }) {
  const [name, setName] = useState(null);

  function handle(e){
    const file = e.target.files[0];
    if(file){
      setName(file.name);
      if(onChange) onChange(file);
    }
  }

  return (
    <label className="block">
      <input type="file" accept="image/*" onChange={handle} className="sr-only" />
      <div className="mt-2 border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-500">
        <p className="mb-2">{name ? name : "Upload a file or drag and drop"}</p>
        <div className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</div>
      </div>
    </label>
  );
}
