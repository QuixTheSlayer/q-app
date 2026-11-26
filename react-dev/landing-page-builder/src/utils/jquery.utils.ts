/** jQuery for imported page scripts that expect the host site to provide it. */
export const JQUERY_SRC = 'https://code.jquery.com/jquery-3.7.1.min.js'
/** SRI hash of JQUERY_SRC, computed from the downloaded file. */
export const JQUERY_INTEGRITY = 'sha384-1H217gwSVyLSIfaLxHbE7dRb3v4mYCKbpQvzx0cegeju1MVsGrX5xXxAvs/HgeFs'

/** True when the script calls `$(`, `$.`, `jQuery(` or `jQuery.` - then jQuery is loaded first.
 * The character before `$`/`jQuery` must not be a letter, `$` or `.`, so names like
 * `my$var` or `obj.$el` and template strings `${x}` aren't mistaken for jQuery. */
export const usesJquery = (js: string) => /(^|[^\w$.])(\$|jQuery)\s*[(.]/.test(js)
