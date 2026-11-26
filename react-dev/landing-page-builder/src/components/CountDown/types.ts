export interface TimeLeft {
    d: number;
    h: number;
    m: number;
    s: number;
    pct: number;
}

export interface ViewProps {
    t: TimeLeft;
    title?: string;
    date: string;
    isEnded: boolean;
    isStarted: boolean;
    description?: string;
    footer?: string;
}
