/* =============================================================
   ExportHub — Main JavaScript
   Lightweight, no Three.js. GSAP + ScrollTrigger only.
   ============================================================= */

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =============================================================
   1. SMOOTH SCROLL
   ============================================================= */
const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        closeMobileMenu();
        closeCountryPanel();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
};

/* =============================================================
   2. NAVBAR SCROLL EFFECT
   ============================================================= */
const initNavScroll = () => {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const onScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('nav-scrolled');
    } else {
      navbar.classList.remove('nav-scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
};

/* =============================================================
   3. MOBILE NAVIGATION
   ============================================================= */
const closeMobileMenu = () => {
  const menu = document.getElementById('mobile-menu');
  const hamburger = document.getElementById('hamburger');
  if (menu) menu.classList.remove('open');
  if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
};

const initMobileMenu = () => {
  const hamburger = document.getElementById('hamburger');
  const closeBtn = document.getElementById('mobile-close');
  const menu = document.getElementById('mobile-menu');
  if (!hamburger || !closeBtn || !menu) return;

  hamburger.addEventListener('click', () => {
    menu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    closeBtn.focus();
  });

  closeBtn.addEventListener('click', closeMobileMenu);

  menu.querySelectorAll('.mobile-links a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      closeMobileMenu();
      hamburger.focus();
    }
  });
};

/* =============================================================
   4. SCROLL REVEAL
   ============================================================= */
const initScrollReveal = () => {
  const reveals = document.querySelectorAll('.reveal');
  if (prefersReducedMotion) {
    reveals.forEach(el => el.classList.add('revealed'));
    return;
  }
  reveals.forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => el.classList.add('revealed'),
      once: true
    });
  });
};

/* =============================================================
   5. PRODUCT CATEGORIES
   ============================================================= */
const categories = [
  { name: 'Medical Supplies', icon: '🏥', desc: 'Surgical instruments, PPE, pharmaceuticals, diagnostic equipment, and disposable medical products.', count: '120+ Products' },
  { name: 'Food & Beverages', icon: '🌾', desc: 'Basmati rice, organic spices, tea, processed foods, and packaged beverages.', count: '95+ Products' },
  { name: 'Agriculture', icon: '🌿', desc: 'Seeds, organic fertilizers, farm equipment, and processed agricultural commodities.', count: '80+ Products' },
  { name: 'Industrial', icon: '⚙️', desc: 'Valves, pipes, cables, fasteners, industrial chemicals, and machinery components.', count: '110+ Products' },
  { name: 'Electronics', icon: '📱', desc: 'Transformers, capacitors, cables, LED lighting, and electronic components.', count: '95+ Products' }
];

const renderCategories = () => {
  const grid = document.getElementById('categories-grid');
  if (!grid) return;
  grid.innerHTML = categories.map(cat => `
    <div class="category-card reveal">
      <div class="category-icon">${cat.icon}</div>
      <h3>${cat.name}</h3>
      <p>${cat.desc}</p>
      <span class="category-count">${cat.count}</span>
      <a href="#products" class="btn-text">Explore →</a>
    </div>
  `).join('');
};

/* =============================================================
   6. GLOBAL TRADE MAP
   ============================================================= */
