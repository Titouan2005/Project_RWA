import Link from "next/link";
import "./globals.css";

export const metadata = { title: "Laptop Manager" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        <nav className="bottomNav">
          <Link href="/">Home</Link>
          <Link href="/products">Products</Link>
          <Link href="/products/new">Add</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </body>
    </html>
  );
}
