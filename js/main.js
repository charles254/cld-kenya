/**
 * CENTER FOR DIALOGUE AND RESEARCH INTERNATIONAL LIMITED
 * Official Interactive Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initStickyNavbar();
  initCounterAnimation();
  initDonationModal();
  initCopyButtons();
  initProgramTabs();
  initFaqAccordion();
  initFormHandlers();
});

/* ----------------------------------------------------
   1. Mobile Navigation & Drawer
   ---------------------------------------------------- */
function initMobileNavigation() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const closeBtn = document.getElementById('drawerClose');

  if (!toggleBtn || !drawer || !overlay) return;

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  const drawerLinks = drawer.querySelectorAll('a');
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/* ----------------------------------------------------
   2. Sticky Navbar with shadow
   ---------------------------------------------------- */
function initStickyNavbar() {
  const header = document.querySelector('.header-nav');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* ----------------------------------------------------
   3. Animated Impact Counter
   ---------------------------------------------------- */
function initCounterAnimation() {
  const counters = document.querySelectorAll('.counter-val');
  if (!counters.length) return;

  const observerOptions = {
    threshold: 0.2
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1800;
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const currentVal = Math.floor(easeProgress * target);
          
          el.innerText = `${prefix}${currentVal.toLocaleString()}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            el.innerText = `${prefix}${target.toLocaleString()}${suffix}`;
          }
        }

        requestAnimationFrame(updateCounter);
        obs.unobserve(el);
      }
    });
  }, observerOptions);

  counters.forEach(counter => observer.observe(counter));
}

/* ----------------------------------------------------
   4. Copy to Clipboard (M-Pesa / Bank Info)
   ---------------------------------------------------- */
function initCopyButtons() {
  const copyButtons = document.querySelectorAll('[data-copy-text]');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const text = btn.getAttribute('data-copy-text');
      navigator.clipboard.writeText(text).then(() => {
        showToast(`Copied to clipboard: ${text}`, 'success');
      }).catch(() => {
        showToast(`Copy failed, please copy manually: ${text}`);
      });
    });
  });
}

/* ----------------------------------------------------
   5. Interactive Donation Modal & M-Pesa STK Simulator
   ---------------------------------------------------- */
let currentDonationAmount = 2500;
let currentCurrency = 'KES';

function initDonationModal() {
  const modalBackdrop = document.getElementById('donationModal');
  const openButtons = document.querySelectorAll('.open-donate-modal');
  const closeBtn = document.getElementById('closeDonationModal');

  if (!modalBackdrop) return;

  function openModal() {
    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const presetAmount = btn.getAttribute('data-amount');
      if (presetAmount) {
        selectDonationPreset(parseInt(presetAmount, 10));
      }
      openModal();
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  // Preset pill selection
  const presetPills = document.querySelectorAll('.preset-pill-modal');
  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      presetPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const val = parseInt(pill.getAttribute('data-value'), 10);
      currentDonationAmount = val;
      const customInput = document.getElementById('customAmountInput');
      if (customInput) customInput.value = val;
      updateImpactDescription(val);
    });
  });

  const customInput = document.getElementById('customAmountInput');
  if (customInput) {
    customInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10) || 0;
      currentDonationAmount = val;
      presetPills.forEach(p => p.classList.remove('active'));
      updateImpactDescription(val);
    });
  }

  // M-Pesa STK Push Simulation Form
  const mpesaForm = document.getElementById('mpesaStkForm');
  if (mpesaForm) {
    mpesaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const phoneInput = document.getElementById('mpesaPhoneInput');
      const phone = phoneInput ? phoneInput.value.trim() : '';

      if (!phone.match(/^(?:254|\+254|0)?(7[0-9]{8}|1[0-9]{8})$/)) {
        showToast('Please enter a valid Kenyan Safaricom phone number (e.g. 0712345678)', 'warning');
        return;
      }

      const submitBtn = mpesaForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending STK Prompt...';

      setTimeout(() => {
        submitBtn.innerHTML = '<i class="fas fa-mobile-alt"></i> Prompt Sent! Check Your Phone...';
        showToast(`M-PESA prompt sent to ${phone}. Enter your M-Pesa PIN on your phone.`, 'success');

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          showDonationSuccess(phone, currentDonationAmount);
        }, 3000);
      }, 1500);
    });
  }
}

function selectDonationPreset(amount) {
  currentDonationAmount = amount;
  const customInput = document.getElementById('customAmountInput');
  if (customInput) customInput.value = amount;
  const pills = document.querySelectorAll('.preset-pill-modal');
  pills.forEach(p => {
    if (parseInt(p.getAttribute('data-value'), 10) === amount) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });
  updateImpactDescription(amount);
}

function updateImpactDescription(amount) {
  const descEl = document.getElementById('donationImpactText');
  if (!descEl) return;

  if (amount >= 20000) {
    descEl.innerText = `KES ${amount.toLocaleString()}: Co-funds a multi-clan Peace Accord Dialogue and provides neutral solar water kiosk materials in conflict corridors.`;
  } else if (amount >= 10000) {
    descEl.innerText = `KES ${amount.toLocaleString()}: Provides full de-radicalization mentorship, tech toolkits & seed micro-grants for 2 at-risk youth ex-gang members in Nairobi.`;
  } else if (amount >= 5000) {
    descEl.innerText = `KES ${amount.toLocaleString()}: Funds a certified Alternative Dispute Resolution (ADR) session and legal mediation for an inter-clan boundary dispute.`;
  } else if (amount >= 2000) {
    descEl.innerText = `KES ${amount.toLocaleString()}: Trains and equips 1 grassroots woman peace monitor with early-warning reporting tools in conflict-prone areas.`;
  } else {
    descEl.innerText = `KES ${amount.toLocaleString()}: Supports community peace committee travel and emergency early-warning communication in hotspot wards.`;
  }
}

function showDonationSuccess(phone, amount) {
  const receiptContainer = document.getElementById('donationReceipt');
  const formContainer = document.getElementById('mpesaFlowContainer');
  if (!receiptContainer || !formContainer) return;

  const txnCode = 'QK' + Math.floor(10000000 + Math.random() * 90000000);
  const now = new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });

  document.getElementById('receiptTxnCode').innerText = txnCode;
  document.getElementById('receiptAmount').innerText = `KES ${amount.toLocaleString()}`;
  document.getElementById('receiptPhone').innerText = phone;
  document.getElementById('receiptDate').innerText = now;

  formContainer.style.display = 'none';
  receiptContainer.style.display = 'block';

  showToast('Asante sana! Donation received successfully.', 'success');
}

function resetDonationModal() {
  const receiptContainer = document.getElementById('donationReceipt');
  const formContainer = document.getElementById('mpesaFlowContainer');
  if (receiptContainer && formContainer) {
    receiptContainer.style.display = 'none';
    formContainer.style.display = 'block';
  }
}

/* ----------------------------------------------------
   6. Program Filter Tabs
   ---------------------------------------------------- */
function initProgramTabs() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const programCards = document.querySelectorAll('.program-card-item');

  if (!filterBtns.length || !programCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterCategory = btn.getAttribute('data-filter');

      programCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (filterCategory === 'all' || cardCategory === filterCategory) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ----------------------------------------------------
   7. FAQ Accordion
   ---------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-question');
    if (!header) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });
}

/* ----------------------------------------------------
   8. Form Handlers (Contact, Volunteer, Newsletter)
   ---------------------------------------------------- */
function initFormHandlers() {
  // Contact Form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        contactForm.reset();
        showToast('Thank you for contacting CLD Kenya. Our Nairobi team will reply within 24 hours.', 'success');
      }, 1200);
    });
  }

  // Volunteer Form
  const volunteerForm = document.getElementById('volunteerForm');
  if (volunteerForm) {
    volunteerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = volunteerForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting Application...';

      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check"></i> Application Submitted!';
        volunteerForm.reset();
        showToast('Application received! We look forward to welcoming you to the CLD Kenya volunteer family.', 'success');
      }, 1400);
    });
  }

  // Newsletter Form
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        showToast(`Subscribed! Updates will be sent to ${input.value}`, 'success');
        input.value = '';
      }
    });
  });
}

/* ----------------------------------------------------
   9. Toast Notification Utility
   ---------------------------------------------------- */
function showToast(message, type = 'info') {
  let toast = document.getElementById('toastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.className = `toast-notice ${type === 'success' ? 'success' : ''}`;
  toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i> <span>${message}</span>`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}
