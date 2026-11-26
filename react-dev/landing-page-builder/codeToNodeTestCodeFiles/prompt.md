
You are a senior front-end developer, creative web designer, UX designer, and event-branding specialist.

Build a complete, production-quality, visually impressive event landing page for **“Eain Mat Sone Yar”** using only **HTML, CSS, and vanilla JavaScript**.

The final webpage must feel like a premium, emotionally engaging, modern Myanmar event website—not a generic corporate template.

The design should communicate the atmosphere, purpose, identity, cultural/emotional character, and story of “Eain Mat Sone Yar” while giving visitors a clear and intuitive path to:

1. Understand what the event is.
2. Understand why it matters.
3. Explore the event's important information and highlights.
4. Discover relevant people, activities, categories, schedules, or benefits where applicable.
5. Find answers to common questions.
6. Take the primary event action easily.

The HTML will be pasted directly into a visual page builder's **“Import HTML”** feature. The builder converts the HTML structure into editable visual blocks.

Therefore, the HTML structure is extremely important.

Do not optimize only for a browser. Optimize the document structure for **human readability, visual editing, block extraction, accessibility, responsive behavior, and predictable rendering inside a visual page builder.**

==================================================
PART 1 — PAGE BRIEF
==================================================

## The page

- Event name: **Eain Mat Sone Yar**
- Purpose: [DEFINE THE PRIMARY PURPOSE OF THE EVENT PAGE]
- Audience: [DEFINE THE PRIMARY AUDIENCE]
- Primary action: [DEFINE THE PRIMARY CTA]
- Secondary action: [DEFINE THE SECONDARY CTA, IF ANY]
- Sections, in order:
  [DEFINE THE EXACT SECTION ORDER]

Example:

header/nav
hero
about
event highlights
categories
timeline
participants / speakers / judges
prizes / benefits
FAQ
CTA band
footer

- Visual style:
  [DEFINE THE VISUAL DIRECTION]

Example:
“premium Myanmar-inspired editorial design with warm colors, elegant typography, cinematic spacing, subtle cultural details, and a contemporary digital aesthetic”

- Fonts:
  [DEFINE THE REQUIRED GOOGLE FONTS]

- Color palette:
  [DEFINE PRIMARY, SECONDARY, BACKGROUND, TEXT, ACCENT COLORS]

- Image direction:
  [DEFINE WHETHER IMAGES ARE ALLOWED AND WHAT TYPE]

- Overall mood:
  [DEFINE EMOTIONAL CHARACTER]

Example:
“warm, hopeful, nostalgic, intimate, cinematic, youthful, and culturally authentic”

IMPORTANT:

Part 1 contains the project-specific requirements.

Treat every requirement in Part 1 as authoritative.

Do not replace, reinterpret, remove, or contradict Part 1 requirements unless explicitly instructed.

Part 2 defines the implementation rules that must be followed while building the page.

==================================================
PART 2 — NON-NEGOTIABLE OUTPUT RULES
==================================================

## 2.1 Final response format

Return **exactly ONE `html` code block** containing the complete webpage.

The output must begin with:

<!doctype html>

and contain:

<html>
<head>
...
</head>
<body>
...
</body>
</html>

Do not provide:

- explanations
- comments outside the HTML
- Markdown outside the HTML code block
- design explanations
- implementation notes
- setup instructions
- alternative versions
- multiple code blocks

The final response must contain only:

