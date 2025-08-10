'use client'

import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Download,
  Upload,
  Plus,
  Trash2,
  RefreshCw,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  ImagePlus,
  PlusCircle,
} from "lucide-react";

/**
 * INNER Life‑Balance Tracker – v2.2 (mobile‑first)
 * — Mobile: sticky header, FAB add, card‑based habits, larger touch targets
 * — Brand gradient + logo upload, custom sections, auto inner/outer slider
 * — Local‑first (per week), Export/Import JSON, Print to PDF
 */

// Types
export type HabitKind = 'inner' | 'outer'
export type Habit = { id: string; name: string; enabled: boolean; kind: HabitKind }
export type ChecklistItem = { id: string; text: string; done: boolean }
export type ChecklistSection = { id: string; type: 'checklist'; title: string; items: ChecklistItem[] }
export type NotesSection = { id: string; type: 'notes'; title: string; text: string }
export type NumberSection = { id: string; type: 'number'; title: string; value: number }
export type Section = ChecklistSection | NotesSection | NumberSection

// Brand theme inspired by your logo (mint→sky)
const BRAND_FROM = "#C7F36B"; // mint‑green
const BRAND_TO = "#6FD3FF";   // sky‑blue
const BRAND_TEXT = "#0B1220";  // deep ink for contrast

// Defaults
const DEFAULT_HABITS: Habit[] = [
  { id: "upstream", name: "2‑min upstream block (start of day)", enabled: true, kind: "inner" },
  { id: "sleep", name: "Sleep ≥ 7h", enabled: true, kind: "inner" },
  { id: "move", name: "Move 20+ min", enabled: true, kind: "inner" },
  { id: "noscroll", name: "No‑scroll bedtime", enabled: true, kind: "inner" },
  { id: "learn", name: "Learn (10 pages / 20 min)", enabled: true, kind: "inner" },
  { id: "fuel", name: "Fuel/Water (prep or ≥2L)", enabled: true, kind: "inner" },
  { id: "connect", name: "Connect (msg/call someone who matters)", enabled: true, kind: "inner" },
  { id: "screentime", name: "Screen time ≤ target (hrs)", enabled: true, kind: "inner" },
  { id: "publish", name: "Post something public", enabled: false, kind: "outer" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; // Monday‑start

function mondayOfWeek(date: Date | string | number = new Date()) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0=Mon
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}
const formatISO = (d: Date | string | number) => new Date(d).toISOString().slice(0, 10);
function prettyRange(weekStartISO: string) {
  const start = new Date(weekStartISO);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const f = (dt: Date) => dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const y = start.getFullYear();
  const showYear = start.getFullYear() !== end.getFullYear();
  return `${f(start)}${showYear ? ", " + y : ""} – ${f(end)}${showYear ? ", " + end.getFullYear() : ""}`;
}

// Storage
const STORAGE_PREFIX = "inner-tracker-v2.2:";
function useLocalState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return (raw ? (JSON.parse(raw) as T) : initial);
    } catch {
      return initial;
    }
  });
  const [state, setState] = useState(() => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} }, [key, state]);
  return [state, setState];
}
const deepClone = <T,>(o: T): T => JSON.parse(JSON.stringify(o)) as T;

function newWeekState(weekStartISO: string) {
  const habits = deepClone(DEFAULT_HABITS);
  const ticks = Object.fromEntries(habits.map((h) => [h.id, Array(7).fill(false)]));
  return {
    meta: { weekStart: weekStartISO, createdAt: new Date().toISOString(), theme: "", logoDataUrl: "" },
    metrics: { realMetricLabel: "Sleep hours", realMetricValue: "", screenTimeTarget: "2.5", dailyInnerMinutes: Array(7).fill(2), innerShareEstimate: 60 },
    habits,
    ticks,
    sections: [] as Section[],
    oneTime: { whysTopic: "", rootCause: "", vanityFrom: "", realTo: "", seam: "", bridgeAction: "", bridgeWhen: "" },
    wins: ["", "", "", "", ""],
    reflection: { helped: "", overPolish: "", stop: "", cont: "", start: "", nextInnerShare: 60, commitment: "" },
  };
}

