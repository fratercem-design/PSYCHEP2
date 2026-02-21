"use client";

import { signIn, signOut } from "next-auth/react";
import Link from "next/link";

export function AuthButton({
  isLoggedIn,
  userName,
  username,
  className,
}: {
  isLoggedIn: boolean;
  userName?: string | null;
  username?: string | null;
  className?: string;
}) {
  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        {username ? (
          <Link
            href={`/profile/${username}`}
            className="text-xs text-muted-foreground hover:text-primary transition-colors hidden sm:inline"
          >
            {userName ?? `@${username}`}
          </Link>
        ) : (
          <Link
            href="/profile/edit"
            className="text-xs text-primary hover:text-foreground transition-colors hidden sm:inline"
          >
            Set up profile
          </Link>
        )}
        <button
          onClick={() => signOut()}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${className}`}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${className}`}
    >
      Sign In
    </button>
  );
}