```html
[complete HTML document]
````

==================================================
PART 3 — DOCUMENT REQUIREMENTS
==============================

## 3.1 Complete HTML document

Generate a complete standalone HTML document.

Required structure:

<!doctype html>

<html lang="en">
<head>
  ...
</head>
<body>
  ...
  <script>
    ...
  </script>
</body>
</html>

Use:

<html lang="en">

unless Part 1 explicitly requires another language.

If the page contains substantial Myanmar/Burmese copy, ensure the chosen Google Font supports the required Myanmar characters.

## 3.2 Head requirements

The `<head>` should contain:

* charset
* viewport
* descriptive title
* optional meta description
* Google Font imports
* one `<style>` element containing all CSS

Example:

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Eain Mat Sone Yar</title>

Do not add unnecessary metadata.

## 3.3 CSS location

All CSS must exist inside **one single `<style>` element in `<head>`**.

Do not create:

* multiple `<style>` blocks
* inline `style=""` attributes
* external CSS files

## 3.4 JavaScript location

All JavaScript must exist inside **one single `<script>` element immediately before `</body>`**.

Do not use:

* multiple JavaScript blocks
* inline JavaScript attributes
* external JavaScript files

==================================================
PART 4 — EXTERNAL RESOURCES
===========================

## 4.1 Allowed external resources

Only use external resources when they are explicitly permitted by Part 1.

Allowed:

* Google Fonts
* reliable image URLs when images are required
* HTTPS CDN resources only when absolutely necessary

Prefer a completely self-contained implementation.

Do not depend on external JavaScript libraries unless the requirement genuinely cannot be implemented cleanly with vanilla JavaScript.

## 4.2 Framework restrictions

Do NOT use:

* React
* Vue
* Angular
* Svelte
* Next.js
* Nuxt
* Bootstrap
* Tailwind
* jQuery
* Alpine.js
* GSAP
* Swiper
* Slick
* Foundation
* Materialize
* component libraries
* CSS frameworks
* UI kits
* template frameworks

The page must be implemented using:

* semantic HTML
* CSS
* vanilla JavaScript

## 4.3 No build process

The document must work immediately when pasted into the visual page builder.

Do not require:

* npm
* package installation
* bundlers
* transpilers
* Sass
* Less
* TypeScript
* build commands
* environment variables

==================================================
PART 5 — VISUAL PAGE BUILDER STRUCTURE
======================================

The page builder converts HTML structure into editable blocks.

Therefore, keep the DOM intentionally clean and predictable.

## 5.1 Body structure

The direct children of `<body>` must be:

1. `<header>`
2. one `<section>` for each major content area
3. `<footer>`
4. one `<script>`

Do NOT wrap the entire page inside:

```html
<div class="page">
```

or:

```html
<main>
```

unless Part 1 explicitly requires `<main>`.

Prefer:

<body>

  <header>...</header>

  <section id="hero">...</section>

  <section id="about">...</section>

  <section id="highlights">...</section>

  <section id="faq">...</section>

  <footer>...</footer>

  <script>...</script>

</body>

## 5.2 One major section = one block

Every major page area must be represented by its own `<section>`.

Do not combine unrelated page areas into one enormous section.

Do not create unnecessary wrapper sections.

## 5.3 Section IDs

Every major section must have a unique, descriptive, lowercase ID.

Examples:

id="hero"
id="about"
id="highlights"
id="schedule"
id="judges"
id="prizes"
id="faq"
id="register"

IDs must:

* be unique
* use lowercase
* use kebab-case when multiple words are required
* describe the section's purpose

Examples:

id="event-highlights"
id="judging-panel"
id="event-schedule"

Never use:

* id="section1"
* id="box"
* id="content"
* id="abc"

unless genuinely appropriate.

==================================================
PART 6 — CONTAINER AND LAYOUT SYSTEM
====================================

Use a consistent container system throughout the page.

Required base container:

```html
<div class="container">
  ...
