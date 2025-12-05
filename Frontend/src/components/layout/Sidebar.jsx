// src/components/layout/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { Grid, Leaf, CloudRain, Bell, Clock, Settings, HelpCircle } from "lucide-react";

const items = [
  { to: "/register-farm", label: "Register Farm", Icon: Grid },
  { to: "/crop-analysis", label: "Crop Analysis", Icon: Leaf },
  { to: "/weather", label: "Weather", Icon: CloudRain },
  { to: "/alerts", label: "Alerts", Icon: Bell },
  { to: "/history", label: "History", Icon: Clock },
  { to: "/settings", label: "Settings", Icon: Settings },
  { to: "/help", label: "Help", Icon: HelpCircle },
];

export default function Sidebar(){
  return (
    <aside className="w-64 bg-white border-r border-gray-100 hidden md:block">
      <div className="px-6 py-8">
        <img src="/logo.png" alt="AgriSense 360" className="h-8" onError={(e) => { e.currentTarget.style.display = "none"; }} />
      </div>

      <nav className="px-4">
        {items.map(({to,label,Icon}) => (
          <NavLink
            key={to}
            to={to}
            className={({isActive}) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 mb-2 text-gray-700 transition-colors
              ${isActive ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-gray-50'}`
            }
          >
            <div className="p-2 rounded bg-transparent">
              <Icon className="w-5 h-5" />
            </div>
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
