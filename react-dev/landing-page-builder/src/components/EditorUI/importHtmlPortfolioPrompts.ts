// Portfolio-website prompts for the Import HTML dialog: one Part 1 per professional field.
// Used with PORTFOLIO_INTRO (instead of the event intro) and the same Part 2 rules as every other prompt.

export const PORTFOLIO_INTRO = `You are a senior front-end developer, creative web designer, and personal-branding specialist. Build a complete, production-quality, visually striking portfolio website for the professional described in Part 1 using only **HTML, CSS, and vanilla JavaScript**. The final webpage must feel like a premium, personal, modern website made specifically for that person or studio, not a generic template. It should show who they are, prove their skill through real-looking work, explain how they work, build trust, and give visitors one clear way to get in touch. It will be pasted into a visual page builder's "Import HTML" feature, which turns the markup into editable blocks.

Portfolio note: the rules in Part 2 are written for event pages. Wherever they say "event", read it as "this portfolio / this person's brand" (the event name is the person's or studio's name). This page needs no event placeholders; the contact action is a mailto link or a labeled contact form.

 = PART 1: THE PAGE (edit freely)  =`

const CONTACT_FORM = `a contact form with labeled Name, Email and Message fields and a "Send message" button (demo only: prevent default submission and show a short client-side thank-you)`

