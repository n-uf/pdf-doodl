"use client";

/**
 * Settings Page
 */

import Link from "next/link";
import React, { useEffect, useState } from "react";

interface Settings {
  theme: "dark" | "light";
  defaultTool: string;
  autoSave: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  defaultTool: "select",
  autoSave: true,
};

const STORAGE_KEY = "doodl-app-settings";

export default function SettingsPage(): React.ReactElement {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Load settings
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSettings(JSON.parse(stored) as Settings);
      } catch {
        // ignore
      }
    }
  }, []);

  // Save settings
  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-mono">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xs tracking-[0.3em] text-amber-400">
            DOODL / SETTINGS
          </h1>
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← BACK
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-xl mx-auto p-6 space-y-6">
        {/* Theme */}
        <section className="border border-zinc-800 p-4">
          <h2 className="text-[10px] text-zinc-500 tracking-wider mb-3">
            APPEARANCE
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-xs">Theme</span>
            <div className="flex gap-2">
              {(["dark", "light"] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => updateSetting("theme", theme)}
                  className={`px-3 py-1 text-[10px] tracking-wider transition-colors ${
                    settings.theme === theme
                      ? "bg-amber-500 text-black"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {theme.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Default Tool */}
        <section className="border border-zinc-800 p-4">
          <h2 className="text-[10px] text-zinc-500 tracking-wider mb-3">
            DEFAULTS
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-xs">Default Tool</span>
            <select
              value={settings.defaultTool}
              onChange={(e) => updateSetting("defaultTool", e.target.value)}
              className="bg-zinc-800 border border-zinc-700 px-3 py-1 text-xs 
                         text-zinc-200 focus:outline-none focus:border-amber-500/50"
            >
              <option value="select">SELECT</option>
              <option value="rect">RECT</option>
              <option value="ellipse">ELLIPSE</option>
              <option value="freehand">DRAW</option>
              <option value="text">TEXT</option>
            </select>
          </div>
        </section>

        {/* Auto Save */}
        <section className="border border-zinc-800 p-4">
          <h2 className="text-[10px] text-zinc-500 tracking-wider mb-3">
            BEHAVIOR
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-xs">Auto-save drawings</span>
            <button
              onClick={() => updateSetting("autoSave", !settings.autoSave)}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                settings.autoSave ? "bg-amber-500" : "bg-zinc-700"
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.autoSave ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </section>

        {/* Info */}
        <div className="text-[10px] text-zinc-600 text-center pt-4">
          DOODL APP v0.0.1
        </div>
      </main>
    </div>
  );
}
