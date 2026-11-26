import React, { useEffect, useRef, useState } from "react";
import type { TimeLeft, ViewProps } from "./types";
import {
    Card,
    CountdownShell,
    EventHeader,
    Footer,
    FlipColon,
    FlipUnit,
    ProgressRing,
    Unit,
    UnitRow,
    UnitSeparator,
    pad,
    unitsFromTime,
} from "./primitives";

export type { TimeLeft, ViewProps };
/** Public shell also used directly by CustomCountDownWrapper (Nodes.tsx) — keep its contract stable. */
export const CardWrapper = CountdownShell;

// ── View: Bold Blocks — oversized digits, minimal chrome ──────────────────────

export function BoldBlocks({ t, title, date, isStarted, isEnded, description, footer }: ViewProps) {
    return (
        <CountdownShell value={{ t, title, date, isStarted, isEnded, description, footer }}>
            <div className="flex flex-col items-center gap-2 w-full">
                <div
                    className="h-[3px] w-full  rounded-full"
                    style={{ background: "linear-gradient(90deg,  transparent,var(--countdown-primary))" }}
                />
                <UnitRow units={unitsFromTime(t, ["days", "hrs", "min", "sec"])} size="xl" gap="gap-5" />
                <div
                    className="h-[3px] w-full  rounded-full"
                    style={{ background: "linear-gradient(90deg, var(--countdown-primary), transparent)" }}
                />
            </div>
        </CountdownShell>
    );
}

// ── View: Ring Arc — four progress rings ──────────────────────────────────────

export function RingArc({ t, title, date, isStarted, isEnded, description, footer }: ViewProps) {
    const rings = [
        { val: t.d, max: 90, label: "Days" },
        { val: t.h, max: 24, label: "Hours" },
        { val: t.m, max: 60, label: "Mins" },
        { val: t.s, max: 60, label: "Secs" },
    ];
    return (
        <CountdownShell value={{ t, title, date, isStarted, isEnded, description, footer }}>
            <div className="w-full flex justify-center gap-4 flex-wrap">
                {rings.map((r, i) => (
                    <ProgressRing key={r.label} value={r.val} max={r.max} color={i === 3 ? "var(--countdown-primary)" : "var(--countdown-secondary)"} label={r.label} />
                ))}
            </div>
        </CountdownShell>
    );
}

// ── View: Minimal Pill — compact inline row with an urgency badge ────────────

