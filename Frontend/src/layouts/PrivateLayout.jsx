// src/layouts/PrivateLayout.jsx
import React from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";

/**
 * PrivateLayout wraps only private pages.
 * Public pages must not use this component.
 */
export default function PrivateLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        <Header />
        <main className="p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
