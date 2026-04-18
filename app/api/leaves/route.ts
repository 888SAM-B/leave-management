import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "db.json");

function readDb() {
  if (!fs.existsSync(dbPath)) {
    return { users: [], leaves: [] };
  }
  const raw = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(raw || "{}");
}

function writeDb(db: object) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// GET /api/leaves — return all leave requests
export async function GET() {
  try {
    const db = readDb();
    return NextResponse.json(db.leaves || []);
  } catch (error) {
    console.error("GET /api/leaves error:", error);
    return NextResponse.json({ message: "Failed to fetch leaves" }, { status: 500 });
  }
}

// POST /api/leaves — add a new leave request
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = readDb();
    const leaves: any[] = db.leaves || [];

    const newLeave = {
      id: Date.now(),
      ...body,
      status: "Pending",
    };

    leaves.push(newLeave);
    db.leaves = leaves;
    writeDb(db);

    return NextResponse.json(newLeave, { status: 201 });
  } catch (error) {
    console.error("POST /api/leaves error:", error);
    return NextResponse.json({ message: "Failed to add leave" }, { status: 500 });
  }
}