export function MinimalPill({ t, title, date, isStarted, isEnded, description, footer }: ViewProps) {
    let badge = { text: "Open", bg: "rgb(var(--primary) / 0.14)", color: "var(--countdown-primary)" };
    if (t.d <= 1) badge = { text: "Last 24h", bg: "#FCEBEB", color: "#791F1F" };
    else if (t.d <= 7) badge = { text: "Closing soon", bg: "#FAEEDA", color: "#633806" };

    return (
        <div className="w-full h-auto animate-[fadeUp_.2s_ease]">
            <Card className="flex items-center justify-between gap-4 !py-4">
                <div>
                    {title && <p style={{ color: "var(--countdown-title)" }} className="text-[13px] font-semibold mb-0.5">{title}</p>}
                    {description && <p style={{ color: "var(--countdown-description)" }} className="text-[11px] mb-2 opacity-80">{description}</p>}
                    {isStarted && !isEnded && (
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>
                            {badge.text}
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 flex-shrink-0">
                    {isEnded ? (
                        <span style={{ color: "var(--countdown-secondary)" }} className="text-[12px]">Event closed.</span>
                    ) : isStarted ? (
                        <UnitRow units={unitsFromTime(t)} size="sm" gap="gap-1.5" />
                    ) : (
                        <span style={{ color: "var(--countdown-secondary)" }} className="text-[12px]">Starts {date}</span>
                    )}
                </div>
            </Card>
            <Footer footer={footer} />
        </div>
    );
}

// ── View: Banner Bar — dark sticky-strip style ────────────────────────────────

export function BannerBar({ t, title, date, isStarted, isEnded, description, footer }: ViewProps) {
    return (
        <div className="w-full h-auto animate-[fadeUp_.2s_ease]">
            <div className="rounded-xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap" style={{ background: "linear-gradient(120deg, var(--countdown-basic), var(--countdown-primary))", boxShadow: "0 20px 40px -24px var(--countdown-primary)" }}>
                <div>
                    {title && <p className="text-[18px] font-bold text-white mb-0.5" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{title}</p>}
                    {description && <p className="text-[12px] text-white/70">{description}</p>}
                </div>
                <div className="flex gap-2 items-center">
                    {isEnded ? (
                        <span className="text-[12px] text-white/60">Event closed.</span>
                    ) : isStarted ? (
                        <UnitRow units={unitsFromTime(t, ["days", "hrs", "min", "sec"])} size="md" gap="gap-3" color="#ffffff" labelColor="rgba(255,255,255,0.75)" />
                    ) : (
                        <span className="text-[12px] text-white/60">Starts {date}</span>
                    )}
                </div>
            </div>
            <Footer footer={footer} />
        </div>
    );
}

// ── View: Flip Cards — mechanical split-flap digits ───────────────────────────

export function FlipCards({ t, title, date, isStarted, isEnded, description, footer }: ViewProps) {
    const units = unitsFromTime(t, ["days", "hours", "minutes", "seconds"]);
    return (
        <CountdownShell value={{ t, title, date, isStarted, isEnded, description, footer }}>
            <div className="w-full flex flex-wrap justify-center items-center gap-2">
                {units.map((u, i) => (
                    <div className=" relative h-fit flex gap-3 justify-center items-center " key={u.label}>
                        <FlipUnit u={u} size={76} />
                        {i < units.length - 1 && <FlipColon size={76} />}
                    </div>
                ))}
            </div>
        </CountdownShell>
    );
}

// ── View: Progress Bar — linear elapsed-time bar ──────────────────────────────

export function ProgressBar({ t, title, date, isStarted, isEnded, description, footer }: ViewProps) {
    return (
        <div className="w-full h-auto animate-[fadeUp_.2s_ease]">
            <Card>
                <div className="flex items-start justify-between mb-4 gap-3">
                    <EventHeader title={title} description={description || ""} />
                    {isStarted && !isEnded && (
                        <div className="flex gap-1.5 flex-shrink-0">
                            {[{ val: t.d, label: "days" }, { val: t.h, label: "hrs" }, { val: t.m, label: "min" }].map((u) => (
                                <div key={u.label} style={{ backgroundColor: "rgb(var(--muted))" }} className="text-center rounded-md px-2.5 py-1.5 min-w-[40px]">
                                    <div style={{ color: "var(--countdown-basic)" }} className="tabular-nums text-[15px] font-semibold leading-none">{pad(u.val)}</div>
                                    <div style={{ color: "var(--countdown-secondary)" }} className="text-[9px] uppercase tracking-[.05em] mt-0.5">{u.label}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {isStarted && !isEnded ? (
                    <>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                            <div className="h-1.5 rounded-full" style={{ width: `${t.pct}%`, background: "var(--countdown-primary)", transition: "width .5s ease" }} />
                        </div>
                        <div style={{ color: "var(--countdown-basic)" }} className="flex justify-between text-[11px]">
                            <span>{t.pct}% elapsed</span>
                            <span className="tabular-nums font-semibold" style={{ color: "var(--countdown-primary)" }}>{pad(t.s)}s</span>
                        </div>
                    </>
                ) : (
                    <span style={{ color: "var(--countdown-secondary)" }} className="text-[12px]">
                        {isEnded ? "Event closed." : `Starts ${date}`}
                    </span>
                )}
            </Card>
            <Footer footer={footer} />
        </div>
    );
}

// ── View: Mechanical Flip Clock — larger flip digits, dark surface ───────────

export function MechanicalFlipClock({ t, title, date, isStarted, isEnded, description, footer }: ViewProps) {
    const units = unitsFromTime(t, ["days", "hours", "minutes", "seconds"]);
    return (
        <CountdownShell value={{ t, title, date, isStarted, isEnded, description, footer }}>
            <div className="w-full flex flex-wrap gap-4 items-center justify-center">
                {units.map((u, i) => (
                    <React.Fragment key={u.label}>
                        <FlipUnit u={u} size={92} />
                        {i < units.length - 1 && <FlipColon size={92} />}
                    </React.Fragment>
                ))}
            </div>
        </CountdownShell>
    );
}

// ── View: Neumorphism — soft-shadow tiles ─────────────────────────────────────

export function Neumorphism({ t, title, date, isStarted, isEnded, description, footer }: ViewProps) {
    const units = unitsFromTime(t, ["days", "hrs", "min", "sec"]);
    return (
        <CountdownShell value={{ t, title, date, isStarted, isEnded, description, footer }}>
            <div className="flex gap-3.5 flex-wrap justify-center">
                {units.map((u) => (
                    <div key={u.label} className="flex flex-col items-center gap-2">
                        <div
                            style={{ background: "var(--countdown-secondary)", boxShadow: "6px 6px 12px rgb(0 0 0 / 0.12), -6px -6px 12px rgb(255 255 255 / 0.6)" }}
                            className="w-[72px] h-[72px] rounded-[18px] flex items-center justify-center"
                        >
                            <span
                                className="tabular-nums font-bold text-[28px] leading-none"
                                style={{ color: u.accent ? "var(--countdown-primary)" : "var(--countdown-basic)" }}
                            >
                                {pad(u.val)}
                            </span>
                        </div>
                        <span style={{ color: "var(--countdown-secondary)" }} className="text-[9px] font-medium tracking-[0.18em] uppercase">{u.label}</span>
                    </div>
                ))}
            </div>
        </CountdownShell>
    );
}

// ── View: Brutalist — hard borders, grid layout ───────────────────────────────

export function Brutalist({ t, title, date, isStarted, isEnded, description, footer }: ViewProps) {
    const units = unitsFromTime(t, ["DD", "HH", "MM", "SS"]);
    return (
        <CountdownShell value={{ t, title, date, isStarted, isEnded, description, footer }}>
            <div className="w-full border-[3px]" style={{ borderColor: "var(--countdown-basic)", background: "rgb(var(--muted))" }}>
                <div className="grid grid-cols-4">
                    {units.map((u, i) => (
                        <div
                            key={u.label}
                            style={{
                                borderRight: i < 3 ? `3px solid var(--countdown-basic)` : "none",
                                background: u.accent ? "var(--countdown-primary)" : "transparent",
                            }}
                            className="px-2 py-2.5 text-center"
                        >
                            <div style={{ color: u.accent ? "#fff" : "var(--countdown-basic)" }} className="font-black text-[38px] leading-none tracking-[-0.03em]">
                                {pad(u.val)}
                            </div>
                            <div
                                style={{ color: u.accent ? "#fff" : "var(--countdown-basic)", borderColor: u.accent ? "#fff" : "var(--countdown-basic)" }}
                                className="font-bold text-[9px] tracking-[0.2em] uppercase border-t-2 mt-1.5 pt-1.5"
                            >
                                {u.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </CountdownShell>
    );
}

// ── View: Editorial — serif grid, magazine-style ──────────────────────────────

export function Editorial({ t, title, date, isStarted, isEnded, description, footer }: ViewProps) {
    const units = unitsFromTime(t, ["Days", "Hours", "Mins", "Secs"]);
    return (
        <CountdownShell value={{ t, title, date, isStarted, isEnded, description, footer }}>
            <div style={{ fontFamily: "'Playfair Display',serif" }} className="w-full">
                <div className="grid grid-cols-4" style={{ borderLeft: "1px solid var(--countdown-secondary)", borderTop: "1px solid var(--countdown-secondary)" }}>
                    {units.map((u) => (
                        <div key={u.label} style={{ borderRight: "1px solid var(--countdown-secondary)", borderBottom: "1px solid var(--countdown-secondary)" }} className="px-1.5 py-3 text-center">
                            <div style={{ color: u.accent ? "var(--countdown-primary)" : "var(--countdown-basic)" }} className="font-black text-[36px] leading-none">
                                {pad(u.val)}
                            </div>
                            <div style={{ color: "var(--countdown-secondary)", fontFamily: "'Work Sans',sans-serif" }} className="font-normal text-[8px] tracking-[0.15em] uppercase mt-1.5">
                                {u.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </CountdownShell>
    );
}

// ── View: Gradient Glow — new — soft gradient card with glowing accent digit ─

export function GradientGlow({ t, title, date, isStarted, isEnded, description, footer }: ViewProps) {
    const units = unitsFromTime(t, ["days", "hrs", "min", "sec"]);
    return (
        <div className="w-full h-auto animate-[fadeUp_.2s_ease]">
            <div
                className="w-full rounded-2xl px-6 py-9 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, var(--countdown-basic), rgb(var(--foreground) / 0.85))" }}
            >
                <div
                    className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-40 pointer-events-none"
                    style={{ background: "var(--countdown-primary)" }}
                />
                {title && <p className="text-[20px] font-bold text-white text-center mb-1 relative" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{title}</p>}
                {description && <p className="text-[13px] text-white/70 text-center mb-6 relative">{description}</p>}

                <div className="flex items-center justify-center gap-2 relative">
                    {isEnded ? (
                        <span className="text-white/70 text-[13px]">Event closed.</span>
                    ) : isStarted ? (
                        <div className="flex items-baseline gap-4">
                            {units.map((u, i) => (
                                <React.Fragment key={u.label}>
                                    <div className="flex flex-col items-center gap-1">
                                        <span
                                            className="tabular-nums font-bold leading-none text-[52px]"
                                            style={{
                                                fontFamily: "Georgia, 'Times New Roman', serif",
                                                color: u.accent ? "var(--countdown-primary)" : "#fff",
                                                textShadow: u.accent ? "0 0 24px var(--countdown-primary)" : "none",
                                            }}
                                        >
                                            {pad(u.val)}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-[0.22em] text-white/60 font-semibold">{u.label}</span>
                                    </div>
                                    {i < units.length - 1 && <UnitSeparator size="lg" />}
                                </React.Fragment>
                            ))}
                        </div>
                    ) : (
                        <span className="text-white/70 text-[13px]">Starts {date}</span>
                    )}
                </div>

                <p className="text-[11px] text-white/40 text-center mt-4 relative">{footer || ""}</p>
            </div>
        </div>
    );
}

// ── View: Split Flap — new — airport-departure-board style ────────────────────

const SPLIT_FLAP_WIDTH = 46;
const SPLIT_FLAP_HEIGHT = 58;
const SPLIT_FLAP_FONT_SIZE = 30;

/**
 * A full-height, flex-centered digit face — always drawn at the exact same
 * size and position regardless of which half is viewing it. Each half is
 * just a fixed-size window (overflow-hidden) that shifts this face up or
 * down by exactly half the card height, so the visible glyph is one
 * continuous digit straddling the split line, dead center in the card.
 * Flex-centering (not a translate(-50%) transform) avoids sub-pixel
 * rounding, which otherwise blurs/doubles the glyph at the split line.
 */
function SplitFlapDigitFace({ text, offset }: { text: string; offset: number }) {
    return (
        <div
            className="absolute left-0 right-0 flex items-center justify-center"
            style={{ top: -offset, height: SPLIT_FLAP_HEIGHT }}
        >
            <span
                className="font-bold leading-none tabular-nums"
                style={{ fontSize: SPLIT_FLAP_FONT_SIZE, color: "var(--countdown-primary)", fontFamily: "'DM Mono',monospace" }}
            >
                {text}
            </span>
        </div>
    );
}

function SplitFlapHalf({ text, position }: { text: string; position: "top" | "bottom" }) {
    return (
        <div
            style={{ background: "var(--countdown-basic)", height: SPLIT_FLAP_HEIGHT / 2 }}
            className={`absolute left-0 right-0 overflow-hidden ${position === "top" ? "top-0 rounded-t-[3px]" : "bottom-0 rounded-b-[3px]"}`}
        >
            <SplitFlapDigitFace text={text} offset={position === "bottom" ? SPLIT_FLAP_HEIGHT / 2 : 0} />
        </div>
    );
}

function SplitFlapDigit({ value }: { value: number }) {
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
        }, 350);
        return () => clearTimeout(timer);
    }, [value]);

    const oldText = pad(previous);
    const newText = pad(current);

    return (
        <div className="relative rounded-[3px]" style={{ width: SPLIT_FLAP_WIDTH, height: SPLIT_FLAP_HEIGHT, perspective: 300 }}>
            {/* Bottom static layer always shows the incoming value underneath */}
            <SplitFlapHalf text={newText} position="bottom" />
            {/* Top static layer shows the current value until the flap lands */}
            <SplitFlapHalf text={flipping ? oldText : newText} position="top" />

            {flipping && (
                <div
                    className="absolute left-0 right-0 top-0 overflow-hidden rounded-t-[3px] origin-bottom"
                    style={{ background: "var(--countdown-basic)", height: SPLIT_FLAP_HEIGHT / 2, animation: "splitFlapDown 0.35s cubic-bezier(0.4,0,0.2,1) forwards" }}
                >
                    <SplitFlapDigitFace text={oldText} offset={0} />
                </div>
            )}

            <div className="absolute left-0 right-0 top-1/2 h-px bg-black/40 z-10" />
        </div>
    );
}

export function SplitFlap({ t, title, date, isStarted, isEnded, description, footer }: ViewProps) {
    const units = unitsFromTime(t, ["DAYS", "HRS", "MIN", "SEC"]);
    return (
        <CountdownShell value={{ t, title, date, isStarted, isEnded, description, footer }}>
            <div className="flex gap-3 flex-wrap justify-center">
                {units.map((u) => (
                    <div key={u.label} className="flex flex-col items-center gap-1.5 w-[46px]">
                        <SplitFlapDigit value={u.val} />
                        <span style={{ color: "var(--countdown-secondary)" }} className="text-[9px] font-semibold tracking-[0.16em] text-center whitespace-nowrap">{u.label}</span>
                    </div>
                ))}
            </div>
        </CountdownShell>
    );
}

export default {
    boldBlocks: BoldBlocks,
    ringArc: RingArc,
    minimalPill: MinimalPill,
    bannerBar: BannerBar,
    flipCards: FlipCards,
    slideCards: FlipCards,
    progressBar: ProgressBar,
    mechanicalFlipClock: MechanicalFlipClock,
    neumorphism: Neumorphism,
    brutalist: Brutalist,
    editorial: Editorial,
    gradientGlow: GradientGlow,
    splitFlap: SplitFlap,
};
