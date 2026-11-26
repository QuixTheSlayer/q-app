import React, { CSSProperties, PropsWithChildren, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { TimeLeft, ViewProps } from "./types";
import "./flipcard.css";

// ── Shared shell ──────────────────────────────────────────────────────────────

export function Card({ children, className = "", style }: PropsWithChildren<{ className?: string; style?: CSSProperties }>) {
    return (
        <div style={style} className={`w-full h-auto bg-transparent rounded-lg px-6 py-7 ${className}`}>
            {children}
        </div>
    );
}

export function EventHeader({ title, description, align = "center" }: { title?: string; description?: string; align?: "center" | "left" }) {
    return (
        <>
            {title && (
                <p
                    style={{ color: "var(--countdown-title)", fontFamily: "Georgia, 'Times New Roman', serif" }}
                    className={`text-[20px] font-bold leading-tight ${align === "center" ? "text-center" : "text-left"} mb-1`}
                >
                    {title}
                </p>
            )}
            {description && (
                <p
                    style={{ color: "var(--countdown-description)" }}
                    className={`text-[13px] leading-relaxed ${align === "center" ? "text-center" : "text-left"} mb-6 opacity-80`}
                >
                    {description}
                </p>
            )}
        </>
    );
}

export function Footer({ footer }: { footer?: string }) {
    if (!footer) return null;
    return (
        <p style={{ color: "var(--countdown-footer)" }} className="text-[12px] text-center mt-5 opacity-70 tracking-wide">
            {footer}
        </p>
    );
}

/** Fallback status label shown before start / after end, standing in for the live units. */
export function StatusLabel({ isEnded, date }: { isEnded: boolean; date: string }) {
    return (
        <label style={{ color: "var(--countdown-secondary)" }} className="flex justify-center text-[13px] items-center w-full py-3">
            {isEnded ? "Event closed." : `Event will start on: ${date}`}
        </label>
    );
}

/**
 * Wraps a variant's live-state markup with the header/footer/status shell so
 * each variant only needs to describe its own countdown display. Also the
 * public shell used by CustomCountDownWrapper (Nodes.tsx) to host arbitrary
 * children, so its props stay a stable, general-purpose contract.
 */
export function CountdownShell({ value, className, align, style, children }: PropsWithChildren<{ value: ViewProps; className?: string; align?: "center" | "left"; style?: CSSProperties }>) {
    const { title, description, footer, date, isStarted, isEnded } = value;
    return (
        <div className="w-full flex justify-center items-center h-full animate-[fadeUp_.2s_ease]">
            <Card className={className} style={style}>
                <EventHeader title={title} description={description || ""} align={align} />
                <div className="w-full flex items-center justify-center gap-2">
                    {isEnded || !isStarted ? <StatusLabel isEnded={isEnded} date={date} /> : children}
                </div>
                <Footer footer={footer} />
            </Card>
        </div>
    );
}

// ── Time unit primitives ──────────────────────────────────────────────────────

export function pad(n: number) {
    return String(n).padStart(2, "0");
}

export interface UnitDef {
    val: number;
    label: string;
    accent?: boolean;
}

export function unitsFromTime(t: TimeLeft, labels: [string, string, string, string] = ["days", "hrs", "min", "sec"]): UnitDef[] {
    return [
        { val: t.d, label: labels[0] },
        { val: t.h, label: labels[1] },
        { val: t.m, label: labels[2] },
        { val: t.s, label: labels[3], accent: true },
    ];
}

/** A crossfading digit — the base building block most variants animate with. */
export function AnimatedDigit({ value, style, className }: { value: number; style?: CSSProperties; className?: string }) {
    return (
        <AnimatePresence mode="wait">
            <motion.span
                key={value}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.18 }}
                style={style}
                className={className}
            >
                {pad(value)}
            </motion.span>
        </AnimatePresence>
    );
}

/** Simple stacked digit+label unit, sized via the size prop. */
export function Unit({ u, size = "md", color, labelColor }: { u: UnitDef; size?: "sm" | "md" | "lg" | "xl"; color?: string; labelColor?: string }) {
    const digitSize = { sm: 22, md: 34, lg: 56, xl: 88 }[size];
    const labelSize = { sm: 9, md: 10, lg: 11, xl: 12 }[size];
    return (
        <div className="flex flex-col items-center gap-1">
            <AnimatedDigit
                value={u.val}
                className="tabular-nums font-bold leading-none"
                style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: digitSize,
                    color: color ?? (u.accent ? "var(--countdown-primary)" : "var(--countdown-basic)"),
                }}
            />
            <span
                style={{ fontSize: labelSize, color: labelColor ?? "var(--countdown-secondary)" }}
                className="uppercase tracking-[0.22em] font-semibold"
            >
                {u.label}
            </span>
        </div>
    );
}