const countriesData = {
  Russia: {
    flag: '🇷🇺',
    popular: ['Surgical Gloves', 'Industrial Valves', 'Tea', 'Pharmaceuticals'],
    time: '18 Days',
    ports: ['St. Petersburg', 'Vladivostok', 'Novorossiysk'],
    docs: ['Commercial Invoice', 'Customs Declaration', 'Certificate of Origin'],
    certifications: ['GOST-R', 'EAC Mark', 'CE Certificate']
  },
  UAE: {
    flag: '🇦🇪',
    popular: ['Basmati Rice', 'Organic Spices', 'Apparel', 'Industrial Cables'],
    time: '5 Days',
    ports: ['Jebel Ali (Dubai)', 'Khalifa (Abu Dhabi)', 'Sharjah'],
    docs: ['Bill of Lading', 'Commercial Invoice', 'Certificate of Origin'],
    certifications: ['Halal Certificate', 'ESMA Conformity', 'SABER Registered']
  },
  Germany: {
    flag: '🇩🇪',
    popular: ['Electronics', 'Automotive Parts', 'Organic Tea', 'Surgical Face Masks'],
    time: '22 Days',
    ports: ['Hamburg', 'Bremerhaven', 'Wilhelmshaven'],
    docs: ['Customs Invoice', 'EUR.1 Movement Certificate', 'Packing List'],
    certifications: ['CE Mark', 'ISO 9001', 'RoHS / REACH']
  },
  USA: {
    flag: '🇺🇸',
    popular: ['Textiles & Garments', 'Spices', 'Medical PPE', 'Rice'],
    time: '25 Days',
    ports: ['Los Angeles', 'New York/New Jersey', 'Houston'],
    docs: ['FDA Registration', 'Commercial Invoice', 'Bill of Lading'],
    certifications: ['FDA Approved', 'UL Listed', 'USDA Organic']
  },
  Brazil: {
    flag: '🇧🇷',
    popular: ['Agriculture Machinery', 'Spices', 'Industrial Chemicals', 'Apparel'],
    time: '30 Days',
    ports: ['Santos', 'Paranagua', 'Rio de Janeiro'],
    docs: ['Import Declaration', 'Phytosanitary Certificate', 'Packing List'],
    certifications: ['MAPA Certified', 'ANVISA Approved', 'INMETRO']
  },
  Japan: {
    flag: '🇯🇵',
    popular: ['Basmati Rice', 'Textiles', 'Electronics', 'Organic Spices'],
    time: '14 Days',
    ports: ['Tokyo', 'Yokohama', 'Kobe', 'Osaka'],
    docs: ['Certificate of Origin (EPA)', 'Customs Invoice', 'Bill of Lading'],
    certifications: ['JAS Organic', 'JIS Mark', 'PSE Certification']
  }
};

const countryPositions = {
  India:   { x: 640, y: 260 },
  Russia:  { x: 620, y: 120 },
  UAE:     { x: 580, y: 270 },
  Germany: { x: 490, y: 155 },
  USA:     { x: 200, y: 195 },
  Brazil:  { x: 300, y: 360 },
  Japan:   { x: 810, y: 200 }
};

