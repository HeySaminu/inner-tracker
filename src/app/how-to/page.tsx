// src/app/how-to/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sun, Moon, ImagePlus, ChevronLeft } from "lucide-react";

// Brand theme (match tracker)
const BRAND_FROM = "#C7F36B"; // mint‑green
const BRAND_TO = "#6FD3FF";   // sky‑blue
const BRAND_TEXT = "#0B1220";  // deep ink for contrast

export default function HowToPage() {
  // Header-only state to mirror tracker header behavior
  const [themeDark, setThemeDark] = useState<boolean>(false);
  const [accentFrom] = useState<string>(BRAND_FROM);
  const [accentTo] = useState<string>(BRAND_TO);
  const [logoDataUrl, setLogoDataUrl] = useState<string>("");
  const logoRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", !!themeDark);
  }, [themeDark]);

  const gradient = { backgroundImage: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` } as const;

  function onLogoFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="min-h-screen bg-background print:bg-white" style={{ backgroundImage: `linear-gradient(135deg, ${accentFrom}33, ${accentTo}33)` }}>
      {/* Sticky mobile header — cloned from tracker */}
      <div className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/90 border-b print:hidden">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl shadow-sm ring-1 ring-border overflow-hidden flex items-center justify-center" style={gradient}>
              {logoDataUrl ? (
                <img src={logoDataUrl} alt="logo" className="h-full w-full object-cover" />
              ) : (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-[10px] font-semibold text-center px-1">Logo</motion.div>
              )}
            </div>
            <div>
              <h1 className="text-base md:text-xl font-bold leading-tight" style={{ color: BRAND_TEXT }}>INNER Tracker</h1>
              <div className="text-[11px] text-muted-foreground hidden sm:block">Inner work ≥ 60% beats random bursts.</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="print:hidden">
              <Button variant="outline" className="cursor-pointer" size="sm" aria-label="Back to app"><ChevronLeft className="h-4 w-4 mr-1"/>Back</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => setThemeDark((d) => !d)} aria-label="Toggle theme">
              {themeDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* How-To content */}
      <main className="mx-auto max-w-3xl mt-10 bg-white rounded-lg p-4 shadow-md md:p-8 print:p-6">
        {/* Header intro */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge>Quick Start</Badge>
            <span className="text-xs text-muted-foreground">2‑minute user guide</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">INNER Tracker — Quick Start</h2>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            A simple, mobile‑first habit + life‑balance tracker. It helps you shift
            <span className="font-semibold"> ≥60% </span>
            of your week to the inner work that actually prevents fires.
          </p>
          <div className="mt-4 flex gap-2 print:hidden">
            <Link href="/">
              <Button variant="outline" size="sm">Open the tracker</Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={() => window.print()}>Print this guide</Button>
          </div>
        </header>

        {/* Sections */}
        <section className="space-y-8 text-sm md:text-base text-muted-foreground">
          <div>
            <h3 className="text-xl font-semibold">1) Start your week</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>The header shows the current week range. Use ◀ / ▶ to move between weeks.</li>
              <li>Your data auto‑saves in your browser (local‑first). No account needed.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold">2) Set your focus</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>In <span className="font-medium">Weekly Theme</span>, type the one thing you’re strengthening (e.g., “Sleep discipline”).</li>
              <li>Add a real metric label/value (e.g., Sleep hours → 7.2).</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold">3) Track daily habits</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><span className="font-medium">Desktop:</span> tick checkboxes in the grid (Mon–Sun).</li>
              <li><span className="font-medium">Mobile:</span> use the habit cards; tap the day buttons to toggle.</li>
              <li>Press <span className="font-medium">Add Habit</span> to create your own. Toggle Kind = Inner/Outer for each habit.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold">4) Watch your balance (auto)</h3>
            <p className="mt-2">The Inner vs Outer bar and % update as you tick habits. Aim for <span className="font-semibold">≥60% inner</span> by the end of the week.</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold">5) Log tiny minutes</h3>
            <p className="mt-2">In <span className="font-medium">Daily Inner Minutes</span>, enter how many minutes of pure “upstream” work you did each day. Start small: <span className="font-semibold">2 minutes/day</span> beats nothing. The progress shows your weekly baseline.</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold">6) Add custom sections</h3>
            <p className="mt-2">Open <span className="font-medium">Custom Trackers</span> → add <span className="font-medium">Checklist</span> / <span className="font-medium">Notes</span> / <span className="font-medium">Number</span> sections to track anything (hydration, reading, savings, gratitude). Rename section titles. Add/remove checklist items.</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold">7) One‑time actions (this week)</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><span className="font-medium">5 Whys:</span> pick a recurring problem and write the root cause.</li>
              <li><span className="font-medium">Metric swap:</span> replace one vanity metric with a real one.</li>
              <li><span className="font-medium">Bridge a seam:</span> plan one small action that improves a handoff (home ↔ work, partner ↔ money, etc.).</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold">8) Review & reflect</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>In <span className="font-medium">Boring Wins</span>, log small improvements (incident ↓, cycle time ↓, no‑scroll bedtime).</li>
              <li>In <span className="font-medium">Weekly Reflection</span>, fill <span className="font-medium">Stop / Continue / Start</span> and set next week’s inner‑share target.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold">Save, share, brand</h3>
            <p className="mt-2">Print / PDF saves a weekly snapshot.</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold">Tips</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Keep habits tiny (5–10 minute wins).</li>
              <li>If a row isn’t useful this week, rename or disable it.</li>
              <li>Use dark mode at night (sun/moon button).</li>
              <li>Stuck? Press Reset to clear the week.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold">Your data</h3>
            <p className="mt-2">Everything is stored locally in your browser (<span className="font-mono">localStorage</span>). Export if you need to switch devices.</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold">Micro‑routine</h3>
            <p className="mt-2">Brush teeth → open the app → tick one inner habit → add 2 minutes. Repeat tomorrow.</p>
          </div>
        </section>

        {/* Footer actions */}
        <footer className="mt-10 flex items-center gap-2 print:hidden">
          <Link href="/">
            <Button size="sm">Open the tracker</Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => window.print()}>Print / PDF</Button>
        </footer>
      </main>
    </div>
  );
}
