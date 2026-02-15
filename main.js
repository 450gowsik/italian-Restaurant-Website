// DOM Elements
const header = document.querySelector('.header');
const menuToggle = document.querySelector('.menu-toggle');
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.navbar a');

// ===== Header Scroll Effect =====
const headerScrollEffect = () => {
  if (window.scrollY > 100) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
};

window.addEventListener('scroll', headerScrollEffect);

// ===== Mobile Menu Toggle =====
menuToggle.addEventListener('click', () => {
  navbar.classList.toggle('active');
  menuToggle.innerHTML = navbar.classList.contains('active') ? '✕' : '☰';
});

// ===== Smooth Scroll with Mobile Menu Close =====
navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Close mobile menu if open
    if (navbar.classList.contains('active')) {
      navbar.classList.remove('active');
      menuToggle.innerHTML = '☰';
    }
    
    // Smooth scroll to section
    const targetId = this.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    
    if (targetSection) {
      targetSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// ===== Reservation Form Validation =====
const form = document.querySelector('.reserve-form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    
    // Basic form validation
    const inputs = form.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    inputs.forEach(input => {
      if (input.hasAttribute('required') && !input.value.trim()) {
        isValid = false;
        input.classList.add('error');
      } else {
        input.classList.remove('error');
      }
    });
    
    if (isValid) {
      alert('Thank you! Your reservation has been confirmed.');
      form.reset();
    } else {
      alert('Please fill in all required fields.');
    }
  });
}