const renderTradeMap = () => {
  const container = document.getElementById('map-container');
  if (!container) return;

  const india = countryPositions.India;

  // Build SVG with simplified continent outlines
  let svg = `<svg viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="World map showing ExportHub trade corridors from India">`;

  // Simplified continent paths
  svg += `<g fill="#E5E2DD" stroke="#D0CBC3" stroke-width="0.5">`;
  // North America
  svg += `<path d="M80,80 L120,60 L200,55 L260,80 L280,120 L260,170 L230,200 L200,230 L170,240 L140,210 L120,170 L90,130 Z"/>`;
  // Central America
  svg += `<path d="M170,240 L200,230 L220,250 L210,280 L190,290 L175,270 Z"/>`;
  // South America
  svg += `<path d="M210,280 L260,290 L310,310 L340,350 L330,400 L300,430 L270,440 L250,410 L240,370 L230,330 L210,310 Z"/>`;
  // Europe
  svg += `<path d="M440,80 L480,60 L530,70 L560,90 L550,130 L530,160 L500,170 L470,160 L450,130 Z"/>`;
  // Africa
  svg += `<path d="M460,210 L510,200 L550,220 L570,270 L560,330 L540,380 L510,400 L480,380 L460,340 L450,290 L445,240 Z"/>`;
  // Russia/Northern Asia
  svg += `<path d="M560,60 L620,50 L700,55 L780,70 L830,90 L820,120 L780,130 L720,125 L660,120 L600,100 L570,80 Z"/>`;
  // Middle East
  svg += `<path d="M550,200 L580,190 L610,210 L600,250 L570,260 L550,240 Z"/>`;
  // India (highlighted)
  svg += `</g>`;
  svg += `<path d="M620,220 L660,210 L680,230 L670,270 L650,300 L630,290 L620,260 L615,240 Z" fill="#1B3A2D" stroke="#122820" stroke-width="0.5" opacity="0.7"/>`;
  svg += `<g fill="#E5E2DD" stroke="#D0CBC3" stroke-width="0.5">`;
  // Southeast Asia
  svg += `<path d="M700,220 L740,210 L770,230 L760,260 L730,270 L710,250 Z"/>`;
  // China/East Asia
  svg += `<path d="M680,140 L740,130 L790,150 L810,180 L790,210 L750,220 L710,210 L680,190 L670,160 Z"/>`;
  // Japan
  svg += `<path d="M815,160 L825,150 L830,175 L825,200 L815,195 Z"/>`;
  // Australia
  svg += `<path d="M750,350 L810,340 L850,360 L860,400 L830,420 L780,415 L750,390 Z"/>`;
  svg += `</g>`;

  // Dashed trade route lines from India
  svg += `<g stroke="#D0CBC3" stroke-width="1" stroke-dasharray="6,4" fill="none" opacity="0.6">`;
  Object.keys(countriesData).forEach(country => {
    const pos = countryPositions[country];
    svg += `<line x1="${india.x}" y1="${india.y}" x2="${pos.x}" y2="${pos.y}"/>`;
  });
  svg += `</g>`;

  // India dot (larger)
  svg += `<circle cx="${india.x}" cy="${india.y}" r="8" fill="#1B3A2D" class="map-dot"/>`;
  svg += `<circle cx="${india.x}" cy="${india.y}" r="4" fill="#fff"/>`;
  svg += `<text x="${india.x + 14}" y="${india.y + 5}" class="map-india-label">India (HQ)</text>`;

  // Country dots
  Object.keys(countriesData).forEach(country => {
    const pos = countryPositions[country];
    const data = countriesData[country];
    svg += `<circle cx="${pos.x}" cy="${pos.y}" r="6" fill="#C45D2C" class="map-dot" data-country="${country}" style="cursor:pointer"/>`;
    svg += `<circle cx="${pos.x}" cy="${pos.y}" r="3" fill="#fff" pointer-events="none"/>`;
    // Label positioning
    const lx = pos.x + 12;
    const ly = pos.y + 4;
    svg += `<text x="${lx}" y="${ly}" class="map-label">${data.flag} ${country}</text>`;
  });

  svg += `</svg>`;
  container.innerHTML = svg;

  // Add click handlers to dots
  container.querySelectorAll('.map-dot[data-country]').forEach(dot => {
    dot.addEventListener('click', () => {
      showCountryPanel(dot.dataset.country);
    });
  });
};

const showCountryPanel = (country) => {
  const panel = document.getElementById('country-panel');
  const overlay = document.getElementById('panel-overlay');
  const content = document.getElementById('panel-content');
  if (!panel || !content) return;

  const data = countriesData[country];
  if (!data) return;

  content.innerHTML = `
    <div class="panel-flag">${data.flag}</div>
    <h3 class="panel-country-name">${country}</h3>
    <p class="panel-subtitle">Direct export corridor from India</p>

    <div class="panel-stat-grid">
      <div class="panel-stat">
        <div class="panel-stat-val">${data.time}</div>
        <div class="panel-stat-key">Transit Time</div>
      </div>
      <div class="panel-stat">
        <div class="panel-stat-val">${data.ports.length}</div>
        <div class="panel-stat-key">Major Ports</div>
      </div>
    </div>

    <p class="panel-section-title">Popular Exports</p>
    <div class="panel-tags">
      ${data.popular.map(p => `<span class="panel-tag">${p}</span>`).join('')}
    </div>

    <p class="panel-section-title">Required Documents</p>
    <ul class="panel-list">
      ${data.docs.map(d => `<li>${d}</li>`).join('')}
    </ul>

    <p class="panel-section-title">Certifications</p>
    <div class="panel-tags">
      ${data.certifications.map(c => `<span class="panel-tag">${c}</span>`).join('')}
    </div>

    <a href="#contact" class="btn-primary btn-full" style="margin-top:var(--space-xl)">Inquire for ${country}</a>
  `;

  panel.classList.add('open');
  if (overlay) overlay.classList.add('open');
};

