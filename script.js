// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

mobileMenuToggle.addEventListener('click', function () {
    this.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', function () {
        mobileMenuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', function (event) {
    const isClickInsideNav = navMenu.contains(event.target);
    const isClickOnToggle = mobileMenuToggle.contains(event.target);

    if (!isClickInsideNav && !isClickOnToggle && navMenu.classList.contains('active')) {
        mobileMenuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', function () {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('.section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Add animation to tech cards
document.querySelectorAll('.tech-card, .app-card, .paper-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;

    observer.observe(card);
});

// Toggle BibTeX citation
function toggleBib(bibId) {
    const bibElement = document.getElementById(bibId);
    if (bibElement) {
        if (bibElement.style.display === 'none' || bibElement.style.display === '') {
            bibElement.style.display = 'block';
        } else {
            bibElement.style.display = 'none';
        }
    }
}

// Language Toggle
let currentLang = 'ko'; // Default language

const translations = {
    ko: '한국어',
    en: 'English'
};

function switchLanguage() {
    currentLang = currentLang === 'ko' ? 'en' : 'ko';

    // Update language button text
    document.getElementById('currentLang').textContent = translations[currentLang];

    // Update all elements with data-lang attributes
    document.querySelectorAll('[data-ko]').forEach(element => {
        const koText = element.getAttribute('data-ko');
        const enText = element.getAttribute('data-en');

        // Check if content has HTML tags (like <br>)
        if (koText.includes('<br>') || enText.includes('<br>') || koText.includes('<') || enText.includes('<')) {
            if (currentLang === 'ko') {
                element.innerHTML = koText;
            } else {
                element.innerHTML = enText;
            }
        } else {
            if (currentLang === 'ko') {
                element.textContent = koText;
            } else {
                element.textContent = enText;
            }
        }
    });

    // Update form placeholders
    const form = document.querySelector('.contact-form form');
    if (form) {
        const inputs = form.querySelectorAll('input, textarea');
        const placeholders = {
            ko: {
                name: '이름',
                email: '이메일',
                company: '회사명',
                message: '메시지'
            },
            en: {
                name: 'Name',
                email: 'Email',
                company: 'Company',
                message: 'Message'
            }
        };

        inputs[0].placeholder = placeholders[currentLang].name;
        inputs[1].placeholder = placeholders[currentLang].email;
        inputs[2].placeholder = placeholders[currentLang].company;
        inputs[3].placeholder = placeholders[currentLang].message;
    }

    // Update form button text
    const submitBtn = document.querySelector('.contact-form button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = currentLang === 'ko' ? '보내기' : 'Send';
    }

    // Update form success message
    if (form) {
        form.onsubmit = function (e) {
            e.preventDefault();
            const message = currentLang === 'ko'
                ? '감사합니다! 메시지가 전송되었습니다.'
                : 'Thank you! Your message has been sent.';
            alert(message);
            this.reset();
        };
    }
}

// Add event listener to language button
document.addEventListener('DOMContentLoaded', function () {
    const langBtn = document.getElementById('langBtn');
    if (langBtn) {
        langBtn.addEventListener('click', switchLanguage);
    }
});
