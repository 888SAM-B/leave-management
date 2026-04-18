// src/app/layout.tsx
import { AuthProvider } from "@/context/AuthContext";
import { LeaveProvider } from "@/context/LeaveContext";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata = { title: "Leave Management System" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LeaveProvider>
            <Navbar />
            <main className="container">
              {children}
            </main>
          </LeaveProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
// ENSURE THERE IS NOTHING BELOW THIS LINE