import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// This points to your db.json file
const dbPath = path.join(process.cwd(), "db.json");

export async function POST(req: Request) {
  try {
    // 1. Get the data the user typed into the login form
    const { email, password, role } = await req.json();

    // 2. Read the db.json file
    if (!fs.existsSync(dbPath)) {
       return NextResponse.json({ message: "Database file not found. Please register first." }, { status: 500 });
    }
    
    const fileData = fs.readFileSync(dbPath, "utf-8");
    const db = JSON.parse(fileData || "{}");
    const users: any[] = db.users || [];

    // 3. Look for a user where EVERYTHING matches (email, password, AND role)
    const user = users.find((u: any) => 
      u.email === email && 
      u.password === password && 
      u.role === role
    );

    // 4. Send back the result
    if (user) {
      return NextResponse.json({ success: true, user });
    } else {
      return NextResponse.json({ message: "Invalid email, password, or role choice." }, { status: 401 });
    }
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Login failed on the server." }, { status: 500 });
  }
}