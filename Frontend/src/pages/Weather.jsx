import React from "react";
import Card from "../components/ui/Card";
import MetricCard from "../components/ui/MetricCard";
import LineChart from "../components/charts/LineChart";

export default function Weather(){
  // static demo values; replace with real fetch using api + WEATHER endpoints
  const metrics = [
    { title: "Temperature", value: "24°C" },
    { title: "Humidity", value: "68%" },
    { title: "Rainfall (24h)", value: "5 mm" },
    { title: "Wind Speed", value: "15 km/h" },
  ];

  const rainfall = [20,40,80,60,120,95,70,45,30,55];
  const labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct"];

  return (
    <div>
      <h2 className="text-4xl font-extrabold mb-6">Weather Insights for Green Valley Farms</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {metrics.map((m,i) => <MetricCard key={i} title={m.title} value={m.value} />)}
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Rainfall Trend (Last 10 Months)</h3>
        <div className="w-full"><LineChart data={rainfall} labels={labels} height={260} /></div>
      </Card>
    </div>
  );
}