export default function App() {
  const [themeDark, setThemeDark] = useLocalState("inner-theme-dark", false);
  const [accentFrom, setAccentFrom] = useLocalState("inner-accent-from", BRAND_FROM);
  const [accentTo, setAccentTo] = useLocalState("inner-accent-to", BRAND_TO);
  const [weekStartISO, setWeekStartISO] = useLocalState("inner-week-start", formatISO(mondayOfWeek()));
  const storageKey = `${STORAGE_PREFIX}${weekStartISO}`;
  const [week, setWeek] = useLocalState(storageKey, newWeekState(weekStartISO));

  useEffect(() => { if (week?.meta?.weekStart !== weekStartISO) setWeek((p) => ({ ...p, meta: { ...p.meta, weekStart: weekStartISO } })); }, [weekStartISO]);
  useEffect(() => { document.documentElement.classList.toggle("dark", !!themeDark); }, [themeDark]);

  const enabledHabits = useMemo(() => week.habits.filter((h) => h.enabled), [week.habits]);
  const ticksCount = useMemo(() => enabledHabits.reduce((sum, h) => sum + week.ticks[h.id].filter(Boolean).length, 0), [enabledHabits, week.ticks]);
  const totalCells = enabledHabits.length * 7;
  const habitScore = totalCells ? Math.round((ticksCount / totalCells) * 100) : 0;

  const innerTicks = useMemo(() => enabledHabits.filter(h => h.kind === "inner").reduce((s,h)=>s+week.ticks[h.id].filter(Boolean).length,0), [enabledHabits, week.ticks]);
  const outerTicks = useMemo(() => enabledHabits.filter(h => h.kind === "outer").reduce((s,h)=>s+week.ticks[h.id].filter(Boolean).length,0), [enabledHabits, week.ticks]);
  const totalTaggedTicks = innerTicks + outerTicks;
  const innerPct = totalTaggedTicks ? Math.round((innerTicks / totalTaggedTicks) * 100) : 0;

  const totalInnerMinutes = week.metrics.dailyInnerMinutes.reduce((a,b)=>a+Number(b||0),0);
  const targetInnerMinutes = 2 * 7;
  const innerProgress = Math.min(100, Math.round((totalInnerMinutes / targetInnerMinutes) * 100));

  function shiftWeek(delta: number) {
    const start = new Date(weekStartISO); start.setDate(start.getDate() + delta * 7);
    const nextISO = formatISO(start); setWeekStartISO(nextISO);
    const existing = localStorage.getItem(`${STORAGE_PREFIX}${nextISO}`);
    if (!existing) setWeek(newWeekState(nextISO));
  }
  function resetWeek(confirmText: boolean = true) { if (!confirmText || confirm("Reset all fields for this week?")) setWeek(newWeekState(weekStartISO)); }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(week, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `inner-${weekStartISO}.json`; a.click(); URL.revokeObjectURL(url);
  }
  function importJSON(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try { const data = JSON.parse(reader.result); if (data?.meta && data?.habits && data?.ticks) setWeek(data); else alert("Invalid file format"); } catch { alert("Could not read file"); }
    };
    reader.readAsText(file);
  }
  const fileRef = useRef(null);
  const logoRef = useRef(null);
  function printPDF() { window.print(); }

  function addHabit() {
    const name = prompt("New habit name"); if (!name) return;
    const id = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 24) + "-" + (Math.random()+"").slice(2,6);
    const h = { id, name, enabled: true, kind: "inner" };
    setWeek((prev) => ({ ...prev, habits: [...prev.habits, h], ticks: { ...prev.ticks, [id]: Array(7).fill(false) } }));
  }
  function removeHabit(id: string) {
    if (!confirm("Remove this habit?")) return;
    setWeek((prev) => { const habits = prev.habits.filter((h) => h.id !== id); const { [id]: _, ...rest } = prev.ticks; return { ...prev, habits, ticks: rest }; });
  }
  function setTick(habitId: string, dayIndex: number, val: boolean) { setWeek((prev) => ({ ...prev, ticks: { ...prev.ticks, [habitId]: prev.ticks[habitId].map((b, i) => (i === dayIndex ? val : b)) } })); }
  function setHabitName(id: string, name: string) { setWeek((prev) => ({ ...prev, habits: prev.habits.map((h) => (h.id === id ? { ...h, name } : h)) })); }
  function setHabitEnabled(id: string, enabled: boolean) { setWeek((prev) => ({ ...prev, habits: prev.habits.map((h) => (h.id === id ? { ...h, enabled } : h)) })); }
  function setHabitKind(id: string, kind: HabitKind) { setWeek((prev) => ({ ...prev, habits: prev.habits.map((h) => (h.id === id ? { ...h, kind } : h)) })); }

  function onLogoFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => setWeek((p) => ({ ...p, meta: { ...p.meta, logoDataUrl: reader.result } }));
    reader.readAsDataURL(file);
  }

  function addSection(type: Section['type']) {
    const title = prompt("Section title") || (type === "checklist" ? "Custom Checklist" : type === "notes" ? "Notes" : "Number");
    const id = `sec-${(Math.random()+"").slice(2,8)}`;
    let section: Section;
    if (type === "checklist") {
      section = { id, type: 'checklist', title, items: [{ id: `i-${(Math.random()+"").slice(2,6)}`, text: "New item", done: false }] };
    } else if (type === "notes") {
      section = { id, type: 'notes', title, text: "" };
    } else {
      section = { id, type: 'number', title, value: 0 };
    }
    setWeek((p) => ({ ...p, sections: [...p.sections, section] }));
  }
  function removeSection(id: string) { if (!confirm("Remove this section?")) return; setWeek((p) => ({ ...p, sections: p.sections.filter((s) => s.id !== id) })); }

  const gradient = { backgroundImage: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` };

  // helpers
  const todayIndex = ((new Date().getDay() + 6) % 7);
  const dayDot = (on) => (<span className={`inline-block h-3 w-3 rounded-full ${on ? "bg-primary" : "bg-muted"}`} />);

  return (
    <div className="min-h-screen bg-background print:bg-white" style={{ backgroundImage: `linear-gradient(135deg, ${accentFrom}33, ${accentTo}33)` }}>
      {/* Sticky mobile header */}
      <div className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/90 border-b print:hidden">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 ring-1 ring-border overflow-hidden flex items-center justify-center" style={gradient}>
              <img src="/inspiring-change-logo.jpeg" alt="logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="text-base md:text-xl font-bold leading-tight" style={{ color: BRAND_TEXT }}>INNER Tracker</h1>
              <div className="text-[11px] text-muted-foreground hidden sm:block">Inner work ≥ 60% beats random bursts.</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setThemeDark((d) => !d)} aria-label="Toggle theme">
              {themeDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl p-4 md:p-8 print:p-0">
        {/* Week controls */}
        <Card className="mb-4">
          <CardContent className="pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => shiftWeek(-1)} className="print:hidden" aria-label="Prev week"><ChevronLeft className="h-5 w-5" /></Button>
              <Badge className="text-sm md:text-base py-1 px-3" >Week: {prettyRange(weekStartISO)}</Badge>
              <Button variant="ghost" size="icon" onClick={() => shiftWeek(1)} className="print:hidden" aria-label="Next week"><ChevronRight className="h-5 w-5" /></Button>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <Button variant="outline" size="sm" onClick={printPDF}><Printer className="h-4 w-4 mr-1" />PDF</Button>
              <Button variant="outline" size="sm" onClick={exportJSON}><Download className="h-4 w-4 mr-1" />Export</Button>
              <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])} />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4 mr-1" />Import</Button>
              <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">Accent
                <input type="color" value={accentFrom} onChange={(e)=>setAccentFrom(e.target.value)} className="h-6 w-6 rounded"/>
                <span>→</span>
                <input type="color" value={accentTo} onChange={(e)=>setAccentTo(e.target.value)} className="h-6 w-6 rounded"/>
              </div>
              <Button variant="secondary" size="sm" onClick={() => resetWeek()}><RefreshCw className="h-4 w-4 mr-1" />Reset</Button>
            </div>
          </CardContent>
        </Card>

        {/* Theme + Scores + Inner/Outer */}
        <div className="grid md:grid-cols-3 gap-4 print:gap-2">
          <Card style={{ borderImage: `linear-gradient(45deg, ${accentFrom}, ${accentTo}) 1` }} className="border-2">
            <CardHeader><CardTitle className="text-base">Weekly Theme</CardTitle></CardHeader>
            <CardContent>
              <Label className="text-xs text-muted-foreground">What inner surface will you strengthen?</Label>
              <Input value={week.meta.theme} onChange={(e) => setWeek({ ...week, meta: { ...week.meta, theme: e.target.value } })} placeholder="e.g., Sleep / Money check‑in / Boundaries" />
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Real metric label</Label>
                  <Input value={week.metrics.realMetricLabel} onChange={(e) => setWeek({ ...week, metrics: { ...week.metrics, realMetricLabel: e.target.value } })} />
                </div>
                <div>
                  <Label className="text-xs">Metric value</Label>
                  <Input value={week.metrics.realMetricValue} onChange={(e) => setWeek({ ...week, metrics: { ...week.metrics, realMetricValue: e.target.value } })} placeholder="e.g., 7.2 (hrs sleep)" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Quick Scores</CardTitle></CardHeader>
            <CardContent>
              <div className="mb-3">
                <div className="flex justify-between text-sm"><span>Habit score</span><span>{habitScore}%</span></div>
                <Progress value={habitScore} />
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm"><span>Inner minutes (vs 14m/wk)</span><span>{innerProgress}%</span></div>
                <Progress value={innerProgress} />
              </div>
              <div className="mb-1 flex items-center justify-between text-sm"><span>Inner share (estimate)</span>
                <Input className="w-24 h-8" type="number" value={week.metrics.innerShareEstimate} onChange={(e) => setWeek({ ...week, metrics: { ...week.metrics, innerShareEstimate: Number(e.target.value) } })} />
              </div>
              <p className="text-xs text-muted-foreground">Target ≥ 60% inner work.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Inner vs Outer (auto)</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm mb-2"><span>Inner: <b>{innerTicks}</b></span><span>Outer: <b>{outerTicks}</b></span><span>Total: <b>{totalTaggedTicks}</b></span></div>
              <div className="w-full h-3 rounded-full overflow-hidden ring-1 ring-border" style={{ background: `linear-gradient(90deg, ${accentFrom} ${innerPct}%, ${accentTo} ${innerPct}%)` }} />
              <div className="mt-3">
                <Label className="text-xs">Inner share (from ticks)</Label>
                <Slider value={[innerPct]} max={100} step={1} disabled className="mt-2" />
                <div className="text-right text-xs text-muted-foreground">{innerPct}% inner</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Habit Grid – desktop table */}
        <Card className="mt-4 hidden md:block">
          <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-base">Daily Habit Grid</CardTitle><div className="flex gap-2 print:hidden"><Button size="sm" variant="outline" onClick={addHabit}><Plus className="h-4 w-4 mr-1" /> Add Habit</Button></div></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left">
                  <tr>
                    <th className="py-2 pr-2 min-w-[220px]">Habit</th>
                    {DAYS.map((d) => (<th key={d} className="py-2 px-2 text-center">{d}</th>))}
                    <th className="py-2 px-2 text-center">Kind</th>
                    <th className="py-2 px-2 text-center">On?</th>
                    <th className="py-2 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {week.habits.map((h) => (
                    <tr key={h.id} className="border-t">
                      <td className="py-2 pr-2 align-top">
                        <Input aria-label={`Habit name ${h.name}`} value={h.name} onChange={(e) => setHabitName(h.id, e.target.value)} />
                        {h.id === "screentime" && (
                          <div className="mt-1 text-xs text-muted-foreground">Target hrs: <Input className="inline-block w-20 h-7 ml-2" value={week.metrics.screenTimeTarget} onChange={(e) => setWeek({ ...week, metrics: { ...week.metrics, screenTimeTarget: e.target.value } })} /></div>
                        )}
                      </td>
                      {DAYS.map((d, i) => (
                        <td key={d} className="py-2 px-2 text-center align-middle">
                          <Checkbox aria-label={`${h.name} ${d}`} checked={!!week.ticks[h.id]?.[i]} onCheckedChange={(v) => setTick(h.id, i, !!v)} />
                        </td>
                      ))}
                      <td className="px-2 text-center align-middle">
                        <Select value={h.kind} onValueChange={(v) => setHabitKind(h.id, v)}>
                          <SelectTrigger className="h-8 w-[112px] mx-auto"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inner">Inner</SelectItem>
                            <SelectItem value="outer">Outer</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="text-center align-middle"><Checkbox aria-label={`${h.name} enabled`} checked={h.enabled} onCheckedChange={(v) => setHabitEnabled(h.id, !!v)} /></td>
                      <td className="text-right w-12 align-middle">
                        {DEFAULT_HABITS.find((d) => d.id === h.id) ? null : (
                          <Button aria-label={`Remove ${h.name}`} variant="ghost" size="icon" onClick={() => removeHabit(h.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="justify-between text-sm text-muted-foreground">
            <div>Ticks: <b>{ticksCount}</b> / {totalCells} • Habit score: <b>{habitScore}%</b></div>
            <div className="flex items-center gap-2">Inner: <b>{innerTicks}</b> • Outer: <b>{outerTicks}</b> • <span className="inline-block h-3 w-16 rounded" style={{ background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})` }} /></div>
          </CardFooter>
        </Card>

        {/* Mobile Habit Cards */}
        <div className="md:hidden space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Habits</h2>
            <Button size="sm" variant="outline" onClick={addHabit}><Plus className="h-4 w-4 mr-1"/>Add</Button>
          </div>
          {week.habits.map((h) => (
            <Card key={h.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-3">
                  <Input className="flex-1" value={h.name} onChange={(e)=>setHabitName(h.id, e.target.value)} />
                  <Checkbox aria-label={`${h.name} enabled`} checked={h.enabled} onCheckedChange={(v)=>setHabitEnabled(h.id, !!v)} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Kind</Label>
                    <Select value={h.kind} onValueChange={(v)=>setHabitKind(h.id,v)}>
                      <SelectTrigger className="h-8 w-[112px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inner">Inner</SelectItem>
                        <SelectItem value="outer">Outer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {DEFAULT_HABITS.find((d)=>d.id===h.id)? null : (
                    <Button variant="ghost" size="icon" onClick={()=>removeHabit(h.id)} aria-label={`Remove ${h.name}`}><Trash2 className="h-4 w-4"/></Button>
                  )}
                </div>
                {h.id === "screentime" && (
                  <div className="mt-2 text-xs text-muted-foreground">Target hrs: <Input className="inline-block w-24 h-7 ml-2" value={week.metrics.screenTimeTarget} onChange={(e) => setWeek({ ...week, metrics: { ...week.metrics, screenTimeTarget: e.target.value } })} /></div>
                )}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {DAYS.map((d,i)=> (
                      <button key={d} aria-label={`${h.name} ${d}`} onClick={()=>setTick(h.id,i,!week.ticks[h.id][i])} className={`h-10 rounded-xl text-xs font-medium border flex items-center justify-center ${week.ticks[h.id][i] ? "bg-primary text-primary-foreground" : "bg-background"}`}>
                        {d.slice(0,2)}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs">Today: {DAYS[todayIndex]} {dayDot(!!week.ticks[h.id][todayIndex])}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Daily Inner Minutes */}
        <Card className="mt-4">
          <CardHeader><CardTitle className="text-base">Daily Inner Minutes</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {DAYS.map((d, i) => (
                <div key={d} className="text-center">
                  <Label className="text-xs block mb-1">{d}</Label>
                  <Input aria-label={`Inner minutes ${d}`} type="number" min={0} className="h-10" value={week.metrics.dailyInnerMinutes[i]} onChange={(e) => {
                    const v = Number(e.target.value ?? 0);
                    const arr = [...week.metrics.dailyInnerMinutes];
                    arr[i] = isNaN(v) ? 0 : v;
                    setWeek({ ...week, metrics: { ...week.metrics, dailyInnerMinutes: arr } });
                  }} />
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Tip: Start with 2 minutes/day. Consistency beats intensity.</p>
          </CardContent>
        </Card>

        {/* Custom Sections */}
        <Card className="mt-4">
          <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-base">Custom Trackers</CardTitle>
            <div className="flex gap-2 print:hidden">
              <Button size="sm" variant="outline" onClick={() => addSection("checklist")}><Plus className="h-4 w-4 mr-1" /> Checklist</Button>
              <Button size="sm" variant="outline" onClick={() => addSection("notes")}><Plus className="h-4 w-4 mr-1" /> Notes</Button>
              <Button size="sm" variant="outline" onClick={() => addSection("number")}><Plus className="h-4 w-4 mr-1" /> Number</Button>
            </div>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            {week.sections.length === 0 && (
              <p className="text-sm text-muted-foreground">Add sections to track anything: hydration, gratitude, side‑project time, finances…</p>
            )}
            {week.sections.map((s) => (
              <Card key={s.id} className="border">
                <CardHeader className="flex-row items-center justify-between">
                  <Input className="font-semibold" value={s.title} onChange={(e)=>setWeek((p)=>({ ...p, sections: p.sections.map(x=>x.id===s.id?{...x, title:e.target.value}:x) }))} />
                  <Button variant="ghost" size="icon" onClick={()=>removeSection(s.id)} aria-label="Remove section"><Trash2 className="h-4 w-4"/></Button>
                </CardHeader>
                <CardContent>
                  {s.type === "checklist" && (
                    <div className="space-y-2">
                      {(s.items||[]).map((it, idx) => (
                        <div key={it.id} className="flex items-center gap-2">
                          <Checkbox checked={!!it.done} onCheckedChange={(v)=>setWeek((p)=>({ ...p, sections: p.sections.map(x=>x.id===s.id?{...x, items: x.items.map((y,i)=> i===idx?{...y, done:!!v}:y)}:x) }))} />
                          <Input value={it.text} onChange={(e)=>setWeek((p)=>({ ...p, sections: p.sections.map(x=>x.id===s.id?{...x, items: x.items.map((y,i)=> i===idx?{...y, text:e.target.value}:y)}:x) }))} />
                        </div>
                      ))}
                      <Button size="sm" variant="outline" onClick={()=>setWeek((p)=>({ ...p, sections: p.sections.map(x=>x.id===s.id?{...x, items:[...x.items, { id:`i-${(Math.random()+"").slice(2,6)}`, text:"New item", done:false }]}:x) }))}><Plus className="h-4 w-4 mr-1"/>Add Item</Button>
                    </div>
                  )}
                  {s.type === "notes" && (
                    <Textarea rows={5} value={s.text||""} onChange={(e)=>setWeek((p)=>({ ...p, sections: p.sections.map(x=>x.id===s.id?{...x, text:e.target.value}:x) }))} placeholder="Write freely…" />
                  )}
                  {s.type === "number" && (
                    <div className="flex items-center gap-3">
                      <Label className="text-sm">Value</Label>
                      <Input type="number" value={s.value||0} onChange={(e)=>setWeek((p)=>({ ...p, sections: p.sections.map(x=>x.id===s.id?{...x, value:Number(e.target.value||0)}:x) }))} className="w-40" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* One‑time Actions */}
        <div className="grid md:grid-cols-3 gap-4 mt-4 print:gap-2">
          <Card><CardHeader><CardTitle className="text-base">5 Whys (this week)</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Label className="text-xs">Topic</Label>
              <Input value={week.oneTime.whysTopic} onChange={(e) => setWeek({ ...week, oneTime: { ...week.oneTime, whysTopic: e.target.value } })} placeholder="What keeps repeating?" />
              <Label className="text-xs">Root cause found</Label>
              <Textarea rows={3} value={week.oneTime.rootCause} onChange={(e) => setWeek({ ...week, oneTime: { ...week.oneTime, rootCause: e.target.value } })} placeholder="Ask ‘why?’ until it hurts." />
            </CardContent>
          </Card>

          <Card><CardHeader><CardTitle className="text-base">Metric Swap</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">From (vanity)</Label>
                <Input value={week.oneTime.vanityFrom} onChange={(e) => setWeek({ ...week, oneTime: { ...week.oneTime, vanityFrom: e.target.value } })} placeholder="e.g., Likes" />
              </div>
              <div>
                <Label className="text-xs">To (real)</Label>
                <Input value={week.oneTime.realTo} onChange={(e) => setWeek({ ...week, oneTime: { ...week.oneTime, realTo: e.target.value } })} placeholder="e.g., Sleep hrs, Steps" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Note</Label>
                <Input value={week.metrics.realMetricLabel} onChange={(e) => setWeek({ ...week, metrics: { ...week.metrics, realMetricLabel: e.target.value } })} placeholder="Label your real metric clearly" />
              </div>
            </CardContent>
          </Card>

          <Card><CardHeader><CardTitle className="text-base">Bridge a Seam</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Label className="text-xs">Interdental seam</Label>
              <Input value={week.oneTime.seam} onChange={(e) => setWeek({ ...week, oneTime: { ...week.oneTime, seam: e.target.value } })} placeholder="e.g., Partner ↔ Money, Home ↔ Work" />
              <Label className="text-xs">Small bridge + when</Label>
              <Input value={week.oneTime.bridgeAction} onChange={(e) => setWeek({ ...week, oneTime: { ...week.oneTime, bridgeAction: e.target.value } })} placeholder="e.g., Sunday money date, 7pm" />
              <Label className="text-xs">Date/Time</Label>
              <Input value={week.oneTime.bridgeWhen} onChange={(e) => setWeek({ ...week, oneTime: { ...week.oneTime, bridgeWhen: e.target.value } })} placeholder="YYYY‑MM‑DD 19:00" />
            </CardContent>
          </Card>
        </div>

        {/* Boring wins & Reflection */}
        <div className="grid md:grid-cols-2 gap-4 mt-4 print:gap-2">
          <Card><CardHeader><CardTitle className="text-base">Boring Wins (they compound)</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {week.wins.map((w, i) => (
                <Input key={i} value={w} onChange={(e) => { const arr = [...week.wins]; arr[i] = e.target.value; setWeek({ ...week, wins: arr }); }} placeholder={`Win ${i + 1}`} />
              ))}
            </CardContent>
          </Card>

          <Card><CardHeader><CardTitle className="text-base">Weekly Reflection</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2">
                <Label className="text-xs">What helped most?</Label>
                <Textarea rows={2} value={week.reflection.helped} onChange={(e) => setWeek({ ...week, reflection: { ...week.reflection, helped: e.target.value } })} />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Where did I over‑polish the front?</Label>
                <Textarea rows={2} value={week.reflection.overPolish} onChange={(e) => setWeek({ ...week, reflection: { ...week.reflection, overPolish: e.target.value } })} />
              </div>
              <div>
                <Label className="text-xs">Stop</Label>
                <Input value={week.reflection.stop} onChange={(e) => setWeek({ ...week, reflection: { ...week.reflection, stop: e.target.value } })} />
              </div>
              <div>
                <Label className="text-xs">Continue</Label>
                <Input value={week.reflection.cont} onChange={(e) => setWeek({ ...week, reflection: { ...week.reflection, cont: e.target.value } })} />
              </div>
              <div>
                <Label className="text-xs">Start</Label>
                <Input value={week.reflection.start} onChange={(e) => setWeek({ ...week, reflection: { ...week.reflection, start: e.target.value } })} />
              </div>
              <div>
                <Label className="text-xs">Inner share next week (%)</Label>
                <Input type="number" value={week.reflection.nextInnerShare} onChange={(e) => setWeek({ ...week, reflection: { ...week.reflection, nextInnerShare: Number(e.target.value) } })} />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">One small commitment</Label>
                <Input value={week.reflection.commitment} onChange={(e) => setWeek({ ...week, reflection: { ...week.reflection, commitment: e.target.value } })} />
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">Tip: Review on Sunday; create a tiny “unlock” for next week.</CardFooter>
          </Card>
        </div>

        {/* Mobile FAB */}
        <div className="fixed bottom-4 right-4 md:hidden print:hidden">
          <Button size="lg" className="rounded-full shadow-lg" onClick={addHabit} aria-label="Add habit">
            <PlusCircle className="h-5 w-5 mr-2"/> Add habit
          </Button>
        </div>
      </div>
    </div>
  );
}