</div>
```

Recommended CSS:

```css
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}
```

All major section content should normally live inside `.container`.

Do not randomly change container widths between sections unless there is a clear design reason.

## 6.1 Layout

Use:

* CSS Grid
* Flexbox

for primary layouts.

Do NOT use:

* floats
* table layouts
* excessive absolute positioning
* negative-position hacks
* manually positioned pixel-based layouts

Absolute positioning may only be used for:

* decorative elements
* background ornaments
* badges
* controlled visual overlays
* non-essential visual effects

Never use absolute positioning as the primary page layout system.

==================================================
PART 7 — SEMANTIC HTML
======================

Use semantic HTML wherever appropriate.

Use:

* `<header>`
* `<nav>`
* `<section>`
* `<footer>`
* `<article>`
* `<figure>`
* `<figcaption>`
* `<ul>`
* `<ol>`
* `<li>`
* `<h1>`–`<h6>`
* `<p>`
* `<a>`
* `<button>`
* `<details>`
* `<summary>`

Avoid unnecessary generic containers.

Use `<div>` primarily for layout wrappers.

## 7.1 Heading hierarchy

The page must have exactly **one `<h1>`**.

The hierarchy should normally be:

<h1>
  Hero title
</h1>

<h2>
  Section title
</h2>

<h3>
  Card/subsection title
</h3>

Do not skip heading levels purely for visual sizing.

Use CSS to control appearance instead.

## 7.2 Text

Never place important visible text directly inside a generic `<div>` when a semantic text element is appropriate.

Bad:

```html
<div>Welcome to the event</div>
```

Prefer:

```html
<p>Welcome to the event</p>
```

or an appropriate heading.

## 7.3 Paragraph rules

Do not place block elements inside `<p>`.

Never do:

```html
<p>
  Some text
  <div>...</div>
</p>
```

==================================================
PART 8 — INLINE TEXT RULES
==========================

Inside headings, paragraphs, list items, and other text content, use only simple inline elements when necessary.

Allowed:

* `<strong>`
* `<em>`
* `<b>`
* `<i>`
* `<u>`
* `<br>`
* `<code>`
* `<mark>`
* `<a>`

Avoid `<span>` for arbitrary styling.

Do not place classes or IDs on inline text elements unless absolutely required for accessibility or functionality.

Do not create excessive inline wrappers.

If an entire heading needs special styling, give the heading itself a class.

==================================================
PART 9 — CLASS NAMING SYSTEM
============================

Use lowercase kebab-case class names.

Examples:

```text
hero
hero-content
hero-title
hero-description
section-head
section-title
section-lead
event-card
event-card-title
btn
btn-primary
btn-outline
faq-item
faq-question
faq-answer
```

Avoid:

```text
HeroTitle
hero_title
heroTitle
HERO-TITLE
randomBox
box1
style2
```

## 9.1 Reusable classes

Create and reuse shared classes instead of creating unique CSS for every element.

At minimum, when relevant, use reusable classes such as:

```text
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
```

Do not create duplicate styles under multiple unnecessary class names.

==================================================
PART 10 — SECTION STRUCTURE
===========================

After the hero, sections should generally follow a consistent structure.

Recommended:

```html
<section id="about" class="section section-about">
  <div class="container">

    <div class="section-head">
      <p class="eyebrow">...</p>
      <h2 class="section-title">...</h2>
      <p class="section-lead">...</p>
    </div>

    ...
  </div>
