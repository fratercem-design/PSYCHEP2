"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ProfileData {
  username: string | null;
  bio: string | null;
  socialLinks: Record<string, string>;
  tier: string;
  psycheBalance: number;
  name: string | null;
}

const SOCIAL_PLATFORMS = [
  "twitter",
  "youtube",
  "twitch",
  "kick",
  "discord",
  "instagram",
  "website",
];

export function ProfileEditForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data: ProfileData) => {
        setUsername(data.username ?? "");
        setBio(data.bio ?? "");
        setSocialLinks(data.socialLinks ?? {});
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile");
        setLoading(false);
      });
  }, []);

  const handleSocialChange = (platform: string, value: string) => {
    setSocialLinks((prev) => {
      const next = { ...prev };
      if (value.trim()) {
        next[platform] = value.trim();
      } else {
        delete next[platform];
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim() || undefined,
          bio: bio.trim() || undefined,
          socialLinks,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to save");
        return;
      }

      setSuccess("Profile updated!");
      // Redirect to profile if username is set
      if (username.trim()) {
        setTimeout(() => {
          router.push(`/profile/${username.trim().toLowerCase()}`);
        }, 1000);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
        Loading your profile...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Username */}
      <div className="bg-card border border-border rounded-lg p-6">
        <label
          htmlFor="username"
          className="block font-heading font-bold text-sm text-foreground uppercase tracking-wider mb-2"
        >
          Username
        </label>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">@</span>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your-username"
            className="flex-1 px-3 py-2 border border-border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            minLength={3}
            maxLength={30}
            pattern="[a-zA-Z0-9_-]+"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          3-30 characters. Letters, numbers, hyphens, and underscores only.
        </p>
      </div>

      {/* Bio */}
      <div className="bg-card border border-border rounded-lg p-6">
        <label
          htmlFor="bio"
          className="block font-heading font-bold text-sm text-foreground uppercase tracking-wider mb-2"
        >
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell The World about yourself..."
          rows={4}
          maxLength={500}
          className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">
          {bio.length}/500
        </p>
      </div>

      {/* Social Links */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider mb-4">
          Social Links
        </h3>
        <div className="space-y-3">
          {SOCIAL_PLATFORMS.map((platform) => (
            <div key={platform} className="flex items-center gap-3">
              <label
                htmlFor={`social-${platform}`}
                className="w-24 text-sm text-muted-foreground capitalize shrink-0"
              >
                {platform}
              </label>
              <input
                type="url"
                id={`social-${platform}`}
                value={socialLinks[platform] ?? ""}
                onChange={(e) => handleSocialChange(platform, e.target.value)}
                placeholder={`https://${platform}.com/...`}
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-primary/10 border border-primary/30 text-primary rounded-lg p-3 text-sm">
          {success}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-heading font-bold uppercase tracking-wider"
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
