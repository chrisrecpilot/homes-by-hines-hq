import { Link } from "@tanstack/react-router";
import logoMark from "@/assets/logo-mark.png";

const nav = [
  { to: "/", label: "Home" },
  { to: "/work", label: "Renovation, Development & Landscaping" },
  { to: "/about", label: "About & Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 lg:flex lg:h-20 lg:justify-between lg:px-8">
        <Link to="/" className="group flex min-w-0 items-center gap-3">
          <img
            src={logoMark}
            alt="Homes by Hines logo"
            width={1024}
            height={1024}
            loading="lazy"
            className="h-8 w-8 shrink-0 lg:h-10 lg:w-10"
          />
          <span className="truncate font-display text-lg leading-none">Homes by Hines</span>
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
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
          className="shrink-0 border border-foreground px-4 py-2 text-xs uppercase transition-colors hover:bg-foreground hover:text-background"
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
          <div className="flex items-center gap-2.5">
            <img
              src={logoMark}
              alt=""
              width={1024}
              height={1024}
              loading="lazy"
              className="h-7 w-7"
            />
            <p className="font-display text-xl">Homes by Hines</p>
          </div>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            End-to-end planning and project management for renovation, development and landscaping.
            Architects, builders, council and building control — all handled.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>hello@homesbyhines.co.uk</p>
          <p>01234 567 890</p>
          <p className="mt-4 text-xs">&copy; {new Date().getFullYear()} Homes by Hines</p>
        </div>
      </div>
    </footer>
  );
}
