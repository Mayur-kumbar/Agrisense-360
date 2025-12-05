import React from "react";
import Card from "../components/ui/Card";
import LineChart from "../components/charts/LineChart";

export default function History(){
  const ndvi = [0.6,0.65,0.7,0.78,0.82,0.8,0.75,0.72,0.68,0.7];
  const labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct"];

  return (
    <div>
      <h2 className="text-4xl font-extrabold mb-6">History & Analytics</h2>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Historical NDVI Trend</h3>
        <LineChart data={ndvi} labels={labels} height={260} />
      </Card>
    </div>
  );
}
