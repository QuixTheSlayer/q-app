import{s as ft,p as mt,u as ht,J as gt,a as $t,I as wt,h as yt,e as bt}from"../index.js";const V={class:"className",for:"htmlFor",tabindex:"tabIndex",readonly:"readOnly",maxlength:"maxLength",minlength:"minLength",colspan:"colSpan",rowspan:"rowSpan",srcset:"srcSet",crossorigin:"crossOrigin",autoplay:"autoPlay",playsinline:"playsInline",autocomplete:"autoComplete",autofocus:"autoFocus",enterkeyhint:"enterKeyHint",contenteditable:"contentEditable",spellcheck:"spellCheck",datetime:"dateTime",frameborder:"frameBorder",allowfullscreen:"allowFullScreen",novalidate:"noValidate",formnovalidate:"formNoValidate",accesskey:"accessKey",inputmode:"inputMode",referrerpolicy:"referrerPolicy",fetchpriority:"fetchPriority",usemap:"useMap",cellpadding:"cellPadding",cellspacing:"cellSpacing",hreflang:"hrefLang",enctype:"encType","accept-charset":"acceptCharset","http-equiv":"httpEquiv","xlink:href":"xlinkHref","xml:space":"xmlSpace","xml:lang":"xmlLang","xmlns:xlink":"xmlnsXlink",srcdoc:"srcDoc",marginheight:"marginHeight",marginwidth:"marginWidth",charset:"charSet",nomodule:"noModule",itemprop:"itemProp",itemscope:"itemScope",itemtype:"itemType",autocapitalize:"autoCapitalize",controlslist:"controlsList",srclang:"srcLang"},D=new Set(["disabled","required","hidden","open","multiple","muted","loop","controls","playsinline","readonly","novalidate","formnovalidate","allowfullscreen","async","defer","itemscope","inert","reversed","autoplay","autofocus","default","nomodule","checked","selected"]),Q=new Set(["rows","cols","tabindex","colspan","rowspan","maxlength","minlength","size","span","start"]),xt={novalidate:["form"],enctype:["form"],method:["form"],action:["form"],"accept-charset":["form"],target:["a","area","base","form"],rel:["a","area","link"],href:["a","area","base","link"],download:["a","area"],name:["button","fieldset","form","iframe","input","map","meta","object","output","param","select","slot","textarea"],src:["audio","embed","iframe","img","input","script","source","track","video"],alt:["area","img","input"],value:["button","data","input","li","meter","option","output","param","progress","select","textarea"],type:["a","button","embed","input","link","menu","object","ol","script","source","style"],disabled:["button","fieldset","input","optgroup","option","select","textarea"],required:["input","select","textarea"],placeholder:["input","textarea"],readonly:["input","textarea"],checked:["input"],maxlength:["input","textarea"],minlength:["input","textarea"],pattern:["input"],accept:["input"],multiple:["input","select"],for:["label","output"],colspan:["td","th"],rowspan:["td","th"],width:["canvas","embed","iframe","img","input","object","source","video"],height:["canvas","embed","iframe","img","input","object","source","video"],open:["details","dialog"],datetime:["del","ins","time"],cite:["blockquote","del","ins","q"]};function St(t,e){const n=xt[e.toLowerCase()];return!n||n.includes(t)}function vt(t,e){return D.has(t.toLowerCase())&&(e===""||e.toLowerCase()===t.toLowerCase())?"true":Q.has(t.toLowerCase())&&/^-?\d+$/.test(e.trim())?e.trim():JSON.stringify(e)}const N=t=>t.replace(/[-:]([a-z])/g,(e,n)=>n.toUpperCase()),Y=t=>t.charAt(0).toUpperCase()+t.slice(1);function _(t,e,n){const s=e.toLowerCase();return s.startsWith("on")||s==="style"||s==="selected"?null:s==="value"&&["input","textarea","select"].includes(t)?"defaultValue":s==="checked"&&t==="input"?"defaultChecked":s.startsWith("data-")||s.startsWith("aria-")?s:V[s]?V[s]:n&&/[-:]/.test(e)?N(e):e}function kt(t){return/["\\{}\n]|&[#\w]+;/.test(t)?`{${JSON.stringify(t)}}`:`"${t}"`}function Et(t,e,n,s){const r=_(t,e,s);return r?D.has(e.toLowerCase())&&(n===""||n.toLowerCase()===e.toLowerCase())?` ${r}`:Q.has(e.toLowerCase())&&/^-?\d+$/.test(n.trim())?` ${r}={${n.trim()}}`:` ${r}=${kt(n)}`:""}function Ct(t){if(t.startsWith("--"))return t;const e=t.toLowerCase();return e.startsWith("-ms-")?`ms${Y(N(e.slice(4)))}`:e.startsWith("-")?Y(N(e.slice(1))):N(e)}const P=t=>`'${t.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\n/g," ")}'`;function Nt(t){const e=[];for(const n of ft(t)){const s=n.indexOf(":");if(s<1)continue;const r=n.slice(0,s).trim(),o=n.slice(s+1).replace(/\s*!important\s*$/i,"").trim();r&&o&&e.push([Ct(r),o])}return e}function At(t,e){const n=Nt(t);if(n.length===0)return null;const s=n.some(([i])=>i.startsWith("--")),r=i=>/^[A-Za-z_$][\w$]*$/.test(i)?i:P(i),o=s?" as CSSProperties":"";return e===null||n.length<3?{code:` style={{ ${n.map(([i,c])=>`${r(i)}: ${P(c)}`).join(", ")} }${o}}`,needsCast:s}:{code:` style={{
${n.map(([i,c])=>`${e}  ${r(i)}: ${P(c)},`).join(`
`)}
${e}}${o}}`,needsCast:s}}const y=t=>(t==null?void 0:t.kind)==="element",Lt=new Set(["area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"]),A=t=>/^[ \t\r\n\f]*$/.test(t),X=t=>t.replace(/[ \t\r\n\f]+/g," "),jt=(t,e)=>e.children.some(n=>{var s;return((s=t[n])==null?void 0:s.kind)==="text"&&!A(t[n].text)}),Tt=new Set(["a","abbr","b","br","button","cite","code","em","i","img","input","kbd","label","mark","q","s","select","small","span","strong","sub","sup","svg","textarea","time","u","picture"]),Pt="  ",Rt=new Set(["pre","style"]),tt=(t,e)=>{const n=t[e];return(n==null?void 0:n.kind)==="text"&&A(n.text)},K=(t,e)=>!!(e&&y(t[e])&&Tt.has(t[e].tag));function It(t,e,n){var i;const s=(i=t.props)==null?void 0:i.get(e);if(s)return`{${s}}`;const r=t.nodes[e],o=(r==null?void 0:r.kind)==="text"?r.text:"";if(n)return`{${JSON.stringify(o)}}`;const a=X(o);return/[{}<>]|&[#\w]+;/.test(a)?`{${JSON.stringify(a)}}`:a}function Ot(t,e){const n=e.children.map(r=>t[r]).find(r=>y(r)&&"selected"in r.attrs);if(!y(n))return;const s=n.children.map(r=>{var o;return((o=t[r])==null?void 0:o.kind)==="text"?t[r].text:""}).join("").trim();return n.attrs.value??s}function et(t,e,n,s){var f;const r={...e.attrs};if(e.tag==="select"){const l=Ot(t.nodes,e);l!==void 0&&(r.value=l)}const o=[...((f=t.props)==null?void 0:f.keys())??[]].filter(l=>l.startsWith(`${e.id}@`)).map(l=>l.split("@")[1]),a=[...new Set([...Object.keys(r),...o])].filter(l=>l!=="style"),i=[],c=a.map(l=>{var u;const g=(u=t.props)==null?void 0:u.get(`${e.id}@${l}`);if(!g&&!n&&!St(e.tag,l)){const d=_(e.tag,l,n);return d&&i.push(`${d}: ${vt(l,r[l])}`),""}if(!g)return Et(e.tag,l,r[l],n);const $=_(e.tag,l,n);return $?` ${$}={${g}}`:""}).join("")+(i.length?` {...({ ${i.join(", ")} } as object)}`:""),p=r.style?At(r.style,s):null;return p!=null&&p.needsCast&&(t.usage.cssProperties=!0),c+((p==null?void 0:p.code)??"")}function _t(t,e,n,s){return e.map(r=>{var o;return((o=t.nodes[r])==null?void 0:o.kind)==="text"?tt(t.nodes,r)&&!s?" ":It(t,r,s):L(t,r,null,n,s)}).join("")}function Mt(t,e,n,s){const r=[],o=new Set;return e.forEach((a,i)=>{var p;if(o.has(a))return;const c=(p=t.repeats)==null?void 0:p.get(a);c?(c.ids.forEach(f=>o.add(f)),r.push(`${n}${c.expression}`)):tt(t.nodes,a)?K(t.nodes,e[i-1])&&K(t.nodes,e[i+1])&&!o.has(e[i+1])&&r.push(`${n}{' '}`):r.push(L(t,a,n,s))}),r}function L(t,e,n,s=!1,r=!1){const o=t.nodes[e];if(!y(o))return"";const a=n??"",i=s||o.tag==="svg",c=i&&o.tag!=="foreignObject",p=o.children,f=et(t,o,i,n);if(o.tag==="textarea"){const u=p.map(h=>{var w;return((w=t.nodes[h])==null?void 0:w.kind)==="text"?t.nodes[h].text:""}).join(""),d=u?` defaultValue={${JSON.stringify(u)}}`:"";return`${a}<textarea${f}${d} />`}const l=`<${o.tag}${f}`;if(Lt.has(o.tag)||p.length===0)return`${a}${l} />`;const g=r||Rt.has(o.tag);if(g||jt(t.nodes,o))return`${a}${l}>${_t(t,p,c,g)}</${o.tag}>`;const $=Mt(t,p,`${a}${Pt}`,c);return $.length?`${a}${l}>
${$.join(`
`)}
${a}</${o.tag}>`:`${a}${l} />`}function Dt(t,e,n){return`<${e.tag}${et(t,e,!1,n)}>`}const Bt=new Set(["section","container","wrapper","wrap","inner","content","row","col","block","grid"]),Gt=new Set(["App","React","Fragment","Component","Suspense","Main"]),R=28;function S(t){const e=t.split(/[^a-zA-Z0-9]+/).filter(Boolean).map(n=>n[0].toUpperCase()+n.slice(1)).join("");return/^[0-9]/.test(e)?`Part${e}`:e}const Wt=t=>t.charAt(0).toLowerCase()+t.slice(1),I=t=>t.replace(/^lp-/,"");function nt(t,e){return e.children.map(n=>{const s=t[n];return s?s.kind==="text"?s.text:nt(t,s):""}).join(" ")}const C={nav:"Navbar",header:"Header",footer:"Footer"},Ft=new Set(["h1","h2","h3","h4"]);function zt(t,e){let n=[e];for(let s=0;s<6&&n.length;s++){const r=[];for(const o of n)for(const a of o.children){const i=t[a];if(y(i)){if(i.tag in C||Ft.has(i.tag))return i;r.push(i)}}n=r}return null}function Ut(t=new Set){const e=r=>{const o=I(r);return!!o&&!Bt.has(o)&&(r.startsWith("lp-")||t.has(r))};function n(r){const o=r.attrs.id;if(o&&!/^radix-|^[0-9a-f]{8}-/i.test(o)){const c=S(I(o));if(c)return c.slice(0,R)}const a=(r.attrs.class??"").split(/\s+/).find(e),i=a?S(I(a)):"";return i?i.slice(0,R):null}function s(r,o){var c;const a=n(o);if(a)return a;const i=zt(r,o);if(i){if(i.tag in C)return C[i.tag];const p=((c=nt(r,i).match(/[A-Za-z0-9]+/g))==null?void 0:c.slice(0,3).join(" "))??"",f=S(p);if(f)return f.slice(0,R)}return o.tag in C?C[o.tag]:o.tag==="div"?"Block":S(o.tag)}return{meaningfulName:n,describeName:s}}function qt(){const t=new Set,e=n=>Gt.has(n)?`${n}Section`:n||"Part";return(n,s)=>{const r=e(n),o=t.has(r)&&s?e(s):r;let a=o;for(let i=2;t.has(a);i++)a=`${o}${i}`;return t.add(a),a}}const Jt=new Set(["break","case","catch","class","const","continue","default","delete","do","else","export","extends","false","finally","for","function","if","import","in","instanceof","new","null","return","super","switch","this","throw","true","try","typeof","var","void","while","with","yield","let","static","enum","await"]);function Ht(){const t=new Set(["key","children"]);return e=>{const n=/^[a-zA-Z_$][\w$]*$/.test(e)?e:"value",s=Jt.has(n)?`${n}Value`:n;let r=s;for(let o=2;t.has(r);o++)r=`${s}${o}`;return t.add(r),r}}const Vt=(t,e)=>{const n=t[e];return(n==null?void 0:n.kind)==="text"&&A(n.text)},j=(t,e)=>e.children.filter(n=>!Vt(t,n));function M(t,e){const n=t[e];if(!y(n))return"t";const{class:s="",style:r="","data-id":o=""}=n.attrs;return`${n.tag}.${s}|${r}|${o}(${j(t,n).map(a=>M(t,a)).join(",")})`}function Yt(t,e,n){const s=e?t[e]:void 0;if(!y(s))return"text";if(/^h[1-6]$/.test(s.tag))return"title";if(s.tag==="p")return"text";if(s.tag==="a"||s.tag==="button")return"label";if(s.tag==="li")return"item";const r=n.meaningfulName(s);return r?r.charAt(0).toLowerCase()+r.slice(1):"text"}function Kt(t,e){if(e==="src")return t==="img"?"image":`${t}Src`;if(e==="alt")return"imageAlt";if(e==="href")return"link";if(e==="class")return"className";if(e==="datetime")return"date";const n=S(e);return n.charAt(0).toLowerCase()+n.slice(1)}function Zt(t,e,n){const s=new Map,r=[],o=e.map(()=>({})),a=Ht(),i=(p,f,l,g)=>{const $=a(f);s.set(p,$),r.push({name:$,kind:l,optional:g.some(u=>u===void 0)}),g.forEach((u,d)=>{o[d][$]=u})},c=p=>{const f=t[p[0]];if(f.kind==="text"){const u=p.map(d=>X(t[d].text));new Set(u).size>1&&i(f.id,Yt(t,f.parentId,n),"string",u);return}const l=p.map(u=>t[u]),g=new Set(l.flatMap(u=>Object.keys(u.attrs)));for(const u of g){if(/^on/i.test(u)||u==="selected"||u==="style")continue;const d=l.map(w=>w.attrs[u]);if(new Set(d).size<=1)continue;const h=D.has(u);i(`${f.id}@${u}`,Kt(f.tag,u),h?"boolean":"string",h?d.map(w=>w!==void 0):d)}const $=l.map(u=>j(t,u));$[0].forEach((u,d)=>c($.map(h=>h[d])))};return c(e),{fields:s,props:r,rows:o}}const Qt=new Set(["div","article","li","figure","section","blockquote","details","tr","aside","a","label","dl"]);function Xt(t,e){const n=t[e[0]],s=j(t,n),r=s.some(o=>y(t[o]));return!Qt.has(n.tag)||!r?!1:e.length>=3||e.length===2&&s.length>=2}function te(t,e,n,s){var o;const r=s.meaningfulName(e);if(r)return r;for(let a=e.parentId;a;a=((o=t[a])==null?void 0:o.parentId)??null){const i=t[a],c=y(i)?s.meaningfulName(i):null;if(c)return`${c}Item`;if(a===n)break}return`${s.describeName(t,t[n])}Item`}function ee(t,e,n){const s=[],r=o=>{const a=t[o];if(!y(a)||a.tag==="svg")return;const i=j(t,a);if(i.some(p=>{var f;return((f=t[p])==null?void 0:f.kind)==="text"}))return;let c=0;for(;c<i.length;){const p=M(t,i[c]);let f=c+1;for(;f<i.length&&M(t,i[f])===p;)f++;const l=i.slice(c,f),g=Xt(t,l)?Zt(t,l,n):null;g&&g.props.length>0?s.push({ids:l,baseName:te(t,t[l[0]],e,n),...g}):l.forEach(r),c=f}};return r(e),s}const st="    ",rt="import type { CSSProperties } from 'react'",ne=t=>`  { ${Object.entries(t).filter(([,e])=>e!==void 0).map(([e,n])=>`${e}: ${JSON.stringify(n)}`).join(", ")} },`;function se(t,e,n){const s={nodes:t,props:e.fields,usage:{cssProperties:!1}},r=e.props.map(i=>`  ${i.name}${i.optional?"?":""}: ${i.kind}`),o=e.props.map(i=>i.name).join(", "),a=L(s,e.ids[0],st);return{name:n,code:[...s.usage.cssProperties?[rt,""]:[],`export type ${n}Props = {`,...r,"}","","/** One of the repeated items. Change the look here; change the words in the list that uses it. */",`export default function ${n}({ ${o} }: ${n}Props) {`,"  return (",a,"  )","}",""].join(`
`)}}function re(t,e,n,s,r){const o=ee(t,e,r),a=new Map,i=[],c=[],p=[];for(const u of o){const d=S(u.baseName)||"Item",h=s(d,d.startsWith(n)?void 0:`${n}${d}`),w=`${Wt(h)}Items`;i.push(se(t,u,h)),c.push(`import ${h}, { type ${h}Props } from './${h}'`),p.push(`const ${w}: ${h}Props[] = [`,...u.rows.map(ne),"]",""),a.set(u.ids[0],{ids:u.ids,expression:`{${w}.map((item, index) => <${h} key={index} {...item} />)}`})}const f={nodes:t,repeats:a,usage:{cssProperties:!1}},l=L(f,e,st),g=[...f.usage.cssProperties?[rt]:[],...c],$=[...g,...g.length?[""]:[],...p,`export default function ${n}() {`,"  return (",l,"  )","}",""].join(`
`);return[{name:n,code:$},...i]}const oe=new Set(["script","noscript","template"]);function ie(t,e){const n=new DOMParser().parseFromString(`<!doctype html><html><body>${t}</body></html>`,"text/html"),s={};let r=0;const o=()=>`n${++r}`,a=(c,p)=>{if(p.nodeType===3){const d=o();return s[d]={kind:"text",id:d,parentId:c,text:p.textContent??""},d}if(p.nodeType!==1)return null;const f=p,l=f.localName;if(oe.has(l))return null;const g={};for(const{name:d,value:h}of Array.from(f.attributes))/^on/i.test(d)||d==="id"&&!h||d==="data-id"&&!e(h)||(g[d]=h);const $=o(),u={kind:"element",id:$,parentId:c,tag:l,attrs:g,children:[]};s[$]=u;for(const d of Array.from(f.childNodes)){const h=a($,d);h&&u.children.push(h)}return $},i={kind:"element",id:"root",parentId:null,tag:"body",attrs:{},children:[]};s.root=i;for(const c of Array.from(n.body.childNodes)){const p=a("root",c);p&&i.children.push(p)}return{nodes:s,rootId:"root"}}const ae=t=>!t.type||/^(text|application)\/(x-)?javascript$/i.test(t.type)||t.type==="module",ce=`<script src="${gt}" integrity="${$t}" crossorigin="anonymous"><\/script>`;function le({plainJS:t,classJs:e,pageScripts:n=[]}){var a;const s={files:{},run:[],tags:[]},r=(i,c)=>{const p=`scripts/${c?"module":"page"}-${s.run.length+1}.js`;s.files[`public/${p}`]=`${i.trim()}
`,s.run.push({src:p,module:c})},o=n.some(i=>/jquery/i.test(i.src??""));t&&ht(t)&&!o&&s.tags.push(ce);for(const i of n)if(i.src||!ae(i)){const c=mt(i);c&&s.tags.push(c)}else(a=i.code)!=null&&a.trim()&&r(i.code,i.type==="module");return e!=null&&e.trim()&&r(e,!1),t!=null&&t.trim()&&r(`${wt}
${t}`,!1),s}function pe(t){return`${JSON.stringify({name:t,private:!0,version:"0.1.0",type:"module",scripts:{dev:"vite",build:"vite build",typecheck:"tsc --noEmit",preview:"vite preview"},dependencies:{react:"^18.3.1","react-dom":"^18.3.1"},devDependencies:{"@types/react":"^18.3.18","@types/react-dom":"^18.3.5","@vitejs/plugin-react":"^4.3.4",typescript:"~5.6.2",vite:"^6.0.5"}},null,2)}
`}const ue=`${JSON.stringify({compilerOptions:{target:"ES2022",lib:["ES2022","DOM","DOM.Iterable"],module:"ESNext",moduleResolution:"bundler",jsx:"react-jsx",strict:!0,noEmit:!0,skipLibCheck:!0,isolatedModules:!0,types:["vite/client"]},include:["src"]},null,2)}
`,de=`import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`,fe=t=>`import { createRoot } from 'react-dom/client'
import App from './App'
${t.map(e=>`import './styles/${e}'`).join(`
`)}

// No <StrictMode>: the page's own scripts (public/scripts) expect the page to be put on screen once.
createRoot(document.getElementById('root')!).render(<App />)
`;function ot(t,e,n){const s=`${t}${e}:not([data-lp-text] *)`,r=[];let o=s;return n.forEach((a,i)=>{i===0?r.push(`${s} {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}`):(o+=` > li > ${t}${e}`,r.push(`${o} {
  padding-left: 1.5rem;
  margin-top: 0.3rem;
}`)),r.push(`${o} > li {
  list-style-type: ${a} !important;
  margin-left: 0.4rem;
}`)}),r.join(`

`)}const me=ot("ul",':not([data-type="taskList"]):not([data-lp-tag])',["disc","circle","square"]),he=ot("ol",":not([data-lp-tag])",["decimal","upper-alpha","lower-alpha","upper-roman","lower-roman"]),ge=`/* Global resets from judgify-react-ui, the UI package the builder bundles (on top of Tailwind's reset). */
* {
  padding: 0;
  margin: 0;
  outline-color: #3b82f6;
}

li {
  list-style: none;
}

body {
  font-family: Arial, sans-serif;
  font-feature-settings: "rlig" 1, "calt" 1;
  text-rendering: optimizeLegibility;
}

/* A boxed page (the page setting): capped at 1200px and centered, like Preview. */
.main-container-lp {
  max-width: 1200px;
  margin: 0 auto;
}

table {
  border-collapse: collapse;
  margin: 0;
  overflow: hidden;
  table-layout: fixed;
  width: 100%;
  height: 100%;
}

.table-node * {
  border-color: inherit;
}

table td,
table th {
  border-width: 1px;
  border-style: solid;
  box-sizing: border-box;
  min-width: 1em;
  padding: 6px 8px;
  position: relative;
  vertical-align: middle;
}

table td > *,
table th > * {
  margin-bottom: 0;
}

table th {
  font-weight: normal;
  text-align: left;
}

.dragged-table {
  height: 100%;
}

.dragged-table tr {
  height: 2.77em !important;
}

${me}

${he}
`,$e=`node_modules
dist
`;function we(t,e,n){return`# ${t}

Your Judgify landing page as a React + TypeScript project (Vite).

## Run it

1. Install Node.js 18 or newer from https://nodejs.org
2. In this folder, run \`npm install\`
3. Run \`npm run dev\` and open the address it shows (usually http://localhost:5173)

\`npm run build\` makes a \`dist/\` folder you can upload to any web host
(Vercel, Netlify, GitHub Pages…). \`npm run typecheck\` checks the TypeScript.

## What's where

- \`src/App.tsx\` puts the parts of the page in order.
- \`src/components/\` has one file per part: ${e.join(", ")}.
  Repeated items (cards, menu items, reviews…) have their own component, and
  their words, pictures and links are in a list at the top of the part that uses them.
- \`src/styles/\` has the builder's defaults (\`builder.css\`: base font, text rendering, boxed width, lists and tables).
- \`public/styles/\` has the page's own CSS (\`page.css\` from Import HTML or Custom Code, plus the animation, responsive and class styles).
  \`index.html\` links it at the end of \`<body>\`, in the order the builder applies it, so it wins over Tailwind's reset.
- \`index.html\` has the title, the page's libraries and the \`<html>\` settings.
${n?"- `public/scripts/` has the page's own JavaScript, unchanged. `src/runPageScripts.ts`\n  runs it once after React has put the page on screen. Moving these behaviours\n  into React (state and event handlers) is a good next step.\n":""}
## Good to know

- **Tailwind** classes come from the Tailwind CDN script in \`index.html\`, like in the builder's HTML export.
  It is meant for development. For production, install Tailwind in this project and remove that script.
- **Judgify widgets** (sliders, countdowns, tabs, accordions) are exported as the markup the page shows,
  not as working React components.
- **Event tokens** such as \`{{event_register_url}}\` stay as written. Replace them with your own links and dates.
`}function ye(t){return`/**
 * Runs the page's own JavaScript (public/scripts/) once, after React has put
 * the page on screen, so it finds every element just like on the original page.
 * Over time you can move these behaviours into React components.
 */
type PageScript = { src: string; module: boolean }
type AddListener = (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void

const SCRIPTS: PageScript[] = [
${t.map(n=>`  { src: '${n.src}', module: ${n.module} },`).join(`
`)}
]

let started = false

function callNow(target: EventTarget, type: string, listener: EventListenerOrEventListenerObject): void {
  const event = new Event(type)
  setTimeout(() => (typeof listener === 'function' ? listener.call(target, event) : listener.handleEvent(event)))
}

/** "Wait until the page has loaded" code runs right away: by now it has. Returns a function that undoes this. */
function runReadyListenersNow(): () => void {
  const documentAdd = document.addEventListener
  const windowAdd = window.addEventListener
  const wrap = (target: EventTarget, add: AddListener): AddListener => (type, listener, options) => {
    if (type === 'DOMContentLoaded' || (target === window && type === 'load')) callNow(target, type, listener)
    else add.call(target, type, listener, options)
  }
  document.addEventListener = wrap(document, documentAdd) as typeof document.addEventListener
  window.addEventListener = wrap(window, windowAdd) as typeof window.addEventListener
  return () => {
    document.addEventListener = documentAdd
    window.addEventListener = windowAdd
  }
}

function loadScript({ src, module }: PageScript): Promise<void> {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    if (module) script.type = 'module'
    script.src = import.meta.env.BASE_URL + src
    script.onload = () => resolve()
    script.onerror = () => {
      console.error(\`Could not run \${src}\`)
      resolve()
    }
    document.body.appendChild(script)
  })
}

/** Call once when the app has mounted (App.tsx does). Safe to call twice. */
export function runPageScripts(): void {
  if (started) return
  started = true
  const undo = runReadyListenersNow()
  void SCRIPTS.reduce((previous, script) => previous.then(() => loadScript(script)), Promise.resolve()).finally(undo)
}
`}const x="    ",be=t=>t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"landing-page",xe=t=>t.replace(/\bbody\s*>/g,"body > #root >");function Se(t){const e=t==null?void 0:t.css;return new Set(e&&!Array.isArray(e)?Object.keys(e).filter(n=>!/^\d+$/.test(n)):[])}function O(t,e){return t[e].children.map(n=>t[n]).filter(y)}const Z=(t,e)=>t[e].children.some(n=>{var s;return((s=t[n])==null?void 0:s.kind)==="text"&&!A(t[n].text)});function Ee(t,e,n={},s={}){const{animationCss:r,responsiveCss:o,classCss:a,plainCss:i,classJs:c,plainJS:p,content:f}=n,l=f,g=(l==null?void 0:l.pageScripts)??[],$=le({plainJS:p,classJs:c,pageScripts:g}),u=[r,o,a,i,c,p,...g.map(m=>m.code)].filter(Boolean).join(`
`),{nodes:d,rootId:h}=ie(t,m=>!!m&&u.includes(m)),w=Ut(Se(f)),B=qt(),G={cssProperties:!1},it={nodes:d,usage:G},v=O(d,h),k=v.length===1&&!Z(d,h)&&O(d,v[0].id).length>0&&!Z(d,v[0].id)?v[0]:null,at=k?O(d,k.id):v,W={},T=[],F=[];for(const m of at){const b=B(w.describeName(d,m));for(const H of re(d,m.id,b,B,w))W[`src/components/${H.name}.tsx`]=H.code;T.push(b),F.push(`<${b} />`)}const E=$.run.length>0,z=F.map(m=>`${x}  ${m}`),U=k?[`${x}${Dt(it,k,x)}`,...z,`${x}</${k.tag}>`]:[`${x}<>`,...z,`${x}</>`],ct=s.boxed?[`${x}<div className="main-container-lp">`,...U.map(m=>`  ${m}`),`${x}</div>`]:U,lt=[...E?["import { useEffect } from 'react'"]:[],...G.cssProperties?["import type { CSSProperties } from 'react'"]:[],...T.map(m=>`import ${m} from './components/${m}'`),...E?["import { runPageScripts } from './runPageScripts'"]:[],"","/** The whole page, part by part, in order. */","export default function App() {",...E?["  useEffect(() => runPageScripts(), [])"]:[],"  return (",...ct,"  )","}",""].join(`
`),pt=[["base.css",`#root { display: contents; }
`],["builder.css",ge]],ut=[["animation.css",r],["responsive.css",o],["classes.css",a],["page.css",i?`${xe(i)}
`:void 0]],q=pt.filter(([,m])=>m==null?void 0:m.trim()),J=ut.filter(([,m])=>m==null?void 0:m.trim()),dt=["<!doctype html>",`<html${yt(l==null?void 0:l.htmlAttributes)}>`,"<head>",'<meta charset="UTF-8" />','<meta name="viewport" content="width=device-width, initial-scale=1.0" />',`<title>${bt(e)}</title>`,'<script src="https://cdn.tailwindcss.com"><\/script>',"</head>","<body>",'<div id="root"></div>',...$.tags,'<script type="module" src="/src/main.tsx"><\/script>',...J.map(([m])=>`<link rel="stylesheet" href="/styles/${m}" />`),"</body>","</html>",""].join(`
`);return{"package.json":pe(be(e)),"tsconfig.json":ue,"vite.config.ts":de,".gitignore":$e,"README.md":we(e,T,E),"index.html":dt,"src/main.tsx":fe(q.map(([m])=>m)),"src/App.tsx":lt,...E?{"src/runPageScripts.ts":ye($.run)}:{},...Object.fromEntries(q.map(([m,b])=>[`src/styles/${m}`,b])),...Object.fromEntries(J.map(([m,b])=>[`public/styles/${m}`,b.endsWith(`
`)?b:`${b}
`])),...$.files,...W}}export{Ee as buildReactProject,be as projectSlug};