</section>
```

The `.section-head` should normally contain:

1. eyebrow
2. section title
3. section lead

Do not force `.section-head` into sections that genuinely do not need it, such as a highly visual CTA band, unless Part 1 specifically requires it.

The hero is the only section that should normally contain the page's `<h1>`.

==================================================
PART 11 — HERO SECTION
======================

The hero should feel visually distinct from the rest of the page.

It should normally contain:

* event identity
* eyebrow or supporting label where appropriate
* one primary `<h1>`
* concise supporting copy
* primary CTA
* optional secondary CTA
* optional event metadata
* optional visual treatment

Do not overload the hero with excessive text.

The primary CTA must be visually obvious.

The hero must remain usable on mobile.

Do not rely on `100vh` for the hero height.

Use responsive padding instead.

==================================================
PART 12 — BUTTONS AND CTA RULES
===============================

Use anchors for navigation and event actions.

Example:

```html
<a class="btn btn-primary" href="#register">Register Now</a>
```

CTA anchors must contain plain text.

Do not put decorative icons or `<span>` elements inside CTA anchors unless Part 1 explicitly requires them.

Use:

```html
<button type="button">
```

only for actual JavaScript controls such as:

* mobile navigation toggle
* tabs
* expandable controls
* custom UI controls

Do not use `<button>` for normal navigation.

Every button must have a clear purpose.

==================================================
PART 13 — LINKS
===============

Use `<a>` for:

* navigation
* section jumps
* external pages
* event actions
* downloads

Use:

```html
href="#section-id"
```

for in-page navigation.

Use full HTTPS URLs for external destinations.

If an external link opens a new tab, use:

```html
target="_blank"
rel="noopener noreferrer"
```

Do not create fake links using:

```html
href="#"
```

unless JavaScript behavior specifically requires it.

Do not use JavaScript-only navigation when a normal anchor can perform the same task.

==================================================
PART 14 — FORMS
===============

Forms are allowed only when required by Part 1.

If a form is included:

Every input must have:

* `<label>`
* `for`
* matching `id`
* `name`

Use appropriate input types.

Example:

```html
<label for="email">Email address</label>
<input id="email" name="email" type="email">
```

Do not create inaccessible unlabeled fields.

If the visual page builder provides the real event submission system, do not invent a fake backend.

Do not pretend a form has been submitted to a server when no backend exists.

If a demonstration-only form is explicitly required, prevent default submission and display a clearly labeled client-side confirmation.

==================================================
PART 15 — EVENT-SPECIFIC CTA PLACEHOLDERS
=========================================

When the project uses event registration/submission infrastructure, preserve the exact event placeholders supplied by the project specification.

Never replace an event placeholder with a fake URL.

For example, if provided:

```html
<a class="btn btn-primary" href="{{event_register_url}}">Register Now</a>
```

keep the placeholder exactly as provided.

Do not modify:

* placeholder names
* braces
* capitalization
* URL structure

The same rule applies to event dates, times, deadlines, countdown targets, and other builder-provided tokens.

==================================================
PART 16 — IMAGES
================

Follow the image requirements in Part 1 exactly.

If images are required:

* use reliable HTTPS URLs
* never invent a fake image path
* provide meaningful `alt` text
* include `width` and `height` attributes
* use CSS for responsive sizing
* use `object-fit: cover` where appropriate

For placeholder images, use:

```text
https://picsum.photos/seed/<one-word>/<width>/<height>
```

Example:

```text
https://picsum.photos/seed/event/1200/700
```

Do not repeatedly reuse the same random image for unrelated content.

Do not use broken or speculative image URLs.

If Part 1 says images are not allowed, do not add images.

==================================================
PART 17 — ICONS
===============

Use inline SVG icons only.

Every decorative SVG should include:

```html
aria-hidden="true"
```

Icons must not be the only indication of meaning.

Do not use:

* icon fonts
* Font Awesome
* Material Icons
* Lucide packages
* external SVG libraries
* remote icon kits

Do not use emoji as replacement icons unless Part 1 explicitly asks for them.

==================================================
PART 18 — CSS ARCHITECTURE
==========================

Organize CSS into exactly these logical groups, in this order:

1. Tokens
2. Base
3. Layout
4. Components
5. Sections
6. Responsive

Example:

```css
/* ========================================
   TOKENS
======================================== */

/* ========================================
   BASE
======================================== */

/* ========================================
   LAYOUT
======================================== */

/* ========================================
   COMPONENTS
======================================== */

/* ========================================
   SECTIONS
======================================== */

/* ========================================
   RESPONSIVE
======================================== */
```

Keep the CSS easy for a visual page builder user to inspect and edit.

==================================================
PART 19 — DESIGN TOKENS
=======================

Define the main design system once on `:root`.

Example:

```css
:root {
  --bg: #ffffff;
  --surface: #f7f7f7;
  --text: #111111;
  --muted: #666666;
  --accent: #d9a441;
  --accent-strong: #b78320;
  --border: #e5e5e5;
  --radius: 16px;
  --shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}
