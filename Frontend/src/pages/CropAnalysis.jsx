import React, { useState } from "react";
import Card from "../components/ui/Card";
import FileUpload from "../components/form/FileUpload";
import api from "../services/api";
import { ANALYSIS } from "../services/endpoints";

export default function CropAnalysis(){
  const [file, setFile] = useState(null);
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState(null);

  async function runAnalysis(e){
    e.preventDefault();
    if(!file){ setMsg("Please upload an NDVI image."); return; }
    setRunning(true);
    try{
      const fd = new FormData();
      fd.append("ndviImage", file);
      // optionally send farmId
      const res = await api.post(ANALYSIS.RUN, fd, { headers: { "Content-Type": "multipart/form-data" }});
      setMsg("Analysis started.");
    }catch(err){
      setMsg("Analysis failed.");
    }finally{
      setRunning(false);
    }
  }

  return (
    <div>
      <h2 className="text-4xl font-extrabold mb-6">Crop Health Analysis</h2>

      <Card>
        <div className="text-gray-600 mb-4">
          Upload an NDVI image and run the analysis to detect vegetation stress.
        </div>

        <form onSubmit={runAnalysis}>
          <FileUpload onChange={f=>setFile(f)} />
          <div className="mt-6">
            <button className="bg-emerald-700 text-white px-6 py-3 rounded-lg" type="submit" disabled={running}>
              {running ? "Running..." : "Run Analysis"}
            </button>
          </div>
          {msg && <div className="mt-3 text-sm text-gray-600">{msg}</div>}
        </form>
      </Card>
    </div>
  );
}
