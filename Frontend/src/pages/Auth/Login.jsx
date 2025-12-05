import React, { useState } from "react";
import api from "../../services/api";
import { AUTH } from "../../services/endpoints";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

export default function Login(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("farmer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e){
    e.preventDefault();
    setLoading(true);
    setError(null);
    try{
      const res = await api.post(AUTH.LOGIN, { email, password, role });
      const { token, user } = res.data;
      console.log("Login successful:", res);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      // redirect to dashboard (register farm page)
      window.location.href = "/register-farm";
    }catch(err){
      setError(err?.response?.data?.message || "Login failed");
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <img src="/src/assets/logo.svg" alt="logo" className="mx-auto h-12 mb-2" />
          <h1 className="text-3xl font-extrabold">AgriSense 360</h1>
          <p className="text-sm text-gray-500 mt-1">Smart Crop Health & Weather Intelligence</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-gray-700">Email</label>
          <Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="user@example.com" />

          <label className="block text-sm font-semibold text-gray-700 mt-4">Password</label>
          <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="********" />

          <div className="mt-4">
            <div className="text-sm font-semibold text-gray-700">Role</div>
            <label className="inline-flex items-center mr-4 mt-2">
              <input type="radio" className="mr-2" name="role" value="farmer" checked={role==='farmer'} onChange={()=>setRole('farmer')} />
              Farmer
            </label>
            <label className="inline-flex items-center mt-2">
              <input type="radio" className="mr-2" name="role" value="admin" checked={role==='admin'} onChange={()=>setRole('admin')} />
              Admin
            </label>
          </div>

          {error && <div className="text-sm text-red-600 mt-3">{error}</div>}

          <button disabled={loading} type="submit" className="mt-6 w-full bg-emerald-700 text-white py-3 rounded-lg font-semibold">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </Card>
    </div>
  );
}
