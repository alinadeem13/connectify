import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/navbar/NavBar";

export const metadata: Metadata = {
  title: "Connectify",
  description: "A cloud-native social photo sharing app.",
  icons: {
    icon: "/assets/connectify.png",
    shortcut: "/assets/connectify.png",
    apple: "/assets/connectify.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-[calc(100dvh-4rem)] overflow-x-hidden">{children}</main>
        <ToastContainer />
      </body>
    </html>
  );
}
