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

// PATCH /api/leaves/[id] — update leave status
export async function PATCH(
  req: Request,
  ctx: RouteContext<"/api/leaves/[id]">
) {
  try {
    const { status } = await req.json();
    const { id: rawId } = await ctx.params;
    const id = Number(rawId);

    const db = readDb();
    const leaves: any[] = db.leaves || [];
    const idx = leaves.findIndex((l: any) => l.id === id);

    if (idx === -1) {
      return NextResponse.json({ message: "Leave not found" }, { status: 404 });
    }

    leaves[idx] = { ...leaves[idx], status };
    db.leaves = leaves;
    writeDb(db);

    return NextResponse.json(leaves[idx]);
  } catch (error) {
    console.error("PATCH /api/leaves/[id] error:", error);
    return NextResponse.json({ message: "Failed to update leave" }, { status: 500 });
  }
}