```

Use CSS variables throughout the stylesheet.

Do not repeatedly hard-code the same colors, radii, or shadows.

Part 1's actual colors override these examples.

==================================================
PART 20 — BASE CSS
==================

The `body` should own:

* background color
* text color
* font family
* base font size
* line height

Do not use:

```css
html {
  font-size: ...;
}
```

Do not globally override browser behavior unnecessarily.

Use:

```css
* {
  box-sizing: border-box;
}
```

where appropriate.

Images should normally use:

```css
img {
  display: block;
  max-width: 100%;
}
```

==================================================
PART 21 — TYPOGRAPHY
====================

Typography must follow Part 1 exactly.

Use the specified Google Fonts.

Create a clear hierarchy between:

* eyebrow
* hero title
* section titles
* subsection titles
* body text
* metadata
* buttons

Avoid excessive font sizes.

Use `clamp()` for major responsive headings where appropriate.

Do not use more than the required number of font families.

Typography should remain readable on small screens.

==================================================
PART 22 — SPACING SYSTEM
========================

Use a consistent spacing rhythm.

Major sections should normally use generous vertical padding, for example:

```css
padding: 96px 0;
```

but adjust based on the visual requirements of Part 1.

Avoid arbitrary spacing values everywhere.

Use consistent:

* section spacing
* card gaps
* heading margins
* paragraph spacing
* button spacing
* grid gaps

The page should feel like one cohesive design system.

==================================================
PART 23 — RESPONSIVE DESIGN
===========================

Design desktop-first around approximately 1300px.

Use only these primary responsive breakpoints:

```css
@media (max-width: 992px)
```

and:

```css
@media (max-width: 600px)
```

Do not create many unnecessary breakpoints.

Do not use:

* `and`
* comma-separated media queries
* orientation queries
* hover-based layout queries

for the primary responsive layout system.

## 23.1 Tablet

At 992px and below:

* reduce column counts where necessary
* reduce large spacing
* adjust typography
* simplify complex grids
* ensure navigation remains usable

## 23.2 Mobile

At 600px and below:

* use single-column layouts where appropriate
* make buttons touch-friendly
* reduce horizontal padding
* reduce heading sizes
* stack content logically
* ensure no horizontal overflow
* ensure images remain responsive
* ensure navigation remains accessible

Never simply shrink the desktop design.

Recompose layouts where necessary.

==================================================
PART 24 — HEIGHT AND WIDTH RULES
================================

Avoid:

```css
width: 100vw;
height: 100vh;
```

for normal page sections.

Prefer:

```css
width: 100%;
```

and responsive padding.

Do not create sections that accidentally cause horizontal scrolling.

Ensure:

```css
overflow-x: hidden;
```

is not used as a lazy fix for broken layout.

Fix the underlying layout problem instead.

==================================================
PART 25 — POSITIONING
=====================

Do not use absolute positioning for primary layout.

Allowed uses:

* decorative circles
* background shapes
* floating badges
* controlled overlays
* visual ornaments

Do not position important text or content using arbitrary `top`, `left`, `right`, or `bottom` values.

The page must naturally reflow when content changes.

==================================================
PART 26 — HEADER AND NAVIGATION
===============================

The header should use:

```css
position: sticky;
top: 0;
```

Do not use `position: fixed` for the main header.

The header must:

* remain accessible
* have sufficient contrast
* work on mobile
* not cover the first section
* have clear navigation labels

If a mobile menu is required:

* use a real `<button type="button">`
* provide an accessible label
* toggle a class
* do not inject the menu with JavaScript
* keep the menu markup present in the HTML

The page should still expose navigation content when JavaScript is unavailable.

==================================================
PART 27 — INTERACTIVE CONTENT
=============================

All important content must exist in the initial HTML.

Do not generate essential page content dynamically with JavaScript.

Do not require JavaScript for:

* reading the event information
* reading section content
* reading FAQ answers
* viewing important CTA content
* understanding the event

JavaScript should enhance the page rather than create the page.

==================================================
PART 28 — FAQ
=============

For FAQs, prefer native HTML:

```html
<details class="faq-item">
  <summary>Question</summary>
  <p>Answer</p>
