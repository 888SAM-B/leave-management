"use client";

import { useLeaves } from "@/context/LeaveContext";
import { useAuth } from "@/context/AuthContext";
import StatCard from "@/components/StatCard";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function EmployeePage() {
  const { leaves, addLeave } = useLeaves();
  const { user } = useAuth();
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const LEAVE_LIMITS = {
    "Vacation": 20,
    "Sick Leave": 10,
    "Personal": 5,
  };

  const [form, setForm] = useState({
    type: "Vacation",
    startDate: "",
    endDate: "",
    reason: "",
  });

  // Helper: Identifies if a date string is a Sunday
  const isSunday = (dateString: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date.getUTCDay() === 0; 
  };

  // Helper: Counts only Mon-Sat between two dates
  const countWorkingDays = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 0;
    let count = 0;
    const cur = new Date(startStr);
    const end = new Date(endStr);

    while (cur <= end) {
      if (cur.getUTCDay() !== 0) {
        count++;
      }
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return count;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: "startDate" | "endDate") => {
    const value = e.target.value;
    if (isSunday(value)) {
      alert("Sundays are non-working days and cannot be selected as a start or end date.");
      setForm({ ...form, [field]: "" });
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  useEffect(() => {
    if (!user || user.role !== "EMPLOYEE") {
      router.push("/login");
    }
  }, [user, router]);

  const stats = useMemo(() => {
    const userLeaves = leaves.filter(
      (l) => l.employee.includes(user?.name || "") && l.status === "Approved"
    );

    const calculateUsedDays = (type: string) => {
      return userLeaves
        .filter((l) => l.type === type)
        .reduce((acc, curr) => {
          return acc + countWorkingDays(curr.startDate, curr.endDate);
        }, 0);
    };

    return {
      vacationUsed: calculateUsedDays("Vacation"),
      sickUsed: calculateUsedDays("Sick Leave"),
      personalUsed: calculateUsedDays("Personal"),
    };
  }, [leaves, user]);

  if (!user || user.role !== "EMPLOYEE") return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Basic Date Order Check
    if (new Date(form.endDate) < new Date(form.startDate)) {
      alert("End date cannot be earlier than start date!");
      return;
    }

    // 2. Strict Sunday Check
    if (isSunday(form.startDate) || isSunday(form.endDate)) {
      alert("Your leave period cannot start or end on a Sunday. Please adjust your dates.");
      return;
    }

    // 3. Working Days Calculation
    const requestedDays = countWorkingDays(form.startDate, form.endDate);
    const limit = LEAVE_LIMITS[form.type as keyof typeof LEAVE_LIMITS];

    // 4. Policy Limit Check
    if (requestedDays > limit) {
      alert(`Please contact your manager for leave due to company privacy and policy. Your request of ${requestedDays} working days exceeds the ${limit}-day limit for ${form.type}.`);
      return;
    }

    // --- CORRECTED ADDLEAVE CALL ---
    // status and id are removed here because context/addLeave generates them automatically
    addLeave({
      ...form,
      employee: `${user.name}`,
    });

    alert("Leave Request Submitted!");
    setForm({ type: "Vacation", startDate: "", endDate: "", reason: "" });
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: "2rem" }}>My Dashboard</h1>

      <div className="grid-3">
        <StatCard title="Vacation" used={stats.vacationUsed} total={LEAVE_LIMITS.Vacation} colorHex="var(--primary)" />
        <StatCard title="Sick Leave" used={stats.sickUsed} total={LEAVE_LIMITS["Sick Leave"]} colorHex="var(--danger)" />
        <StatCard title="Personal" used={stats.personalUsed} total={LEAVE_LIMITS.Personal} colorHex="var(--success)" />
      </div>

      <div className="grid-layout">
        <div className="card">
          <h2>Request Leave</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Leave Type</label>
              <select
                className="form-control"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="Vacation">Vacation</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                required
                min={today}
                className="form-control"
                value={form.startDate}
                onChange={(e) => handleDateChange(e, "startDate")}
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                required
                min={form.startDate || today}
                className="form-control"
                value={form.endDate}
                onChange={(e) => handleDateChange(e, "endDate")}
              />
            </div>

            <div className="form-group">
              <label>Reason</label>
              <textarea
                required
                className="form-control"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Submit Application
            </button>
          </form>
        </div>

        <div className="card">
          <h2>My Leave History</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves
                  .filter((l) => l.employee.includes(user.name))
                  .map((l) => (
                    <tr key={l.id}>
                      <td>{l.type}</td>
                      <td>{l.startDate} to {l.endDate}</td>
                      <td>
                        <span className={`badge badge-${l.status.toLowerCase()}`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}