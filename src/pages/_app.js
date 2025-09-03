import "@/styles/globals.css";
import Link from "next/link";

export default function App({ Component, pageProps }) {
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner container">
          <Link href="/" className="brand">School Portal</Link>
          <nav className="menu">
            <Link href="/">Home</Link>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact Us</Link>
          </nav>
        </div>
      </header>
      <main className="app-main container">
        <Component {...pageProps} />
      </main>
    </>
  );
}
