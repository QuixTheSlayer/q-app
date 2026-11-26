// Copyable AI prompts shown in the Import HTML dialog.
// Part 1 is the user's to edit (blank or a preset); part 2 matches the importer's rules (see the code-to-node skill).

import { PORTFOLIO_INTRO, PORTFOLIO_PRESETS } from "@/components/EditorUI/importHtmlPortfolioPrompts"

const INTRO = `You are a senior front-end developer, creative web designer, and event-branding specialist. Build a complete, production-quality, visually impressive event landing page for the event described in Part 1 using only **HTML** and Tailwind CSS utility classes for all of its styling and interactions (see Part 2A). The final webpage must feel like a premium, emotionally engaging, modern website made specifically for that event, not a generic corporate template. It should communicate the atmosphere, purpose, identity, and story of the event while giving visitors a clear path to learn about it, explore its highlights, and take the primary event action. It will be pasted into a visual page builder's "Import HTML" feature, which turns the markup into editable blocks.

 = PART 1: THE PAGE (edit freely)  =`

// Ready-made Part 1s for events; the first is the blank template.
const EVENT_PRESETS = [
	{
		id: "blank",
		page: `- Purpose: [e.g. Registration page for the 2026 Asia Design Awards]
- Audience: [e.g. designers and agencies submitting work]
- Language of the copy: [e.g. English]
- Sections, in order: [e.g. header/nav, hero, about, categories (6 cards), timeline, judges (4 profiles), prizes, FAQ (accordion), CTA band, footer]
- Visual style: [e.g. dark navy background, gold accent, editorial serif headings, generous whitespace]
- Fonts: [e.g. Playfair Display for headings, Inter for body]
- Extra details: [e.g. event date 12 March 2026, venue Kuala Lumpur, CTA links to #register]`,
	},
	{
		id: "awards",
		page: `- Purpose: Call-for-entries page for the "Asia Design Awards 2026", an annual award for graphic, product and digital design. Goal: get studios and freelancers to submit entries before the deadline.
- Audience: design studios, agencies, in-house teams and freelance designers across Asia.
- Language of the copy: English
- Sections, in order:
  1. Header: text logo "ADA 2026", nav links (About, Categories, Timeline, Jury, Prizes, FAQ) and a "Submit entry" button.
  2. Hero: eyebrow "Entries open", h1 about celebrating Asia's best design, one-line lead, two buttons ("Submit entry", "View categories") and a row of 3 key facts (deadline, entry fee, total prize pool).
  3. About: two columns, text on the left (2 short paragraphs), a wide image on the right.
  4. Categories: 6 cards (Brand Identity, Packaging, Product, Digital Product, Motion, Editorial), each with an icon, title and one-line description.
  5. Timeline: 4 steps in a row (Entries open, Early-bird deadline, Final deadline, Winners announced) with dates.
  6. Jury: 4 judge cards with photo, name, role and studio.
  7. Prizes: 3 cards (Gold, Silver, Bronze) with prize amount and what winners get; Gold is highlighted.
  8. FAQ: 6 questions in <details> items (who can enter, fees, file formats, judging criteria, multiple entries, IP rights).
  9. CTA band: short heading, one sentence and a "Submit entry" button.
  10. Footer: logo, short tagline, link list, copyright.
- Visual style: dark navy background, gold accent, editorial and premium; thin gold dividers, large serif headings, generous whitespace, subtle card borders instead of heavy shadows.
- Fonts: Playfair Display for headings, Inter for body text.
- Extra details: entries open 1 Feb 2026, early bird 15 Mar 2026, final deadline (show it with the event widgets {{event_hour}} {{event_timezone}} on {{event_date}}), winners announced 20 Jun 2026 in Kuala Lumpur. Entry fee USD 60 (early bird USD 45). Prize pool USD 30,000. Every "Submit entry" button is the Submit Entry event widget ({{event_submit_entry_url}}).`,
	},
	{
		id: "pitch",
		page: `- Purpose: Application page for "LaunchPad Pitch Challenge 2026", a startup pitch competition. Goal: get early-stage founders to apply.
- Audience: founders of pre-seed and seed startups, plus mentors and investors who might join as judges.
- Language of the copy: English
- Sections, in order:
  1. Header: text logo "LaunchPad", nav links (How it works, Tracks, Judges, Prizes, FAQ, Apply) and an "Apply now" button.
  2. Hero: h1 about pitching to top investors, a lead sentence, an "Apply now" button and an outline "See the tracks" button; on the right a stats card (applications last year, investors on the panel, funding raised by alumni).
  3. How it works: 4 numbered steps (Apply online, Online screening, Live semi-final, Demo Day final), each with a short description.
  4. Tracks: tabs with 3 tracks (Fintech, Climate, Health). Each tab panel has a paragraph and a bullet list of who should apply; the 2nd and 3rd panels start with the hidden attribute.
  5. Judges: 4 judge cards with photo, name, title and fund.
  6. Prizes: 3 cards (Winner, Runner-up, People's Choice) with cash amount and perks list.
  7. Testimonial: one quote from a past winner with name, startup and photo.
  8. FAQ: 6 <details> items (eligibility, equity taken, costs, pitch format, remote founders, selection criteria).
  9. Apply: a CTA band with a short checklist of what to prepare (pitch deck, 2-minute video, team details), the deadline line and an "Apply now" button.
  10. Footer: logo, contact email, link list, copyright.
- Visual style: light and modern SaaS look, white background, indigo primary with a soft violet gradient in the hero, rounded 16px cards with soft shadows, plenty of whitespace.
- Fonts: Space Grotesk for headings, Inter for body text.
- Extra details: applications close at the event deadline ({{event_hour}} {{event_timezone}} on {{event_date}}), Demo Day 20 Jun 2026 in Singapore. Winner gets USD 50,000 investment and 6 months of mentoring. No equity taken. Every "Apply now" button is the Submit Entry event widget ({{event_submit_entry_url}}).`,
	},
	{
		id: "photo",
		page: `- Purpose: Entry page for "Frames of the City 2026", an open photography contest about urban life. Goal: get photographers to upload their best street photo.
- Audience: amateur and professional photographers aged 16 and up.
- Language of the copy: English
- Sections, in order:
  1. Header: text logo "Frames of the City", nav links (Theme, Gallery, Rules, Jury, Prizes, FAQ) and an "Enter now" button.
  2. Hero: full-width image with a dark overlay, eyebrow "Photography contest 2026", h1, one-line lead and an "Enter now" button.
  3. Theme: a centered short statement about this year's theme "Between the lights", 2 short paragraphs.
  4. Gallery: grid of 6 images from last year's winners (mixed landscape and portrait sizes), each in a figure with a caption of photographer name and title.
  5. Rules: a numbered list of 6 short rules (one photo per person, JPG up to 20 MB, taken in 2025-2026, no heavy manipulation, no watermark, original work only).
  6. Jury: 3 judge cards with portrait photo, name and short bio.
  7. Prizes: 3 cards (1st, 2nd, 3rd) with prize amount and a camera gear prize; plus a line about 20 honorable mentions in an online exhibition.
  8. FAQ: 5 <details> items (phones allowed, editing limits, copyright, deadline time zone, how winners are notified).
  9. CTA band: big heading "Your city, your frame", one sentence and an "Enter now" button.
  10. Footer: logo, social links as text, copyright.
- Visual style: minimal gallery look, off-white background, near-black text, photography first; thin 1px lines, square image corners, lots of whitespace, one red accent used sparingly.
- Fonts: DM Serif Display for headings, DM Sans for body text.
- Extra details: deadline shown with the event widgets ({{event_hour}} {{event_timezone}} on {{event_date}}), winners announced 30 Sep 2026, prize pool USD 10,000, free to enter. Every "Enter now" button is the Submit Entry event widget ({{event_submit_entry_url}}).`,
	},
	{
		id: "hackathon",
		page: `- Purpose: Registration page for "BuildFast Hackathon 2026", a 48-hour student hackathon. Goal: get students to register as solo hackers or teams.
- Audience: university and college students who code, design or do product work.
- Language of the copy: English
- Sections, in order:
  1. Header: text logo "BuildFast_", nav links (About, Challenges, Schedule, Prizes, Sponsors, FAQ) and a "Register" button.
  2. Hero: h1 about building something real in 48 hours, a lead sentence, a "Register" button and a countdown with 4 boxes (days, hours, minutes, seconds); built as the event-widget countdown in the builder rules (target from {{event_date}}, {{event_hour}}, {{event_timezone_offset}}).
  3. About: 3 feature cards (48 hours, Mentors on site, Free food and swag) with icons.
  4. Challenges: 4 challenge cards (AI for Good, Smart Campus, Open Data, Wild Card), each with a short brief and a badge for the sponsor.
  5. Schedule: tabs for Day 1 and Day 2; each panel is a list of time and activity rows; the Day 2 panel starts with the hidden attribute.
  6. Prizes: 3 cards (Grand Prize, Best Design, Best First-time Team) with prize amounts.
  7. Sponsors: a row of 6 sponsor names as text logos in a grid.
  8. FAQ: 6 <details> items (who can join, team size, cost, what to bring, beginners welcome, code of conduct).
  9. Register: a CTA band with what you need to sign up (team of 1-4, student ID, laptop), the registration deadline line and a "Register" button.
  10. Footer: logo, contact email, copyright.
- Visual style: dark background (#0d0f14), neon lime accent, monospace touches in labels and the logo, sharp 8px corners, subtle grid pattern in the hero background made with CSS gradients, energetic but readable.
- Fonts: JetBrains Mono for labels and the logo, Sora for headings and body text.
- Extra details: 14-16 Nov 2026 at the University of Malaya, Kuala Lumpur. Teams of 1-4. Free to join. Registration closes at {{event_hour}} {{event_timezone}} on {{event_date}}. Every "Register" button is the Register event widget ({{event_register_url}}).`,
	},
	{
		id: "writing",
		page: `- Purpose: Entry page for "Young Writers Prize 2026", a short story competition for school students. Goal: get students (and their teachers or parents) to submit a story.
- Audience: students aged 10-18, plus teachers and parents who help them enter.
- Language of the copy: English
- Sections, in order:
  1. Header: text logo "Young Writers Prize", nav links (About, Age groups, How to enter, Prizes, FAQ) and a "Submit a story" button.
  2. Hero: friendly h1 inviting students to share their story, a lead sentence, a "Submit a story" button and an illustration-style image on the right.
  3. About: short paragraph about the prize and this year's theme "A door I never opened", with 3 small fact cards (word limit, deadline, free to enter).
  4. Age groups: 2 cards (Juniors 10-13, Seniors 14-18), each with word limit and a bullet list of what judges look for.
  5. How to enter: 4 numbered steps (Write your story, Ask a teacher or parent, Fill in the form, Upload your story).
  6. Prizes: 3 cards per age group combined into one grid of 3 (Winner, Runner-up, Highly commended) with prizes like book vouchers and publication in the anthology.
  7. Testimonial: one quote from last year's young winner and one from a teacher.
  8. FAQ: 6 <details> items (who can enter, word count, file type, parent consent, can I enter twice, when are results).
  9. Submit: a CTA band with a short checklist (story in a document, parent or teacher email, age group), the deadline line and a "Submit a story" button.
  10. Footer: logo, contact email, a short safeguarding note, copyright.
- Visual style: bright, warm and friendly; cream background, coral and teal accents, pastel section backgrounds, big rounded 20px corners, playful but tidy; good contrast for young readers.
- Fonts: Fredoka for headings, Nunito for body text.
- Extra details: deadline shown with the event widgets ({{event_hour}} {{event_timezone}} on {{event_date}}), winners announced 1 Sep 2026, Juniors max 800 words, Seniors max 1,500 words, free to enter. Every "Submit a story" button is the Submit Entry event widget ({{event_submit_entry_url}}).`,
	},
	{
		id: "conference",
		page: `- Purpose: Registration page for "DevSummit Asia 2026", a two-day developer and product conference. Goal: sell attendance and get people to register before seats run out.
- Audience: software engineers, product managers, engineering leads and CTOs from startups and mid-size companies across Southeast Asia.
- Language of the copy: English
- Sections, in order:
  1. Header: text logo "DevSummit", nav links (Speakers, Agenda, Venue, Tickets, FAQ) and a "Register" button.
  2. Hero: eyebrow "2 days · 40 talks · Singapore", h1 about learning from the people building the next decade of software, a lead sentence, a "Register" button and an outline "See the agenda" button; below them a row of 4 key facts (speakers, talks, attendees, workshops).
  3. About: two columns, 2 short paragraphs on the left, 3 highlight cards stacked on the right (Main stage, Hands-on workshops, Hallway track).
  4. Speakers: 8 speaker cards in a grid with photo, name, role and company.
  5. Agenda: tabs for Day 1 and Day 2; each panel is a list of rows with time, talk title, speaker and room; the Day 2 panel starts with the hidden attribute.
  6. Venue: two columns, venue name and address with travel tips on one side, a wide image on the other.
  7. Tickets: 3 cards (Early bird, Standard, Team of 5) with price, a list of what is included and a "Register" button; the Standard card is highlighted.
  8. Sponsors: a row of 6 sponsor names as text logos in a grid.
  9. FAQ: 6 <details> items (refunds, ticket transfers, student discount, recordings, dietary needs, visa letters).
  10. Footer: logo, contact email, link list, copyright.
- Visual style: bright, confident tech look; white and very light grey sections with one dark section for the agenda, electric blue primary, orange accent for highlights, rounded 12px cards, clean grid, strong headings, no gradients except one subtle one in the hero.
- Fonts: Plus Jakarta Sans for headings and body text.
- Extra details: 18-19 Sep 2026 at Marina Bay Convention Centre, Singapore. Tickets: Early bird USD 249, Standard USD 399, Team of 5 USD 1,599. Registration closes at {{event_hour}} {{event_timezone}} on {{event_date}}. Every "Register" button is the Register event widget ({{event_register_url}}).`,
	},
	{
		id: "talent",
		page: `- Purpose: Audition page for "Campus Idol 2026", a university talent competition for singers, dancers, musicians and other performers. Goal: get students to submit an audition video.
- Audience: university students aged 18-26 who perform, plus friends and families who follow them.
- Language of the copy: English
- Sections, in order:
  1. Header: text logo "Campus Idol", nav links (Categories, How it works, Judges, Prizes, FAQ) and an "Audition now" button.
  2. Hero: eyebrow "Auditions open", big h1 about stepping onto the stage, a lead sentence, an "Audition now" button and a small line "Free to enter · Online audition"; a bold image on the right.
  3. Categories: 5 cards (Vocal, Dance, Instrument, Spoken word, Something different), each with an icon, a title and one line on what fits.
  4. How it works: 4 numbered steps (Record a 2-minute video, Submit online, Judges pick the Top 20, Live final on stage).
  5. Stage: a short statement about the live final with 3 stat tiles (finalists, live audience, stream viewers).
  6. Judges: 4 judge cards with photo, name and a one-line bio (singer, choreographer, producer, talent scout).
  7. Prizes: 3 cards (Champion, Runner-up, Audience Favorite) with prize amount and perks; Champion is highlighted.
  8. FAQ: 6 <details> items (video requirements, group acts, original songs, age limit, what happens after the Top 20, copyright of the video).
  9. CTA band: a loud heading, one sentence and an "Audition now" button.
  10. Footer: logo, social links as text, copyright.
- Visual style: stage-show energy; near-black purple background (#120a24), hot pink and electric violet accents, glowing gradient headlines, spotlight-style radial gradients behind the hero, pill-shaped buttons, bold and playful but still readable.
- Fonts: Poppins for headings and body text.
- Extra details: auditions close at {{event_hour}} {{event_timezone}} on {{event_date}}, Top 20 announced 10 Oct 2026, live final on 5 Dec 2026 at the Grand Hall. Prize pool USD 8,000 plus a recording session. Every "Audition now" button is the Submit Entry event widget ({{event_submit_entry_url}}).`,
	},
	{
		id: "artprize",
		page: `- Purpose: Call for artists for the "Canvas of Asia Art Prize 2026", an open art prize with a public exhibition. Goal: get artists to submit one artwork for the open call.
- Audience: emerging and established painters, sculptors, illustrators and digital artists living in Asia, plus art collectors and gallery visitors.
- Language of the copy: English
- Sections, in order:
  1. Header: text logo "Canvas of Asia", nav links (About, Categories, Last year, Jury, Exhibition, FAQ) and a "Submit your work" button.
  2. Hero: full-width image with a soft dark overlay, eyebrow "Open call 2026", h1 about showing your work to Asia, a short lead and a "Submit your work" button.
  3. About: a centered statement (2 short paragraphs) about the prize, with 3 small facts below (artists shown last year, visitors, works sold).
  4. Categories: 4 cards (Painting and drawing, Sculpture and installation, Photography and print, Digital and new media), each with an image, a title and a one-line brief.
  5. Last year: a gallery grid of 6 artworks, each in a figure with a caption of artist, title and medium.
  6. Jury: 3 juror cards with portrait photo, name and a short bio (curator, collector, artist).
  7. Awards: 3 cards (Grand Prize, Emerging Artist, Public Choice) with amount and what is included, such as a solo show and a catalogue feature.
  8. Exhibition: the finalist exhibition shown as two columns, venue, dates and opening hours on one side and a wide image on the other.
  9. FAQ: 6 <details> items (eligibility, size limits, shipping works, fees, selling works, rights).
  10. CTA band: heading "Your work, on the wall", one sentence and a "Submit your work" button.
  11. Footer: logo, address, link list, copyright.
- Visual style: warm editorial gallery look; cream background (#f6f0e6), deep ink text, terracotta accent, thin dark lines, square image corners, big serif headings, lots of whitespace, art images allowed to be large.
- Fonts: Cormorant Garamond for headings, Work Sans for body text.
- Extra details: open call closes at {{event_hour}} {{event_timezone}} on {{event_date}}, finalists announced 15 Aug 2026, exhibition 12 Sep - 11 Oct 2026 at the Metro Art Gallery, Kuala Lumpur. Submission fee USD 25 per artwork. Grand Prize USD 15,000 and a solo show. Every "Submit your work" button is the Submit Entry event widget ({{event_submit_entry_url}}).`,
	},
	{
		id: "film",
		page: `- Purpose: Submission page for the "Lumen Short Film Festival 2026", a festival for films under 20 minutes. Goal: get filmmakers to submit their short film.
- Audience: independent filmmakers, film students and small production studios, plus festival visitors.
- Language of the copy: English
- Sections, in order:
  1. Header: text logo "LUMEN", nav links (About, Categories, Jury, Screenings, Awards, FAQ) and a "Submit a film" button.
  2. Hero: full-width cinematic image with a dark overlay, eyebrow "Call for entries", h1 about stories that fit in twenty minutes, a lead sentence and two buttons ("Submit a film", "Festival program").
  3. About: two columns, 2 short paragraphs on the left and a vertical image on the right, with 3 numbers underneath (films screened, countries, audience).
  4. Categories: 5 cards (Fiction, Documentary, Animation, Experimental, Student), each with a title, a runtime rule and a one-line description.
  5. Jury: 4 juror cards with portrait photo, name, role and a notable film.
  6. Screenings: tabs for the 3 festival days; each panel is a list of screening blocks with time, program name and runtime; the 2nd and 3rd panels start with the hidden attribute.
  7. Awards: 4 cards (Best Short, Best Documentary, Best Animation, Audience Award) with prize amounts.
  8. Submission guide: a numbered list of 6 rules (runtime up to 20 minutes, finished after Jan 2025, English subtitles, online screener link, no AI-generated footage, one entry per film).
  9. FAQ: 6 <details> items (entry fees, premiere status, screener format, rights, notification date, travel support).
  10. CTA band: a short heading, one sentence and a "Submit a film" button.
  11. Footer: logo, contact email, link list, copyright.
- Visual style: cinematic and dark; black background (#0a0a0a), warm amber accent, off-white text, film-grain feel made with CSS only, thin amber lines, small uppercase letter-spaced labels, square corners, dramatic large headings.
- Fonts: Bebas Neue for headings and labels, Inter for body text.
- Extra details: festival 6-8 Nov 2026 at the Riverside Cinema, Bangkok. Submissions close at {{event_hour}} {{event_timezone}} on {{event_date}}. Entry fee USD 30 (students USD 15). Best Short wins USD 10,000. Every "Submit a film" button is the Submit Entry event widget ({{event_submit_entry_url}}).`,
	},
	{
		id: "run",
		page: `- Purpose: Registration page for the "City Lights Charity Run 2026", an evening fun run that raises money for children's education. Goal: get runners and walkers to register.
- Audience: families, office teams, casual runners and club runners in Kuala Lumpur.
- Language of the copy: English
- Sections, in order:
  1. Header: text logo "City Lights Run", nav links (Race categories, Route, Race day, Charity, FAQ) and a "Register" button.
  2. Hero: eyebrow "Evening run · 14 Nov 2026", h1 about running at night for a good cause, a lead sentence, a "Register" button and a wide image of runners on the right; under the buttons a row of 3 facts (distance options, start time, funds raised last year).
  3. Race categories: 3 cards (5K Fun Run, 10K, 21K Half Marathon) with distance, start time, price and a short note on who it suits; the 10K card is highlighted.
  4. Route: two columns, a short route description with 4 landmarks as a list on one side and a wide map-style image on the other.
  5. Race day: tabs for Before the run, During the run, After the run; each panel is a short list of what to expect (pick up your kit, water stations, medals and refreshments); the 2nd and 3rd panels start with the hidden attribute.
  6. Charity: a section about where the money goes, 3 impact cards (school kits, scholarships, library corners) each with an amount and what it covers.
  7. Race pack: a grid of 4 items (race tee, finisher medal, timing chip, goodie bag) each with an icon.
  8. Sponsors: a row of 6 sponsor names as text logos in a grid.
  9. FAQ: 6 <details> items (age limits, strollers and walkers, refunds, pick-up of race kit, weather, road closures).
  10. CTA band: heading "Run for the lights", one sentence, the registration deadline line and a "Register" button.
  11. Footer: logo, contact email, charity partner name, copyright.
- Visual style: bright, sporty and friendly; white background, deep green primary (#0f7a4d), sunny orange accent, bold uppercase labels, chunky 14px rounded cards, a diagonal stripe divider made with CSS between hero and next section, energetic but clean.
- Fonts: Barlow Condensed for headings and labels, Barlow for body text.
- Extra details: 14 Nov 2026, flag-off 7:30 PM at Dataran Merdeka, Kuala Lumpur. Prices: 5K RM 55, 10K RM 75, 21K RM 95. Registration closes at {{event_hour}} {{event_timezone}} on {{event_date}}. Every "Register" button is the Register event widget ({{event_register_url}}).`,
	},
] as const