export function UnitSeparator({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) {
    const fontSize = { sm: 16, md: 22, lg: 32, xl: 48 }[size];
    return (
        <span
            style={{ fontSize, color: "var(--countdown-secondary)", opacity: 0.5 }}
            className="pb-4 select-none font-light"
        >
            :
        </span>
    );
}

/** Row of Unit + UnitSeparator, the shape most "digits in a line" variants need. */
export function UnitRow({ units, size = "md", gap = "gap-3", color, labelColor }: { units: UnitDef[]; size?: "sm" | "md" | "lg" | "xl"; gap?: string; color?: string; labelColor?: string }) {
    return (
        <div className={`flex flex-wrap items-baseline justify-center ${gap}`}>
            {units.map((u, i) => (
                <React.Fragment key={u.label}>
                    <Unit u={u} size={size} color={color} labelColor={labelColor} />
                    {i < units.length - 1 && <UnitSeparator size={size} />}
                </React.Fragment>
            ))}
        </div>
    );
}

// ── Flip digit primitive (mechanical flip-clock look) ─────────────────────────

export function FlipDigit({ value, size = 64 }: { value: number; size?: number }) {
    const [current, setCurrent] = useState(value);
    const [previous, setPrevious] = useState(value);
    const [flipping, setFlipping] = useState(false);
    const first = useRef(true);

    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        if (value === current) return;
        setPrevious(current);
        setFlipping(true);
        const timer = setTimeout(() => {
            setCurrent(value);
            setFlipping(false);
        }, 400);
        return () => clearTimeout(timer);
    }, [value]);

    const oldText = pad(previous);
    const newText = pad(current);
    const fontSize = size * 0.42;

    const half = (text: string, position: "top" | "bottom", extraClass = "") => (
        <div
            style={{ backgroundColor: "var(--countdown-secondary)" }}
            className={`absolute ${position === "top" ? "top-0 rounded-t-md items-end" : "bottom-0 rounded-b-md items-start"} h-1/2 w-full flex justify-center overflow-hidden ${extraClass}`}
        >
            <div
                style={{ color: "var(--countdown-primary)", fontSize }}
                className={`flex justify-center h-full absolute font-bold ${position === "top" ? "top-[65%] items-end" : "bottom-[10%] items-start -translate-y-1/2"}`}
            >
                {text}
            </div>
        </div>
    );

    return (
        <div className="relative rounded-md overflow-hidden" style={{ width: size, height: size, perspective: 400 }}>
            {half(flipping ? oldText : newText, "top")}
            {half(flipping ? oldText : newText, "bottom")}
            {flipping && half(oldText, "top", "flip-top")}
            {flipping && half(newText, "bottom", "flip-bottom")}
            <div style={{ backgroundColor: "var(--countdown-primary)" }} className="absolute left-0 z-10 right-0 top-1/2 h-px" />
        </div>
    );
}

export function FlipUnit({ u, size = 64 }: { u: UnitDef; size?: number }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <FlipDigit value={u.val} size={size} />
            <span
                style={{ color: "var(--countdown-secondary)", fontSize: size * 0.14 }}
                className="uppercase tracking-[0.18em] font-medium"
            >
                {u.label}
            </span>
        </div>
    );
}

export function FlipColon({ size = 64 }: { size?: number }) {
    const [on, setOn] = useState(true);
    useEffect(() => {
        const id = setInterval(() => setOn((v) => !v), 500);
        return () => clearInterval(id);
    }, []);
    const dot = Math.max(4, size * 0.08);
    return (
        <div className="flex flex-col gap-2 mb-6 justify-center items-center bg-white/10 rounded-full " style={{ opacity: on ? 1 : 0.15, transition: "opacity 0.2s" }}>
            <div style={{ width: dot, height: dot, borderRadius: "50%", background: "var(--countdown-basic)" }} />
            <div style={{ width: dot, height: dot, borderRadius: "50%", background: "var(--countdown-basic)" }} />
        </div>
    );
}

// ── Progress ring ─────────────────────────────────────────────────────────────

export function ProgressRing({ value, max, size = 100, strokeWidth = 6, color, label }: {
    value: number; max: number; size?: number; strokeWidth?: number; color: string; label: string;
}) {
    const r = (size - strokeWidth * 2) / 2;
    const circ = 2 * Math.PI * r;
    const dash = circ * Math.min(1, value / max);
    const center = size / 2;
    return (
        <div className="text-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={center} cy={center} r={r} fill="none" stroke="rgb(var(--border))" strokeWidth={strokeWidth} />
                <circle
                    cx={center} cy={center} r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`}
                    transform={`rotate(-90 ${center} ${center})`}
                    style={{ transition: "stroke-dasharray .6s ease" }}
                />
                <text x={center} y={center + size * 0.06} textAnchor="middle" fontSize={size * 0.2} fontWeight="600" className="fill-foreground" fontFamily="inherit">
                    {pad(value)}
                </text>
            </svg>
            <div style={{ color: "var(--countdown-secondary)" }} className="text-[11px] uppercase tracking-[.2em] font-semibold mt-2">
                {label}
            </div>
        </div>
    );
}
