// src/pages/CoordinatorDashboard.js
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// 🔥 fixed port: 3000 → 5000 (backend in local dev)
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function CoordinatorDashboard() {
  const [activeTab, setActiveTab] = useState("plans");

  const [plans, setPlans] = useState([]);
  const [marks, setMarks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [timetables, setTimetables] = useState([]);

  const token = localStorage.getItem("token");

  // ✅ Fetch all submissions on load
  useEffect(() => {
    async function fetchData() {
      try {
        const [plansRes, marksRes, assignmentsRes, timetablesRes] = await Promise.all([
          fetch(`${API_URL}/api/coordinator/plans`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/coordinator/marks`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/coordinator/assignments`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/coordinator/schedules`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        // ✅ Normalize responses to arrays
        const plansData = await plansRes.json();
        const marksData = await marksRes.json();
        const assignmentsData = await assignmentsRes.json();
        const timetablesData = await timetablesRes.json();

        setPlans(Array.isArray(plansData) ? plansData : []);
        setMarks(Array.isArray(marksData) ? marksData : []);
        setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
        setTimetables(Array.isArray(timetablesData) ? timetablesData : []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }

    fetchData();
  }, [token]);

  // ✅ Handle review (approve/reject with feedback)
  async function handleReview(type, id, status, feedback = "") {
    try {
      const res = await fetch(`${API_URL}/api/coordinator/review/${type}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, feedback }),
      });

      const updated = await res.json();

      // ✅ Update local state safely
      if (type === "plan") setPlans((prev) => prev.map((p) => (p._id === id ? updated : p)));
      if (type === "marks") setMarks((prev) => prev.map((m) => (m._id === id ? updated : m)));
      if (type === "assignment") setAssignments((prev) => prev.map((a) => (a._id === id ? updated : a)));
      if (type === "schedule") setTimetables((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch (err) {
      console.error("Review error:", err);
    }
  }

  // ✅ Review actions component
  function ReviewActions({ type, item }) {
    const [feedback, setFeedback] = useState("");

    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleReview(type, item._id, "approved")}
          className="bg-green-600 text-white px-2 py-1 rounded text-sm"
        >
          Approve
        </button>
        <button
          onClick={() => handleReview(type, item._id, "rejected", feedback)}
          className="bg-red-600 text-white px-2 py-1 rounded text-sm"
        >
          Reject
        </button>
        <input
          type="text"
          placeholder="Feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="border p-1 text-sm"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Navbar />

      {/* Tabs */}
      <nav className="flex space-x-4 p-4 bg-blue-100">
        {["plans", "marks", "assignments", "timetables"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? "bg-blue-900 text-white" : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      <main className="flex-grow p-6">
        {/* -------------------- PLANS -------------------- */}
        {activeTab === "plans" && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-blue-900">Course Plans</h2>
            <ul className="space-y-2">
              {plans.map((p) => (
                <li key={p._id} className="border p-2 rounded flex justify-between items-center">
                  <span>
                    <strong>{p.course}</strong> - {p.topics} ({p.timeline})
                    <span className="ml-2 text-sm text-gray-600">[{p.status}]</span>
                    {p.feedback && <span className="ml-2 text-sm text-red-600">Feedback: {p.feedback}</span>}
                  </span>
                  <ReviewActions type="plan" item={p} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* -------------------- MARKS -------------------- */}
        {activeTab === "marks" && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-blue-900">Marks</h2>
            <ul className="space-y-2">
              {marks.map((m) => (
                <li key={m._id} className="border p-2 rounded flex justify-between items-center">
                  <span>
                    {m.studentId} - {m.course}: {m.score}
                    <span className="ml-2 text-sm text-gray-600">[{m.status}]</span>
                    {m.feedback && <span className="ml-2 text-sm text-red-600">Feedback: {m.feedback}</span>}
                  </span>
                  <ReviewActions type="marks" item={m} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* -------------------- ASSIGNMENTS -------------------- */}
        {activeTab === "assignments" && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-blue-900">Assignments</h2>
            <ul className="space-y-2">
              {assignments.map((a) => (
                <li key={a._id} className="border p-2 rounded flex justify-between items-center">
                  <span>
                    <strong>{a.title}</strong> - {a.description} (Due: {a.deadline})
                    <span className="ml-2 text-sm text-gray-600">[{a.status}]</span>
                    {a.feedback && <span className="ml-2 text-sm text-red-600">Feedback: {a.feedback}</span>}
                  </span>
                  <ReviewActions type="assignment" item={a} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* -------------------- TIMETABLES -------------------- */}
        {activeTab === "timetables" && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-blue-900">Teaching Timetables</h2>
            <ul className="space-y-2">
              {timetables.map((t) => (
                <li key={t._id} className="border p-2 rounded flex justify-between items-center">
                  <span>
                    <a href={t.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      View Timetable
                    </a>
                    <span className="ml-2 text-sm text-gray-600">[{t.status}]</span>
                    {t.feedback && <span className="ml-2 text-sm text-red-600">Feedback: {t.feedback}</span>}
                  </span>
                  <ReviewActions type="schedule" item={t} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
