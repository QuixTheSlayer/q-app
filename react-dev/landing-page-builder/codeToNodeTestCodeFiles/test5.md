<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AETHER - Fashion Exhibition</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0a0a0a;
            color: #e0e0e0;
            line-height: 1.6;
        }

        /* Header */
        header {
            position: fixed;
            top: 0;
            width: 100%;
            background: rgba(10, 10, 10, 0.95);
            backdrop-filter: blur(20px);
            z-index: 1000;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 1rem 2rem;
        }

        .header-container {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .brand {
            font-size: 1.8rem;
            font-weight: 300;
            letter-spacing: 4px;
            background: linear-gradient(45deg, #00d4ff, #0099ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-transform: uppercase;
        }

        .nav-items {
            display: flex;
            list-style: none;
            gap: 3rem;
        }

        .nav-items a {
            color: #a0a0a0;
            text-decoration: none;
            font-size: 0.9rem;
            letter-spacing: 1px;
            text-transform: uppercase;
            transition: all 0.3s ease;
            position: relative;
        }

        .nav-items a:hover {
            color: #00d4ff;
        }

        .nav-items a::before {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 0;
            height: 1px;
            background: #00d4ff;
            transition: width 0.3s ease;
        }

        .nav-items a:hover::before {
            width: 100%;
        }

        .hamburger {
            display: none;
            flex-direction: column;
            gap: 6px;
            cursor: pointer;
        }

        .hamburger span {
            width: 25px;
            height: 2px;
            background: #00d4ff;
            border-radius: 1px;
            transition: 0.3s;
        }

        /* Hero */
        .hero {
            margin-top: 60px;
            min-height: 90vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%);
            position: relative;
            overflow: hidden;
        }

        .hero::before {
            content: '';
            position: absolute;
            width: 800px;
            height: 800px;
            background: radial-gradient(circle, rgba(0, 212, 255, 0.15), transparent);
            border-radius: 50%;
            top: -300px;
            right: -300px;
            animation: rotate 20s linear infinite;
        }

        .hero::after {
            content: '';
            position: absolute;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(0, 153, 255, 0.1), transparent);
            border-radius: 50%;
            bottom: -200px;
            left: -200px;
            animation: rotate-reverse 25s linear infinite;
        }

        @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes rotate-reverse {
            0% { transform: rotate(360deg); }
            100% { transform: rotate(0deg); }
        }

        .hero-content {
            position: relative;
            z-index: 2;
            text-align: center;
            max-width: 900px;
            padding: 0 2rem;
        }

        .hero-label {
            font-size: 0.8rem;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: #00d4ff;
            margin-bottom: 1rem;
            display: inline-block;
            padding: 0.5rem 1rem;
            border: 1px solid rgba(0, 212, 255, 0.5);
            border-radius: 50px;
        }

        .hero h1 {
            font-size: 5rem;
            font-weight: 700;
            line-height: 1.1;
            margin: 1rem 0;
            background: linear-gradient(135deg, #ffffff, #a0a0a0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -2px;
        }

        .hero p {
            font-size: 1.2rem;
            color: #a0a0a0;
            margin-bottom: 2rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }

        .cta-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn {
            padding: 1rem 2.5rem;
            border: none;
            border-radius: 4px;
            font-size: 0.9rem;
            font-weight: 600;
            letter-spacing: 1px;
            cursor: pointer;
            text-transform: uppercase;
            transition: all 0.3s ease;
        }

        .btn-primary {
            background: linear-gradient(135deg, #00d4ff, #0099ff);
            color: #000;
        }

        .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(0, 212, 255, 0.3);
        }

        .btn-secondary {
            background: transparent;
            border: 1px solid #00d4ff;
            color: #00d4ff;
        }

        .btn-secondary:hover {
            background: rgba(0, 212, 255, 0.1);
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
        }

        /* Featured Section */
        .featured {
            padding: 8rem 2rem;
            max-width: 1400px;
            margin: 0 auto;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 4rem;
            gap: 2rem;
        }

        .section-title {
            font-size: 2.8rem;
            font-weight: 700;
            line-height: 1.2;
        }

        .section-subtitle {
            color: #a0a0a0;
            max-width: 400px;
            font-size: 1rem;
        }

        .view-all {
            color: #00d4ff;
            text-decoration: none;
            font-size: 0.9rem;
            letter-spacing: 1px;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
        }

        .view-all:hover {
            gap: 1rem;
        }

        /* Card Grid */
        .card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }

        .card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .card:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(0, 212, 255, 0.5);
            transform: translateY(-10px);
        }

        .card-image {
            width: 100%;
            height: 350px;
            overflow: hidden;
            background: linear-gradient(135deg, #1a0a2e, #0a0a0a);
            position: relative;
        }

        .card-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }

        .card:hover .card-image img {
            transform: scale(1.15);
        }

        .card-label {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: rgba(0, 212, 255, 0.9);
            color: #000;
            padding: 0.5rem 1rem;
            border-radius: 50px;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .card-content {
            padding: 2rem;
        }

        .card-category {
            font-size: 0.8rem;
            color: #00d4ff;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 0.5rem;
        }

        .card-title {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            font-weight: 600;
        }

        .card-description {
            color: #a0a0a0;
            font-size: 0.95rem;
            margin-bottom: 1.5rem;
        }

        .card-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .card-price {
            font-size: 1.3rem;
            color: #00d4ff;
            font-weight: 700;
        }

        .card-icon {
            width: 40px;
            height: 40px;
            background: rgba(0, 212, 255, 0.1);
            border: 1px solid rgba(0, 212, 255, 0.3);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #00d4ff;
            transition: all 0.3s ease;
        }

        .card:hover .card-icon {
            background: rgba(0, 212, 255, 0.2);
            border-color: #00d4ff;
        }

        /* Stats Section */
        .stats {
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(0, 153, 255, 0.05));
            border: 1px solid rgba(0, 212, 255, 0.2);
            border-radius: 12px;
            padding: 4rem 2rem;
            margin: 8rem 2rem;
            max-width: 1400px;
            margin-left: auto;
            margin-right: auto;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
        }

        .stat-item {
            text-align: center;
        }

        .stat-number {
            font-size: 3rem;
            font-weight: 700;
            background: linear-gradient(135deg, #00d4ff, #0099ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
        }

        .stat-label {
            color: #a0a0a0;
            font-size: 0.95rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* Timeline Section */
        .timeline {
            padding: 8rem 2rem;
            max-width: 1400px;
            margin: 0 auto;
        }

        .timeline-items {
            display: grid;
            gap: 2rem;
        }

        .timeline-item {
            display: grid;
            grid-template-columns: 150px 1fr;
            gap: 2rem;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.03);
            border-left: 3px solid #00d4ff;
            border-radius: 4px;
            transition: all 0.3s ease;
        }

        .timeline-item:hover {
            background: rgba(255, 255, 255, 0.06);
            padding-left: 2.5rem;
        }

        .timeline-time {
            font-size: 1.5rem;
            font-weight: 700;
            color: #00d4ff;
        }

        .timeline-time-period {
            font-size: 0.8rem;
            color: #a0a0a0;
            margin-top: 0.3rem;
        }

        .timeline-content h3 {
            font-size: 1.3rem;
            margin-bottom: 0.5rem;
        }

        .timeline-content p {
            color: #a0a0a0;
            margin-bottom: 0.5rem;
        }

        /* Footer */
        footer {
            background: rgba(0, 0, 0, 0.5);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding: 4rem 2rem;
            margin-top: 8rem;
        }

        .footer-container {
            max-width: 1400px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 3rem;
            margin-bottom: 2rem;
        }

        .footer-col h4 {
            font-size: 1rem;
            margin-bottom: 1.5rem;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .footer-col ul {
            list-style: none;
        }

        .footer-col ul li {
            margin-bottom: 0.8rem;
        }

        .footer-col a {
            color: #a0a0a0;
            text-decoration: none;
            transition: color 0.3s ease;
            font-size: 0.95rem;
        }

        .footer-col a:hover {
            color: #00d4ff;
        }

        .footer-bottom {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 2rem;
            text-align: center;
            color: #606060;
            font-size: 0.9rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .hamburger {
                display: flex;
            }

            .nav-items {
                display: none;
            }

            .nav-items.active {
                display: flex;
                position: absolute;
                top: 60px;
                left: 0;
                right: 0;
                flex-direction: column;
                background: rgba(10, 10, 10, 0.98);
                padding: 2rem;
                gap: 1rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .hero h1 {
                font-size: 3rem;
            }

            .section-header {
                flex-direction: column;
                align-items: flex-start;
            }

            .section-title {
                font-size: 2rem;
            }

            .card-grid {
                grid-template-columns: 1fr;
            }

            .timeline-item {
                grid-template-columns: 80px 1fr;
            }

            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .stats {
                padding: 2rem;
            }
        }

        @media (max-width: 480px) {
            header {
                padding: 1rem;
            }

            .brand {
                font-size: 1.2rem;
                letter-spacing: 2px;
            }

            .hero {
                margin-top: 50px;
                min-height: 70vh;
            }

            .hero h1 {
                font-size: 2rem;
                letter-spacing: 0;
            }

            .hero p {
                font-size: 1rem;
            }

            .section-title {
                font-size: 1.5rem;
            }

            .cta-buttons {
                flex-direction: column;
            }

            .btn {
                width: 100%;
            }

            .featured {
                padding: 4rem 1rem;
            }

            .timeline-item {
                grid-template-columns: 1fr;
                padding: 1.5rem;
            }

            .timeline-time {
                font-size: 1.2rem;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header>
        <div class="header-container">
            <div class="brand">AETHER</div>
            <ul class="nav-items" id="navMenu">
                <li><a href="#featured">Collections</a></li>
                <li><a href="#schedule">Schedule</a></li>
                <li><a href="#stats">Exhibition</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
            <div class="hamburger" id="hamburger">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
            <div class="hero-label">Fashion Exhibition 2025</div>
            <h1>Redefining Contemporary Fashion</h1>
            <p>Immerse yourself in curated collections from emerging and established designers. Experience innovation, artistry, and elegance.</p>
            <div class="cta-buttons">
                <button class="btn btn-primary">Get Tickets</button>
                <button class="btn btn-secondary">Explore Collections</button>
            </div>
        </div>
    </section>

    <!-- Featured Collections -->
    <section class="featured" id="featured">
        <div class="section-header">
            <div>
                <h2 class="section-title">Featured Collections</h2>
                <p class="section-subtitle">Discover the latest designs from our curated selection of talented designers</p>
            </div>
            <a href="#" class="view-all">View All →</a>
        </div>

        <div class="card-grid">
            <div class="card">
                <div class="card-image">
                    <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&h=400&fit=crop" alt="Minimalist Collection">
                    <span class="card-label">New</span>
                </div>
                <div class="card-content">
                    <div class="card-category">Minimalist</div>
                    <h3 class="card-title">Simplicity Redefined</h3>
                    <p class="card-description">Clean lines and subtle elegance in every piece</p>
                    <div class="card-meta">
                        <span class="card-price">$89-$450</span>
                        <div class="card-icon">→</div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-image">
                    <img src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=400&fit=crop" alt="Avant-Garde Collection">
                    <span class="card-label">Featured</span>
                </div>
                <div class="card-content">
                    <div class="card-category">Avant-Garde</div>
                    <h3 class="card-title">Bold Expressions</h3>
                    <p class="card-description">Experimental designs that push creative boundaries</p>
                    <div class="card-meta">
                        <span class="card-price">$120-$680</span>
                        <div class="card-icon">→</div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-image">
                    <img src="https://images.unsplash.com/photo-1544077960-604201fe6e52?w=500&h=400&fit=crop" alt="Sustainable Collection">
                    <span class="card-label">Eco</span>
                </div>
                <div class="card-content">
                    <div class="card-category">Sustainable</div>
                    <h3 class="card-title">Conscious Style</h3>
                    <p class="card-description">Ethically crafted with eco-friendly materials</p>
                    <div class="card-meta">
                        <span class="card-price">$75-$320</span>
                        <div class="card-icon">→</div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-image">
                    <img src="https://images.unsplash.com/photo-1519689373462-6651a3a7c0fd?w=500&h=400&fit=crop" alt="Heritage Collection">
                    <span class="card-label">Classic</span>
                </div>
                <div class="card-content">
                    <div class="card-category">Heritage</div>
                    <h3 class="card-title">Timeless Elegance</h3>
                    <p class="card-description">Contemporary takes on traditional craftsmanship</p>
                    <div class="card-meta">
                        <span class="card-price">$95-$550</span>
                        <div class="card-icon">→</div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-image">
                    <img src="https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&h=400&fit=crop" alt="Urban Streetwear">
                    <span class="card-label">Trending</span>
                </div>
                <div class="card-content">
                    <div class="card-category">Streetwear</div>
                    <h3 class="card-title">Urban Vibes</h3>
                    <p class="card-description">Modern street style meets high fashion</p>
                    <div class="card-meta">
                        <span class="card-price">$65-$280</span>
                        <div class="card-icon">→</div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-image">
                    <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=400&fit=crop" alt="Luxury Evening">
                    <span class="card-label">Luxury</span>
                </div>
                <div class="card-content">
                    <div class="card-category">Evening Wear</div>
                    <h3 class="card-title">Luxury Moments</h3>
                    <p class="card-description">Exquisite pieces for special occasions</p>
                    <div class="card-meta">
                        <span class="card-price">$250-$1200</span>
                        <div class="card-icon">→</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Stats Section -->
    <section class="stats" id="stats">
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number">50+</div>
                <div class="stat-label">Designers</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">500+</div>
                <div class="stat-label">Pieces</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">15K</div>
                <div class="stat-label">Attendees</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">12</div>
                <div class="stat-label">Days</div>
            </div>
        </div>
    </section>

    <!-- Timeline Section -->
    <section class="timeline" id="schedule">
        <h2 class="section-title" style="margin-bottom: 3rem;">Exhibition Schedule</h2>
        <div class="timeline-items">
            <div class="timeline-item">
                <div>
                    <div class="timeline-time">9:00 AM</div>
                    <div class="timeline-time-period">Day 1-3</div>
                </div>
                <div class="timeline-content">
                    <h3>VIP Preview</h3>
                    <p>Exclusive early access for collectors and industry professionals</p>
                </div>
            </div>

            <div class="timeline-item">
                <div>
                    <div class="timeline-time">11:00 AM</div>
                    <div class="timeline-time-period">Daily</div>
                </div>
                <div class="timeline-content">
                    <h3>Designer Showcase</h3>
                    <p>Watch live presentations and styling demonstrations</p>
                </div>
            </div>

            <div class="timeline-item">
                <div>
                    <div class="timeline-time">2:00 PM</div>
                    <div class="timeline-time-period">Daily</div>
                </div>
                <div class="timeline-content">
                    <h3>Interactive Workshop</h3>
                    <p>Learn fashion design techniques from industry experts</p>
                </div>
            </div>

            <div class="timeline-item">
                <div>
                    <div class="timeline-time">5:00 PM</div>
                    <div class="timeline-time-period">Weekends</div>
                </div>
                <div class="timeline-content">
                    <h3>Networking Reception</h3>
                    <p>Connect with designers, retailers, and fashion enthusiasts</p>
                </div>
            </div>

            <div class="timeline-item">
                <div>
                    <div class="timeline-time">8:00 PM</div>
                    <div class="timeline-time-period">Day 12</div>
                </div>
                <div class="timeline-content">
                    <h3>Closing Gala</h3>
                    <p>Grand finale celebrating the best collections of the exhibition</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer id="contact">
        <div class="footer-container">
            <div class="footer-col">
                <h4>About AETHER</h4>
                <ul>
                    <li><a href="#">Our Mission</a></li>
                    <li><a href="#">The Team</a></li>
                    <li><a href="#">Press Kit</a></li>
                    <li><a href="#">Partners</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Information</h4>
                <ul>
                    <li><a href="#">Tickets & Passes</a></li>
                    <li><a href="#">Schedule</a></li>
                    <li><a href="#">Venue & Directions</a></li>
                    <li><a href="#">FAQ</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Connect</h4>
                <ul>
                    <li><a href="#">Instagram</a></li>
                    <li><a href="#">Twitter / X</a></li>
                    <li><a href="#">TikTok</a></li>
                    <li><a href="#">LinkedIn</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Contact</h4>
                <ul>
                    <li><a href="mailto:hello@aether.com">hello@aether.com</a></li>
                    <li><a href="tel:+1234567890">+1 (234) 567-890</a></li>
                    <li>New York, USA</li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 AETHER Fashion Exhibition. All rights reserved.</p>
        </div>
    </footer>

    <script>
        // Mobile Menu Toggle
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('navMenu');

        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });

        // Smooth Scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.card, .timeline-item, .stat-item').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        // Button interactions
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', function() {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 200);
            });
        });
    </script>
</body>
</html>