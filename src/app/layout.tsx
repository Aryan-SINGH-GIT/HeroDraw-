import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hero Draw - Golf Score Tracking & Prize Draws",
  description: "Track your golf scores, participate in monthly draws, and support your favorite charities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