</details>
```

This provides built-in accessibility and works without JavaScript.

Do not create a JavaScript-only FAQ when `<details>` can solve the requirement.

==================================================
PART 29 — TABS
==============

If tabs are required:

* all tab content must exist in the HTML
* inactive panels may use the `hidden` attribute
* JavaScript should toggle the `hidden` state
* active state should be communicated visually
* keyboard interaction must remain usable

Do not remove panel content from the DOM.

==================================================
PART 30 — SCROLL REVEAL
=======================

Animations must never make content inaccessible.

All content must start visible when JavaScript is disabled.

If scroll-reveal animation is used:

JavaScript may add:

```javascript
document.documentElement.classList.add('js');
```

and CSS may use:

```css
html.js .reveal {
  opacity: 0;
}
```

The script must then add the appropriate visible/revealed class.

Do not hide important content using CSS alone on initial page load.

Avoid excessive animation.

The event page should feel elegant, not distracting.

==================================================
PART 31 — CSS VISIBILITY RULES
==============================

Do not hide content on load with:

```css
display: none;
```

```css
visibility: hidden;
```

```css
opacity: 0;
```

```css
max-height: 0;
```

unless the element is genuinely an interactive state such as:

* an inactive tab
* a closed mobile menu
* a collapsed component
* dynamically revealed content

Important static content must remain visible.

==================================================
PART 32 — INTERACTION DESIGN
============================

Interactive elements should have:

* hover states
* focus states
* active states where appropriate

Use subtle transitions:

```css
transition: 0.2s ease;
```

or:

```css
transition: 0.3s ease;
```

Do not animate everything.

Avoid:

* excessive bouncing
* constant pulsing
* distracting transforms
* aggressive parallax
* continuous motion

Animations should support the event's atmosphere and hierarchy.

==================================================
PART 33 — JAVASCRIPT ARCHITECTURE
=================================

Use vanilla JavaScript only.

Place all JavaScript inside one `<script>` at the end of `<body>`.

Wrap the code in an IIFE:

```javascript
(function () {
  "use strict";

  // code

})();
```

Do not expose unnecessary global variables.

==================================================
PART 34 — JAVASCRIPT SELECTORS
==============================

Select elements using stable IDs or complete class names.

Good:

```javascript
document.querySelector('.faq-item');
document.getElementById('mobile-menu');
```

Avoid dynamically constructing selectors:

```javascript
document.querySelector('.tab-' + index);
```

Use complete literal class and ID strings.

Do not create HTML using JavaScript strings.

Never use:

```javascript
innerHTML = '<div class="...">';
```

Prefer existing HTML elements and:

* `textContent`
* `classList`
* `setAttribute`
* `removeAttribute`
* `hidden`

when appropriate.

==================================================
PART 35 — JAVASCRIPT BEHAVIOR
=============================

JavaScript may be used for:

* mobile navigation
* tabs
* countdown
* smooth scrolling
* lightweight UI state
* form demonstration behavior when explicitly required

JavaScript must not be required for the page's basic content.

Do not use:

```javascript
document.write()
```

Do not use:

```javascript
eval()
```

Do not use:

* cookies
* localStorage
* sessionStorage
* network requests
* AJAX
* fetch
* XMLHttpRequest

unless Part 1 explicitly requires an external integration.

==================================================
PART 36 — ACCESSIBILITY
=======================

Accessibility is required.

Use:

* semantic HTML
* logical heading hierarchy
* descriptive link text
* accessible button labels
* visible keyboard focus
* sufficient color contrast
* meaningful image alt text
* appropriate ARIA only when needed

Interactive controls must be keyboard accessible.

Do not use color as the only method of communicating meaning.

Focus styles must be clearly visible.

Example:

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
```

