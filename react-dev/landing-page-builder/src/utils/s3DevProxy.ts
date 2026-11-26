import { isDev } from '@/libs/checkEnv'

/**
 * The S3 bucket's CORS policy only allows the real vhost origin, not the
 * Vite dev server's origin (e.g. http://local.newjudgify.me:5173) — so a
 * direct browser PUT/GET against a presigned S3 URL fails CORS there, even
 * though the exact same request works fine served from the vhost. Applies
 * to both uploading (useUploadToS3's PUT) and reading images back for
 * thumbnail capture (convertToCanvas.ts's cross-origin `fetch()` calls to
 * inline images as base64).
 *
 * Rather than changing the bucket's CORS policy (shared AWS infra, not
 * just this machine), route the request through Vite's own dev-server
 * proxy (`/s3-dev-proxy`, see vite.config.ts) so the browser's request
 * stays same-origin — no CORS involved at all. `changeOrigin: true` on
 * that proxy rule makes the outgoing Host header match what was actually
 * signed, so the presigned URL's signature still validates.
 *
 * No-op in production (`isDev` is false there): the real S3 URL is used
 * directly, same as it always has been.
 */
export function toUploadUrl(signedUrl: string): string {
    if (!isDev) return signedUrl
    return signedUrl.replace(/^https:\/\/s3\.[a-z0-9-]+\.amazonaws\.com/, '/s3-dev-proxy')
}
