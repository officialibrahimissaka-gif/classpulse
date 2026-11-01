import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "ClassPulse · Placement operations",
  description: "Coordinate accepted placements through the first day.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
