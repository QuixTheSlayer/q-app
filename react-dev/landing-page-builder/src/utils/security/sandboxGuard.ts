// What the browser enforces on a sandboxed page: a CSP, plus a guard script that runs before the page's own JS.

/**
 * Blocks fetch/XHR/WebSocket, form posts, eval and <base>; images, fonts, styles, media and scripts may still come from https.
 * `origin` is the builder's own site, so its stylesheet and uploaded files load even when it is served over http (local dev).
 */
export const buildSandboxCsp = (origin = ''): string => {
	let own = ''
	try {
		const url = new URL(origin)
		if (url.protocol === 'http:' || url.protocol === 'https:') own = ` ${url.origin}`
	} catch { /* no usable origin */ }
	return [
		"default-src 'none'",
		"script-src 'unsafe-inline' https:",
		`style-src 'unsafe-inline' https:${own}`,
		`img-src https: data: blob:${own}`,
		`font-src https: data:${own}`,
		`media-src https: data: blob:${own}`,
		'frame-src https:',
		"connect-src 'none'",
		"form-action 'none'",
		"base-uri 'none'",
	].join('; ')
}

/** Message the guard posts to the parent: `beat` every second while the page is alive, `tripped` when a limit was hit. */
export const SANDBOX_MESSAGE = 'lp-sandbox'

/**
 * Runs first in the frame. Keeps intervals from running faster than 50 ms, caps live timers and DOM size,
 * and sends a heartbeat so the parent can tell when the page stopped responding.
 * Best effort: page code can still reach clean copies of these functions through a new frame.
 */
export const SANDBOX_GUARD_SCRIPT = `(function () {
window.fetch = window.fetch = async (
        _input,
        _init
      ) => {
        return new Response(null, { status: 420, statusText: 'Too many request' })
      };
  var MSG = '${SANDBOX_MESSAGE}', MIN_INTERVAL = 50, MAX_TIMERS = 200, MAX_NODES = 20000;
  var realTimeout = window.setTimeout, realInterval = window.setInterval;
  var realClearTimeout = window.clearTimeout, realClearInterval = window.clearInterval;
  var live = {}, count = 0, tripped = false;
  function post(type) { try { parent.postMessage({ source: MSG, type: type }, '*'); } catch (e) {} }
  function trip() {
    if (tripped) return;
    tripped = true;
    for (var id in live) { realClearTimeout(+id); realClearInterval(+id); }
    live = {};
    post('tripped');
  }
  function wrap(real, repeat) {
    return function (fn, delay) {
      if (tripped || typeof fn !== 'function') return 0;
      if (count >= MAX_TIMERS) { trip(); return 0; }
      var args = Array.prototype.slice.call(arguments, 2);
      var id;
      var run = function () {
        if (tripped) return;
        if (!repeat) { delete live[id]; count--; }
        fn.apply(this, args);
      };
      var d = +delay || 0;
      id = real(run, repeat ? Math.max(d, MIN_INTERVAL) : d);
      live[id] = 1; count++;
      return id;
    };
  }
  function clearer(real) {
    return function (id) { if (live[id]) { delete live[id]; count--; } real(id); };
  }
  window.setTimeout = wrap(realTimeout, false);
  window.setInterval = wrap(realInterval, true);
  window.clearTimeout = clearer(realClearTimeout);
  window.clearInterval = clearer(realClearInterval);
  try {
    new MutationObserver(function () {
      if (document.getElementsByTagName('*').length > MAX_NODES) { trip(); document.body && (document.body.textContent = ''); }
    }).observe(document, { childList: true, subtree: true });
  } catch (e) {}
  realInterval(function () { post('beat'); }, 1000);
  post('beat');
})();`


// const s:string ="(()())(())"

// const removeOuterParentheses = function (s:string) {

//     const strArr:string[] = s.split('').map((v)=>v.trim())

//     const newStrArr:string[] =[]

//     let isStart = false
//     let isEnd = false

//     let start:number = 0
//     let end = 1
//     let child:string[] = []


//     function changeStrToNum(idx:number, num:number) {
//         if (idx < strArr.length + 1) {
//             if (strArr[idx] === '(') {
//                 // strArr[idx] = num
//                 newStrArr.push(String(num))

//                 changeStrToNum(idx + 1, num + 1)
//             }

//             else {
//                 newStrArr.push(")")
//                 changeStrToNum(idx + 1, num)
//             }
//         }

//     }
//     try {
//         changeStrToNum(0, 1)
//     } catch {
//       return ;
//     } finally {

//         console.log(newStrArr)

//         for (let i:number =0 ; i <newStrArr.length; i++ ) {
//             // console.log(strArr[i])

//             const curr = newStrArr[i]
//             const next = newStrArr[i + 1]


//             if (Number(curr) && ( next !== ')') ) {

//             console.log((curr),next)

//                 if (!isStart) {
//                     isStart = true
//                     start = i
//                 }
//                 else if (isStart) {
//                     isEnd = true
//                     end = i
//                     child.push(s.slice(start, i))
//                     isStart = false


//                 }


//             }

//         }
//     }



//     console.log(child)

// };