const closeCountryPanel = () => {
  const panel = document.getElementById('country-panel');
  const overlay = document.getElementById('panel-overlay');
  if (panel) panel.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
};

const initCountryPanel = () => {
  const closeBtn = document.getElementById('panel-close');
  const overlay = document.getElementById('panel-overlay');
  if (closeBtn) closeBtn.addEventListener('click', closeCountryPanel);
  if (overlay) overlay.addEventListener('click', closeCountryPanel);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCountryPanel();
  });
};

/* =============================================================
   7. EXPORT PROCESS TIMELINE
   ============================================================= */
const processSteps = [
  { num: '01', title: 'Inquiry', desc: 'Share your product requirements, target quantities, and destination market.' },
  { num: '02', title: 'Sourcing', desc: 'We identify verified manufacturers and obtain competitive quotations.' },
  { num: '03', title: 'Quotation', desc: 'Receive detailed pricing including FOB/CIF terms, MOQ, and lead times.' },
  { num: '04', title: 'Quality Check', desc: 'Pre-production samples, factory audit, and third-party inspection.' },
  { num: '05', title: 'Documentation', desc: 'Complete export documentation: invoices, certificates, customs paperwork.' },
  { num: '06', title: 'Shipping', desc: 'Container booking, freight forwarding, and real-time shipment tracking.' },
  { num: '07', title: 'Delivery', desc: 'Customs clearance at destination and final delivery to your warehouse.' }
];

const renderProcessSteps = () => {
  const container = document.getElementById('process-steps');
  if (!container) return;
  container.innerHTML = processSteps.map(step => `
    <div class="process-step reveal">
      <div class="step-circle">${step.num}</div>
      <div class="step-content">
        <h3 class="step-title">${step.title}</h3>
        <p class="step-desc">${step.desc}</p>
      </div>
    </div>
  `).join('');

  // Activate step circles on scroll
  if (!prefersReducedMotion) {
    setTimeout(() => {
      document.querySelectorAll('.step-circle').forEach((circle, i) => {
        ScrollTrigger.create({
          trigger: circle,
          start: 'top 80%',
          onEnter: () => {
            gsap.delayedCall(i * 0.15, () => circle.classList.add('active'));
          },
          once: true
        });
      });
    }, 100);
  } else {
    document.querySelectorAll('.step-circle').forEach(c => c.classList.add('active'));
  }
};

/* =============================================================
   8. FEATURED PRODUCTS
   ============================================================= */
const products = [
  { name: 'Nitrile Examination Gloves', category: 'Medical Supplies', icon: '🧤', desc: 'Powder-free nitrile gloves, chlorinated inner surface. Available in S/M/L/XL.', moq: '10,000 pcs', origin: 'Gujarat, India', certifications: 'ISO 13485, CE, FDA 510(k)' },
  { name: 'Premium Basmati Rice (1121)', category: 'Food & Beverages', icon: '🌾', desc: 'Extra-long grain aged Basmati. Moisture content < 12%. Available in 1kg, 5kg, 25kg packaging.', moq: '20 MT', origin: 'Punjab, India', certifications: 'FSSAI, APEDA, Organic Available' },
  { name: 'Surgical Face Masks (3-Ply)', category: 'Medical Supplies', icon: '😷', desc: 'Meltblown filter layer, BFE > 99%, fluid resistant. Ear-loop and tie-back variants.', moq: '50,000 pcs', origin: 'Maharashtra, India', certifications: 'ISO 13485, CE, ASTM Level 2' },
  { name: 'Darjeeling Black Tea', category: 'Food & Beverages', icon: '🍵', desc: 'Single-estate Darjeeling FTGFOP1 grade. Available loose leaf and in tea bags.', moq: '500 kg', origin: 'Darjeeling, India', certifications: 'FSSAI, Tea Board, Organic' },
  { name: 'Industrial Gate Valves', category: 'Industrial', icon: '🔧', desc: 'Cast steel gate valves, flanged ends. Pressure rating 150-600 class. API 600 compliant.', moq: '50 units', origin: 'Rajkot, India', certifications: 'API 600, ISO 9001, CE/PED' },
  { name: 'Organic Turmeric Powder', category: 'Agriculture', icon: '🟡', desc: 'High curcumin content (>3%). Sorted, cleaned, and ground in HACCP-certified facility.', moq: '5 MT', origin: 'Andhra Pradesh, India', certifications: 'USDA Organic, EU Organic, FSSAI' }
];

