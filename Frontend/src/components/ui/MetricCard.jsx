import React from "react";

export default function MetricCard({title, value, sub}) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M4 12h16" stroke="currentColor"/></svg>
      </div>
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        {sub && <div className="text-sm text-gray-400">{sub}</div>}
      </div>
    </div>
  );
}
