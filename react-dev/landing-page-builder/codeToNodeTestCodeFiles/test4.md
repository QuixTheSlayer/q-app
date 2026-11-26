<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lumière Fashion Show 2025</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            overflow-x: hidden;
        }

        /* Navigation */
        nav {
            position: fixed;
            top: 0;
            width: 100%;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            z-index: 1000;
            padding: 1rem 2rem;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        nav .container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            font-size: 1.5rem;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            background: linear-gradient(135deg, #c41e3a, #8b0000);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        nav ul {
            display: flex;
            list-style: none;
            gap: 2rem;
        }

        nav a {
            text-decoration: none;
            color: #333;
            font-weight: 500;
            transition: color 0.3s;
            position: relative;
        }

        nav a:hover {
            color: #c41e3a;
        }

        nav a::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 0;
            height: 2px;
            background: #c41e3a;
            transition: width 0.3s;
        }

        nav a:hover::after {
            width: 100%;
        }

        /* Mobile Menu Toggle */
        .menu-toggle {
            display: none;
            flex-direction: column;
            cursor: pointer;
            gap: 5px;
        }

        .menu-toggle span {
            width: 25px;
            height: 3px;
            background: #333;
            border-radius: 2px;
            transition: 0.3s;
        }

        /* Hero Section */
        .hero {
            margin-top: 60px;
            height: 100vh;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .hero::before {
            content: '';
            position: absolute;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(196, 30, 58, 0.3), transparent);
            border-radius: 50%;
            animation: float 8s ease-in-out infinite;
            top: -100px;
            right: -100px;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }

        .hero-content {
            position: relative;
            z-index: 2;
            animation: slideInUp 1s ease-out;
        }

        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .hero h1 {
            font-size: 4.5rem;
            font-weight: 700;
            letter-spacing: 3px;
            margin-bottom: 1rem;
            text-transform: uppercase;
        }

        .hero p {
            font-size: 1.3rem;
            margin-bottom: 2rem;
            font-weight: 300;
            letter-spacing: 1px;
        }

        /* Buttons */
        .btn {
            display: inline-block;
            padding: 0.8rem 2rem;
            margin: 0.5rem;
            border: 2px solid white;
            background: transparent;
            color: white;
            text-decoration: none;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 1px;
            cursor: pointer;
            transition: all 0.3s;
            border-radius: 4px;
            font-size: 0.9rem;
        }

        .btn-primary {
            background: #c41e3a;
            border-color: #c41e3a;
        }

        .btn-primary:hover {
            background: white;
            color: #c41e3a;
            transform: scale(1.05);
        }

        .btn-secondary:hover {
            background: white;
            color: #1a1a1a;
            transform: scale(1.05);
        }

        /* Collections Section */
        .collections {
            padding: 6rem 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }

        .section-title {
            text-align: center;
            font-size: 2.5rem;
            margin-bottom: 3rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            position: relative;
        }

        .section-title::after {
            content: '';
            position: absolute;
            width: 50px;
            height: 3px;
            background: #c41e3a;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
        }

        .collection-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }

        .collection-card {
            position: relative;
            overflow: hidden;
            border-radius: 8px;
            aspect-ratio: 3/4;
            cursor: pointer;
        }

        .collection-card img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }

        .collection-card:hover img {
            transform: scale(1.1);
        }

        .collection-info {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
            padding: 2rem 1rem 1rem;
            color: white;
            transform: translateY(20px);
            transition: transform 0.3s;
        }

        .collection-card:hover .collection-info {
            transform: translateY(0);
        }

        .collection-info h3 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .collection-info p {
            font-size: 0.9rem;
            opacity: 0.9;
        }

        /* Schedule Section */
        .schedule {
            background: #f5f5f5;
            padding: 6rem 2rem;
        }

        .schedule-container {
            max-width: 1000px;
            margin: 0 auto;
        }

        .event-list {
            display: flex;
            flex-direction: column;
            gap: 2rem;
            margin-top: 3rem;
        }

        .event-item {
            display: grid;
            grid-template-columns: 150px 1fr;
            gap: 2rem;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            border-left: 4px solid #c41e3a;
            transition: all 0.3s;
        }

        .event-item:hover {
            box-shadow: 0 10px 30px rgba(196, 30, 58, 0.2);
            transform: translateX(10px);
        }

        .event-time {
            font-size: 1.8rem;
            font-weight: 700;
            color: #c41e3a;
        }

        .event-details h4 {
            font-size: 1.3rem;
            margin-bottom: 0.5rem;
        }

        .event-details p {
            color: #666;
            margin-bottom: 0.5rem;
        }

        /* Testimonials */
        .testimonials {
            padding: 6rem 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }

        .testimonial-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }

        .testimonial-card {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
            transition: all 0.3s;
        }

        .testimonial-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
        }

        .rating {
            color: #c41e3a;
            margin-bottom: 1rem;
            font-size: 1.2rem;
        }

        .testimonial-text {
            margin-bottom: 1.5rem;
            font-style: italic;
            color: #555;
            line-height: 1.8;
        }

        .author {
            font-weight: 700;
            color: #333;
            display: block;
            margin-bottom: 0.3rem;
        }

        .author-title {
            color: #999;
            font-size: 0.9rem;
        }

        /* Footer */
        footer {
            background: #1a1a1a;
            color: white;
            padding: 3rem 2rem;
            text-align: center;
        }

        .footer-content {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
            text-align: left;
        }

        .footer-section h4 {
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .footer-section ul {
            list-style: none;
        }

        .footer-section ul li {
            margin-bottom: 0.5rem;
        }

        .footer-section a {
            color: #ccc;
            text-decoration: none;
            transition: color 0.3s;
        }

        .footer-section a:hover {
            color: #c41e3a;
        }

        .footer-bottom {
            border-top: 1px solid #333;
            padding-top: 2rem;
            text-align: center;
            color: #999;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .menu-toggle {
                display: flex;
            }

            nav ul {
                display: none;
                position: absolute;
                top: 60px;
                left: 0;
                right: 0;
                flex-direction: column;
                background: white;
                padding: 1rem;
                gap: 1rem;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }

            nav ul.active {
                display: flex;
            }

            .hero h1 {
                font-size: 2.5rem;
            }

            .hero p {
                font-size: 1rem;
            }

            .section-title {
                font-size: 2rem;
            }

            .event-item {
                grid-template-columns: 1fr;
            }

            .event-time {
                font-size: 1.2rem;
            }

            .collection-grid {
                grid-template-columns: 1fr;
            }

            .testimonial-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 480px) {
            nav {
                padding: 1rem;
            }

            .logo {
                font-size: 1.2rem;
            }

            .hero {
                margin-top: 50px;
            }

            .hero h1 {
                font-size: 2rem;
                letter-spacing: 1px;
            }

            .btn {
                padding: 0.6rem 1rem;
                font-size: 0.8rem;
                margin: 0.3rem;
            }

            .collections {
                padding: 3rem 1rem;
            }

            .section-title {
                font-size: 1.5rem;
            }

            .event-item {
                padding: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav>
        <div class="container">
            <div class="logo">Lumière</div>
            <ul id="navMenu" class="nav-menu">
                <li><a href="#home">Home</a></li>
                <li><a href="#collections">Collections</a></li>
                <li><a href="#schedule">Schedule</a></li>
                <li><a href="#reviews">Reviews</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
            <div class="menu-toggle" id="menuToggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero" id="home">
        <div class="hero-content">
            <h1>Lumière Fashion Show 2025</h1>
            <p>Experience the Elegance of Tomorrow's Fashion</p>
            <a href="#collections" class="btn btn-primary">Explore Collections</a>
            <a href="#schedule" class="btn btn-secondary">View Schedule</a>
        </div>
    </section>

    <!-- Collections Section -->
    <section class="collections" id="collections">
        <h2 class="section-title">Spring/Summer Collections</h2>
        <div class="collection-grid">
            <div class="collection-card">
                <img src="https://images.unsplash.com/photo-1595777712802-576b10e62e1e?w=400&h=500&fit=crop" alt="Elegance Collection">
                <div class="collection-info">
                    <h3>Elegance</h3>
                    <p>Timeless sophistication meets modern design</p>
                </div>
            </div>
            <div class="collection-card">
                <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=500&fit=crop" alt="Vibe Collection">
                <div class="collection-info">
                    <h3>Urban Vibe</h3>
                    <p>Bold colors and contemporary silhouettes</p>
                </div>
            </div>
            <div class="collection-card">
                <img src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop" alt="Heritage Collection">
                <div class="collection-info">
                    <h3>Heritage</h3>
                    <p>Classic cuts inspired by fashion history</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Schedule Section -->
    <section class="schedule" id="schedule">
        <div class="schedule-container">
            <h2 class="section-title">Event Schedule</h2>
            <div class="event-list">
                <div class="event-item">
                    <div class="event-time">10:00 AM</div>
                    <div class="event-details">
                        <h4>Registration & Welcome</h4>
                        <p>VIP Lounge - Grand Ballroom</p>
                        <p>Check-in and complimentary refreshments</p>
                    </div>
                </div>
                <div class="event-item">
                    <div class="event-time">11:30 AM</div>
                    <div class="event-details">
                        <h4>Elegance Collection Showcase</h4>
                        <p>Main Runway</p>
                        <p>Experience timeless sophistication on the runway</p>
                    </div>
                </div>
                <div class="event-item">
                    <div class="event-time">1:00 PM</div>
                    <div class="event-details">
                        <h4>Lunch & Networking</h4>
                        <p>VIP Dining Area</p>
                        <p>Exclusive networking with designers and industry leaders</p>
                    </div>
                </div>
                <div class="event-item">
                    <div class="event-time">2:30 PM</div>
                    <div class="event-details">
                        <h4>Urban Vibe & Heritage Collections</h4>
                        <p>Main Runway</p>
                        <p>Double showcase featuring contemporary and classic designs</p>
                    </div>
                </div>
                <div class="event-item">
                    <div class="event-time">4:00 PM</div>
                    <div class="event-details">
                        <h4>Designer Meet & Greet</h4>
                        <p>Designer Lounge</p>
                        <p>One-on-one conversations with our featured designers</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials" id="reviews">
        <h2 class="section-title">Guest Reviews</h2>
        <div class="testimonial-grid">
            <div class="testimonial-card">
                <div class="rating">★★★★★</div>
                <p class="testimonial-text">"An absolutely breathtaking showcase of creativity and craftsmanship. The collections this year are simply outstanding!"</p>
                <span class="author">Sarah Mitchell</span>
                <span class="author-title">Fashion Editor</span>
            </div>
            <div class="testimonial-card">
                <div class="rating">★★★★★</div>
                <p class="testimonial-text">"The production quality was exceptional. Every detail from the runway to the ambiance was meticulously planned."</p>
                <span class="author">Michael Chen</span>
                <span class="author-title">Event Organizer</span>
            </div>
            <div class="testimonial-card">
                <div class="rating">★★★★★</div>
                <p class="testimonial-text">"I was captivated by the Urban Vibe collection. The designers truly understand what modern fashion enthusiasts want."</p>
                <span class="author">Emma Rodriguez</span>
                <span class="author-title">Fashion Influencer</span>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer id="contact">
        <div class="footer-content">
            <div class="footer-section">
                <h4>About Lumière</h4>
                <ul>
                    <li><a href="#">Our Story</a></li>
                    <li><a href="#">Brand Values</a></li>
                    <li><a href="#">Sustainability</a></li>
                    <li><a href="#">Press</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Contact Us</h4>
                <ul>
                    <li><a href="mailto:info@lumiere.com">info@lumiere.com</a></li>
                    <li><a href="tel:+1234567890">+1 (234) 567-890</a></li>
                    <li>New York, NY 10001</li>
                    <li><a href="#">Contact Form</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Follow Us</h4>
                <ul>
                    <li><a href="#">Instagram</a></li>
                    <li><a href="#">Facebook</a></li>
                    <li><a href="#">Twitter</a></li>
                    <li><a href="#">TikTok</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 Lumière Fashion Show. All rights reserved.</p>
        </div>
    </footer>

    <script>
        // Mobile Menu Toggle
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.getElementById('navMenu');

        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Close menu on link click
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });

        // Add scroll animation for elements
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.collection-card, .event-item, .testimonial-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    </script>
</body>
</html>