import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Milon",
  description: "Track your gym progress.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto min-h-screen w-full max-w-[430px]">
          {children}
        </div>
      </body>
    </html>
  );
}
