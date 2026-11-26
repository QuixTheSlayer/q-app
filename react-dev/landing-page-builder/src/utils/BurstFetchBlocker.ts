import crypto from 'crypto';

let controller = new AbortController();
 
function hashPayload(payload: unknown): string {
    const normalized = JSON.stringify(payload, Object.keys(payload as object).sort()); // sort keys so key order doesn't matter
    return crypto.createHash('sha256').update(normalized).digest('hex');
}

interface FetchMonitorOptions {
    onBurst?: (count: number, windowMs: number) => void;
    burstThreshold?: number;
    burstWindowMs?: number;
}

export function installFetchMonitor(options: FetchMonitorOptions = {}): () => void {
    const { onBurst, burstThreshold = 20, burstWindowMs = 5000 } = options;
    const originalFetch = window.fetch
    const log: number[] = [];

    window.fetch = async function (...args: Parameters<typeof fetch>) {
        const now = Date.now();
        log.push(now);

        // prune old entries so this doesn't grow forever
        while (log.length && now - log[0] > burstWindowMs) {
            log.shift();
        }

        if (onBurst && log.length > burstThreshold) {
            onBurst(log.length, burstWindowMs);
        }

        return originalFetch.apply(this, args);
    };

    // returns a cleanup function to restore original fetch
    return () => {
        window.fetch = originalFetch
    };
}

interface DuplicateDetectionOptions {
    windowMs?: number;
    onDuplicate?: (info: { url: string; method: string; body: unknown; count: number,abortReq:()=>void }) => void;
}

export function installFetchDuplicateDetector(options: DuplicateDetectionOptions = {}) {
    const { windowMs = 3000, onDuplicate } = options;
    const originalFetch = window.fetch;

    // key -> { expiry, count }
    const seen = new Map<string, { expiry: number; count: number }>();

    async function hashBody(body: BodyInit | null | undefined): Promise<string> {
        if (!body) return '';
        if (typeof body === 'string') return body;
        if (body instanceof FormData) {
            const entries: string[] = [];
            body.forEach((value, key) => entries.push(`${key}=${value}`));
            return entries.sort().join('&');
        }
        if (body instanceof URLSearchParams) return body.toString();
        return String(body);
    }

      function abortAll() {
        controller.abort();
        controller = new AbortController(); 
    }

    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {

        const signal = init?.signal ?? controller.signal;

        const method = (init?.method ?? 'GET').toUpperCase();

        const url = typeof input === 'string' ? input : input instanceof Request ? input.url : input.toString();
        const bodyHash = await hashBody(init?.body);
        const key = `${method}:${url}:${bodyHash}`;
        const now = Date.now();

        // prune expired
        for (const [k, entry] of seen) {
            if (entry.expiry < now) seen.delete(k);
        }

        const existing = seen.get(key);
        if (existing) {
            existing.count += 1;
            existing.expiry = now + windowMs; // refresh window

            onDuplicate?.({ url, method, body: init?.body, count: existing.count,abortReq:abortAll })

        } else {
            seen.set(key, { expiry: now + windowMs, count: 1 });
        }

        return originalFetch(input, { ...init, signal });
    };


  


    return () => {
        window.fetch = originalFetch;
    };
}