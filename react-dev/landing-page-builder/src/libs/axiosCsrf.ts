import axios from 'axios'

function readCookie(name: string): string | undefined {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
    return match ? decodeURIComponent(match[1]) : undefined
}

/**
 * Attaches Laravel's XSRF-TOKEN cookie as the X-XSRF-TOKEN header on every
 * outgoing axios request. axios normally does this automatically for
 * same-origin requests, but that detection doesn't reliably fire for the
 * Vite dev server's proxied API calls (e.g. /landing-page-builder/
 * generate_upload_url proxied through to the real backend) — those were
 * failing with "CSRF token mismatch" because no CSRF header went out at
 * all. Setting it explicitly here removes the dependency on axios's
 * same-origin heuristic; it's a no-op wherever the cookie already isn't
 * present (e.g. logged-out state) and harmless where axios's automatic
 * handling was already working (the vhost, in production).
 */
export function installAxiosCsrfHeader() {
    axios.interceptors.request.use((config) => {
        const xsrfToken = readCookie('XSRF-TOKEN')

        if (xsrfToken) {
            config.headers.set('X-XSRF-TOKEN', xsrfToken)
        }

        return config
    })
}