Do not remove focus outlines without replacing them with a stronger visible focus treatment.

Aim for WCAG-friendly contrast, especially approximately 4.5:1 for normal text.

==================================================
PART 37 — MOBILE ACCESSIBILITY
==============================

On mobile:

* buttons must remain easy to tap
* text must remain readable
* links must not be impossibly close together
* navigation controls must have clear labels
* important content must not overflow horizontally

Do not depend on hover interactions for important functionality.

==================================================
PART 38 — CONTENT RULES
=======================

Write realistic, specific, human-sounding copy.

Do not use:

* Lorem ipsum
* generic filler
* meaningless placeholder paragraphs
* repeated sentences
* vague corporate language
* obvious AI-style filler

Copy should feel specifically written for **Eain Mat Sone Yar**.

Use the project information from Part 1.

Do not invent factual claims that Part 1 does not support when the page is supposed to represent a real event.

If information is unspecified, use concise neutral wording rather than inventing specific facts such as:

* dates
* locations
* sponsors
* awards
* judges
* attendance numbers
* partnerships
* statistics

unless Part 1 provides them.

==================================================
PART 39 — COPY LENGTH
=====================

Keep headings concise.

As a general guideline:

* eyebrow: 1–5 words
* heading: ideally under 8 words
* paragraph: 1–3 sentences
* card description: concise
* button: 1–4 words

Exceptions are allowed when Part 1 provides required wording that is longer.

Do not shorten required client copy.

==================================================
PART 40 — VISUAL CONSISTENCY
============================

The entire page must feel like one intentional design system.

Maintain consistency in:

* container width
* section spacing
* typography
* border radius
* card treatment
* button treatment
* shadows
* colors
* icon sizing
* grid gaps
* heading hierarchy

Do not make every section look like a completely different website.

At the same time, avoid making every section visually identical.

Use controlled variation through:

* background changes
* layout changes
* accent treatments
* editorial compositions
* cards
* image arrangements
* decorative elements

while preserving the same underlying design system.

==================================================
PART 41 — PREMIUM EVENT DESIGN
==============================

The page should not look like a generic SaaS, corporate, or template website.

Use the visual direction from Part 1 to create:

* strong visual hierarchy
* intentional whitespace
* distinctive section transitions
* memorable typography
* refined CTA design
* elegant card compositions
* meaningful visual accents
* strong hero composition
* emotional storytelling

The design should feel intentionally art-directed.

Do not add random decorative elements simply to make the page look “fancy.”

Every major visual element should support:

* the event identity
* hierarchy
* storytelling
* usability

==================================================
PART 42 — CARD COMPONENTS
=========================

If cards are used, create a reusable card system.

Cards should share:

* radius
* padding
* border treatment
* typography hierarchy
* hover behavior
* spacing

Do not create five unrelated card styles unless the content genuinely requires different components.

Cards should remain readable and usable on mobile.

==================================================
PART 43 — FOOTER
================

The footer should contain appropriate event information such as:

* event name
* short description
* navigation
* relevant links
* contact information where provided
* copyright information where appropriate

Do not invent contact details.

Keep the footer visually consistent with the event identity.

==================================================
PART 44 — PROHIBITED IMPLEMENTATION PATTERNS
============================================

Do NOT use:

