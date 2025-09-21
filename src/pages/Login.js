import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {   // ✅ use API_URL here
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "Login failed");
        return;
      }

      // ✅ Save JWT token
      localStorage.setItem("token", data.token);

      // ✅ Redirect by role
      if (data.user?.role === "Faculty") {
        navigate("/faculty");
      } else if (data.user?.role === "Coordinator") {
        navigate("/coordinator");
      } else if (data.user?.role === "Admin") {
        navigate("/admin");
      } else {
        navigate("/faculty"); // fallback
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="bg-white shadow-lg rounded-lg p-10 w-96 border border-gray-200">
        {/* Logo from public/ */}
        <div className="flex justify-center mb-6">
          <img src="/christlogo.jpg" alt="University Logo" className="h-16 w-16" />
        </div>

        <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">
          IQAC Portal Login
        </h2>

        {error && (
          <p className="text-red-600 bg-red-100 p-2 rounded mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-900"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-900"
            required
          />
          <button
            type="submit"
            className="bg-blue-900 text-white px-4 py-2 rounded w-full font-semibold hover:bg-blue-800 transition"
          >
            Login
          </button>
        </form>

        <p className="text-gray-600 text-sm mt-6 text-center">
          Don’t have an account?{" "}
          <span
            className="text-blue-900 font-semibold cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}
