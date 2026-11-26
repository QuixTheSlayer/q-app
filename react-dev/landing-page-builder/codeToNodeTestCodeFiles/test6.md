<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Registration page for the 2026 Asia Design Awards — celebrating outstanding designers, studios, and creative teams across Asia.">
  <title>Asia Design Awards 2026 — Submit Your Work</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap">

  <style>
    :root {
      --bg: #0b1020;
      --surface: #121a2d;
      --surface-light: #18233b;
      --text: #f6f2e8;
      --muted: #aeb6c7;
      --accent: #d7ad5b;
      --accent-light: #efd18f;
      --border: rgba(255, 255, 255, 0.1);
      --radius: 18px;
      --shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
      --max-width: 1200px;
    }

    * {
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
    }

    html.js .reveal {
      opacity: 0;
      transform: translateY(18px);
    }

    html.js .reveal.is-visible {
      opacity: 1;
      transform: translateY(0);
    }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: "Inter", sans-serif;
      font-size: 16px;
      line-height: 1.65;
    }

    img {
      display: block;
      max-width: 100%;
    }

    a {
      color: inherit;
      text-decoration: none;
      transition: color 0.25s ease, background-color 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
    }

    a:hover,
    a:focus-visible {
      color: var(--accent-light);
    }

    button,
    input,
    select,
    textarea {
      font: inherit;
    }

    button,
    .btn {
      transition: color 0.25s ease, background-color 0.25s ease, border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
    }

    button:focus-visible,
    a:focus-visible,
    input:focus-visible,
    select:focus-visible,
    textarea:focus-visible,
    summary:focus-visible {
      outline: 3px solid var(--accent);
      outline-offset: 3px;
    }

    .container {
      width: 100%;
      max-width: var(--max-width);
      margin: 0 auto;
      padding: 0 24px;
    }

    .section {
      padding: 96px 0;
    }

    .section-heading {
      max-width: 720px;
      margin-bottom: 48px;
    }

    .eyebrow {
      margin: 0 0 14px;
      color: var(--accent-light);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }

    .section-title {
      margin: 0 0 18px;
      color: var(--text);
      font-family: "Playfair Display", serif;
      font-size: clamp(2.25rem, 5vw, 4rem);
      line-height: 1.05;
      letter-spacing: -0.03em;
    }

    .section-copy {
      margin: 0;
      color: var(--muted);
      font-size: 17px;
    }

    .site-header {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(11, 16, 32, 0.94);
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(14px);
    }

    .header-inner {
      min-height: 76px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      color: var(--text);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .brand-mark {
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      border: 1px solid var(--accent);
      color: var(--accent);
      font-family: "Playfair Display", serif;
      font-size: 18px;
    }

    .site-nav {
      display: flex;
      align-items: center;
      gap: 28px;
    }

    .site-nav ul {
      display: flex;
      align-items: center;
      gap: 26px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .site-nav a {
      color: var(--muted);
      font-size: 14px;
      font-weight: 500;
    }

    .site-nav a:hover,
    .site-nav a:focus-visible {
      color: var(--text);
    }

    .menu-toggle {
      display: none;
      width: 44px;
      height: 44px;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: transparent;
      color: var(--text);
      cursor: pointer;
    }

    .menu-toggle svg {
      width: 21px;
      height: 21px;
    }

    .hero {
      padding: 110px 0 96px;
      border-bottom: 1px solid var(--border);
      background:
        radial-gradient(circle at 82% 20%, rgba(215, 173, 91, 0.14), transparent 30%),
        radial-gradient(circle at 10% 80%, rgba(67, 95, 145, 0.2), transparent 32%),
        var(--bg);
    }

    .hero-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(380px, 0.95fr);
      align-items: center;
      gap: 72px;
    }

    .hero-title {
      max-width: 850px;
      margin: 0 0 26px;
      color: var(--text);
      font-family: "Playfair Display", serif;
      font-size: clamp(3.2rem, 7vw, 6.6rem);
      line-height: 0.95;
      letter-spacing: -0.045em;
    }

    .hero-title strong {
      color: var(--accent-light);
      font-weight: 600;
    }

    .hero-copy {
      max-width: 650px;
      margin: 0 0 34px;
      color: var(--muted);
      font-size: 18px;
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      margin-bottom: 38px;
    }

    .btn {
      display: inline-flex;
      min-height: 48px;
      align-items: center;
      justify-content: center;
      padding: 12px 22px;
      border: 1px solid transparent;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.01em;
      cursor: pointer;
    }

    .btn-primary {
      background: var(--accent);
      color: #17130b;
      box-shadow: 0 10px 30px rgba(215, 173, 91, 0.18);
    }

    .btn-primary:hover,
    .btn-primary:focus-visible {
      background: var(--accent-light);
      color: #17130b;
      transform: translateY(-2px);
    }

    .btn-secondary {
      border-color: var(--border);
      background: transparent;
      color: var(--text);
    }

    .btn-secondary:hover,
    .btn-secondary:focus-visible {
      border-color: var(--accent);
      background: rgba(215, 173, 91, 0.08);
      color: var(--text);
    }

    .hero-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .hero-meta li {
      padding-left: 16px;
      border-left: 1px solid var(--accent);
    }

    .hero-meta strong {
      display: block;
      color: var(--text);
      font-size: 13px;
    }

    .hero-meta span {
      display: block;
      color: var(--muted);
      font-size: 12px;
    }

    .hero-visual {
      position: relative;
    }

    .hero-image {
      width: 100%;
      height: 570px;
      object-fit: cover;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }

    .hero-caption {
      position: absolute;
      right: 18px;
      bottom: 18px;
      max-width: 220px;
      padding: 15px 17px;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: rgba(11, 16, 32, 0.9);
      color: var(--muted);
      font-size: 12px;
      backdrop-filter: blur(12px);
    }

    .hero-caption strong {
      display: block;
      margin-bottom: 4px;
      color: var(--text);
    }

    .about {
      background: var(--surface);
    }

    .about-grid {
      display: grid;
      grid-template-columns: 0.85fr 1.15fr;
      gap: 72px;
      align-items: start;
    }

    .about-statement {
      margin: 0;
      color: var(--text);
      font-family: "Playfair Display", serif;
      font-size: clamp(2rem, 4vw, 3.25rem);
      line-height: 1.12;
    }

    .about-copy p {
      margin: 0 0 20px;
      color: var(--muted);
    }

    .about-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin: 30px 0 0;
      padding: 0;
      list-style: none;
    }

    .about-list li {
      padding: 18px;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.025);
      color: var(--text);
      font-size: 14px;
      font-weight: 600;
    }

    .categories {
      background: var(--bg);
    }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .card {
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
    }

    .card:hover,
    .card:focus-within {
      border-color: rgba(215, 173, 91, 0.5);
      box-shadow: var(--shadow);
      transform: translateY(-4px);
    }

    .category-card {
      overflow: hidden;
    }

    .category-card figure {
      margin: 0;
    }

    .category-card img {
      width: 100%;
      height: 220px;
      object-fit: cover;
    }

    .category-content {
      padding: 24px;
    }

    .category-number {
      margin: 0 0 10px;
      color: var(--accent);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.12em;
    }

    .category-content h3 {
      margin: 0 0 10px;
      color: var(--text);
      font-family: "Playfair Display", serif;
      font-size: 25px;
      line-height: 1.15;
    }

    .category-content p {
      margin: 0;
      color: var(--muted);
      font-size: 14px;
    }

    .timeline {
      background: var(--surface);
    }

    .timeline-list {
      display: grid;
      gap: 0;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .timeline-item {
      display: grid;
      grid-template-columns: 180px 1fr;
      gap: 32px;
      padding: 28px 0;
      border-top: 1px solid var(--border);
    }

    .timeline-item:last-child {
      border-bottom: 1px solid var(--border);
    }

    .timeline-date {
      color: var(--accent-light);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .timeline-content h3 {
      margin: 0 0 7px;
      color: var(--text);
      font-family: "Playfair Display", serif;
      font-size: 26px;
    }

    .timeline-content p {
      max-width: 680px;
      margin: 0;
      color: var(--muted);
    }

    .judges {
      background: var(--bg);
    }

    .judge-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }

    .judge-card {
      overflow: hidden;
    }

    .judge-card figure {
      margin: 0;
    }

    .judge-card img {
      width: 100%;
      height: 310px;
      object-fit: cover;
      filter: saturate(0.7);
    }

    .judge-content {
      padding: 22px;
    }

    .judge-content h3 {
      margin: 0 0 5px;
      color: var(--text);
      font-family: "Playfair Display", serif;
      font-size: 24px;
    }

    .judge-role {
      margin: 0 0 12px;
      color: var(--accent-light);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .judge-content p {
      margin: 0;
      color: var(--muted);
      font-size: 13px;
    }

    .prizes {
      background: var(--surface);
    }

    .prize-grid {
      display: grid;
      grid-template-columns: 1.3fr 1fr 1fr;
      gap: 20px;
    }

    .prize-card {
      min-height: 280px;
      padding: 30px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .prize-card.featured {
      border-color: rgba(215, 173, 91, 0.5);
      background:
        radial-gradient(circle at 80% 20%, rgba(215, 173, 91, 0.13), transparent 42%),
        var(--surface-light);
    }

    .prize-label {
      margin: 0;
      color: var(--accent);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .prize-value {
      margin: 20px 0 8px;
      color: var(--text);
      font-family: "Playfair Display", serif;
      font-size: clamp(2.5rem, 5vw, 4.4rem);
      line-height: 1;
    }

    .prize-card h3 {
      margin: 0 0 8px;
      color: var(--text);
      font-family: "Playfair Display", serif;
      font-size: 26px;
    }

    .prize-card p {
      margin: 0;
      color: var(--muted);
      font-size: 14px;
    }

    .faq {
      background: var(--bg);
    }

    .faq-list {
      max-width: 900px;
      margin: 0 auto;
    }

    .faq-item {
      border-top: 1px solid var(--border);
    }

    .faq-item:last-child {
      border-bottom: 1px solid var(--border);
    }

    .faq-item summary {
      padding: 25px 45px 25px 0;
      position: relative;
      color: var(--text);
      font-family: "Playfair Display", serif;
      font-size: 22px;
      cursor: pointer;
      list-style: none;
    }

    .faq-item summary::-webkit-details-marker {
      display: none;
    }

    .faq-item summary::after {
      content: "+";
      position: absolute;
      top: 21px;
      right: 5px;
      color: var(--accent);
      font-family: "Inter", sans-serif;
      font-size: 24px;
      font-weight: 400;
    }

    .faq-item[open] summary::after {
      content: "−";
    }

    .faq-item p {
      max-width: 760px;
      margin: -4px 0 25px;
      color: var(--muted);
      font-size: 15px;
    }

    .register {
      background:
        radial-gradient(circle at 20% 50%, rgba(215, 173, 91, 0.12), transparent 35%),
        var(--surface);
    }

    .register-grid {
      display: grid;
      grid-template-columns: 0.8fr 1.2fr;
      gap: 72px;
      align-items: start;
    }

    .register-copy h2 {
      margin: 0 0 18px;
      color: var(--text);
      font-family: "Playfair Display", serif;
      font-size: clamp(2.4rem, 5vw, 4.3rem);
      line-height: 1;
    }

    .register-copy > p {
      margin: 0 0 28px;
      color: var(--muted);
    }

    .register-note {
      padding: 18px;
      border-left: 2px solid var(--accent);
      background: rgba(255, 255, 255, 0.025);
      color: var(--muted);
      font-size: 13px;
    }

    .register-form {
      padding: 30px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--bg);
      box-shadow: var(--shadow);
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .form-field {
      display: grid;
      gap: 8px;
    }

    .form-field.full {
      grid-column: 1 / -1;
    }

    .form-field label {
      color: var(--text);
      font-size: 13px;
      font-weight: 600;
    }

    .form-field input,
    .form-field select,
    .form-field textarea {
      width: 100%;
      border: 1px solid var(--border);
      border-radius: 10px;
      outline: 0;
      background: var(--surface);
      color: var(--text);
      padding: 13px 14px;
      transition: border-color 0.25s ease, box-shadow 0.25s ease;
    }

    .form-field textarea {
      min-height: 130px;
      resize: vertical;
    }

    .form-field input:focus,
    .form-field select:focus,
    .form-field textarea:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(215, 173, 91, 0.1);
    }

    .form-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 22px;
    }

    .form-message {
      margin: 0;
      color: var(--accent-light);
      font-size: 13px;
      font-weight: 600;
    }

    .site-footer {
      padding: 45px 0;
      border-top: 1px solid var(--border);
      background: #080c18;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: 30px;
    }

    .footer-brand {
      margin: 0 0 8px;
      color: var(--text);
      font-family: "Playfair Display", serif;
      font-size: 24px;
    }

    .footer-copy {
      margin: 0;
      color: var(--muted);
      font-size: 13px;
    }

    .footer-nav ul {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 20px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .footer-nav a {
      color: var(--muted);
      font-size: 13px;
    }

    .footer-nav a:hover,
    .footer-nav a:focus-visible {
      color: var(--text);
    }

    @media (max-width: 992px) {
      .section {
        padding: 78px 0;
      }

      .hero {
        padding: 82px 0 78px;
      }

      .hero-grid,
      .about-grid,
      .register-grid {
        grid-template-columns: 1fr;
        gap: 48px;
      }

      .hero-image {
        height: 480px;
      }

      .category-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .judge-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .prize-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .prize-card.featured {
        grid-column: 1 / -1;
      }

      .site-nav {
        position: relative;
      }

      .menu-toggle {
        display: inline-flex;
      }

      .site-nav ul {
        position: absolute;
        top: 58px;
        right: 0;
        width: 260px;
        padding: 18px;
        display: none;
        flex-direction: column;
        align-items: stretch;
        gap: 0;
        border: 1px solid var(--border);
        border-radius: 14px;
        background: var(--surface);
        box-shadow: var(--shadow);
      }

      .site-nav.is-open ul {
        display: flex;
      }

      .site-nav li {
        border-bottom: 1px solid var(--border);
      }

      .site-nav li:last-child {
        border-bottom: 0;
      }

      .site-nav a {
        display: block;
        padding: 13px 6px;
      }
    }

    @media (max-width: 600px) {
      .container {
        padding: 0 18px;
      }

      .section {
        padding: 64px 0;
      }

      .hero {
        padding: 65px 0 64px;
      }

      .header-inner {
        min-height: 68px;
      }

      .hero-title {
        font-size: clamp(3rem, 15vw, 4.5rem);
      }

      .hero-copy {
        font-size: 16px;
      }

      .hero-image {
        height: 390px;
      }

      .hero-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .hero-actions .btn {
        width: 100%;
      }

      .hero-meta {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
      }

      .about-list,
      .category-grid,
      .judge-grid,
      .prize-grid,
      .form-grid {
        grid-template-columns: 1fr;
      }

      .prize-card.featured {
        grid-column: auto;
      }

      .category-card img {
        height: 200px;
      }

      .judge-card img {
        height: 330px;
      }

      .timeline-item {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .faq-item summary {
        font-size: 19px;
      }

      .register-form {
        padding: 20px;
      }

      .form-field.full {
        grid-column: auto;
      }

      .form-actions {
        align-items: stretch;
        flex-direction: column;
      }

      .form-actions .btn {
        width: 100%;
      }

      .footer-grid {
        grid-template-columns: 1fr;
      }

      .footer-nav ul {
        justify-content: flex-start;
      }
    }
  </style>
</head>

<body>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="#top" aria-label="Asia Design Awards home">
        <span class="brand-mark">A</span>
        Asia Design Awards
      </a>

      <nav class="site-nav" aria-label="Main navigation">
        <button class="menu-toggle" type="button" aria-label="Open navigation menu" aria-expanded="false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16"></path>
          </svg>
        </button>

        <ul>
          <li><a href="#about">About</a></li>
          <li><a href="#categories">Categories</a></li>
          <li><a href="#timeline">Timeline</a></li>
          <li><a href="#judges">Judges</a></li>
          <li><a href="#faq">FAQ</a></li>
          <li><a class="btn btn-primary" href="#register">Register now</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <section class="hero" id="top">
    <div class="container hero-grid">
      <div class="reveal">
        <p class="eyebrow">Asia Design Awards 2026</p>
        <h1 class="hero-title">Make work worth <strong>remembering.</strong></h1>
        <p class="hero-copy">
          The Asia Design Awards celebrates ambitious ideas, thoughtful craft, and creative work shaping the visual culture of Asia. Submit your strongest project for consideration by an independent panel of industry leaders.
        </p>

        <div class="hero-actions">
          <a class="btn btn-primary" href="#register">Register now</a>
          <a class="btn btn-secondary" href="#categories">Explore categories</a>
        </div>

        <ul class="hero-meta">
          <li>
            <strong>31 Dec 2026</strong>
            <span>Final deadline</span>
          </li>
          <li>
            <strong>6 disciplines</strong>
            <span>Open for entry</span>
          </li>
          <li>
            <strong>Asia-wide</strong>
            <span>Regional eligibility</span>
          </li>
        </ul>
      </div>

      <div class="hero-visual reveal">
        <img class="hero-image" src="https://picsum.photos/seed/gala/900/1100" width="900" height="1100" alt="Abstract creative installation displayed at an awards exhibition">
        <p class="hero-caption">
          <strong>Ideas move culture.</strong>
          Enter work that deserves to be part of the conversation.
        </p>
      </div>
    </div>
  </section>

  <section class="section about" id="about">
    <div class="container">
      <div class="section-heading reveal">
        <p class="eyebrow">The awards</p>
        <h2 class="section-title">A stage for ambitious design.</h2>
        <p class="section-copy">
          Built for designers and agencies across Asia, the awards recognize projects where strategy, execution, and cultural relevance come together.
        </p>
      </div>

      <div class="about-grid">
        <p class="about-statement reveal">Good design solves a problem. Great design changes how people see it.</p>

        <div class="about-copy reveal">
          <p>
            From identity systems and digital experiences to spaces and campaigns, the Asia Design Awards looks beyond surface aesthetics. Entries are assessed on the clarity of the idea, quality of execution, and the impact the work creates for its audience.
          </p>
          <p>
            Whether you are an independent designer, emerging studio, established agency, or in-house creative team, your work belongs in the conversation.
          </p>

          <ul class="about-list">
            <li>Independent jury</li>
            <li>International exposure</li>
            <li>Professional recognition</li>
            <li>Winner showcase</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="section categories" id="categories">
    <div class="container">
      <div class="section-heading reveal">
        <p class="eyebrow">Six disciplines</p>
        <h2 class="section-title">Choose your category.</h2>
        <p class="section-copy">
          Enter a completed project that demonstrates a clear creative point of view and meaningful results.
        </p>
      </div>

      <div class="category-grid">
        <article class="card category-card reveal">
          <figure>
            <img src="https://picsum.photos/seed/identity/800/500" width="800" height="500" alt="Brand identity materials arranged on a table">
          </figure>
          <div class="category-content">
            <p class="category-number">01 / BRAND</p>
            <h3>Brand & Identity</h3>
            <p>Visual identities, rebrands, packaging systems, naming, and brand worlds that create lasting recognition.</p>
          </div>
        </article>

        <article class="card category-card reveal">
          <figure>
            <img src="https://picsum.photos/seed/digital/800/500" width="800" height="500" alt="Digital interface displayed across multiple screens">
          </figure>
          <div class="category-content">
            <p class="category-number">02 / DIGITAL</p>
            <h3>Digital Experience</h3>
            <p>Websites, products, applications, platforms, and interactive experiences built around real user needs.</p>
          </div>
        </article>

        <article class="card category-card reveal">
          <figure>
            <img src="https://picsum.photos/seed/campaign/800/500" width="800" height="500" alt="Creative campaign posters displayed in an urban environment">
          </figure>
          <div class="category-content">
            <p class="category-number">03 / CAMPAIGN</p>
            <h3>Campaign & Communication</h3>
            <p>Integrated campaigns, advertising, social work, editorial concepts, and communication systems with impact.</p>
          </div>
        </article>

        <article class="card category-card reveal">
          <figure>
            <img src="https://picsum.photos/seed/space/800/500" width="800" height="500" alt="Contemporary interior space with considered architectural details">
          </figure>
          <div class="category-content">
            <p class="category-number">04 / SPACE</p>
            <h3>Spatial Design</h3>
            <p>Retail, hospitality, exhibitions, installations, workplaces, and environments designed around human experience.</p>
          </div>
        </article>

        <article class="card category-card reveal">
          <figure>
            <img src="https://picsum.photos/seed/graphic/800/500" width="800" height="500" alt="Editorial graphic design printed across a collection of publications">
          </figure>
          <div class="category-content">
            <p class="category-number">05 / GRAPHIC</p>
            <h3>Graphic Design</h3>
            <p>Posters, publications, typography, information design, illustration, and graphic systems with a distinct voice.</p>
          </div>
        </article>

        <article class="card category-card reveal">
          <figure>
            <img src="https://picsum.photos/seed/motion/800/500" width="800" height="500" alt="Abstract motion design frames displayed as a visual sequence">
          </figure>
          <div class="category-content">
            <p class="category-number">06 / MOTION</p>
            <h3>Motion & Film</h3>
            <p>Motion identities, title sequences, animation, short films, and moving-image work that tells a strong story.</p>
          </div>
        </article>
      </div>
    </div>
  </section>

  <section class="section timeline" id="timeline">
    <div class="container">
      <div class="section-heading reveal">
        <p class="eyebrow">Key dates</p>
        <h2 class="section-title">Four steps to recognition.</h2>
        <p class="section-copy">
          Plan your submission around the milestones below. Earlier entries receive more time for project review and preparation.
        </p>
      </div>

      <ol class="timeline-list">
        <li class="timeline-item reveal">
          <div class="timeline-date">01 OCT — 31 OCT 2026</div>
          <div class="timeline-content">
            <h3>Early Entry</h3>
            <p>Open registration, prepare your project case study, and submit before the first deadline.</p>
          </div>
        </li>

        <li class="timeline-item reveal">
          <div class="timeline-date">01 NOV — 30 NOV 2026</div>
          <div class="timeline-content">
            <h3>Regular Entry</h3>
            <p>Continue submitting eligible projects during the main registration period.</p>
          </div>
        </li>

        <li class="timeline-item reveal">
          <div class="timeline-date">01 — 31 DEC 2026</div>
          <div class="timeline-content">
            <h3>Final Entry</h3>
            <p>Last opportunity to complete your application and upload supporting project material.</p>
          </div>
        </li>

        <li class="timeline-item reveal">
          <div class="timeline-date">FEBRUARY 2027</div>
          <div class="timeline-content">
            <h3>Jury & Results</h3>
            <p>Our jury reviews the shortlisted work before the winners are announced and presented online.</p>
          </div>
        </li>
      </ol>
    </div>
  </section>

  <section class="section judges" id="judges">
    <div class="container">
      <div class="section-heading reveal">
        <p class="eyebrow">The jury</p>
        <h2 class="section-title">Reviewed by people who make.</h2>
        <p class="section-copy">
          A multidisciplinary jury brings perspectives from branding, technology, architecture, advertising, and cultural design.
        </p>
      </div>

      <div class="judge-grid">
        <article class="card judge-card reveal">
          <figure>
            <img src="https://picsum.photos/seed/judgeone/600/700" width="600" height="700" alt="Portrait of jury member Maya Tan">
          </figure>
          <div class="judge-content">
            <h3>Maya Tan</h3>
            <p class="judge-role">Creative Director</p>
            <p>Singapore-based brand strategist known for building identity systems for global and regional brands.</p>
          </div>
        </article>

        <article class="card judge-card reveal">
          <figure>
            <img src="https://picsum.photos/seed/judgetwo/600/700" width="600" height="700" alt="Portrait of jury member Kenji Mori">
          </figure>
          <div class="judge-content">
            <h3>Kenji Mori</h3>
            <p class="judge-role">Design Partner</p>
            <p>Tokyo-based designer focused on typography, editorial systems, and contemporary visual culture.</p>
          </div>
        </article>

        <article class="card judge-card reveal">
          <figure>
            <img src="https://picsum.photos/seed/judgethree/600/700" width="600" height="700" alt="Portrait of jury member Aisha Rahman">
          </figure>
          <div class="judge-content">
            <h3>Aisha Rahman</h3>
            <p class="judge-role">Experience Director</p>
            <p>A Kuala Lumpur creative leader working across digital products, service design, and emerging technology.</p>
          </div>
        </article>

        <article class="card judge-card reveal">
          <figure>
            <img src="https://picsum.photos/seed/judgefour/600/700" width="600" height="700" alt="Portrait of jury member Daniel Park">
          </figure>
          <div class="judge-content">
            <h3>Daniel Park</h3>
            <p class="judge-role">Creative Strategist</p>
            <p>Seoul-based strategist exploring the relationship between culture, brands, and new forms of storytelling.</p>
          </div>
        </article>
      </div>
    </div>
  </section>

  <section class="section prizes" id="prizes">
    <div class="container">
      <div class="section-heading reveal">
        <p class="eyebrow">Recognition</p>
        <h2 class="section-title">More than a trophy.</h2>
        <p class="section-copy">
          Winning projects become part of the official awards showcase and receive recognition designed to travel with your work.
        </p>
      </div>

      <div class="prize-grid">
        <article class="card prize-card featured reveal">
          <div>
            <p class="prize-label">Grand distinction</p>
            <p class="prize-value">01</p>
          </div>
          <div>
            <h3>Design of the Year</h3>
            <p>The highest distinction for one project demonstrating exceptional concept, execution, and cultural relevance.</p>
          </div>
        </article>

        <article class="card prize-card reveal">
          <div>
            <p class="prize-label">Category</p>
            <p class="prize-value">06</p>
          </div>
          <div>
            <h3>Category Winners</h3>
            <p>One leading project in each discipline receives a category award and featured showcase placement.</p>
          </div>
        </article>

        <article class="card prize-card reveal">
          <div>
            <p class="prize-label">Selection</p>
            <p class="prize-value">30</p>
          </div>
          <div>
            <h3>Shortlisted Works</h3>
            <p>Selected projects are presented in the digital gallery and considered for editorial features.</p>
          </div>
        </article>
      </div>
    </div>
  </section>

  <section class="section faq" id="faq">
    <div class="container">
      <div class="section-heading reveal">
        <p class="eyebrow">Questions</p>
        <h2 class="section-title">Before you enter.</h2>
        <p class="section-copy">
          A few practical answers to help you prepare your submission.
        </p>
      </div>

      <div class="faq-list">
        <details class="faq-item reveal">
          <summary>Who can submit?</summary>
          <p>Designers, agencies, studios, freelancers, in-house teams, and creative organizations based in or working across Asia may submit eligible projects.</p>
        </details>

        <details class="faq-item reveal">
          <summary>How many projects can I enter?</summary>
          <p>There is no fixed limit on the number of eligible projects you can submit. Each project requires its own entry and category selection.</p>
        </details>

        <details class="faq-item reveal">
          <summary>Can an unfinished project be submitted?</summary>
          <p>Entries should represent completed or publicly launched work. If a project is still evolving, submit it once the core experience and final execution can be evaluated.</p>
        </details>

        <details class="faq-item reveal">
          <summary>What should my case study include?</summary>
          <p>Explain the challenge, your approach, the creative idea, execution, and measurable or observable outcome. Strong visual documentation helps the jury understand the work quickly.</p>
        </details>

        <details class="faq-item reveal">
          <summary>When will results be announced?</summary>
          <p>Jury review takes place in February 2027, with shortlisted projects and winners announced through the official awards channels afterward.</p>
        </details>
      </div>
    </div>
  </section>

  <section class="section register" id="register">
    <div class="container register-grid">
      <div class="register-copy reveal">
        <p class="eyebrow">Start your entry</p>
        <h2>Your next great case study starts here.</h2>
        <p>
          Tell us who you are and what you are submitting. This registration form is a starting point for the awards team to help you prepare your entry.
        </p>
        <p class="register-note">
          Registration does not automatically publish your project. Your final submission can be prepared and reviewed before the entry deadline.
        </p>
      </div>

      <form class="register-form reveal" id="registration-form">
        <div class="form-grid">
          <div class="form-field">
            <label for="full-name">Full name</label>
            <input type="text" id="full-name" name="full-name" autocomplete="name" required>
          </div>

          <div class="form-field">
            <label for="email">Email address</label>
            <input type="email" id="email" name="email" autocomplete="email" required>
          </div>

          <div class="form-field">
            <label for="studio">Studio or company</label>
            <input type="text" id="studio" name="studio" autocomplete="organization">
          </div>

          <div class="form-field">
            <label for="category">Primary category</label>
            <select id="category" name="category" required>
              <option value="">Select a category</option>
              <option value="brand">Brand & Identity</option>
              <option value="digital">Digital Experience</option>
              <option value="campaign">Campaign & Communication</option>
              <option value="space">Spatial Design</option>
              <option value="graphic">Graphic Design</option>
              <option value="motion">Motion & Film</option>
            </select>
          </div>

          <div class="form-field full">
            <label for="project">Project name</label>
            <input type="text" id="project" name="project" required>
          </div>

          <div class="form-field full">
            <label for="message">Tell us about the project</label>
            <textarea id="message" name="message" placeholder="What did you make, who was it for, and why does it matter?" required></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" type="submit">Begin registration</button>
          <p class="form-message" id="form-message" aria-live="polite"></p>
        </div>
      </form>
    </div>
  </section>

  <footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <p class="footer-brand">Asia Design Awards 2026</p>
        <p class="footer-copy">Celebrating ideas, craft, and creative culture across Asia.</p>
      </div>

      <nav class="footer-nav" aria-label="Footer navigation">
        <ul>
          <li><a href="#about">About</a></li>
          <li><a href="#categories">Categories</a></li>
          <li><a href="#timeline">Timeline</a></li>
          <li><a href="#judges">Judges</a></li>
          <li><a href="#faq">FAQ</a></li>
          <li><a href="#register">Register</a></li>
        </ul>
      </nav>
    </div>
  </footer>

  <script>
    (function () {
      document.documentElement.classList.add("js");

      var menuToggle = document.querySelector(".menu-toggle");
      var siteNav = document.querySelector(".site-nav");

      if (menuToggle && siteNav) {
        menuToggle.addEventListener("click", function () {
          var isOpen = siteNav.classList.toggle("is-open");
          menuToggle.setAttribute("aria-expanded", String(isOpen));
          menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
        });

        var navLinks = siteNav.querySelectorAll("a");

        navLinks.forEach(function (link) {
          link.addEventListener("click", function () {
            siteNav.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation menu");
          });
        });
      }

      var revealItems = document.querySelectorAll(".reveal");

      if ("IntersectionObserver" in window) {
        var revealObserver = new IntersectionObserver(function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        }, {
          threshold: 0.12
        });

        revealItems.forEach(function (item) {
          revealObserver.observe(item);
        });
      } else {
        revealItems.forEach(function (item) {
          item.classList.add("is-visible");
        });
      }

      var registrationForm = document.querySelector("#registration-form");
      var formMessage = document.querySelector("#form-message");

      if (registrationForm && formMessage) {
        registrationForm.addEventListener("submit", function (event) {
          event.preventDefault();
          formMessage.textContent = "Thanks — your registration details have been received.";
          registrationForm.reset();
        });
      }

      var anchors = document.querySelectorAll('a[href^="#"]');

      anchors.forEach(function (anchor) {
        anchor.addEventListener("click", function (event) {
          var targetId = anchor.getAttribute("href");

          if (targetId === "#") {
            return;
          }

          var target = document.querySelector(targetId);

          if (target) {
            event.preventDefault();
            target.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
          }
        });
      });
    }());
  </script>
</body>
</html>