// The dialog groups the presets by kind of page; each group has its own intro.
export type ImportHtmlPresetGroup = "events" | "portfolio"
export const IMPORT_HTML_PROMPT_GROUPS: ImportHtmlPresetGroup[] = ["events", "portfolio"]

export const IMPORT_HTML_PROMPT_PRESETS: { id: string; group: ImportHtmlPresetGroup; page: string }[] = [
	...EVENT_PRESETS.map((preset) => ({ ...preset, group: "events" as const })),
	...PORTFOLIO_PRESETS.map((preset) => ({ ...preset, group: "portfolio" as const })),
]

const GROUP_INTRO: Record<ImportHtmlPresetGroup, string> = { events: INTRO, portfolio: PORTFOLIO_INTRO }

export type ImportHtmlPresetId = string

export const importHtmlPromptPage = (id: ImportHtmlPresetId) => {
	const preset = IMPORT_HTML_PROMPT_PRESETS.find((p) => p.id === id) ?? IMPORT_HTML_PROMPT_PRESETS[0]
	return `${GROUP_INTRO[preset.group]}\n${preset.page}`
}

export const IMPORT_HTML_PROMPT_RULES = 
`
PART 2 — NON-NEGOTIABLE OUTPUT RULES
 

## 2.1 Final response format

Return **exactly ONE html code block** containing the complete webpage.

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

html
[complete HTML document]


 
PART 2A — STYLE FORMAT: TAILWIND CLASSES (OVERRIDES EVERY STYLING AND SCRIPTING RULE BELOW)


The page builder does not accept CSS code or JavaScript. You write the page as semantic HTML and give every element its look with Tailwind CSS utility classes in its class attribute. The builder reads those classes and turns them into the element's own styles for desktop, tablet and mobile, and into its hover, press, scroll-into-view and animation effects.

Do not output: a <style> element, a <link> stylesheet, a <script> element of any kind (including the Tailwind CDN script and a tailwind.config), style="" attributes, @apply, @import, CSS variables, Google Font imports, inline event handlers or any JavaScript.

If any later part asks for any of those, or for :hover rules, @media queries, @keyframes, animations written as CSS, or JavaScript behavior, ignore that request and use the Tailwind classes below instead. Part 2A always wins. Keep every other rule (structure, sections, semantics, accessibility, content). A semantic class name (hero, card) may stay in front of the utilities.

## 2A.1 Responsive: desktop first, with tablet: and mobile:

Plain utilities are the desktop look (screens wider than 991px). Two prefixes change it on smaller screens:

* tablet: screens up to 991px wide
* mobile: screens up to 575px wide

Example: class="px-16 py-24 grid grid-cols-3 gap-8 tablet:px-8 tablet:grid-cols-2 mobile:px-4 mobile:py-12 mobile:grid-cols-1"
Example: class="text-6xl font-bold leading-tight tablet:text-5xl mobile:text-4xl"

A tablet: or mobile: utility replaces the plain one for that property on that screen; everything not listed keeps its desktop value. Do not use sm:, md:, lg:, xl: or 2xl:, they do not match the builder's screens.

## 2A.2 Interactive states

Use these prefixes for effects. They work with the colour, opacity, shadow and transform utilities:

* hover: effect while the pointer is over the element. Example: hover:bg-amber-400 hover:scale-105 hover:shadow-xl hover:-translate-y-1
* active: effect while the element is pressed. Example: active:scale-95 active:opacity-80
* view: effect once the element has scrolled into view. Write the starting look as plain utilities and the end look with view:. Example: opacity-0 translate-y-8 view:opacity-100 view:translate-y-0 duration-700

Effects that work inside hover:, active: and view:: bg-{color}, text-{color}, shadow-{size}, opacity-{n}, scale-{n}, rotate-{n}, -translate-x-{n}, translate-y-{n}, skew-x-{n}, blur-{size}, rounded-{size}.

Timing for the element's effects: duration-{ms} (duration-300), delay-{ms} (delay-150), ease-linear, ease-in, ease-out or ease-in-out, and the word transition. Put them with the plain utilities; hover:duration-500 sets one state only.

## 2A.3 Animations

* animate-spin, animate-pulse, animate-bounce: loop forever on the element
* animate-fade-in, animate-fade-up, animate-fade-down, animate-fade-left, animate-fade-right, animate-zoom-in, animate-zoom-out, animate-rotate-in, animate-blur-in, animate-skew-in, animate-bounce-in: entrance animations, played once on page load
* animate-heartbeat, animate-float, animate-shake, animate-wobble, animate-swing, animate-rubber-band: attention animations
* with a prefix, they play on that event: view:animate-fade-up (when scrolled into view, the best choice for sections and cards), hover:animate-shake, active:animate-rubber-band

Use duration-{ms} and delay-{ms} to set their speed and wait. Do not write animate-[custom] values.

## 2A.4 Utilities you can use

* layout: block, inline-block, flex, inline-flex, grid, hidden, flex-row, flex-col, flex-wrap, flex-1, grow, shrink-0, items-*, justify-*, self-*, gap-*, gap-x-*, gap-y-*, space-x-*, space-y-*, grid-cols-{n}, col-span-{n}, order-*
* position: relative, absolute, fixed, sticky, inset-0, top-*, right-*, bottom-*, left-*, z-{n}, overflow-hidden, overflow-auto
* spacing: p-*, px-*, py-*, pt-*, pr-*, pb-*, pl-*, m-*, mx-auto, my-*, mt-*, mb-*, and so on (-mt-4 for negative)
* size: w-*, h-*, min-w-*, min-h-*, max-w-* (max-w-xl, max-w-7xl), size-*, w-1/2, w-full, h-screen, container
* text: text-xs to text-9xl, font-thin to font-black, leading-*, tracking-*, text-left, text-center, text-right, uppercase, capitalize, italic, underline, line-through, truncate, line-clamp-{n}, whitespace-nowrap, font-sans, font-serif, font-mono
* colour: the full Tailwind palette with a shade (bg-slate-900, text-amber-400, border-white/10), white, black, transparent, and an opacity after a slash (bg-black/60, text-white/80)
* gradients: bg-gradient-to-r (or -b, -br, -t, -l, ...) with from-{color}, via-{color}, to-{color}
* borders: border, border-2, border-t, border-{color}, border-dashed, rounded, rounded-lg, rounded-full, rounded-t-xl, shadow, shadow-md, shadow-2xl, opacity-{n}
* images: object-cover, object-contain, aspect-video, aspect-square, bg-cover, bg-center, bg-no-repeat
* transforms: scale-{n}, rotate-{n}, translate-x-{n}, translate-y-{n}, skew-x-{n}, origin-*

Arbitrary values in square brackets are allowed and are how you reach exact brand colours and sizes: bg-[#0B0B12], text-[#F5C518], w-[420px], text-[56px], tracking-[0.2em], shadow-[0_10px_30px_rgba(0,0,0,0.35)], grid-cols-[1fr_2fr], font-[Inter,sans-serif]. A space inside brackets is written as an underscore. A background image is bg-[url(https://...)] (https only) or bg-[linear-gradient(135deg,#111,#333)].

## 2A.5 Click actions and the navigation bar

A click can show, hide or toggle another element, or scroll to it. Give the target element an id attribute, and give the element that is clicked one of these classes:

* click:toggle-[#menu] opens the element with id="menu" if it is closed and closes it if it is open
* click:show-[#menu] and click:hide-[#menu]
* click:scroll-to-[#pricing] scrolls smoothly to the element with id="pricing"

An element that starts closed has the class hidden. Use plain classes for the target: when it opens it is shown as a normal block, so lay out what is inside it with block elements (links that each fill a row), not with flex on the element itself.

The navigation bar is written as three <nav> elements, one per screen, with two of them hidden by classes:

* desktop: class="flex tablet:hidden mobile:hidden items-center justify-between px-12 py-4 ..." with the logo and the links in a row
* tablet: class="hidden tablet:flex mobile:hidden items-center justify-between px-6 py-3 ..."
* mobile: class="hidden mobile:block ..." with a top row (logo on the left, a hamburger button on the right) and a menu panel below it

The tablet nav needs mobile:hidden, because a mobile screen also matches tablet:. Do not repeat id attributes across the navs; the mobile menu is the only element with an id.

Mobile hamburger example:

<nav class="hidden mobile:block bg-slate-900 text-white">
  <div class="flex items-center justify-between px-4 py-3">
    <a href="#top" class="text-lg font-bold">Brand</a>
    <button class="text-2xl px-2 click:toggle-[#mobile-menu]" aria-label="Menu">☰</button>
  </div>
  <div id="mobile-menu" class="hidden px-4 pb-4 bg-slate-900">
    <a href="#about" class="block py-3 border-t border-white/10">About</a>
    <a href="#schedule" class="block py-3 border-t border-white/10">Schedule</a>
    <a href="#join" class="block py-3 border-t border-white/10 click:toggle-[#mobile-menu]">Join</a>
  </div>
</nav>

Use the character ☰ for the hamburger button text, not an icon font or an image. The same pattern works for any block that must look different on each screen, and for any accordion, dropdown or "read more" panel.

## 2A.6 Not supported (do not use)

focus:, focus-visible:, group-hover:, peer-*, dark:, first:, last:, odd:, even:, disabled:, before:, after:, divide-*, prose, ring offsets, @apply, plugins and any utility not listed above. Build an FAQ with <details> and <summary>, show tab content as stacked sections, write menus as plain links.

PART 3 — DOCUMENT REQUIREMENTS
 

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
</body>
</html>

Use:

<html lang="en">

unless Part 1 explicitly requires another language.

If the page contains substantial non-Latin copy (for example Myanmar/Burmese, Thai, Chinese or Arabic), ensure the chosen Google Font supports those characters.

## 3.2 Head requirements

The <head> should contain:

* charset
* viewport
* descriptive title
* optional meta description

Do not add Google Font imports, <link> stylesheets or a <style> element: all styling is Tailwind classes (see Part 2A).

Example:

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Event name from Part 1</title>

Do not add unnecessary metadata.

## 3.3 CSS location

There is no CSS code. All styling, including the tablet and mobile styles and the hover, press and scroll effects, is Tailwind classes on the elements, as described in Part 2A.

Do not create:

* <style> blocks
* style="" attributes
* external CSS files

## 3.4 JavaScript

There is no JavaScript. Do not write a <script> element (the Tailwind CDN script included), inline JavaScript attributes or external JavaScript files.

 
PART 4 — EXTERNAL RESOURCES
 

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

 
PART 5 — VISUAL PAGE BUILDER STRUCTURE
  

The page builder converts HTML structure into editable blocks.

Therefore, keep the DOM intentionally clean and predictable.

## 5.1 Body structure

The direct children of  <body > must be:

1.  <header >
2. one  <section > for each major content area
3.  <footer >
4. one  <script >

Do NOT wrap the entire page inside:

html
<div class="page">


or:

html
<main>


unless Part 1 explicitly requires  <main >.

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

Every major page area must be represented by its own  <section >.

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

 
PART 6 — CONTAINER AND LAYOUT SYSTEM
  

Use a consistent container system throughout the page.

Required base container:

html
<div class="container">
  ...
</div>


Recommended CSS:

css
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}


All major section content should normally live inside .container.

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

 
PART 7 — SEMANTIC HTML
   

Use semantic HTML wherever appropriate.

Use:

*  <header >
*  <nav >
*  <section >
*  <footer >
*  <article >
*  <figure >
*  <figcaption >
*  <ul >
*  <ol >
*  <li >
*  <h1 >– <h6 >
*  <p >
*  <a >
*  <button >
*  <details >
*  <summary >

Avoid unnecessary generic containers.

Use  <div > primarily for layout wrappers.

## 7.1 Heading hierarchy

The page must have exactly **one  <h1 >**.

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

Never place important visible text directly inside a generic  <div > when a semantic text element is appropriate.

Bad:

 html
<div>Welcome to the event</div>
 

Prefer:

 html
<p>Welcome to the event</p>
 

or an appropriate heading.

## 7.3 Paragraph rules

Do not place block elements inside  <p >.

Never do:

 html
<p>
  Some text
  <div>...</div>
</p>
 

 
PART 8 — INLINE TEXT RULES
    

Inside headings, paragraphs, list items, and other text content, use only simple inline elements when necessary.

Allowed:

*  <strong >
*  <em >
*  <b >
*  <i >
*  <u >
*  <br >
*  <code >
*  <mark >
*  <a >

Avoid  <span > for arbitrary styling.

Do not place classes or IDs on inline text elements unless absolutely required for accessibility or functionality.

Do not create excessive inline wrappers.

If an entire heading needs special styling, give the heading itself a class.

 
PART 9 — CLASS NAMING SYSTEM
 =

Use lowercase kebab-case class names.

Examples:

 text
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
 

Avoid:

 text
HeroTitle
hero_title
heroTitle
HERO-TITLE
randomBox
box1
style2
 

## 9.1 Reusable classes

Create and reuse shared classes instead of creating unique CSS for every element.

At minimum, when relevant, use reusable classes such as:

 text
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
 

Do not create duplicate styles under multiple unnecessary class names.

 
PART 10 — SECTION STRUCTURE
 

After the hero, sections should generally follow a consistent structure.

Recommended:

 html
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
 

The .section-head should normally contain:

1. eyebrow
2. section title
3. section lead

Do not force .section-head into sections that genuinely do not need it, such as a highly visual CTA band, unless Part 1 specifically requires it.

The hero is the only section that should normally contain the page's  <h1 >.

 
PART 11 — HERO SECTION
   

The hero should feel visually distinct from the rest of the page.

It should normally contain:

* event identity
* eyebrow or supporting label where appropriate
* one primary  <h1 >
* concise supporting copy
* primary CTA
* optional secondary CTA
* optional event metadata
* optional visual treatment

Do not overload the hero with excessive text.

The primary CTA must be visually obvious.

The hero must remain usable on mobile.

Do not rely on 100vh for the hero height.

Use responsive padding instead.

 
PART 12 — BUTTONS AND CTA RULES
 =

Use anchors for navigation and event actions.

Example:

 html
<a class="btn btn-primary" href="#register">Register Now</a>
 

CTA anchors must contain plain text.

Do not put decorative icons or  <span > elements inside CTA anchors unless Part 1 explicitly requires them.

Use:

 html
<button type="button">
 

only for actual JavaScript controls such as:

* mobile navigation toggle
* tabs
* expandable controls
* custom UI controls

Do not use  <button > for normal navigation.

Every button must have a clear purpose.

 
PART 13 — LINKS
  =

Use  <a > for:

* navigation
* section jumps
* external pages
* event actions
* downloads

Use:

 html
href="#section-id"
 

for in-page navigation.

Use full HTTPS URLs for external destinations.

If an external link opens a new tab, use:

 html
target="_blank"
rel="noopener noreferrer"
 

Do not create fake links using:

 html
href="#"
 

unless JavaScript behavior specifically requires it.

Do not use JavaScript-only navigation when a normal anchor can perform the same task.

 
PART 14 — FORMS
  =

Forms are allowed only when required by Part 1.

If a form is included:

Every input must have:

*  <label >
* for
* matching id
* name

Use appropriate input types.

Example:

 html
<label for="email">Email address</label>
<input id="email" name="email" type="email">
 

Do not create inaccessible unlabeled fields.

If the visual page builder provides the real event submission system, do not invent a fake backend.

Do not pretend a form has been submitted to a server when no backend exists.

If a demonstration-only form is explicitly required, prevent default submission and display a clearly labeled client-side confirmation.

 
PART 15 — EVENT-SPECIFIC CTA PLACEHOLDERS
   =

When the project uses event registration/submission infrastructure, preserve the exact event placeholders supplied by the project specification.

Never replace an event placeholder with a fake URL.

For example, if provided:

 html
<a class="btn btn-primary" href="{{event_register_url}}">Register Now</a>
 

keep the placeholder exactly as provided.

Do not modify:

* placeholder names
* braces
* capitalization
* URL structure

The same rule applies to event dates, times, deadlines, countdown targets, and other builder-provided tokens.

 
PART 16 — IMAGES
  

Follow the image requirements in Part 1 exactly.

If images are required:

* use reliable HTTPS URLs
* never invent a fake image path
* provide meaningful alt text
* include width and height attributes
* use CSS for responsive sizing
* use object-fit: cover where appropriate

For placeholder images, use:

 text
https://picsum.photos/seed/<one-word>/<width>/<height>
 

Example:

 text
https://picsum.photos/seed/event/1200/700
 

Do not repeatedly reuse the same random image for unrelated content.

Do not use broken or speculative image URLs.

If Part 1 says images are not allowed, do not add images.

 
PART 17 — ICONS
  =

Use inline SVG icons only.

Every decorative SVG should include:

 html
aria-hidden="true"
 

Icons must not be the only indication of meaning.

Do not use:

* icon fonts
* Font Awesome
* Material Icons
* Lucide packages
* external SVG libraries
* remote icon kits

Do not use emoji as replacement icons unless Part 1 explicitly asks for them.

 
PART 18 — CSS ARCHITECTURE
    

Organize CSS into exactly these logical groups, in this order:

1. Tokens
2. Base
3. Layout
4. Components
5. Sections
6. Responsive

Example:

 css
/*    
   TOKENS
    */

/*    
   BASE
    */

/*    
   LAYOUT
    */

/*    
   COMPONENTS
    */

/*    
   SECTIONS
    */

/*    
   RESPONSIVE
    */
 

Keep the CSS easy for a visual page builder user to inspect and edit.

 
PART 19 — DESIGN TOKENS
   =

Define the main design system once on :root.

Example:

 css
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
 

Use CSS variables throughout the stylesheet.

Do not repeatedly hard-code the same colors, radii, or shadows.

Part 1's actual colors override these examples.

 
PART 20 — BASE CSS
   

The body should own:

* background color
* text color
* font family
* base font size
* line height

Do not use:

 css
html {
  font-size: ...;
}
 

Do not globally override browser behavior unnecessarily.

Use:

 css
* {
  box-sizing: border-box;
}
 

where appropriate.

Images should normally use:

 css
img {
  display: block;
  max-width: 100%;
}
 

 
PART 21 — TYPOGRAPHY
    

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

Use clamp() for major responsive headings where appropriate.

Do not use more than the required number of font families.

Typography should remain readable on small screens.

 
PART 22 — SPACING SYSTEM
   

Use a consistent spacing rhythm.

Major sections should normally use generous vertical padding, for example:

 css
padding: 96px 0;
 

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

 
PART 23 — RESPONSIVE DESIGN
 

Design desktop-first around approximately 1300px.

Use only these primary responsive breakpoints:

 css
@media (max-width: 992px)
 

and:

 css
@media (max-width: 600px)
 

Do not create many unnecessary breakpoints.

Do not use:

* and
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

 
PART 24 — HEIGHT AND WIDTH RULES
  

Avoid:

 css
width: 100vw;
height: 100vh;
 

for normal page sections.

Prefer:

 css
width: 100%;
 

and responsive padding.

Do not create sections that accidentally cause horizontal scrolling.

Ensure:

 css
overflow-x: hidden;
 

is not used as a lazy fix for broken layout.

Fix the underlying layout problem instead.

 
PART 25 — POSITIONING
    =

Do not use absolute positioning for primary layout.

Allowed uses:

* decorative circles
* background shapes
* floating badges
* controlled overlays
* visual ornaments

Do not position important text or content using arbitrary top, left, right, or bottom values.

The page must naturally reflow when content changes.

 
PART 26 — HEADER AND NAVIGATION
 =

The header should use:

 css
position: sticky;
top: 0;
 

Do not use position: fixed for the main header.

The header must:

* remain accessible
* have sufficient contrast
* work on mobile
* not cover the first section
* have clear navigation labels

If a mobile menu is required:

* use a real  <button type="button" >
* provide an accessible label
* toggle a class
* do not inject the menu with JavaScript
* keep the menu markup present in the HTML

The page should still expose navigation content when JavaScript is unavailable.

 
PART 27 — INTERACTIVE CONTENT
  

All important content must exist in the initial HTML.

Do not generate essential page content dynamically with JavaScript.

Do not require JavaScript for:

* reading the event information
* reading section content
* reading FAQ answers
* viewing important CTA content
* understanding the event

JavaScript should enhance the page rather than create the page.

 
PART 28 — FAQ
   =

For FAQs, prefer native HTML:

 html
<details class="faq-item">
  <summary>Question</summary>
  <p>Answer</p>
</details>
 

This provides built-in accessibility and works without JavaScript.

Do not create a JavaScript-only FAQ when  <details > can solve the requirement.

 
PART 29 — TABS
  

If tabs are required:

* all tab content must exist in the HTML
* inactive panels may use the hidden attribute
* JavaScript should toggle the hidden state
* active state should be communicated visually
* keyboard interaction must remain usable

Do not remove panel content from the DOM.

 
PART 30 — SCROLL REVEAL
   =

Animations must never make content inaccessible.

All content must start visible when JavaScript is disabled.

If scroll-reveal animation is used:

JavaScript may add:

 javascript
document.documentElement.classList.add('js');
 

and CSS may use:

 css
html.js .reveal {
  opacity: 0;
}
 

The script must then add the appropriate visible/revealed class.

Do not hide important content using CSS alone on initial page load.

Avoid excessive animation.

The event page should feel elegant, not distracting.

 
PART 31 — CSS VISIBILITY RULES
 

Do not hide content on load with:

 css
display: none;
 

 css
visibility: hidden;
 

 css
opacity: 0;
 

 css
max-height: 0;
 

unless the element is genuinely an interactive state such as:

* an inactive tab
* a closed mobile menu
* a collapsed component
* dynamically revealed content

Important static content must remain visible.

 
PART 32 — INTERACTION DESIGN
 =

Interactive elements should have:

* hover states
* focus states
* active states where appropriate

Use subtle transitions:

 css
transition: 0.2s ease;
 

or:

 css
transition: 0.3s ease;
 

Do not animate everything.

Avoid:

* excessive bouncing
* constant pulsing
* distracting transforms
* aggressive parallax
* continuous motion

Animations should support the event's atmosphere and hierarchy.

 
PART 33 — JAVASCRIPT ARCHITECTURE
  =

Use vanilla JavaScript only.

Place all JavaScript inside one  <script > at the end of  <body >.

Wrap the code in an IIFE:

 javascript
(function () {
  "use strict";

  // code

})();
 

Do not expose unnecessary global variables.

 
PART 34 — JAVASCRIPT SELECTORS
 

Select elements using stable IDs or complete class names.

Good:

 javascript
document.querySelector('.faq-item');
document.getElementById('mobile-menu');
 

Avoid dynamically constructing selectors:

 javascript
document.querySelector('.tab-' + index);
 

Use complete literal class and ID strings.

Do not create HTML using JavaScript strings.

Never use:

 javascript
innerHTML = '<div class="...">';
 

Prefer existing HTML elements and:

* textContent
* classList
* setAttribute
* removeAttribute
* hidden

when appropriate.

 
PART 35 — JAVASCRIPT BEHAVIOR
  

JavaScript may be used for:

* mobile navigation
* tabs
* countdown
* smooth scrolling
* lightweight UI state
* form demonstration behavior when explicitly required

JavaScript must not be required for the page's basic content.

Do not use:

 javascript
document.write()
 

Do not use:

 javascript
eval()
 

Do not use:

* cookies
* localStorage
* sessionStorage
* network requests
* AJAX
* fetch
* XMLHttpRequest

unless Part 1 explicitly requires an external integration.

 
PART 36 — ACCESSIBILITY
   =

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

 css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
 

Do not remove focus outlines without replacing them with a stronger visible focus treatment.

Aim for WCAG-friendly contrast, especially approximately 4.5:1 for normal text.

 
PART 37 — MOBILE ACCESSIBILITY
 

On mobile:

* buttons must remain easy to tap
* text must remain readable
* links must not be impossibly close together
* navigation controls must have clear labels
* important content must not overflow horizontally

Do not depend on hover interactions for important functionality.

 
PART 38 — CONTENT RULES
   =

Write realistic, specific, human-sounding copy.

Do not use:

* Lorem ipsum
* generic filler
* meaningless placeholder paragraphs
* repeated sentences
* vague corporate language
* obvious AI-style filler

Copy should feel specifically written for the event described in Part 1.

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

 
PART 39 — COPY LENGTH
    =

Keep headings concise.

As a general guideline:

* eyebrow: 1–5 words
* heading: ideally under 8 words
* paragraph: 1–3 sentences
* card description: concise
* button: 1–4 words

Exceptions are allowed when Part 1 provides required wording that is longer.

Do not shorten required client copy.

 
PART 40 — VISUAL CONSISTENCY
 =

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

 
PART 41 — PREMIUM EVENT DESIGN
 

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

 
PART 42 — CARD COMPONENTS
   =

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

 
PART 43 — FOOTER
  

The footer should contain appropriate event information such as:

* event name
* short description
* navigation
* relevant links
* contact information where provided
* copyright information where appropriate

Do not invent contact details.

Keep the footer visually consistent with the event identity.

 
PART 44 — PROHIBITED IMPLEMENTATION PATTERNS
   

Do NOT use:

* inline style=""
* inline onclick=""
* inline event handlers
* document.write
* eval
* innerHTML for building page markup
* external frameworks
* CSS frameworks
* JavaScript libraries
* unnecessary CDN dependencies
* iframes
*  <object >
*  <embed >
*  <noscript >
*  <iframe srcdoc >
* canvas-based UI
* SVG-as-an-image for icons
* excessive absolute positioning
* excessive CSS specificity
* !important
* giant generated CSS blocks with duplicate rules
* unnecessary duplicate components
* fake backend behavior
* fake API calls
* lorem ipsum
* inaccessible interactive controls

 
PART 45 — BUILDER-SAFE HTML
 

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

 
PART 46 — PERFORMANCE
    =

Keep the page lightweight.

Avoid:

* unnecessary dependencies
* huge JavaScript bundles
* excessive animation
* unnecessary DOM nodes
* repeated inline SVG definitions
* unnecessary external requests

Use CSS rather than JavaScript for visual effects whenever possible.

 
PART 47 — QUALITY CHECK BEFORE OUTPUT
  =

Before returning the HTML, internally verify all of the following:

### HTML

* Valid complete HTML document
* Correct doctype
* Correct language attribute
* One <h1>
* Logical heading hierarchy
* Semantic sections
* Unique IDs
* No broken nesting
* No block elements inside paragraphs
* No duplicate IDs
* No unnecessary wrappers

### Builder compatibility

* Major sections are direct children of <body>
* Each major section is independently identifiable
* .container is reused
* No essential content is dynamically generated
* HTML remains readable/editable
* No builder-hostile dependencies

### CSS

* One <style> block
* Tokens defined once
* No unnecessary hard-coded repeated values
* No !important
* Low specificity
* Responsive rules included
* No accidental horizontal overflow
* Mobile layout works
* Focus states exist
* Hover states exist where appropriate

### JavaScript

* One <script> block
* Located at the end of <body>
* Wrapped in an IIFE
* Vanilla JavaScript only
* No inline event handlers
* No eval
* No document.write
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

 
PART 48 — IMPORTANT PRIORITY RULE
  =

Part 2A (the style format: Tailwind classes, no CSS code, no JavaScript) overrides every other part that mentions CSS, classes, variables, media queries, animations or scripts.

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

 
PART 49 — FINAL INSTRUCTION
 

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

Return only ONE complete: html...

HTML code block.`

export const buildImportHtmlPrompt = (id: ImportHtmlPresetId) => `${importHtmlPromptPage(id)}\n\n${IMPORT_HTML_PROMPT_RULES}`
