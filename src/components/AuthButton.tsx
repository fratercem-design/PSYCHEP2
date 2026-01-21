"use client";

import { signIn, signOut } from "next-auth/react";

export function AuthButton({
  isLoggedIn,
  className,
}: {
  isLoggedIn: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={() => (isLoggedIn ? signOut() : signIn())}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${className}`}
    >
      {isLoggedIn ? "Sign Out" : "Sign In"}
    </button>
  );
}