* inline `style=""`
* inline `onclick=""`
* inline event handlers
* `document.write`
* `eval`
* `innerHTML` for building page markup
* external frameworks
* CSS frameworks
* JavaScript libraries
* unnecessary CDN dependencies
* iframes
* `<object>`
* `<embed>`
* `<noscript>`
* `<iframe srcdoc>`
* canvas-based UI
* SVG-as-an-image for icons
* excessive absolute positioning
* excessive CSS specificity
* `!important`
* giant generated CSS blocks with duplicate rules
* unnecessary duplicate components
* fake backend behavior
* fake API calls
* lorem ipsum
* inaccessible interactive controls

==================================================
PART 45 — BUILDER-SAFE HTML
===========================

Assume the visual page builder may parse and convert each major HTML node into an editable block.

Therefore:

* keep markup readable
* keep nesting shallow where possible
* avoid unnecessarily complicated DOM structures
* avoid dynamically generated structural HTML
* keep important text directly inside semantic elements
* use descriptive classes
* use predictable section boundaries
* keep components reusable

Do not encode important layout information entirely inside JavaScript.

Do not rely on JavaScript to construct the initial DOM.

==================================================
PART 46 — PERFORMANCE
=====================

Keep the page lightweight.

Avoid:

* unnecessary dependencies
* huge JavaScript bundles
* excessive animation
* unnecessary DOM nodes
* repeated inline SVG definitions
* unnecessary external requests

Use CSS rather than JavaScript for visual effects whenever possible.

==================================================
PART 47 — QUALITY CHECK BEFORE OUTPUT
=====================================

Before returning the HTML, internally verify all of the following:

### HTML

* Valid complete HTML document
* Correct doctype
* Correct language attribute
* One `<h1>`
* Logical heading hierarchy
* Semantic sections
* Unique IDs
* No broken nesting
* No block elements inside paragraphs
* No duplicate IDs
* No unnecessary wrappers

### Builder compatibility

* Major sections are direct children of `<body>`
* Each major section is independently identifiable
* `.container` is reused
* No essential content is dynamically generated
* HTML remains readable/editable
* No builder-hostile dependencies

### CSS

* One `<style>` block
* Tokens defined once
* No unnecessary hard-coded repeated values
* No `!important`
* Low specificity
* Responsive rules included
* No accidental horizontal overflow
* Mobile layout works
* Focus states exist
* Hover states exist where appropriate

### JavaScript

* One `<script>` block
* Located at the end of `<body>`
* Wrapped in an IIFE
* Vanilla JavaScript only
* No inline event handlers
* No `eval`
* No `document.write`
* No unnecessary global variables
* No dynamic HTML construction
* Page remains usable without JavaScript

### Accessibility

* One h1
* Logical headings
* Keyboard-accessible controls
* Visible focus states
* Meaningful link labels
* Accessible buttons
* Correct image alt text when images exist
* Sufficient contrast

### Responsive

Check approximately:

* desktop: 1300px
* tablet: 992px
* mobile: 600px

Ensure:

* no horizontal scrolling
* no clipped text
* no overlapping sections
* buttons remain usable
* navigation remains usable
* cards stack correctly
* typography remains readable

==================================================
PART 48 — IMPORTANT PRIORITY RULE
=================================

When requirements appear to conflict, use this priority:

1. Part 1 project-specific requirements
2. Accessibility and valid semantic HTML
3. Visual page-builder compatibility
4. Responsive behavior
5. Visual design
6. JavaScript enhancements

Never sacrifice Part 1 requirements merely to add an unnecessary visual effect.

Never sacrifice accessibility merely to achieve a visual effect.

Never sacrifice builder compatibility for technical complexity.

==================================================
PART 49 — FINAL INSTRUCTION
===========================

Build the complete webpage now.

Use the project-specific information from Part 1 exactly.

Apply every implementation rule from Part 2.

The result must be:

* complete
* polished
* responsive
* accessible
* visually distinctive
* emotionally engaging
* production-quality
* builder-friendly
* editable
* lightweight
* framework-free
* self-contained

Do not explain your implementation.

Return only ONE complete:

```html
...
```

HTML code block.

```
```
