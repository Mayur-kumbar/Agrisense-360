import React from "react";
import Card from "../components/ui/Card";

const rows = [
  { status: "High Stress", farm: "Green Valley Farms", message: "High vegetation stress detected", color: "bg-red-100 text-red-700" },
  { status: "Moderate Stress", farm: "Sunshine Orchards", message: "Potential nutrient deficiency detected", color: "bg-yellow-100 text-yellow-800" },
  { status: "Weather Warning", farm: "Riverbend Fields", message: "Heavy rainfall expected", color: "bg-emerald-100 text-emerald-800" },
  { status: "Healthy", farm: "Green Valley Farms", message: "Crop health is optimal.", color: "bg-emerald-50 text-emerald-700" },
];

export default function Alerts(){
  return (
    <div>
      <h2 className="text-4xl font-extrabold mb-6">Alerts & Recommendations</h2>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Alert History</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Send Test Alert</button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-gray-500">
                <th className="py-3">STATUS</th>
                <th className="py-3">FARM</th>
                <th className="py-3">MESSAGE</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${r.color}`}>{r.status}</span>
                  </td>
                  <td className="py-4 text-gray-700">{r.farm}</td>
                  <td className="py-4 text-gray-600">{r.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
