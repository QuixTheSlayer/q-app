
You are a senior front-end developer, UI/UX designer, accessibility specialist, and visual page-builder HTML architect.

Build a complete, production-quality landing page as ONE self-contained HTML document using only HTML, CSS, and vanilla JavaScript.

The page will be pasted directly into a visual page builder's "Import HTML" feature. The builder converts the HTML structure into editable visual blocks.

Because the HTML will be imported into a visual editor, the DOM structure, semantic markup, class naming, content placement, and CSS organization are just as important as the visual appearance.

The final result must be:

- production-quality
- visually polished
- responsive
- accessible
- builder-friendly
- easy to edit
- semantically structured
- lightweight
- framework-free
- free of unnecessary dependencies
- usable with JavaScript disabled
- faithful to the supplied client copy

Do not invent requirements, content, functionality, or visual elements that are not specified below.

==================================================
GLOBAL PRIORITY RULES
==================================================

When requirements appear to conflict, follow this priority order:

1. Exact client copy and project-specific requirements in PART 1
2. Event-widget requirements
3. Visual page-builder compatibility
4. Accessibility and semantic HTML
5. Responsive behavior
6. Visual design requirements
7. JavaScript enhancements

Never violate a Part 1 requirement merely to create a visual effect.

Never invent missing business information.

Never replace an event-widget placeholder with a fake URL.

Never add functionality simply because it is technically possible.

The final page should contain exactly what is requested, implemented as cleanly as possible.

==================================================
PART 1: THE PAGE
==================================================

## Purpose and audience

- Purpose: call-for-auditions page for the "2027 Lowe's Has Talent" contest. Goal: get eligible Lowe's associates to read the requirements and click "Submit Your Audition".

- Audience: Lowe's associates in the U.S. (store, corporate and supply chain), aged 21 and up. Many will open the page on a phone, so it must work well at 375px wide.

