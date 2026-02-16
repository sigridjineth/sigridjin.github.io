import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

const navLinks = [
  { href: "/blog", label: "blog" },
  { href: "/til", label: "til" },
  { href: "/links", label: "links" },
  { href: "/about", label: "about" },
];

export function Header() {
  return (
    <header className="flex items-center justify-between py-8">
      <Link href="/" className="text-base font-semibold !bg-none !no-underline hover:!underline">
        sigridjin
      </Link>
      <nav className="flex items-center gap-4">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors !bg-none !no-underline hover:!underline text-xs"
          >
            {link.label}
          </Link>
        ))}
        <ThemeToggle />
      </nav>
    </header>
  );
}
