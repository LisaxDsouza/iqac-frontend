import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // clear JWT
    navigate("/"); // redirect to login
  };

  return (
    <nav className="bg-blue-900 text-white flex justify-between items-center px-6 py-3">
      <h1 className="text-lg font-bold">IQAC Faculty Portal</h1>
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
      >
        Logout
      </button>
    </nav>
  );
}
