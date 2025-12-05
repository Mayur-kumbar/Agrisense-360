// src/pages/Auth/Signup.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { AUTH } from "../../services/endpoints";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

export default function Signup(){
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("farmer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const navigate = useNavigate();

  function validate() {
    if (!email) return "Email is required.";
    // simple email regex
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email.";
    if (!password || password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirm) return "Passwords do not match.";
    return null;
  }

  async function handleSubmit(e){
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const v = validate();
    if (v) { setError(v); return; }

    setLoading(true);
    try {
      // POST /api/v1/auth/register
      await api.post(AUTH.REGISTER, { name, email, password });

      // show message and go to login after short delay
      setSuccessMsg("Account created. Redirecting to login...");
      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Signup failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">Create an account</h2>

        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
        {successMsg && <div className="text-sm text-green-600 mb-3">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="user@example.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <Input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Repeat password" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input type="radio" name="role" value="farmer" checked={role==="farmer"} onChange={()=>setRole("farmer")} />
                <span>Farmer</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="role" value="admin" checked={role==="admin"} onChange={()=>setRole("admin")} />
                <span>Admin</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-emerald-700 text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Creating..." : "Create account"}
          </button>

          <div className="text-sm text-center mt-3">
            Already have an account? <Link to="/login" className="text-emerald-700 font-semibold">Sign in</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
