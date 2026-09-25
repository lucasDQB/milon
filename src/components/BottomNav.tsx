"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  {
    href: "/workout/new",
    label: "Log",
    match: (p: string) => p.startsWith("/workout"),
  },
  {
    href: "/history",
    label: "History",
    match: (p: string) => p.startsWith("/history"),
  },
  {
    href: "/profile",
    label: "Profile",
    match: (p: string) => p.startsWith("/profile"),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-10 flex w-full max-w-[430px] -translate-x-1/2 border-t border-line bg-panel/90 px-1.5 backdrop-blur-md"
      style={{
        paddingTop: 10,
        paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-1 text-[10.5px] ${
              active ? "text-accent" : "text-sub"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