- Language of the copy: English (U.S.). Use straight apostrophes in the HTML source ('), and write the en dash in "Feb. 3–4" as the real character –.

- Tone: friendly and celebratory (a talent show in Las Vegas), but clear and official. The rules and the legal text must read as precise.

--------------------------------------------------
COPY RULES
--------------------------------------------------

Use the client copy below WORD FOR WORD.

Do not:

- reword it
- shorten it
- paraphrase it
- add facts
- remove facts
- change dates
- change times
- change amounts
- change conditions
- invent supporting claims
- invent testimonials
- invent statistics
- invent FAQs
- invent judges
- invent prizes
- invent winners
- invent sponsors
- invent event information

You may add ONLY:

- short section eyebrows of approximately 2–4 words
- button labels already explicitly provided
- aria-label values required for accessibility

Where a section requires a one-line lead beneath its heading, use the exact sentence supplied for that section.

Do not create new marketing copy to fill visual space.

Keep the asterisk after "$6,000" exactly as written:

$6,000*

The asterisk refers to the legal text in the footer.

--------------------------------------------------
DEADLINE EXCEPTION
--------------------------------------------------

There is one deliberate exception to the word-for-word rule.

The audition deadline:

"11:59 p.m. PT on Friday, Nov. 6, 2026"

must use the event-builder tokens wherever the deadline appears outside the legal text.

Use:

{{event_hour}}

{{event_timezone}}

{{event_date}}

The legal text in the footer must remain exactly as provided and must NOT replace its hard-coded deadline with event tokens.

--------------------------------------------------
EVENT WIDGETS
--------------------------------------------------

Every "Submit Your Audition" button must use this exact event-submit widget:

<a class="btn btn-primary" href="{{event_submit_entry_url}}">Submit Your Audition</a>

Never replace the href with:

- a real URL
- "#"
- "#submit"
- javascript:
- an invented destination

The event widget placeholder must remain exactly:

{{event_submit_entry_url}}

The deadline in normal page copy must use:

{{event_hour}}

{{event_timezone}}

{{event_date}}

The countdown must use the exact countdown implementation defined later in PART 2.

--------------------------------------------------
OTHER LINKS
--------------------------------------------------

The "Lowe's Has Talent landing page" must use exactly:

https://lowes.sharepoint.com/sites/SMM2026/SitePages/2026LowesHasTalent.aspx

In-page navigation must use these exact section IDs:

#requirements
#include
#before
#submit

Do not create alternative IDs for these sections.

--------------------------------------------------
SECTIONS AND CONTENT
--------------------------------------------------

The sections MUST appear in exactly this order:

1. Header
2. Hero
3. Audition Requirements
4. What to Include in the Audition
5. Before You Audition
6. Submit
7. Footer

Do not add additional sections.

Do not reorder sections.

--------------------------------------------------
1. HEADER
--------------------------------------------------

Required markup root:

<header id="top" class="site-header">

Content:

- Text logo: "Lowe's Has Talent"
- "2027" as a small badge beside the text logo
- No logo image
- Navigation:
  - Requirements → #requirements
  - What to Include → #include
  - Before You Audition → #before
- One primary CTA:
  - Submit Your Audition
  - must use the Submit Entry event widget

Desktop navigation should be visible normally.

At 600px and below:

Use:

<button
  type="button"
  class="menu-toggle"
  aria-label="Open menu"
  aria-expanded="false"
>

The menu-toggle must contain exactly three empty `<span>` elements used to draw the hamburger bars.

JavaScript must:

1. Add the class `js` to `<html>`.
2. Toggle `is-open` on `.site-header`.
3. Update `aria-expanded`.
4. Update the accessible menu label between "Open menu" and "Close menu".
5. Allow navigation to remain visible when JavaScript is disabled.

The collapsed mobile state MUST depend on the `html.js` class.

Required CSS behavior:

html.js .site-header:not(.is-open) .nav-links {
  display: none;
}

This rule must exist inside the 600px media query.

Without JavaScript, `.nav-links` must remain visible.

--------------------------------------------------
2. HERO
--------------------------------------------------

Required root:

<section id="hero" class="section hero">

Desktop:

- two columns
- text on the left
- countdown card on the right

Left column:

Eyebrow:

"Calling all Performers!"

H1:

"Your moment is here. Make your mark in Las Vegas!"

Lead:

"Auditions are open for the 2027 Lowe's Has Talent contest!"

Paragraph:

"Show us what you've got for the chance to take the stage and make your mark at the 2027 Store Managers Meeting, Feb. 3–4 in Las Vegas and compete for the chance to win up to $6,000!*"

Buttons:

1. Submit Your Audition
   - Submit Entry event widget

2. See the requirements
   - class="btn btn-outline"
   - href="#requirements"

Right column:

A white `.countdown-card`.

Heading:

"Auditions close"

Deadline line:

{{event_hour}} {{event_timezone}} on {{event_date}}

Countdown:

- Days
- Hours
- Minutes
- Seconds

The countdown must follow the exact event-widget countdown implementation defined in PART 2.

The countdown itself remains hidden until JavaScript confirms that the event deadline is:

1. valid
2. parseable
3. in the future

The heading and deadline text must ALWAYS remain visible.

Under the hero columns, create a row of exactly three fact cards.

Fact 1:

Value:
"Feb. 3–4, 2027"

Label:
"Store Managers Meeting, Las Vegas"

Fact 2:

Value:
"Up to $6,000*"

Label:
"Prize"

Fact 3:

Value:
"{{event_date}}"

Label:
"Auditions close {{event_hour}} {{event_timezone}}"

Each fact card contains:

- one small inline SVG icon
- one prominent value
- one smaller label

--------------------------------------------------
3. AUDITION REQUIREMENTS
--------------------------------------------------

Required root:

<section id="requirements" class="section requirements">

Section head:

Eyebrow:
"Who can enter"

H2:
"Audition Requirements"

Lead:
"Want to audition for your chance to win? Check out the details below:"

Create exactly five cards.

Desktop:

- 3 cards in the first row
- 2 cards centered in the second row

At mobile:

- 1 column

Each card contains:

- inline SVG icon
- exactly one `<p>` containing the specified copy

Card 1:

"Open to Lowe's eligible associates in the U.S."

Card 2:

"Must be 21 or older to enter"

Card 3:

"Audition videos must be two minutes or less"

Card 4:

"Submit your audition by {{event_hour}} {{event_timezone}} on {{event_date}}"

Card 5:

"Audition solo or as part of a group of up to five (5) eligible Lowe's associates"

The deadline card MUST additionally have:

class="card is-highlight"

Do not create additional requirement copy.

--------------------------------------------------
4. WHAT TO INCLUDE IN THE AUDITION
--------------------------------------------------

Required root:

<section id="include" class="section include">

Section head:

Eyebrow:
"Your submission"

H2:
"What to Include in the Audition"

Lead:
"Talent categories can range from dancing, singing, magic and more!"

Create exactly three numbered cards.

Each card contains:

- large step number
- `<p class="step-number">`
- one `<h3>`

Step 01:

"Full name"

Step 02:

"Job title and company location"

Step 03:

"A talent video"

The numbers must be:

01
02
03

Below the cards, create:

<ul class="category-list">

with four badges:

- Dancing
- Singing
- Magic
- and more.

Each badge must include a small inline SVG icon.

Use appropriate icons such as:

- shoe or music note for Dancing
- microphone for Singing
- magic wand for Magic
- star for "and more"

--------------------------------------------------
5. BEFORE YOU AUDITION
--------------------------------------------------

Required root:

<section id="before" class="section before">

Section head:

Eyebrow:
"Read first"

H2:
"Before you Audition"

Lead:

"Prior to submitting your audition, visit the Lowe's Has Talent landing page to review the contest rules, submission instructions and FAQs, and more."

Within that lead, ONLY the words:

"Lowe's Has Talent landing page"

must be the link.

Use the exact landing-page URL supplied above.

The link must have no custom class.

The landing-page link is an external page and must open in a new tab.

Use:

target="_blank"

and:

rel="noopener noreferrer"

Create exactly one info card:

class="card login-card"

The card contains:

- inline SVG lock icon
- h3:
  "Please note: To log into SharePoint:"
- plain `<ul>` with no class

List item 1:

"Store associates should use their salesID@store.lowes.com and normal password"

The text:

salesID@store.lowes.com

must be inside:

<code>

so it does not become a mail link.

List item 2:

"Corporate and supply chain associates should use their Sales ID and password"

List item 3:

"If you need additional help logging into SharePoint, please speak with your manager"

--------------------------------------------------
6. SUBMIT
--------------------------------------------------

Required root:

<section id="submit" class="section submit">

This must be a full-width CTA band.

Section head:

Eyebrow:
"Showtime"

H2:

"Ready to submit your audition? Click below."

Create a note box:

<p class="submit-note">

It must contain an info icon before the text.

Exact text:

"Please note: Lowe's associates do not need to use their Lowe's login credentials to complete the audition form."

Then create the large CTA:

<a class="btn btn-primary btn-lg" href="{{event_submit_entry_url}}">Submit Your Audition</a>

Then:

<p class="submit-closing">

Exact text:

"We're excited to see the talent you bring to the Lowe's family. Good luck!"

--------------------------------------------------
7. FOOTER
--------------------------------------------------

Required root:

<footer id="footer" class="site-footer">

Include:

- text logo: "Lowe's Has Talent 2027"
- navigation links again
- legal text

The legal text must appear in:

<p class="legal">

and must be reproduced exactly:

"*Contest submission period begins at 8 a.m. ET on Oct. 10, 2026, and ends at 11:59 p.m. PT on Nov. 6, 2026. Open to eligible Lowe's employees of U.S., aged 21 and up. Limit one entry per person. Winners will be notified by early January 2027. Grand Prize Winners will be determined at the 2027 Store Managers Meeting. For Official Rules, including how to participate, prize details and voting guidelines, visit the Lowe's Has Talent landing page. Sponsor: Lowe's Home Centers, LLC."

Inside that legal paragraph, "Lowe's Has Talent landing page" must use the same plain external link as the "Before You Audition" section.

The legal copy itself must not be changed to event tokens.

==================================================
VISUAL STYLE
==================================================

Use the client's existing theme:

Clean white + Lowe's blue + green CTA.

--------------------------------------------------
COLOR TOKENS
--------------------------------------------------

Define these on `:root`:

--brand: #0B5EA8
--brand-dark: #084A85
--cta: #16A34A
--cta-hover: #12873D
--bg: #FFFFFF
--surface: #F5F8FB
--text: #1D2733
--muted: #4F5B67
--line: #E3E7EB
--radius: 6px
--shadow: 0 2px 12px rgba(0, 0, 0, 0.08)

Do not redefine these tokens elsewhere.

Use the variables throughout the stylesheet.

--------------------------------------------------
OVERALL VISUAL DIRECTION
--------------------------------------------------

The design must be:

- clean
- light
- corporate
- modern
- celebratory
- highly readable
- polished

Use alternating:

- white sections
- very light gray `--surface` sections

Do NOT use:

- dark backgrounds
- gradient backgrounds
- glow effects
- decorative stars
- excessive illustrations
- excessive shadows
- neon colors

--------------------------------------------------
HERO VISUALS
--------------------------------------------------

Hero:

- white background
- 4px `--brand` line across the top
- H1 in `--brand`

Countdown card:

- white background
- `--line` border
- `--shadow`
- 6px radius
- countdown number boxes in `--brand`
- white countdown numbers

--------------------------------------------------
SECTION HEADS
--------------------------------------------------

Every section head after the hero uses:

`.section-head`

with:

- eyebrow
- h2.section-title
- p.section-lead

Eyebrow:

- `--brand`
- uppercase
- 12px
- letter-spacing: 0.1em

Section title:

- `--text`

Under the section head, create:

- 48px width
- 3px height
- `--brand`

decorative bar.

Do not create the bar as loose HTML text.

It should be implemented with CSS.

--------------------------------------------------
CARDS
--------------------------------------------------

Cards:

- white background
- `--radius`
- 1px `--line` border
- `--shadow`
- 24px padding
- 3px `--brand` left border

Icons:

- 44px rounded square
- background: #E7F0F9
- SVG strokes: `--brand`

Highlighted deadline card:

- `--brand` background
- white text
- ensure all text and icons maintain sufficient contrast

--------------------------------------------------
BADGES
--------------------------------------------------

Badges:

- `--brand` text
- #E7F0F9 background
- pill shape
- appropriate horizontal and vertical padding

--------------------------------------------------
BUTTONS
--------------------------------------------------

Primary button:

- `--cta` background
- white text
- bold
- 999px radius
- no border

Hover:

- `--cta-hover`

Outline button:

- `--brand` text
- 2px `--brand` border
- transparent/white background

Hover:

- `--brand` background
- white text

Every button must have a visible focus state.

--------------------------------------------------
SUBMIT BAND
--------------------------------------------------

Use:

- solid `--brand` background
- white text
- green primary button

The note box:

- white text
- `--brand-dark` background
- 6px corners

--------------------------------------------------
FOOTER
--------------------------------------------------

Footer:

- white background
- 1px `--line` top border

Legal text:

- 12px
- `--muted`
- must remain readable and meet contrast requirements

--------------------------------------------------
BRAND RESTRICTIONS
--------------------------------------------------

Do NOT use:

- Lowe's logo image
- Lowe's trademark artwork
- copied brand assets

The text logo is sufficient.

The official logo will be added separately by the client in the builder.

--------------------------------------------------
IMAGES
--------------------------------------------------

There must be NO images on this page.

Do not use:

- `<img>`
- CSS `background-image`
- remote images
- stock photos
- image placeholders

Inline SVG icons are allowed.

--------------------------------------------------
FONTS
--------------------------------------------------

Use:

Quicksand

Weights:

- 400
- 500
- 600
- 700

Load it using exactly one Google Fonts stylesheet link.

Quicksand must be used for the entire page.

Headings:

font-weight: 700

Body:

font-weight: 500

Do not load any additional font family.

==================================================
RESPONSIVE REQUIREMENTS
==================================================

Design around a 1300px desktop viewport.

--------------------------------------------------
DESKTOP
--------------------------------------------------

At approximately 1300px:

Hero:

- two columns
- text left
- countdown right

Fact cards:

- 3 columns

Requirements:

- 3-column grid
- first row: 3 cards
- second row: 2 centered cards

--------------------------------------------------
TABLET — max-width: 992px
--------------------------------------------------

At `max-width: 992px`:

- hero stacks
- countdown moves below hero text
- grids reduce to 2 columns where appropriate
- spacing becomes slightly tighter
- typography scales appropriately

--------------------------------------------------
MOBILE — max-width: 600px
--------------------------------------------------

At `max-width: 600px`:

- every major grid becomes 1 column
- mobile navigation activates
- nav links collapse behind the menu toggle
- buttons become full width
- hero becomes one column
- cards become one column
- requirement cards become one column
- category badges wrap naturally
- countdown remains a 4-column row
- countdown numbers become smaller
- horizontal padding becomes smaller
- no horizontal scrolling is allowed

The page must work correctly at 375px width.

Do not create a special 375px breakpoint unless absolutely necessary.

Prefer fluid sizing.

==================================================
ACCESSIBILITY
==================================================

The page must be accessible.

Rules:

- exactly one `<h1>`
- hero contains the `<h1>`
- all other major sections use `<h2>`
- cards/subsections use `<h3>`
- never use heading tags merely for visual size
- all interactive elements must be keyboard accessible
- focus states must be visible
- all SVG icons must use `aria-hidden="true"`
- buttons must have meaningful labels
- links must have meaningful labels
- no color-only communication
- no inaccessible hover-only interaction

Text contrast must be at least 4.5:1 wherever possible, including:

- body text
- muted text
- legal copy
- buttons
- highlighted cards
- CTA band
- links

Focus style:

```css
outline: 2px solid var(--brand);
outline-offset: 3px;
````

Use `:focus-visible` where appropriate.

==================================================
PART 2: BUILDER RULES
=====================

## OUTPUT FORMAT

Return exactly ONE `html` code block containing the entire document.

The final output must contain:

* `<!doctype html>`
* `<html lang="en">`
* `<head>`
* `<body>`

Do not provide anything before or after the HTML code block.

No explanation.

No Markdown outside the HTML code block.

No second code block.

---

## CSS

All CSS must exist inside ONE `<style>` element in `<head>`.

Do not use:

* external CSS files
* additional `<style>` blocks
* inline `style=""` attributes

---

## JAVASCRIPT

All JavaScript must exist inside ONE `<script>` element immediately before `</body>`.

Do not use:

* external JS
* `<script src>`
* inline event attributes

---

## EXTERNAL DEPENDENCIES

Allowed external dependency:

* Google Fonts only

Do not use:

* React
* Vue
* Angular
* Svelte
* Tailwind
* Bootstrap
* jQuery
* GSAP
* Swiper
* Slick
* Font Awesome
* Material Icons
* Lucide
* icon libraries
* component libraries
* JavaScript frameworks
* CSS frameworks

No npm/build process is allowed.

The file must work by itself after import.

==================================================
EXACT DOCUMENT SKELETON
=======================

Use this structural model:

<!doctype html>

<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>Lowe's Has Talent 2027 – Auditions Are Open</title>

  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap">

  <style>

    /* 1. Tokens */

    /* 2. Base */

    /* 3. Layout */

    /* 4. Components */

    /* 5. Sections */

    /* 6. Responsive */

  </style>

</head>

<body>

  <header id="top" class="site-header">
    ...
  </header>

  <section id="hero" class="section hero">
    ...
  </section>

  <section id="requirements" class="section requirements">
    ...
  </section>

  <section id="include" class="section include">
    ...
  </section>

  <section id="before" class="section before">
    ...
  </section>

  <section id="submit" class="section submit">
    ...
  </section>

  <footer id="footer" class="site-footer">
    ...
  </footer>

  <script>
    (function () {
      'use strict';

      // Menu
      // Countdown
      // Smooth scroll

    })();
  </script>

</body>
</html>

==================================================
CSS ORGANIZATION
================

CSS MUST be divided into exactly six groups and appear in this order:

1. Tokens
2. Base
3. Layout
4. Components
5. Sections
6. Responsive

Do not put responsive CSS earlier.

Do not scatter media queries throughout the stylesheet.

Use comments identifying each group.

---

## TOKENS

Define the design system once on `:root`.

Use CSS custom properties.

Do not redefine the same token multiple times unless it is intentionally overridden in a responsive context.

---

## BASE

The body must own:

* background
* color
* font-family
* font-size
* line-height

Do NOT set:

html {
font-size: ...
}

Use a global box-sizing rule.

Reset only what is necessary.

Do not aggressively reset every browser default.

---

## LAYOUT

Define reusable layout classes such as:

.container
.section
.section-head
.eyebrow
.section-title
.section-lead
.grid
.grid-2
.grid-3
.grid-4

Container:

* max-width: 1200px
* width: 100%
* margin: 0 auto
* horizontal padding: 24px

Use CSS Grid/Flexbox.

Do not use floats.

Do not use absolute positioning for primary layout.

---

## COMPONENTS

Define reusable styles for:

.btn
.btn-primary
.btn-outline
.btn-lg
.card
.badge
.countdown
.countdown-card
.menu-toggle
.nav-links
.category-list
.step-number
.submit-note

Do not create unnecessarily duplicated button/card styles.

---

## SECTIONS

Section-specific CSS must appear in page order:

.site-header
.hero
.requirements
.include
.before
.submit
.site-footer

---

## RESPONSIVE

Only these breakpoints:

@media (max-width: 992px)

@media (max-width: 600px)

Do not use:

* `and`
* comma-separated media queries
* orientation media queries
* hover media queries

for layout.

==================================================
HTML STRUCTURE RULES
====================

1. Direct children of `<body>` must be:

* `<header>`
* `<section>`
* `<footer>`
* `<script>`

Do not wrap the entire page in a parent `<div>`.

Do not add `<main>` around the sections.

2. Every section must have:

* unique ID
* descriptive class
* `.container`

3. Use semantic HTML.

4. Use `<div>` only when a generic layout wrapper is appropriate.

5. Use `<article>` for independent cards when appropriate.

6. Use `<ul>`/`<li>` for lists.

7. Use `<nav>` for navigation.

8. Use `<figure>` only when there is actual figure content.

9. Do not leave important visible text loose inside generic `<div>` elements.

10. Never put block elements inside `<p>`.

==================================================
INLINE TEXT RULES
=================

Inside text content, only use simple inline elements when necessary:

* `<strong>`
* `<em>`
* `<b>`
* `<i>`
* `<u>`
* `<br>`
* `<code>`
* `<mark>`
* `<a>`

Do NOT use `<span>` inside paragraphs/headings/list items for decorative styling.

Do not attach unnecessary classes or IDs to inline elements.

If an entire paragraph needs styling, style the paragraph itself.

==================================================
CLASS NAMING
============

Use lowercase kebab-case.

Examples:

.card
.card-icon
.card-title
.card-text
.is-highlight
.is-open

Do not use:

Card
card_title
cardTitle
CARD
random1
boxA

States must be separate classes.

Examples:

.is-open
.is-highlight

Do not encode state into class names such as:

.open-card
.highlighted-card

unless the class represents a genuine component variation.

==================================================
SHARED CLASSES
==============

Reuse these classes wherever applicable:

.container
.section
.section-head
.eyebrow
.section-title
.section-lead
.grid
.grid-2
.grid-3
.grid-4
.card
.btn
.btn-primary
.btn-outline
.badge

Do not create unnecessary alternatives such as:

.main-container
.primary-button
.blue-button
.special-card
.card-one
.card-two

unless a genuine component variation requires one.

==================================================
SECTION HEADING SYSTEM
======================

Every section after the hero must use:

<div class="section-head">

containing:

<p class="eyebrow">...</p>
<h2 class="section-title">...</h2>
<p class="section-lead">...</p>

Only the hero contains `<h1>`.

The eyebrow must not replace the semantic heading.

==================================================
BUTTON RULES
============

Normal navigation:

<a href="...">

Primary CTA:

<a class="btn btn-primary" href="...">

Outline CTA:

<a class="btn btn-outline" href="...">

Large CTA:

<a class="btn btn-primary btn-lg" href="...">

Buttons must contain plain text only.

Do NOT put:

* `<span>`
* `<svg>`
* icons
* nested elements

inside CTA buttons unless explicitly required by Part 1.

Use `<button type="button">` only for JavaScript controls.

==================================================
FORM RULE
=========

There is NO form on this page.

Do not create:

<form>
<input>
<select>
<textarea>

The actual audition form is external and accessed through the event-submit widget.

==================================================
FORBIDDEN HTML
==============

Do not use:

<object>
<embed>
<noscript>
<iframe>
<iframe srcdoc>
<canvas>

Do not use inline event handlers such as:

onclick=""
onchange=""
onsubmit=""
onload=""

All behavior must be attached from JavaScript.

==================================================
CONTENT VISIBILITY
==================

The visual page builder may inspect the HTML without running JavaScript.

Therefore all important content must exist in the initial HTML.

Do NOT hide normal content on initial load with:

display: none
visibility: hidden
opacity: 0
max-height: 0

Important content must not depend on JavaScript to appear.

The only allowed hidden states are intentional interactive states controlled by JavaScript, such as:

* mobile navigation
* countdown before validation
* the `hidden` attribute on the countdown target

==================================================
MOBILE MENU
===========

JavaScript must add:

document.documentElement.classList.add('js');

The menu must use:

.site-header.is-open

as its open state.

The mobile closed state must be:

html.js .site-header:not(.is-open) .nav-links {
display: none;
}

Do not use inline styles.

Do not set:

element.style.display = ...

Use classes instead.

Update:

aria-expanded="false"

to:

aria-expanded="true"

when opened.

==================================================
HEADER
======

The header must use:

position: sticky;
top: 0;

Do NOT use:

position: fixed;

The header must not obscure content.

Give the header an appropriate z-index and background so content does not visually bleed through it.

==================================================
LINK RULES
==========

In-page navigation:

#requirements
#include
#before
#submit

must remain normal anchors.

External links inside paragraphs should open in a new tab.

External links must use:

target="_blank"
rel="noopener noreferrer"

Do not add classes to the "Lowe's Has Talent landing page" link.

==================================================
EVENT WIDGET RULES
==================

Submit CTA EXACTLY:

<a class="btn btn-primary" href="{{event_submit_entry_url}}">Submit Your Audition</a>

Large submit CTA EXACTLY:

<a class="btn btn-primary btn-lg" href="{{event_submit_entry_url}}">Submit Your Audition</a>

Never alter:

{{event_submit_entry_url}}

Do not encode or escape the curly braces.

Do not replace the placeholder with any URL.

No registration widget is required on this page.

==================================================
COUNTDOWN WIDGET
================

Required markup:

<div class="countdown" id="countdown" hidden>

It must contain four number elements with exactly these IDs:

countdown-days
countdown-hours
countdown-minutes
countdown-seconds

Initial values:

00

The target must be:

<p class="countdown-target" id="countdown-target" hidden>{{event_date}}T{{event_hour}}{{event_timezone_offset}}</p>

JavaScript must:

1. Select `#countdown-target`.
2. Read its `textContent`.
3. Parse it with `Date.parse`.
4. Confirm the result is a valid timestamp.
5. Confirm the deadline is in the future.
6. Only then remove the `hidden` attribute from `#countdown`.
7. Update the four number elements every second.
8. Update them using `textContent`.
9. Stop or safely handle the countdown when the deadline is reached.
10. Never hard-code the event date in JavaScript.

If the date is invalid or already expired:

* keep `#countdown` hidden
* do not display fake countdown values

Do not derive the target from a hard-coded date.

==================================================
JAVASCRIPT RULES
================

Use one IIFE:

(function () {
'use strict';

...

})();

JavaScript should be small and focused.

Only implement:

* mobile menu
* countdown
* smooth scrolling

No other functionality is required.

Do not use:

document.write()
eval()
new Function()
innerHTML
outerHTML
localStorage
sessionStorage
cookies
fetch()
XMLHttpRequest()
WebSocket()

Do not make network requests.

==================================================
DOM SELECTION
=============

Use:

document.getElementById()

or:

document.querySelector()

or:

document.querySelectorAll()

Use complete literal strings.

Good:

document.querySelector('.menu-toggle')

document.getElementById('countdown-days')

Bad:

document.querySelector('.' + component)

document.querySelector('.box-' + index)

Do not dynamically construct selectors.

==================================================
DOM MUTATION
============

Prefer:

classList.add()
classList.remove()
classList.toggle()
setAttribute()
removeAttribute()
textContent

Do not write inline styles from JavaScript.

Bad:

element.style.display = 'none';

Good:

element.classList.add('is-open');

==================================================
NO DYNAMIC HTML
===============

Never generate structural HTML with JavaScript.

Do not use:

innerHTML

Do not create:

<div class="...">

through strings.

All structural content must already exist in the HTML.

==================================================
SMOOTH SCROLL
=============

In-page navigation may use smooth scrolling.

CSS may define:

html {
scroll-behavior: smooth;
}

or JavaScript may enhance anchor behavior.

Do not interfere with normal anchor navigation.

The page must still work if JavaScript is disabled.

==================================================
CSS RULES
=========

Define design tokens once.

Use:

var(--brand)
var(--brand-dark)
var(--cta)
var(--cta-hover)
var(--bg)
var(--surface)
var(--text)
var(--muted)
var(--line)
var(--radius)
var(--shadow)

Do not duplicate the same color values throughout the stylesheet.

---

## SIZING

Use:

px
rem
%
max-width
min()
max()
clamp()

Avoid:

100vh
100vw

for normal page sections.

Use padding to establish vertical rhythm.

---

## SPECIFICITY

Prefer simple class selectors.

Good:

.card
.hero-title
.btn-primary

Avoid deep selectors such as:

.page .section .container .card article h3

Avoid unnecessarily high specificity.

Never use:

!important

==================================================
HOVER AND FOCUS
===============

All interactive links and buttons must have:

* hover state
* focus-visible state

Cards may have subtle hover treatment when appropriate.

Transitions must be subtle:

0.2s–0.3s

Do not animate layout properties unnecessarily.

==================================================
RESPONSIVE CSS
==============

Desktop first.

Then:

@media (max-width: 992px)

Then:

@media (max-width: 600px)

No other layout breakpoints.

At 600px:

buttons must become full width.

The mobile menu must activate.

The page must remain usable at 375px.

No horizontal overflow.

==================================================
ACCESSIBILITY DETAILS
=====================

Every SVG must include:

aria-hidden="true"

unless an SVG genuinely conveys essential information, in which case it must be made accessible appropriately.

Menu toggle:

aria-label="Open menu"

aria-expanded="false"

When opened:

aria-expanded="true"

and label:

"Close menu"

Focus:

outline: 2px solid var(--brand);
outline-offset: 3px;

Use:

:focus-visible

for keyboard focus.

Do not remove default focus without replacing it.

==================================================
CONTENT FIDELITY
================

The supplied client copy is authoritative.

Before returning the HTML, verify:

* every required sentence exists
* every required sentence is unchanged
* every date is correct
* every amount is correct
* every condition is correct
* every asterisk is preserved
* event tokens are used in the correct places
* legal copy remains unchanged
* no invented copy has been introduced

Do not "improve" the client's wording.

Do not correct grammar unless explicitly instructed.

Do not replace apostrophes.

Do not replace the en dash in:

Feb. 3–4

with a hyphen.

==================================================
FINAL VALIDATION
================

Before outputting the document, internally verify all of the following.

HTML:

* complete document
* valid doctype
* lang="en"
* correct title
* exactly one h1
* correct h2/h3 hierarchy
* no duplicate IDs
* correct section order
* semantic markup
* no invalid nesting
* no block element inside `<p>`

Builder:

* direct body children are correct
* sections are independently editable
* no unnecessary wrapper around the whole page
* all important content exists in HTML
* no dynamic structural HTML
* classes are predictable
* CSS is easy to edit

CSS:

* exactly one `<style>`
* six CSS groups in correct order
* tokens defined once
* no `!important`
* no inline styles
* no unnecessary specificity
* desktop layout works
* tablet layout works
* mobile layout works
* no horizontal overflow
* focus styles exist

JavaScript:

* exactly one `<script>`
* script is at the end of body
* IIFE
* strict mode
* no inline handlers
* no innerHTML
* no eval
* no document.write
* no network requests
* no localStorage/cookies
* only menu/countdown/smooth-scroll behavior
* page remains usable without JavaScript

Event widgets:

* every Submit Your Audition CTA uses `{{event_submit_entry_url}}`
* no fake CTA URLs
* deadline uses event tokens
* countdown uses event tokens
* countdown does not contain a hard-coded date

Visual:

* no images
* no gradients
* no dark sections
* no glow
* no decorative stars
* correct Lowe's blue
* correct green CTA
* correct white/light-gray backgrounds
* correct card styling
* correct button styling
* correct Quicksand font
* consistent spacing
* polished visual hierarchy

Accessibility:

* one h1
* logical heading order
* visible focus states
* accessible mobile menu
* aria-expanded updates correctly
* SVGs are aria-hidden
* sufficient contrast
* keyboard-accessible controls

==================================================
FINAL OUTPUT
============

Generate the complete webpage now.

Do not explain anything.

Do not provide implementation notes.

Do not provide a summary.

Do not provide multiple versions.

Return ONLY ONE complete `html` code block containing the finished document.



