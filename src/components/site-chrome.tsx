import { Link } from "@tanstack/react-router";

const nav = [
  { to: "/", label: "Home" },
  { to: "/work", label: "Renovation, Development & Landscaping" },
  { to: "/about", label: "About & Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5">
        <Link to="/" className="group flex items-baseline gap-3">
          <span className="block h-6 w-[3px] bg-primary" aria-hidden="true" />
          <span className="font-display text-lg leading-none tracking-tight">
            Homes by Hines
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/about"
          hash="enquire"
          className="border border-foreground px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors hover:bg-foreground hover:text-background"
        >
          Enquire
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-xl">Homes by Hines</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Renovation, development and landscaping, carried out with the care
            an old house deserves.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>hello@homesbyhines.co.uk</p>
          <p>01234 567 890</p>
          <p className="mt-4 text-xs">
            &copy; {new Date().getFullYear()} Homes by Hines
          </p>
        </div>
      </div>
    </footer>
  );
}
