import type { Metadata } from "next";
import "./globals.css";
import "./home-updated.css";
import "./qr-generator-page.css";
import "./barcode-generator-page.css";
export const metadata: Metadata = {title: "QR & Barcode — Generator", description: "Create, Scan, And Manage QR Codes And Barcodes — All In One Place", icons: {icon: "/assets/svg/Group 42404.svg"}};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {return <html lang="en"><body>{children}</body></html>;}