export const PORTFOLIO_PRESETS = [
	{
		id: "portfolioBlank",
		page: `- Purpose: [e.g. Personal portfolio for a freelance brand designer who wants more client enquiries]
- Audience: [e.g. startups and small businesses hiring a designer]
- Language of the copy: [e.g. English]
- Sections, in order: [e.g. header/nav, hero with name and role, about, selected work (6 project cards), services, process, tools, testimonials, experience, contact, footer]
- Visual style: [e.g. light warm-grey background, black text, one orange accent, large editorial headings]
- Fonts: [e.g. Fraunces for headings, Inter for body]
- Extra details: [e.g. name, city, email, availability, social links, number of projects, years of experience]`,
	},
	{
		id: "portfolioDesigner",
		page: `- Purpose: Personal portfolio of Mariana Napolitani, a UI/UX and web designer. Goal: show 3 flagship projects, explain her process and turn visitors into project enquiries. The page should feel like a dark, editorial, luxury magazine cover.
- Audience: founders, brands and agencies looking for a designer for a website or product.
- Language of the copy: English
- Sections, in order:
  1. Top strip: small caps "UI/UX & WEB DESIGNER" on the left and "CREATIVE PORTFOLIO" on the right.
  2. Hero: a huge, tall, high-contrast serif word "PORTFOLIO" spanning the full width in a warm beige, with a large portrait of the designer (dark bob haircut, sunglasses, black blazer, cut out) standing in front of the lower half of the letters so the word is partly covered. Left under the word: the line "I DESIGN DIGITAL EXPERIENCES THAT INSPIRE & CONNECT" in spaced capitals, a pill button "Available for projects" with a small sparkle icon, and her name "Mariana Napolitani" in a red script signature. Right: a short 3-line intro ("I'm a UI/UX and Web Designer crafting elegant, functional and user-centered digital experiences.") and "BASED IN ANY CITY / WORKING WORLDWIDE" with a circled globe icon. Dark red petals decorate the edges.
  3. Selected projects: a section heading "SELECTED PROJECTS" with a sparkle icon and a "VIEW ALL PROJECTS" link with an arrow on the right. Three equal bordered columns, each with a number (01, 02, 03), the project name (VELVET STUDIO - Branding & Web Design, AURORA SHOP - E-Commerce Design, MINDSPACE - Landing Page Design), a website screenshot (16:10, each in its own colour mood: burgundy, brown, dark red), and 3 small outlined tag chips (for example BRANDING, WEB DESIGN, UI/UX).
  4. Process and tools: two panels side by side. Left, "MY PROCESS": 5 numbered steps (01 Discover, 02 Define, 03 Design, 04 Develop, 05 Deliver), each with a one-line description, next to a round arc frame holding a dark red flower image and the italic words "A thoughtful process for meaningful results." Right, "TOOLS I USE": a 2-column by 4-row grid of dark tiles with a small coloured inline SVG badge and the name (Figma, Adobe XD, Photoshop, Illustrator, Webflow, Framer, Notion, Slack) and a small line "& MORE GREAT TOOLS".
  5. Kind words: heading "KIND WORDS"; three testimonial cards in a row, each with a large red quote mark, 2-3 lines of praise, a round avatar and a name with role (Sofia L., Founder, Velvet Studio / Daniel R., CEO, Aurora Shop / James T., Marketing Director).
  6. Contact: three columns. Left: "LET'S CREATE SOMETHING" with the word "Amazing" in a large red script. Middle: "I'M CURRENTLY OPEN FOR NEW PROJECTS", one sentence, and an outlined pill button "SEND ME A MESSAGE" (a mailto link). Right: a list with icons for email (hello@mariana-design.com), Instagram (@mariana.design) and location (Any City, Anywhere). A black-and-white portrait photo sits at the far right, overlapping the section edge.
  7. Footer: a full-width dark burgundy bar with centered small caps "THANK YOU FOR VISITING" and a sparkle icon.
- Visual style: near-black background (#0d0909), cards in slightly lighter charcoal-brown (#1a1213) with 1px muted borders, warm beige (#d8b9a0) for the giant headline, deep burgundy (#6d1c2b) and rose-red (#a8323f) for accents, signature and quote marks, muted taupe for small text. Luxury fashion-editorial mood, lots of letter-spacing on small caps, thin lines, no bright colours, subtle grain or vignette on the hero.
- Fonts: Bodoni Moda (or Playfair Display) for the giant PORTFOLIO word, Cormorant Garamond for headings and quotes, Jost for small caps labels and body text, Pinyon Script for the signature and "Amazing".
- Extra details: the hero image is a cut-out style portrait (use a placeholder image and let it overlap the word with a higher z-index). On small screens stack everything in one column and reduce the giant word to fit the width without cutting letters.`,
	},
	{
		id: "portfolioDeveloper",
		page: `- Purpose: Portfolio of Arjun Mehta, a full-stack software engineer. Goal: show shipped products, technical depth and get recruiters and clients to reach out.
- Audience: hiring managers, engineering leads and startup founders.
- Language of the copy: English
- Sections, in order:
  1. Header: monogram logo "AM", nav links (Work, Skills, Experience, Writing, Contact) and a "Download CV" outline button.
  2. Hero: eyebrow "Full-stack engineer, Berlin", h1 about building fast, reliable products, one-line lead, two buttons ("View projects", "Contact me"), and a code-window card on the right showing a short, decorative snippet (plain text in a styled pre).
  3. Stats: 4 tiles (years of experience, products shipped, open-source stars, uptime).
  4. Featured projects: 4 project cards, each with a screenshot, title, a 2-line problem and result description, tech-stack chips and two links ("Live demo", "Source").
  5. Skills: grouped lists in 4 columns (Frontend, Backend, Cloud and DevOps, Tooling), each skill as a chip.
  6. Experience: a vertical timeline with 4 roles (company, title, dates, 2 bullet achievements with numbers).
  7. Open source and writing: 3 article or repository cards with title, one line and a date.
  8. Testimonials: 2 quotes from a former manager and a client.
  9. Contact: heading "Let's build something", one sentence, ${CONTACT_FORM}, and links to email, GitHub and LinkedIn.
  10. Footer: copyright and a "Back to top" link.
- Visual style: dark developer aesthetic, near-black blue background (#0b1020), electric green (#3ddc97) accent, subtle grid-line background, monospace labels, card borders 1px with soft glow on hover, no stock-photo feel.
- Fonts: JetBrains Mono for labels and code, Space Grotesk for headings, Inter for body text.
- Extra details: email arjun@arjunmehta.dev, available for freelance from next month, response time under 24 hours.`,
	},
	{
		id: "portfolioPhotographer",
		page: `- Purpose: Portfolio of Lena Hoffmann, an editorial and wedding photographer. Goal: let the photos lead and bring in booking enquiries.
- Audience: couples, magazines, brands and event planners.
- Language of the copy: English
- Sections, in order:
  1. Header: text logo "LENA HOFFMANN", minimal nav (Work, Series, About, Pricing, Contact), transparent over the hero.
  2. Hero: full-viewport image with a soft dark overlay, centered name, one line "Light, quiet moments and honest portraits" and a "View portfolio" link.
  3. Selected work: a masonry-style gallery of 9 images in mixed portrait and landscape ratios with a category filter row (All, Weddings, Editorial, Portraits, Travel) that works with vanilla JavaScript; each image has a small caption.
  4. Series: 3 large featured series blocks alternating image left and right, each with title, year, location and a 2-sentence story.
  5. About: a portrait of the photographer next to 2 short paragraphs and a signature-style name.
  6. Services and pricing: 3 packages (Portrait session, Wedding day, Editorial and commercial) with what is included and a "from" price.
  7. Press and clients: a row of 6 text-only publication names.
  8. Testimonials: 3 short client quotes with names.
  9. Contact: "Let's make something beautiful", ${CONTACT_FORM}, plus studio email, phone and city.
  10. Footer: social links as text and copyright.
- Visual style: gallery minimalism; white or warm off-white background, near-black text, no coloured accent except a thin warm grey; images are the colour, large type for headings, square corners, plenty of whitespace, slow fade-ins.
- Fonts: Cormorant Garamond for headings, DM Sans for body text.
- Extra details: based in Hamburg, travels worldwide, booking calendar open for 2026, email hello@lenahoffmann.photo.`,
	},
	{
		id: "portfolioArchitect",
		page: `- Purpose: Portfolio of Studio Norra, an architecture and interior design practice. Goal: present built projects with credibility and attract residential and commercial clients.
- Audience: homeowners, developers, hotels and restaurant owners.
- Language of the copy: English
- Sections, in order:
  1. Header: studio wordmark "NORRA", nav links (Projects, Studio, Services, Journal, Contact) and an "Enquire" button.
  2. Hero: very large image of a building, with the studio statement "Spaces shaped by light, material and the people who use them" in a big thin heading and a scroll hint.
  3. Selected projects: 6 project cards in a 2x3 grid, each with image, name, location, year and type (Residential, Hospitality, Workplace); an index list on the side with project names.
  4. Featured case study: one project in depth with a large image, a facts column (location, area, year, team, status) and a 3-step story (Brief, Design, Result).
  5. Services: 4 items (Architecture, Interior design, Master planning, Project management) each with a short description.
  6. Approach: 4 numbered principles in a row.
  7. Numbers: 4 stats (projects completed, years of practice, awards, team size).
  8. Awards and press: a simple list of 5 awards with year and publication.
  9. Team: 4 people with portrait, name and role.
  10. Contact: "Start a project", short text, ${CONTACT_FORM}, office address and phone.
  11. Footer: studio details, social links as text, copyright.
- Visual style: architectural and calm; warm concrete grey and white palette (#f1efea, #1c1c1a), one terracotta accent (#b5583a), thin 1px structural lines, big images with generous gaps, grid-aligned layout, uppercase tracked small labels.
- Fonts: Archivo (wide) for headings, Inter for body text.
- Extra details: studio in Copenhagen, founded 2012, team of 14, email studio@norra.dk.`,
	},
	{
		id: "portfolioFilmmaker",
		page: `- Purpose: Portfolio of Kai Moreno, a filmmaker and video editor. Goal: show reels and projects and get commissions for brand films, music videos and documentaries.
- Audience: brands, agencies, musicians and production companies.
- Language of the copy: English
- Sections, in order:
  1. Header: text logo "KAI MORENO FILMS", nav links (Reel, Projects, Services, About, Contact).
  2. Hero: wide cinematic image (2.39:1 feel) with letterbox bars, a large play button graphic (decorative only), headline "Stories in motion" and the line "Director, cinematographer and editor". A "Watch the 2026 reel" button.
  3. Selected films: 6 cards with a 16:9 still, title, client, type and year; the first card is larger.
  4. Services: 4 items (Brand films, Music videos, Documentary, Editing and colour) with a short description.
  5. Process: 5 steps in a row (Brief, Treatment, Shoot, Edit and grade, Delivery).
  6. Behind the scenes: a strip of 4 still frames with short captions.
  7. Clients: 6 text-only client names.
  8. Testimonials: 3 quotes with name and company.
  9. Contact: "Have a story to tell?", ${CONTACT_FORM}, email and a response-time note.
  10. Footer: social links as text and copyright.
- Visual style: cinematic; near-black (#0a0a0a) background, film-grain feel via subtle gradients, one amber accent (#e0a526), wide letterboxed images, uppercase tracked labels with thin lines, slow fade-in on scroll.
- Fonts: Bebas Neue for big headings, Inter for body text.
- Extra details: based in Los Angeles, available worldwide, email kai@kaimorenofilms.com, gear mentioned in one line (cinema camera, anamorphic lenses, DaVinci Resolve).`,
	},
	{
		id: "portfolioIllustrator",
		page: `- Purpose: Portfolio of Noor Ibrahim, an illustrator and character artist. Goal: show a recognisable style and win book, editorial and brand illustration commissions.
- Audience: publishers, magazines, game studios and brands.
- Language of the copy: English
- Sections, in order:
  1. Header: hand-lettered text logo "Noor", nav links (Work, Commissions, About, Shop, Contact).
  2. Hero: playful oversized h1 "Hello, I draw things", a short intro, two buttons ("See my work", "Commission me") and a collage of 4 overlapping artwork images with slight rotations.
  3. Selected work: a grid of 8 artworks (mixed sizes) with category chips filter (All, Books, Editorial, Characters, Brand) working with vanilla JavaScript.
  4. Style and process: 4 steps (Sketch, Ink, Colour, Polish) each with a small image and a line of text.
  5. Commissions: 3 packages (Spot illustration, Full-page illustration, Character sheet) with scope, turnaround and a "from" price.
  6. Clients and publications: 6 text-only names.
  7. About: portrait, 2 short paragraphs, and a list of favourite tools.
  8. Shop: 3 product cards (print, sticker pack, zine) with price and a "Buy" link.
  9. Testimonials: 2 quotes.
  10. Contact: "Got an idea?", ${CONTACT_FORM}, plus email and social handles as text.
  11. Footer: copyright and a hand-drawn style divider.
- Visual style: warm, colourful and friendly; cream background (#fff6e8), deep ink-blue text (#1f2a44), coral (#ff6b57), mustard (#f4b942) and teal (#2a9d8f) accents, rounded corners, hand-drawn style borders and squiggle dividers drawn with inline SVG, slight tilts on cards.
- Fonts: Fraunces for headings, Nunito for body text.
- Extra details: based in Toronto, works with clients worldwide, usual turnaround 2-4 weeks, email hello@noor-draws.com.`,
	},
	{
		id: "portfolioWriter",
		page: `- Purpose: Portfolio of Priya Raman, a freelance writer, copywriter and journalist. Goal: show credibility through bylines and clear writing samples and win commissions.
- Audience: editors, content leads, brands and start-ups.
- Language of the copy: English
- Sections, in order:
  1. Header: text logo "Priya Raman", nav links (Writing, Services, About, Press, Contact).
  2. Hero: a confident text-led hero (no image needed): h1 "Words that make people stop scrolling", a short intro, and two buttons ("Read my work", "Hire me"); a small line of publication names below.
  3. Selected writing: 6 article cards with publication, title, a 2-line excerpt, date and a "Read" link; filter chips (All, Journalism, Brand, Long-form, Newsletters).
  4. Case studies: 2 copywriting results with a short problem, what was written and a number (for example conversion up 38 percent).
  5. Services: 4 items (Articles and features, Brand copy, Newsletters, Editing and ghostwriting) each with a short description and typical turnaround.
  6. About: a portrait with 2 paragraphs in first person and a short list of beats and topics.
  7. Press and clients: a row of 8 text-only publication and brand names.
  8. Testimonials: 3 quotes from editors and clients.
  9. Newsletter and contact: a short invitation, ${CONTACT_FORM}, plus email.
  10. Footer: social links as text and copyright.
- Visual style: editorial and literary; warm off-white paper background (#faf7f2), near-black ink text, one deep green accent (#1f5c4d), thin rules, very readable column widths, drop-cap on the first paragraph of About.
- Fonts: Newsreader or Source Serif 4 for headings and body text, Inter for small labels.
- Extra details: based in Mumbai, works in English, rates on request, email priya@priyaraman.com. Use realistic but obviously sample article titles.`,
	},
	{
		id: "portfolioMarketer",
		page: `- Purpose: Portfolio of Elena Vasquez, a growth and brand marketing consultant. Goal: prove results with numbers and book discovery calls.
- Audience: SaaS and e-commerce founders and marketing leads.
- Language of the copy: English
- Sections, in order:
  1. Header: logo "Elena Vasquez", nav links (Results, Services, Case studies, Process, About, Contact) and a "Book a call" button.
  2. Hero: h1 about turning marketing into measurable growth, one-line lead, a "Book a call" button and 3 proof stats (revenue generated, brands helped, average ROI).
  3. Trusted by: a row of 6 text-only brand names.
  4. Results: 3 big metric cards (for example +212 percent organic traffic, 3.4x return on ad spend, 41 percent lower acquisition cost) each with the client type and time frame.
  5. Services: 4 cards (Growth strategy, Paid media, SEO and content, Lifecycle and email) with a short description and deliverables.
  6. Case studies: 3 cards with logo-style text, the challenge, the approach and the result.
  7. Process: 4 steps (Audit, Strategy, Execute, Optimise).
  8. About: portrait with 2 paragraphs and a list of certifications.
  9. Testimonials: 3 client quotes with name and company.
  10. FAQ: 5 <details> items (engagement models, minimum budget, timeline, reporting, industries).
  11. Contact: "Book a free 30-minute call", ${CONTACT_FORM}.
  12. Footer: social links as text and copyright.
- Visual style: confident and clean; white background, deep navy text (#0f1b3d), one vivid violet accent (#6c4cf1) with a soft gradient on key buttons and metric numbers, rounded cards with light shadows, large numerals.
- Fonts: Manrope for headings, Inter for body text.
- Extra details: based in Madrid, works remotely with clients in Europe and the US, email elena@elenavasquez.co. Use sample numbers only.`,
	},
	{
		id: "portfolioMusician",
		page: `- Purpose: Portfolio and press page of Nova Reyes, a singer-songwriter and live performer. Goal: introduce the music, show live dates and make it easy to book her.
- Audience: fans, venue bookers, festival programmers and music journalists.
- Language of the copy: English
- Sections, in order:
  1. Header: text logo "NOVA REYES", nav links (Music, Live, Gallery, Press, Booking).
  2. Hero: moody full-width image with an overlay, huge name as the headline, tagline "Dream pop for late-night drives", and two buttons ("Listen now", "Booking").
  3. Music: a featured latest single card with cover art, title and a "Play" button (decorative), plus a list of 5 tracks with duration and a fake play icon drawn in inline SVG.
  4. Live: an upcoming-dates table with date, city, venue and a "Tickets" link for 5 shows.
  5. Gallery: 6 live and press photos in a tight grid.
  6. About: portrait and a 3-paragraph artist bio.
  7. Press: 3 quotes from magazines with the publication name.
  8. Epk and booking: a rider summary (band size, set length, stage needs) and ${CONTACT_FORM}, plus the booking agent email.
  9. Footer: streaming and social links as text and copyright.
- Visual style: nocturnal and atmospheric; deep indigo-black background (#0c0a1d), neon pink (#ff4fa3) and cyan (#4fe3ff) glow accents, blurred gradients, grain-like gradients, large condensed headings, a little glow on hover.
- Fonts: Syne for headings, Inter for body text.
- Extra details: based in Mexico City, debut album "Neon Static" out 2026, booking@novareyes.com. Use sample dates and venues.`,
	},
	{
		id: "portfolioFashion",
		page: `- Purpose: Portfolio of Atelier Sora, an independent fashion designer. Goal: present collections and craftsmanship and attract buyers, stylists and press.
- Audience: boutiques, stylists, editors and private clients.
- Language of the copy: English
- Sections, in order:
  1. Header: wordmark "ATELIER SORA" centered, nav links on both sides (Collections, Lookbook, About, Press, Contact).
  2. Hero: a tall editorial image with the collection name "Autumn / Winter 2026" and a "View lookbook" link.
  3. Collections: 3 collection cards (Capsule, Ready-to-wear, Bridal) with cover image, season and short description.
  4. Lookbook: a gallery of 8 looks in portrait ratio with look numbers (Look 01 ...) and fabric notes on hover.
  5. Craft: a split section about materials and made-to-measure work with an image and 3 small facts (fabric sourcing, handmade hours, small batches).
  6. Designer story: portrait and 2 paragraphs.
  7. Press: 4 magazine names with a short quote each.
  8. Stockists and appointments: a list of 4 cities and a "Book a fitting" ${CONTACT_FORM}.
  9. Footer: newsletter-style line without a form, social links as text and copyright.
- Visual style: quiet luxury; ivory background (#f6f1ea), charcoal text, a muted clay accent (#a4684f), huge whitespace, thin lines, tall images, uppercase tracked small text, no shadows.
- Fonts: Bodoni Moda or Cormorant Garamond for headings, Jost for body text.
- Extra details: studio in Tokyo, ships worldwide, appointments by request, email studio@ateliersora.com.`,
	},
	{
		id: "portfolio3d",
		page: `- Purpose: Portfolio of Theo Lindqvist, a 3D and motion designer. Goal: show animated work and get commissions for product visuals, title sequences and brand animation.
- Audience: agencies, tech brands, game studios and music artists.
- Language of the copy: English
- Sections, in order:
  1. Header: logo "TL", nav links (Work, Showreel, Services, About, Contact) and a "Hire me" button.
  2. Hero: dark hero with a bold h1 "3D that moves people", a short lead, a "Watch showreel" button and an abstract glossy 3D-style shape built with CSS gradients (no video needed).
  3. Selected work: 6 project cards with a rendered still (16:9), title, client, tools used (Blender, Cinema 4D, After Effects) and a hover zoom.
  4. Showreel: a large video-style frame with a decorative play button and runtime.
  5. Services: 4 items (Product visualisation, Motion graphics, Title sequences, Look development).
  6. Pipeline: 5 steps in a row (Concept, Model, Animate, Render, Composite).
  7. Tools: 8 tiles with the software names.
  8. Testimonials: 3 quotes.
  9. Contact: "Got a brief?", ${CONTACT_FORM}, plus email.
  10. Footer: social links as text and copyright.
- Visual style: futuristic and glossy; black background (#07070a), gradient accents from electric blue (#3a7bff) to magenta (#ff3ad4), glass-like cards with subtle blur and 1px light borders, large bold headings.
- Fonts: Unbounded or Space Grotesk for headings, Inter for body text.
- Extra details: based in Stockholm, works remotely, email theo@theolindqvist.com, typical project length 2-6 weeks.`,
	},
]