const renderProducts = () => {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  grid.innerHTML = products.map(p => `
    <div class="product-card reveal">
      <div class="product-visual">
        <span class="product-category-tag">${p.category}</span>
        ${p.icon}
      </div>
      <div class="product-body">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="product-specs">
          <div class="spec-row"><span class="spec-key">MOQ</span><span class="spec-val">${p.moq}</span></div>
          <div class="spec-row"><span class="spec-key">Origin</span><span class="spec-val">${p.origin}</span></div>
          <div class="spec-row"><span class="spec-key">Certifications</span><span class="spec-val">${p.certifications}</span></div>
        </div>
        <a href="#contact" class="btn-outline" style="width:100%;justify-content:center">Request Quote</a>
      </div>
    </div>
  `).join('');
};

/* =============================================================
   9. AI TRADE ASSISTANT CHAT
   ============================================================= */
const aiSuggestions = [
  'Can I export surgical gloves to Russia?',
  'HS Code for Basmati rice?',
  'Shipping cost Mumbai to Dubai?',
  'Documentation for EU exports?'
];

const aiAnswers = {
  'surgical gloves': 'Yes, surgical gloves (HS 4015.12) can be exported to Russia. Key requirements: GOST-R certification, EAC marking, commercial invoice, and Certificate of Origin. Typical transit via St. Petersburg takes approximately 18 days. We can arrange the complete documentation and logistics.',
  'basmati': 'The HS Code for Basmati Rice is 1006.30.20. Export requires APEDA registration, phytosanitary certificate, fumigation certificate, and compliance with minimum export pricing. We handle all documentation and can source premium 1121 Basmati from verified mills in Punjab.',
  'rice': 'The HS Code for Basmati Rice is 1006.30.20. Export requires APEDA registration, phytosanitary certificate, fumigation certificate, and compliance with minimum export pricing.',
  'mumbai': 'Estimated shipping costs from Mumbai (JNPT) to Dubai (Jebel Ali):\n• FCL 20ft: $750–950 USD\n• FCL 40ft: $1,200–1,500 USD\n• LCL per CBM: $45–60 USD\nTransit time: 4–6 days. Multiple weekly sailings available.',
  'dubai': 'Estimated shipping costs from Mumbai (JNPT) to Dubai (Jebel Ali):\n• FCL 20ft: $750–950 USD\n• FCL 40ft: $1,200–1,500 USD\n• LCL per CBM: $45–60 USD\nTransit time: 4–6 days.',
  'shipping': 'We offer both FCL (Full Container Load) and LCL (Less than Container Load) shipping from all major Indian ports including JNPT Mumbai, Mundra, Chennai, and Kolkata. Transit times vary by destination. Please specify your route for detailed estimates.',
  'documentation': 'Standard documentation for EU exports from India includes:\n• Commercial Invoice\n• Packing List\n• Bill of Lading\n• Certificate of Origin (EUR.1 if applicable)\n• Phytosanitary Certificate (for food/agri)\n• CE Declaration of Conformity (for industrial/medical)\nWe prepare all documents and coordinate with customs authorities.',
  'eu': 'EU imports require CE marking for industrial and medical products, REACH compliance for chemicals, and specific food safety certifications for agricultural products. We handle the complete regulatory and documentation process.',
  'default': "I can help with export regulations, HS codes, shipping estimates, and documentation requirements. For detailed product-specific queries, please submit an inquiry through our contact form and our trade experts will respond within 24 hours."
};

