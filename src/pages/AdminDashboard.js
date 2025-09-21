// src/pages/AdminDashboard.js
import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// 🔥 fixed port: 3000 → 5000 (backend in local dev)
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");

  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]); // ✅ always an array
  const [reports, setReports] = useState([]);

  const token = localStorage.getItem("token");

  /* ---------------- FETCH HELPERS ---------------- */
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch users error:", err);
      setUsers([]);
    }
  }, [token]);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubmissions(Array.isArray(data) ? data : []); // ✅ guard
    } catch (err) {
      console.error("Fetch submissions error:", err);
      setSubmissions([]);
    }
  }, [token]);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch reports error:", err);
      setReports([]);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
    fetchSubmissions();
    fetchReports();
  }, [fetchUsers, fetchSubmissions, fetchReports]);

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Navbar />

      {/* Tabs */}
      <nav className="flex space-x-4 p-4 bg-blue-100">
        {["users", "submissions", "reports"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${
              activeTab === tab
                ? "bg-blue-900 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      <main className="flex-grow p-6">
        {/* ---------------- USERS ---------------- */}
        {activeTab === "users" && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-blue-900">
              User Management
            </h2>
            {users && users.length > 0 ? (
              <ul className="space-y-2">
                {users.map((u) => (
                  <li key={u._id} className="border p-2 rounded">
                    <strong>{u.name}</strong> ({u.email}) - {u.role}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No users found.</p>
            )}
          </div>
        )}

        {/* ---------------- SUBMISSIONS ---------------- */}
        {activeTab === "submissions" && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-blue-900">
              All Submissions
            </h2>
            {submissions && submissions.length > 0 ? (
              <ul className="space-y-2">
                {submissions.map((s) => (
                  <li key={s._id} className="border p-2 rounded">
                    <strong>{s.type}</strong> |{" "}
                    {s.facultyId?.name || "Unknown Faculty"} (
                    {s.facultyId?.email || "No Email"})
                    <br />
                    Status: <span className="text-blue-600">{s.status}</span>
                    {s.feedback && <span> | Feedback: {s.feedback}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No submissions found.</p>
            )}
          </div>
        )}

        {/* ---------------- REPORTS ---------------- */}
        {activeTab === "reports" && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-blue-900">Reports</h2>
            {reports && reports.length > 0 ? (
              <ul className="space-y-2">
                {reports.map((r, i) => (
                  <li key={i} className="border p-2 rounded">
                    <strong>{r.title}</strong>
                    <p>{r.content}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No reports available.</p>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
