import { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";

const pressStart = Press_Start_2P({
  weight: "400",
  variable: "--font-pixel-heading",
  subsets: ["latin"],
});

const vt323 = VT323({
  weight: "400",
  variable: "--font-pixel-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Synapse - Medical Research Terminal",
  description: "High-fidelity professional evidence synthesis and biomedical terminal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pressStart.variable} ${vt323.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
