import React, { useState } from "react";
import Card from "../components/ui/Card";

export default function Settings(){
  const [language, setLanguage] = useState("English");
  const [channel, setChannel] = useState("Telegram");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  function save(){
    setSaving(true);
    setMsg(null);
    // POST to settings endpoint (use services/api.js and endpoints in production)
    setTimeout(()=>{ setSaving(false); setMsg("Saved preferences"); }, 800);
  }

  return (
    <div>
      <h2 className="text-4xl font-extrabold mb-6">Settings & Preferences</h2>

      <Card>
        <div className="mb-6">
          <div className="text-sm font-semibold text-gray-700">Alert Language</div>
          <div className="text-gray-500 text-sm mt-1">Choose the language for Telegram and SMS notifications.</div>
          <select value={language} onChange={e=>setLanguage(e.target.value)} className="mt-3 block w-1/3 rounded border border-gray-200 p-3">
            <option>English</option>
            <option>Hindi</option>
            <option>Spanish</option>
          </select>
        </div>

        <div className="mb-6">
          <div className="text-sm font-semibold text-gray-700">Notification Channel</div>
          <div className="text-gray-500 text-sm mt-1">Select your preferred channel for receiving alerts.</div>

          <div className="mt-3">
            <label className="inline-flex items-center mr-6">
              <input type="radio" checked={channel==='Telegram'} onChange={()=>setChannel('Telegram')} className="mr-2" />
              Telegram
            </label>
            <label className="inline-flex items-center">
              <input type="radio" checked={channel==='SMS'} onChange={()=>setChannel('SMS')} className="mr-2" />
              SMS (coming soon)
            </label>
          </div>
        </div>

        <div className="text-right">
          <button className="bg-emerald-700 text-white px-5 py-2 rounded" onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>

        {msg && <div className="mt-4 text-sm text-gray-600">{msg}</div>}
      </Card>
    </div>
  );
}