const getAIResponse = (text) => {
  const lower = text.toLowerCase();
  for (const key of Object.keys(aiAnswers)) {
    if (key !== 'default' && lower.includes(key)) {
      return aiAnswers[key];
    }
  }
  return aiAnswers.default;
};

const addChatMessage = (text, isUser) => {
  const chatWindow = document.getElementById('chat-window');
  if (!chatWindow) return;

  const msg = document.createElement('div');
  msg.className = `chat-msg ${isUser ? 'user-msg' : 'ai-msg'}`;
  msg.innerHTML = `
    <div class="msg-label">${isUser ? 'You' : 'ExportHub Assistant'}</div>
    <div class="msg-text">${text.replace(/\n/g, '<br>')}</div>
  `;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
};

const handleChatSend = () => {
  const input = document.getElementById('chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  addChatMessage(text, true);
  input.value = '';

  setTimeout(() => {
    addChatMessage(getAIResponse(text), false);
  }, 600);
};

const initAssistantChat = () => {
  const suggestionsContainer = document.getElementById('assistant-suggestions');
  const sendBtn = document.getElementById('chat-send');
  const input = document.getElementById('chat-input');

  if (suggestionsContainer) {
    suggestionsContainer.innerHTML = aiSuggestions.map(s =>
      `<button class="suggestion-chip">${s}</button>`
    ).join('');

    suggestionsContainer.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        addChatMessage(chip.textContent, true);
        setTimeout(() => {
          addChatMessage(getAIResponse(chip.textContent), false);
        }, 600);
      });
    });
  }

  if (sendBtn) sendBtn.addEventListener('click', handleChatSend);
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleChatSend();
    });
  }
};

/* =============================================================
   10. ANIMATED STAT COUNTERS
   ============================================================= */
const initStatCounters = () => {
  const items = document.querySelectorAll('.stat-item');
  if (!items.length) return;

  items.forEach(item => {
    const numEl = item.querySelector('.stat-number');
    const target = parseInt(item.dataset.target, 10);
    const suffix = item.dataset.suffix || '';
    if (!numEl || isNaN(target)) return;

    if (prefersReducedMotion) {
      numEl.textContent = target.toLocaleString() + suffix;
      return;
    }

    const counter = { val: 0 };
    ScrollTrigger.create({
      trigger: item,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(counter, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          snap: { val: 1 },
          onUpdate: () => {
            numEl.textContent = Math.round(counter.val).toLocaleString() + suffix;
          }
        });
      },
      once: true
    });
  });
};

/* =============================================================
   11. TESTIMONIALS SLIDER
   ============================================================= */
const testimonials = [
  { quote: 'ExportHub streamlined our medical supply imports from India. Their documentation handling and quality checks gave us complete confidence in every shipment.', author: 'Alexander Petrov', company: 'MedSupply Group, Moscow', initials: 'AP' },
  { quote: 'The team managed our Basmati rice orders with exceptional attention to quality. Every shipment arrived on time and met our specifications exactly.', author: 'Tariq Al-Mansoor', company: 'Gulf Foods Trading, Dubai', initials: 'TM' },
  { quote: 'Professional, responsive, and deeply knowledgeable about EU import regulations. They made our first import from India completely seamless.', author: 'Dieter Weber', company: 'EuroTrade GmbH, Hamburg', initials: 'DW' },
  { quote: 'Finding reliable Indian suppliers was our biggest challenge. ExportHub solved that with their verified manufacturer network and transparent pricing.', author: 'Sarah Chen', company: 'Pacific Imports LLC, Los Angeles', initials: 'SC' }
];

let currentTestimonial = 0;
let autoPlayTimer = null;

