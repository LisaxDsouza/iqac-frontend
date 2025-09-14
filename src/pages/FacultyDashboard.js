// src/pages/FacultyDashboard.js
import React, { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState("timetable");

  // Timetable
  const [fileUrl, setFileUrl] = useState(null);
  const [timetableData, setTimetableData] = useState([]);

  // Course Plans
  const [plans, setPlans] = useState([]);
  const [planForm, setPlanForm] = useState({ course: "", topics: "", timeline: "" });

  // Marks
  const [marks, setMarks] = useState([]);
  const [marksForm, setMarksForm] = useState({ studentId: "", course: "", score: "" });

  // Assignments
  const [assignments, setAssignments] = useState([]);
  const [assignmentForm, setAssignmentForm] = useState({ title: "", description: "", deadline: "" });

  const token = localStorage.getItem("token");

  /* -------------------- FETCH HELPERS -------------------- */
  const fetchData = useCallback(async (endpoint, setter) => {
    try {
      const res = await fetch(`http://localhost:3000/api/faculty/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setter(Array.isArray(data) ? data : []); // ✅ safeguard
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
    }
  }, [token]);

  useEffect(() => {
    fetchData("schedules", () => {}); // only to ensure fileUrl refreshes after upload
    fetchData("plans", setPlans);
    fetchData("marks", setMarks);
    fetchData("assignments", setAssignments);
  }, [fetchData]);

  /* -------------------- HELPERS -------------------- */
  // Parse Excel into JSON
  function parseExcel(file, setData) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      setData(json);
    };
    reader.readAsArrayBuffer(file);
  }

  // File upload (Timetable only)
  async function handleExcelUpload(e) {
    e.preventDefault();
    const file = e.target.file.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:3000/api/faculty/upload-schedule", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      setFileUrl(data.fileUrl);

      // ✅ Parse Excel locally
      parseExcel(file, setTimetableData);

      alert("Timetable uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Error uploading timetable");
    }
  }

  // -------------------- COURSE PLANS --------------------
  async function handlePlanSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/faculty/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(planForm),
      });
      const newPlan = await res.json();
      setPlans([...plans, newPlan]);
      setPlanForm({ course: "", topics: "", timeline: "" });
    } catch (err) {
      console.error(err);
    }
  }

  async function deletePlan(id) {
    await fetch(`http://localhost:3000/api/faculty/plans/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setPlans(plans.filter((p) => p._id !== id));
  }

  // -------------------- MARKS --------------------
  async function handleMarksSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/faculty/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(marksForm),
      });
      const newMarks = await res.json();
      setMarks([...marks, newMarks]);
      setMarksForm({ studentId: "", course: "", score: "" });
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteMarks(id) {
    await fetch(`http://localhost:3000/api/faculty/marks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setMarks(marks.filter((m) => m._id !== id));
  }

  // -------------------- ASSIGNMENTS --------------------
  async function handleAssignmentSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/faculty/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(assignmentForm),
      });
      const newAssignment = await res.json();
      setAssignments([...assignments, newAssignment]);
      setAssignmentForm({ title: "", description: "", deadline: "" });
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteAssignment(id) {
    await fetch(`http://localhost:3000/api/faculty/assignments/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setAssignments(assignments.filter((a) => a._id !== id));
  }

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Navbar />

      {/* Tabs */}
      <nav className="flex space-x-4 p-4 bg-blue-100">
        {["timetable", "plans", "marks", "assignments"].map((tab) => (
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
        {/* -------------------- Timetable -------------------- */}
        {activeTab === "timetable" && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-blue-900">Teaching Timetable</h2>
            <form onSubmit={handleExcelUpload} encType="multipart/form-data">
              <input type="file" name="file" accept=".xlsx,.xls,.csv" className="border p-2 w-full mb-2" required />
              <button type="submit" className="bg-blue-900 text-white px-4 py-2 rounded">
                Upload Timetable
              </button>
            </form>

            {timetableData.length > 0 && (
              <table className="border-collapse border border-gray-400 mt-4 w-full">
                <thead>
                  <tr>
                    {Object.keys(timetableData[0]).map((key) => (
                      <th key={key} className="border border-gray-400 px-2 py-1 bg-gray-100">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timetableData.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="border border-gray-400 px-2 py-1">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {fileUrl && (
              <p className="mt-2">
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  Download Original Timetable
                </a>
              </p>
            )}
          </div>
        )}

        {/* -------------------- Course Plans -------------------- */}
        {activeTab === "plans" && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-blue-900">Course Plans</h2>
            <form onSubmit={handlePlanSubmit} className="space-y-2">
              <input
                type="text"
                placeholder="Course Name"
                value={planForm.course}
                onChange={(e) => setPlanForm({ ...planForm, course: e.target.value })}
                className="border p-2 w-full"
                required
              />
              <textarea
                placeholder="Topics"
                value={planForm.topics}
                onChange={(e) => setPlanForm({ ...planForm, topics: e.target.value })}
                className="border p-2 w-full"
                required
              />
              <input
                type="text"
                placeholder="Timeline"
                value={planForm.timeline}
                onChange={(e) => setPlanForm({ ...planForm, timeline: e.target.value })}
                className="border p-2 w-full"
                required
              />
              <button type="submit" className="bg-blue-900 text-white px-4 py-2 rounded">
                Add Plan
              </button>
            </form>

            <ul className="mt-4">
              {plans.map((p) => (
                <li key={p._id} className="border-b py-2 flex justify-between">
                  <span>
                    <strong>{p.course}</strong> - {p.topics} ({p.timeline}) <br />
                    <span className="text-sm">
                      Status:{" "}
                      <span
                        className={
                          p.status === "approved"
                            ? "text-green-600"
                            : p.status === "rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }
                      >
                        {p.status}
                      </span>
                      {p.feedback && <span> | Feedback: {p.feedback}</span>}
                    </span>
                  </span>
                  <button
                    onClick={() => deletePlan(p._id)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* -------------------- Marks -------------------- */}
        {activeTab === "marks" && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-blue-900">Exam Marks</h2>
            <form onSubmit={handleMarksSubmit} className="space-y-2 mb-4">
              <input
                type="text"
                placeholder="Student ID"
                value={marksForm.studentId}
                onChange={(e) => setMarksForm({ ...marksForm, studentId: e.target.value })}
                className="border p-2 w-full"
                required
              />
              <input
                type="text"
                placeholder="Course"
                value={marksForm.course}
                onChange={(e) => setMarksForm({ ...marksForm, course: e.target.value })}
                className="border p-2 w-full"
                required
              />
              <input
                type="number"
                placeholder="Score"
                value={marksForm.score}
                onChange={(e) => setMarksForm({ ...marksForm, score: e.target.value })}
                className="border p-2 w-full"
                required
              />
              <button type="submit" className="bg-blue-900 text-white px-4 py-2 rounded">
                Add Marks
              </button>
            </form>

            <ul className="mt-4">
              {marks.map((m) => (
                <li key={m._id} className="border-b py-2 flex justify-between">
                  <span>
                    {m.studentId ? `${m.studentId} - ${m.course}: ${m.score}` : "Marks File Uploaded"} <br />
                    <span className="text-sm">
                      Status:{" "}
                      <span
                        className={
                          m.status === "approved"
                            ? "text-green-600"
                            : m.status === "rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }
                      >
                        {m.status}
                      </span>
                      {m.feedback && <span> | Feedback: {m.feedback}</span>}
                    </span>
                  </span>
                  <button
                    onClick={() => deleteMarks(m._id)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* -------------------- Assignments -------------------- */}
        {activeTab === "assignments" && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-blue-900">Assignments</h2>
            <form onSubmit={handleAssignmentSubmit} className="space-y-2">
              <input
                type="text"
                placeholder="Title"
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                className="border p-2 w-full"
                required
              />
              <textarea
                placeholder="Description"
                value={assignmentForm.description}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                className="border p-2 w-full"
                required
              />
              <input
                type="date"
                value={assignmentForm.deadline}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, deadline: e.target.value })}
                className="border p-2 w-full"
                required
              />
              <button type="submit" className="bg-blue-900 text-white px-4 py-2 rounded">
                Create Assignment
              </button>
            </form>

            <ul className="mt-4">
              {assignments.map((a) => (
                <li key={a._id} className="border-b py-2 flex justify-between">
                  <span>
                    <strong>{a.title}</strong> - {a.description} (Due: {a.deadline}) <br />
                    <span className="text-sm">
                      Status:{" "}
                      <span
                        className={
                          a.status === "approved"
                            ? "text-green-600"
                            : a.status === "rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }
                      >
                        {a.status}
                      </span>
                      {a.feedback && <span> | Feedback: {a.feedback}</span>}
                    </span>
                  </span>
                  <button
                    onClick={() => deleteAssignment(a._id)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
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
