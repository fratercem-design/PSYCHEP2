import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ProfileEditForm } from "./ProfileEditForm";

export const metadata: Metadata = {
  title: "Edit Profile",
};

export default async function ProfileEditPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/profile/edit");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
        Edit Your Profile
      </h1>
      <p className="text-muted-foreground mb-8">
        Set your username, bio, and social links. Your profile is visible to all
        members of The World.
      </p>

      <ProfileEditForm />
    </div>
  );
}
