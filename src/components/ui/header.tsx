"use client";

import Link from "next/link";
import { MenuItems } from "./menuItems";
import { MobileMenu } from "./mobileMenu";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
export interface IMenuItem {
  href: string;
  label: string;
}

export default function Header() {
  const { user, setUser, isLoading } = useAuth();
  const router = useRouter();
  console.log("user", user);
  const [menuItems, setMenuItems] = useState<IMenuItem[]>(() =>
    user
      ? [{ href: "/dashboard", label: "Dashboard" }]
      : [
          { href: "/signup", label: "Sign Up" },
          { href: "/login", label: "Login" },
        ]
  );

  useEffect(() => {
    console.log("user changed setting menu items", user);
    setMenuItems(
      user
        ? [{ href: "/dashboard", label: "Dashboard" }]
        : [
            { href: "/signup", label: "Sign Up" },
            { href: "/login", label: "Login" },
          ]
    );
  }, [user]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-8 flex h-14 items-center justify-between w-full">
        <div className="hidden md:flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">JournalApp</span>
          </Link>
        </div>
        {isLoading ? (
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <div className="w-20 h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-20 h-4 bg-gray-200 animate-pulse rounded"></div>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <MenuItems menuItems={menuItems} />
            {user && (
              <button
                onClick={async () => {
                  try {
                    const response = await fetch("/api/auth/logout", {
                      method: "GET",
                      headers: {
                        "Content-Type": "application/json",
                      },
                    });
                    if (response.ok) {
                      // Redirect or update UI as needed after successful logout
                      setUser(null);
                      router.push("/");
                    } else {
                      console.error("Logout failed");
                    }
                  } catch (error) {
                    console.error("Error during logout:", error);
                  }
                }}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Sign Out
              </button>
            )}
          </nav>
        )}
        <MobileMenu menuItems={menuItems} />
        <div className="flex flex-1 items-center justify-between space-x-2 md:hidden md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {isLoading ? (
              <div className="w-40 h-6 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <h1 className="text-lg font-semibold md:text-xl">
                Placeholder Title
              </h1>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
