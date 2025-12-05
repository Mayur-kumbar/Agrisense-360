import React from "react";

export default function Header(){
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 justify-between">
      <div className="flex items-center gap-4">
        
        <img src="/src/assets/logo.svg" alt=" AgriSense 360" className="h-9" / >
        <span>AgriSense 360</span>
        <h1 className="text-2xl font-bold text-[#0f1724]"> {/* dynamic page title could go here */} </h1>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>Welcome, farmer!</span>
        <button className="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M..." /></svg>
          Logout
        </button>
      </div>
    </header>
  );
}
