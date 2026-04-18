"use client";

import { useLeaves } from "@/context/LeaveContext";
import DownloadReport from "@/components/DownloadReport";
import LeaveCalendar from "@/components/LeaveCalendar";
import StatCard from "@/components/StatCard";
import { useMemo } from "react";

export default function AdminPage() {
  const { leaves } = useLeaves();

  // Requirements #8: Leave Reports and Analytics
  // Calculating system-wide trends and metrics
  const analytics = useMemo(() => {
    const total = leaves.length;
    const approved = leaves.filter((l) => l.status === "Approved").length;
    const pending = leaves.filter((l) => l.status === "Pending").length;
    
    // Pattern Analysis: Which leave types are most common?
    const typeCount = leaves.reduce((acc: any, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      approved,
      pending,
      approvalRate: total > 0 ? ((approved / total) * 100).toFixed(1) : 0,
      mostCommonType: Object.keys(typeCount).reduce((a, b) => typeCount[a] > typeCount[b] ? a : b, "N/A")
    };
  }, [leaves]);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Administrator Control Center</h1>
          <p style={{ color: 'var(--text-muted)' }}>Global Leave Tracking & Policy Compliance</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <DownloadReport data={leaves} title="Global Leave Audit Log" />
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid-3">
        <StatCard 
          title="System Approval Rate" 
          used={analytics.approved} 
          total={analytics.total} 
          colorHex="var(--success)" 
        />
        <StatCard 
          title="Active Pending Requests" 
          used={analytics.pending} 
          total={analytics.total} 
          colorHex="var(--warning)" 
        />
        <StatCard 
          title="Most Requested Type" 
          used={analytics.total > 0 ? 1 : 0} 
          total={1} 
          colorHex="var(--primary)" 
          
        />
      </div>

      <div className="grid-layout" style={{ gridTemplateColumns: '2fr 1fr', marginTop: '2rem' }}>
        {/* Requirement #6 & #8: Comprehensive History & Compliance */}
        <div className="card">
          <h2>Master Leave Records</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l.id}>
                    <td><strong>{l.employee}</strong></td>
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

        {/* Requirement #5: Policy Management Overview */}
        <div className="card">
          <h2>Active Policies</h2>
          <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <strong>Vacation Policy</strong>
              <p style={{ color: 'var(--text-muted)' }}>20 days per annum. Max 5 days carry-over.</p>
            </div>
            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <strong>Medical/Sick Leave</strong>
              <p style={{ color: 'var(--text-muted)' }}>10 days. Documentation required for {'>'} 3 days.</p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Probation Rule</strong>
              <p style={{ color: 'var(--text-muted)' }}>New employees can only access Sick Leave for first 3 months.</p>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.8rem' }}>
              Edit System Policies
            </button>
          </div>
        </div>
      </div>

      {/* Requirement #4: Centralized Leave Calendar */}
      <div style={{ marginTop: '2rem' }}>
        <LeaveCalendar />
      </div>
    </div>
  );
}