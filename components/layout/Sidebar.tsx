"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Map, FileText, BarChart3, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { PresenceList } from "@/components/ui/PresenceIndicator";

const navigation = [
  { name: "Fleet", href: "/fleet", icon: LayoutDashboard },
  { name: "Map", href: "/map", icon: Map },
  { name: "Missions", href: "/missions", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Focus trap for mobile sidebar
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    // Store the previously focused element
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // Focus first focusable element in sidebar
    const firstFocusable = sidebar.querySelector(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    firstFocusable?.focus();

    // Handle ESC key
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        previousActiveElementRef.current?.focus();
      }
    };

    // Handle Tab key for focus trap
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = sidebar.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleEsc);
    document.addEventListener("keydown", handleTab);

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.removeEventListener("keydown", handleTab);
      // Restore focus when closing
      if (!mobileMenuOpen) {
        previousActiveElementRef.current?.focus();
      }
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="fixed left-4 top-4 z-50 rounded-md border border-zinc-200 bg-white p-2 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 lg:hidden"
        style={{ top: "max(1rem, env(safe-area-inset-top, 1rem))" }}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm dark:bg-black/70 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 transform border-r border-zinc-200 bg-white transition-transform duration-300 ease-in-out dark:border-zinc-800 dark:bg-zinc-900",
          "lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          // Safe area for mobile status bar
          "pt-[env(safe-area-inset-top,0px)] lg:pt-0"
        )}
        aria-label="Main navigation"
        role="complementary"
      >
        <nav className="flex h-full flex-col p-4 pt-16 lg:pt-4">
          <div className="mb-8 px-2">
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Fleet Overview
            </h1>
          </div>

          <ul className="space-y-1" role="list">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Team presence - bottom of sidebar */}
          <div className="mt-auto border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <PresenceList />
          </div>
        </nav>
      </aside>
    </>
  );
}
