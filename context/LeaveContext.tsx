"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type LeaveRequest = {
  id: string; // MockAPI uses string id
  employee: string;
  type: string;
  startDate: string;
  endDate: string;
  status: "Pending" | "Approved" | "Rejected";
  reason: string;
};

interface LeaveContextType {
  leaves: LeaveRequest[];
  addLeave: (leave: Omit<LeaveRequest, "id" | "status">) => Promise<void>;
  updateStatus: (id: string, status: "Approved" | "Rejected") => Promise<void>;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function LeaveProvider({ children }: { children: ReactNode }) {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  // ---------- FETCH LEAVES ----------
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await fetch(`${BASE_URL}/leaves`);
        if (!res.ok) throw new Error("Failed to fetch leaves");

        const data = await res.json();
        setLeaves(data);
      } catch (err) {
        console.error("Failed to fetch leaves:", err);
      }
    };

    fetchLeaves();
  }, []);

  // ---------- ADD LEAVE ----------
  const addLeave = async (newLeave: Omit<LeaveRequest, "id" | "status">) => {
    try {
      const res = await fetch(`${BASE_URL}/leaves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newLeave,
          status: "Pending", // default status
        }),
      });

      if (!res.ok) throw new Error("Failed to add leave");

      const savedLeave = await res.json();
      setLeaves((prev) => [...prev, savedLeave]);
    } catch (err) {
      console.error(err);
      alert("Error submitting leave request");
    }
  };

  // ---------- UPDATE STATUS ----------
  const updateStatus = async (id: string, status: "Approved" | "Rejected") => {
    try {
      const res = await fetch(`${BASE_URL}/leaves/${id}`, {
        method: "PUT", // MockAPI prefers PUT
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setLeaves((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status } : l))
      );
    } catch (err) {
      console.error(err);
      alert("Error updating leave status");
    }
  };

  return (
    <LeaveContext.Provider value={{ leaves, addLeave, updateStatus }}>
      {children}
    </LeaveContext.Provider>
  );
}

// ---------- HOOK ----------
export const useLeaves = () => {
  const context = useContext(LeaveContext);
  if (!context) throw new Error("useLeaves must be used within Provider");
  return context;
};
