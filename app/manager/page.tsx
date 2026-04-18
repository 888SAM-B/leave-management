"use client";

import { useLeaves } from "@/context/LeaveContext";
import DownloadReport from "@/components/DownloadReport";
import LeaveCalendar from "@/components/LeaveCalendar";
import StatCard from "@/components/StatCard";
import { useMemo } from "react";

export default function ManagerPage() {
  const { leaves, updateStatus } = useLeaves();

  // Memoized stats for the manager's overview
  const stats = useMemo(() => {
    const pending = leaves.filter((l) => l.status === "Pending");
    const approved = leaves.filter((l) => l.status === "Approved");
    return {
      pendingCount: pending.length,
      approvedCount: approved.length,
      totalRequests: leaves.length,
    };
  }, [leaves]);

  return (
    <div className="container">
      {/* Header with Download Action */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Manager Dashboard</h1>
        <DownloadReport data={leaves} title="Team Leave Summary Report" />
      </div>

      {/* Quick Stats Summary */}
      <div className="grid-3">
        <StatCard title="Pending Approvals" used={stats.pendingCount} total={stats.totalRequests} colorHex="var(--warning)" />
        <StatCard title="Approved This Year" used={stats.approvedCount} total={stats.totalRequests} colorHex="var(--success)" />
        <StatCard title="Total Requests" used={stats.totalRequests} total={stats.totalRequests} colorHex="var(--primary)" />
      </div>

      {/* Leave Approval Table */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2>Pending Approval Inbox</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Actions / Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l.id}>
                  <td><strong>{l.employee}</strong></td>
                  <td>{l.type}</td>
                  <td>{l.startDate} to {l.endDate}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{l.reason}</td>
                  <td>
                    {l.status === "Pending" ? (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button 
                          onClick={() => updateStatus(l.id, "Approved")} 
                          className="btn-success"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => updateStatus(l.id, "Rejected")} 
                          className="btn-danger"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className={`badge badge-${l.status.toLowerCase()}`}>
                        {l.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Hover Calendar */}
      <LeaveCalendar />
    </div>
  );
}