const initTestimonials = () => {
  const track = document.getElementById('testimonials-track');
  const dotsContainer = document.getElementById('tctl-dots');
  const prevBtn = document.getElementById('t-prev');
  const nextBtn = document.getElementById('t-next');
  if (!track) return;

  // Render cards
  track.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="t-quote-mark">\u201C</div>
      <p class="t-quote">${t.quote}</p>
      <div class="t-author">
        <div class="t-avatar">${t.initials}</div>
        <div>
          <div class="t-name">${t.author}</div>
          <div class="t-company">${t.company}</div>
        </div>
      </div>
    </div>
  `).join('');

  // Render dots
  if (dotsContainer) {
    dotsContainer.innerHTML = testimonials.map((_, i) =>
      `<button class="tctl-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Go to testimonial ${i + 1}"></button>`
    ).join('');

    dotsContainer.querySelectorAll('.tctl-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        goToTestimonial(parseInt(dot.dataset.index, 10));
        resetAutoPlay();
      });
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { prevTestimonial(); resetAutoPlay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { nextTestimonial(); resetAutoPlay(); });

  startAutoPlay();
};

const getCardWidth = () => {
  const card = document.querySelector('.testimonial-card');
  if (!card) return 400;
  const gap = 24; // var(--space-lg) = 1.5rem ≈ 24px
  return card.offsetWidth + gap;
};

const goToTestimonial = (index) => {
  const track = document.getElementById('testimonials-track');
  if (!track) return;
  currentTestimonial = Math.max(0, Math.min(index, testimonials.length - 1));
  track.style.transform = `translateX(-${currentTestimonial * getCardWidth()}px)`;
  updateDots();
};

const nextTestimonial = () => goToTestimonial(currentTestimonial + 1 >= testimonials.length ? 0 : currentTestimonial + 1);
const prevTestimonial = () => goToTestimonial(currentTestimonial - 1 < 0 ? testimonials.length - 1 : currentTestimonial - 1);

const updateDots = () => {
  document.querySelectorAll('.tctl-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentTestimonial);
  });
};

const startAutoPlay = () => {
  autoPlayTimer = setInterval(nextTestimonial, 5000);
};

const resetAutoPlay = () => {
  clearInterval(autoPlayTimer);
  startAutoPlay();
};

/* =============================================================
   12. CONTACT FORM VALIDATION
   ============================================================= */
const initContactForm = () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  // Remove error on focus
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('focus', () => {
      const parent = field.closest('.form-field');
      if (parent) {
        parent.classList.remove('error');
        const errMsg = parent.querySelector('.error-msg');
        if (errMsg) errMsg.remove();
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const setError = (id, message) => {
      const field = document.getElementById(id);
      if (!field) return;
      const parent = field.closest('.form-field');
      if (!parent) return;
      parent.classList.add('error');
      const existing = parent.querySelector('.error-msg');
      if (existing) existing.remove();
      const errEl = document.createElement('span');
      errEl.className = 'error-msg';
      errEl.textContent = message;
      parent.appendChild(errEl);
      isValid = false;
    };

    const name = document.getElementById('f-name');
    const email = document.getElementById('f-email');
    const company = document.getElementById('f-company');
    const country = document.getElementById('f-country');

    if (!name?.value.trim()) setError('f-name', 'Please enter your name');
    if (!email?.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) setError('f-email', 'Please enter a valid email');
    if (!company?.value.trim()) setError('f-company', 'Please enter your company name');
    if (!country?.value) setError('f-country', 'Please select your country');

    if (isValid) {
      showToast('Your inquiry has been sent. We will respond within 24 business hours.');
      form.reset();
    }
  });
};

/* =============================================================
   13. TOAST
   ============================================================= */
const showToast = (msg, duration = 3000) => {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
};

/* =============================================================
   14. INITIALIZATION
   ============================================================= */
document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initNavScroll();
  initMobileMenu();
  renderCategories();
  renderTradeMap();
  initCountryPanel();
  renderProcessSteps();
  renderProducts();
  initAssistantChat();
  initStatCounters();
  initTestimonials();
  initContactForm();

  // Init scroll reveal after dynamic content is rendered
  requestAnimationFrame(() => {
    initScrollReveal();
  });
});
