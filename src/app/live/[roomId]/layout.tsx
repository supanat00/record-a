import type { Metadata } from "next";
import "./style.css";

export const metadata: Metadata = {
  title: "Live",
  description: "Live Page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <>
        {children}
      </>
  );
}
