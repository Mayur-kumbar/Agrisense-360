import React, { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import FileUpload from "../components/form/FileUpload";
import api from "../services/api";
import { FARMS } from "../services/endpoints";
import { useNavigate } from "react-router-dom";

export default function RegisterFarm() {
  const [form, setForm] = useState({
    name: "",
    cropType: "",
    latitude: "",
    longitude: "",
    ndviSource: "Drone",
  });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();
  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, []);

const handleSubmit = async () => {
  const fd = new FormData();

  fd.append("name", form.name);
  fd.append("crop", form.cropType);
  fd.append("ndviSource", form.ndviSource);

  // Auto-generate a polygon using given lat/lng (simple square for now)
  const lat = Number(form.latitude);
  const lng = Number(form.longitude);

  const polygon = [
    [lng, lat],
    [lng + 0.0005, lat],
    [lng + 0.0005, lat + 0.0005],
    [lng, lat],
  ];

  fd.append("polygon", JSON.stringify(polygon));

  // Center point
  fd.append(
    "center",
    JSON.stringify({
      lat,
      lng,
    })
  );

  if (file) {
    fd.append("ndviImage", file);
  }

  await axios.post("/api/farms", fd);
};

  return (
    <div>
      <h2 className="text-4xl font-extrabold mb-6">Register a New Farm</h2>

      <Card>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Farm Name
            </label>
            <Input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="e.g., Green Valley Farms"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Crop Type
            </label>
            <Input
              name="cropType"
              value={form.cropType}
              onChange={onChange}
              placeholder="e.g., Wheat"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Latitude
            </label>
            <Input
              name="latitude"
              value={form.latitude}
              onChange={onChange}
              placeholder="e.g., 28.6139"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Longitude
            </label>
            <Input
              name="longitude"
              value={form.longitude}
              onChange={onChange}
              placeholder="e.g., 77.2090"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700">
              NDVI Source
            </label>
            <select
              name="ndviSource"
              value={form.ndviSource}
              onChange={onChange}
              className="mt-2 block w-1/3 rounded-lg border border-gray-200 p-3"
            >
              <option>Drone</option>
              <option>Satellite</option>
              <option>Manual</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700">
              Upload NDVI Image
            </label>
            <FileUpload onChange={(f) => setFile(f)} />
          </div>

          <div className="md:col-span-2 text-right">
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-700 text-white px-6 py-3 rounded-lg"
            >
              {saving ? "Saving..." : "Save Farm"}
            </button>
          </div>

          {message && (
            <div className="md:col-span-2 text-sm text-gray-600 mt-2">
              {message}
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
