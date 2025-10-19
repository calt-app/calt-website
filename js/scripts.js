/*!
* Start Bootstrap - New Age v6.0.1 (https://startbootstrap.com/theme/new-age)
* Copyright 2013-2021 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-new-age/blob/master/LICENSE)
*/

window.addEventListener('DOMContentLoaded', event => {
    // Mobile Navigation Toggle
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarMenu = document.querySelector('.navbar-menu');
    
    if (navbarToggler && navbarMenu) {
        navbarToggler.addEventListener('click', () => {
            navbarMenu.classList.toggle('active');
            
            // Animate hamburger menu
            const spans = navbarToggler.querySelectorAll('span');
            if (navbarMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });
        
        // Close menu when clicking on nav links
        const navLinks = document.querySelectorAll('.navbar-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navbarMenu.classList.remove('active');
                const spans = navbarToggler.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            });
        });
    }
    
    // Waitlist Form Submission
    const waitlistForm = document.querySelector('.waitlist-form');
    
    if (waitlistForm) {
        // Replace with your Google Apps Script Web App URL
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz5d82rUwIq7hoLdeQVdE0ofL0ZNF94LGWIo7Ia-VwA_0UDI0Kya2knXQMMHvKs3DpgcA/exec';
        
        waitlistForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = waitlistForm.querySelector('input[type="email"]');
            const submitButton = waitlistForm.querySelector('button[type="submit"]');
            const email = emailInput.value.trim();
            
            // Disable form during submission
            submitButton.disabled = true;
            submitButton.textContent = 'joining...';
            
            try {
                const formData = new FormData();
                formData.append('email', email);
                
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.status === 'success') {
                    // Success message
                    emailInput.value = '';
                    submitButton.textContent = 'joined!';
                    submitButton.style.backgroundColor = '#69a9d1';
                    
                    setTimeout(() => {
                        submitButton.textContent = 'join waitlist';
                        submitButton.style.backgroundColor = '';
                        submitButton.disabled = false;
                    }, 3000);
                } else if (result.status === 'duplicate') {
                    // Duplicate email
                    submitButton.textContent = 'already joined!';
                    submitButton.style.backgroundColor = '#ffc107';
                    
                    setTimeout(() => {
                        submitButton.textContent = 'join waitlist';
                        submitButton.style.backgroundColor = '';
                        submitButton.disabled = false;
                    }, 3000);
                } else {
                    throw new Error(result.message || 'Submission failed');
                }
                
            } catch (error) {
                console.error('Error:', error);
                submitButton.textContent = 'error - try again';
                submitButton.style.backgroundColor = '#dc3545';
                
                setTimeout(() => {
                    submitButton.textContent = 'join waitlist';
                    submitButton.style.backgroundColor = '';
                    submitButton.disabled = false;
                }, 3000);
            }
        });
    }
    
    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all other FAQ items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        if (otherAnswer) {
                            otherAnswer.style.maxHeight = '0';
                        }
                    }
                });
                
                // Toggle current item
                if (isActive) {
                    item.classList.remove('active');
                    answer.style.maxHeight = '0';
                } else {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        }
    });
    
    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#' || href === '') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.backgroundColor = 'rgba(248, 249, 250, 0.95)';
                navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.backgroundColor = 'rgba(248, 249, 250, 0.85)';
                navbar.style.boxShadow = 'none';
            }
        });
    }
});