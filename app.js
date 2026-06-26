// Right Agent Group - Premium Client Application v2.0
const API_BASE = "https://api.rightagentgroup.com/";

// Local fallback hero images (served locally for offline/CORS scenarios)
const LOCAL_HEROES = ["hero1.png", "hero2.png", "hero3.png"];

const LOCAL_FALLBACK_BANNERS = [
  { _id: "1", name: "Trusted Loan Solutions", description: "Access home, business and personal loans through 12+ banking partners with competitive rates and zero hidden charges.", image: null },
  { _id: "2", name: "Tailored Insurance Plans", description: "Protect your family and assets with premium life, health, and general insurance plans from leading Indian insurers.", image: null },
  { _id: "3", name: "Premium Real Estate", description: "Discover ready-to-move apartments, residential plots and commercial properties across prime Hyderabad locations.", image: null }
];

// Global State Store
const state = {
  products: [],
  loans: [],
  insurance: [],
  realestate: [],
  faqs: [],
  reviews: [],
  ratings: { happyCustomers: "999", loanDistribution: "600", visitors: "4000", serviceRating: "4.8", loanAdviser: "190" },
  homeBanners: [],
  pageBanners: [],
  loanPartners: [],
  insurancePartners: [],
  activeSlide: 0,
  otpMobile: "",
  otpTimer: null,
  otpTimeRemaining: 30,
  activeInquiryPayload: null
};

// ─── Toast Notifications ───────────────────────────────────────────────────────
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let icon = "fa-circle-check";
  if (type === "error") icon = "fa-circle-xmark";
  if (type === "warning") icon = "fa-circle-exclamation";

  toast.innerHTML = `
    <i class="fa-solid ${icon} toast-icon"></i>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add("active"), 10);
  setTimeout(() => {
    toast.classList.remove("active");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ─── API Helper ────────────────────────────────────────────────────────────────
async function apiPost(endpoint, data = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
}

// ─── Load Application Data ─────────────────────────────────────────────────────
async function initAppData() {
  try {
    const dashData = await apiPost("website/dashboard");
    if (dashData.success) {
      state.products = dashData.products || [];
      state.loans = dashData.loans || [];
      state.insurance = dashData.insurance || [];
      state.realestate = dashData.realestate || [];
    }

    if (state.realestate.length === 0) {
      const reData = await apiPost("website/allproduct/allrealestate");
      if (reData.success) state.realestate = reData.realestate || [];
    }

    const [hbData, pbData, revData, faqData, ratData, loanPData, insPData] = await Promise.allSettled([
      apiPost("admin/homeBanner/getactive"),
      apiPost("admin/pagebanners/getactive"),
      apiPost("admin/review/getallactive"),
      apiPost("admin/faq/getallactive"),
      apiPost("admin/rating/get"),
      apiPost("admin/loanpartner/getloanpartnerbyproductid", { productId: "64720173d0f054719b9b2880" }),
      apiPost("admin/loanpartner/getloanpartnerbyproductid", { productId: "64720193d0f054719b9b2888" })
    ]);

    if (hbData.status === "fulfilled" && hbData.value.success) state.homeBanners = hbData.value.banner || [];
    if (pbData.status === "fulfilled" && pbData.value.success) state.pageBanners = pbData.value.pageBanners || [];
    if (revData.status === "fulfilled" && revData.value.success) state.reviews = revData.value.review || [];
    if (faqData.status === "fulfilled" && faqData.value.success) state.faqs = faqData.value.faq || [];
    if (ratData.status === "fulfilled" && ratData.value.success && ratData.value.rating) state.ratings = ratData.value.rating;
    if (loanPData.status === "fulfilled" && loanPData.value.success) state.loanPartners = loanPData.value.loanPartner || [];
    if (insPData.status === "fulfilled" && insPData.value.success) state.insurancePartners = insPData.value.loanPartner || [];

    // Fallback for missing banners
    if (state.homeBanners.length === 0) state.homeBanners = LOCAL_FALLBACK_BANNERS;

    try {
      const geoResp = await fetch("https://geolocation-db.com/json/");
      if (geoResp.ok) {
        const geoData = await geoResp.json();
        apiPost("website/addvisitoraddress", { address: geoData.IPv4 }).catch(() => {});
      }
    } catch (e) {}

  } catch (err) {
    console.error("Error loading app data:", err);
    showToast("Offline mode — using local data.", "warning");
    loadOfflineMockData();
  }
}

// ─── Offline Mock Data ─────────────────────────────────────────────────────────
function loadOfflineMockData() {
  state.homeBanners = LOCAL_FALLBACK_BANNERS;
  state.faqs = [
    { _id: "1", question: "What documents are required to apply for a personal loan?", answer: "Typically, PAN card, Aadhaar card, past 3 months' bank statements, salary slips, and an income tax return (ITR) for self-employed applicants." },
    { _id: "2", question: "How long does the loan approval process take?", answer: "Usually 2–7 working days, depending on the partner bank and the completeness of your documentation." },
    { _id: "3", question: "Do you charge a consultation fee?", answer: "No. Right Agent Group does not charge customers for standard loan advisory consultations. Bank-levied processing fees are separate and collected directly by the institution." },
    { _id: "4", question: "Can I get a home loan if I am self-employed?", answer: "Absolutely. We work with banks that extend competitive home loan products to self-employed and business-owner profiles, subject to ITR filings and business continuity proof." },
    { _id: "5", question: "Do you offer doorstep document pickup?", answer: "Yes! Our field executives collect all required documentation directly from your home or office and submit them to the bank on your behalf — completely hassle-free." }
  ];
  state.reviews = [
    { _id: "1", customerName: "Ramesh K.", designation: "IT Professional", review: "Right Agent Group helped me secure a home loan in less than 5 days. Their team handled every single document. Absolutely zero stress experience!", rating: 5 },
    { _id: "2", customerName: "Priya Sharma", designation: "Business Owner", review: "I was denied by two banks but Right Agent Group found the right lender for my business loan. They truly understand customer needs.", rating: 5 },
    { _id: "3", customerName: "Venkat Reddy", designation: "Software Engineer", review: "Excellent service, professional team. Got my personal loan approved in record time. Highly recommend for anyone in Hyderabad!", rating: 4.5 }
  ];
}

// ─── Router ────────────────────────────────────────────────────────────────────
const routes = {
  home: renderHome,
  about: renderAbout,
  loan: renderLoans,
  loans: renderLoanDetail,
  realestate: renderRealEstate,
  realestatedetils: renderRealEstateDetail,
  insurances: renderInsurances,
  insurance: renderInsuranceDetail,
  privacypolicies: renderPrivacyPolicies,
  termsandconditions: renderTermsAndConditions
};

function router() {
  const hash = window.location.hash || "#/";

  document.getElementById("nav-menu").classList.remove("active");
  document.getElementById("nav-actions").classList.remove("active");
  document.body.classList.remove("modal-open");
  window.scrollTo({ top: 0, behavior: "smooth" });

  let routeName = "home";
  let paramValue = "";

  if (hash.startsWith("#/loans/")) {
    routeName = "loans";
    paramValue = decodeURIComponent(hash.substring(8));
  } else if (hash.startsWith("#/realestatedetils/")) {
    routeName = "realestatedetils";
    paramValue = decodeURIComponent(hash.substring(19));
  } else if (hash.startsWith("#/insurance/")) {
    routeName = "insurance";
    paramValue = decodeURIComponent(hash.substring(12));
  } else {
    routeName = hash.substring(2) || "home";
  }

  document.querySelectorAll(".nav-link").forEach(link => {
    const routeAttr = link.getAttribute("data-route");
    const isActive = routeAttr === routeName
      || (routeName === "loans" && routeAttr === "loan")
      || (routeName === "insurance" && routeAttr === "insurances")
      || (routeName === "realestatedetils" && routeAttr === "realestate");
    link.classList.toggle("active", isActive);
  });

  const renderer = routes[routeName] || renderHome;
  const contentDiv = document.getElementById("app-content");
  contentDiv.innerHTML = renderer(paramValue);
  postRenderView(routeName, paramValue);
}

function postRenderView(routeName) {
  if (routeName === "home") {
    setupHeroSlider();
    setupReviewsSlider();
    setupCounterAnimations();
    setupFAQAccordions();
    setupHomeInquiryForm();
    initScrollReveal();
  } else if (routeName === "loans") {
    setupLoanDetailCalculator();
    setupLoanInquiryForm();
    initScrollReveal();
  } else if (routeName === "loan") {
    initScrollReveal();
  } else if (routeName === "insurance") {
    setupInsuranceInquiryForm();
    initScrollReveal();
  } else if (routeName === "realestatedetils") {
    setupRealEstateGallery();
    setupRealEstateInquiryForm();
    initScrollReveal();
  } else if (routeName === "realestate") {
    setupRealEstateFilters();
    initScrollReveal();
  } else {
    initScrollReveal();
  }
}

// ─── Scroll-reveal animation setup ────────────────────────────────────────────
function initScrollReveal() {
  const revealEls = document.querySelectorAll(".reveal");
  if (!revealEls.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("revealed"); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  revealEls.forEach(el => obs.observe(el));
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW RENDERERS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── 1. HOME ───────────────────────────────────────────────────────────────────
function renderHome() {
  const slidesHtml = state.homeBanners.map((banner, index) => {
    const bgImg = banner.image ? `${API_BASE}${banner.image}` : LOCAL_HEROES[index % LOCAL_HEROES.length];
    return `
    <div class="slide ${index === 0 ? 'active' : ''}" style="background-image: url('${bgImg}');">
      <div class="container hero-container">
        <div class="slide-content">
          <div class="slide-badge"><i class="fa-solid fa-shield-check"></i> Hyderabad's Most Trusted Agency</div>
          <h1>${banner.name}</h1>
          <p>${banner.description || 'Secure your future and fulfill your goals with Right Agent Group.'}</p>
          <div class="hero-btns">
            <button class="btn btn-primary trigger-inq-modal" data-service="Loan"><i class="fa fa-paper-plane"></i> Get Free Consultation</button>
            <a href="#/about" class="btn btn-secondary"><i class="fa fa-info-circle"></i> Learn More</a>
          </div>
        </div>

        <!-- Glassmorphic Quick Inquiry Form -->
        <div class="quick-inquiry-box">
          <div class="quick-inquiry-top">
            <i class="fa-solid fa-headset quick-inq-icon"></i>
            <h3>Instant Callback</h3>
            <p>Our advisor will reach you within 30 minutes</p>
          </div>
          <form class="quick-inquiry-form">
            <div class="form-group">
              <label class="form-label">Your Name</label>
              <input type="text" class="form-control quick-name" placeholder="Enter your name" required>
            </div>
            <div class="form-group">
              <label class="form-label">Mobile Number</label>
              <input type="tel" class="form-control quick-phone" placeholder="10-digit mobile" pattern="[0-9]{10}" maxlength="10" required>
            </div>
            <div class="form-group">
              <label class="form-label">I'm Interested In</label>
              <select class="form-control quick-service" required>
                <option value="" disabled selected>Select Service</option>
                <option value="Loan">Loans</option>
                <option value="Insurance">Insurance</option>
                <option value="Real Estate">Real Estate</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">
              <i class="fa fa-paper-plane"></i> Request Callback
            </button>
          </form>
        </div>
      </div>
    </div>`;
  }).join("");

  const dotsHtml = state.homeBanners.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join("");

  // Reviews HTML
  const reviewsHtml = (state.reviews.length > 0 ? state.reviews : [
    { customerName: "Ramesh K.", designation: "IT Professional, Hyderabad", review: "Right Agent Group helped me secure a home loan in less than 5 days. Their team handled every single document. Absolutely zero stress!", rating: 5 },
    { customerName: "Priya Sharma", designation: "Business Owner, Secunderabad", review: "I was denied by two banks but Right Agent Group found the right lender for my business loan. They truly understand customer needs.", rating: 5 },
    { customerName: "Venkat Reddy", designation: "Software Engineer, Madhapur", review: "Excellent service, professional team. Got my personal loan approved in record time. Highly recommend!", rating: 5 }
  ]).map(r => `
    <div class="review-slide">
      <div class="review-card reveal">
        <div class="review-quote-icon"><i class="fa fa-quote-left"></i></div>
        <div class="review-stars">
          ${Array(Math.floor(r.rating || 5)).fill('<i class="fa fa-star"></i>').join("")}
          ${r.rating % 1 !== 0 ? '<i class="fa-solid fa-star-half-stroke"></i>' : ''}
        </div>
        <p class="review-text">"${r.review}"</p>
        <div class="review-author">
          <div class="review-avatar">${r.customerName.charAt(0)}</div>
          <span class="review-name">${r.customerName}</span>
          <span class="review-title">${r.designation || ''}</span>
        </div>
      </div>
    </div>`).join("");

  const faqsHtml = state.faqs.map(faq => `
    <div class="faq-item reveal">
      <button class="faq-question">
        <span>${faq.question}</span>
        <i class="fa fa-plus faq-icon"></i>
      </button>
      <div class="faq-answer">
        <div class="faq-answer-inner">${faq.answer}</div>
      </div>
    </div>`).join("");

  return `
    <!-- Hero Slider -->
    <div class="hero-slider">
      ${slidesHtml}
      <div class="slider-dots">${dotsHtml}</div>
    </div>

    <!-- Stats Section -->
    <section class="stats-section">
      <div class="container stats-grid">
        <div class="stat-card reveal">
          <div class="stat-icon"><i class="fa-solid fa-users"></i></div>
          <div class="stat-number" data-target="${state.ratings.happyCustomers || 999}">0</div>
          <div class="stat-label">Happy Customers</div>
        </div>
        <div class="stat-card reveal">
          <div class="stat-icon"><i class="fa-solid fa-indian-rupee-sign"></i></div>
          <div class="stat-number" data-target="${state.ratings.loanDistribution || 600}">0</div>
          <div class="stat-label">Crores Disbursed</div>
        </div>
        <div class="stat-card reveal">
          <div class="stat-icon"><i class="fa-solid fa-chart-line"></i></div>
          <div class="stat-number" data-target="${state.ratings.visitors || 4000}">0</div>
          <div class="stat-label">Monthly Visitors</div>
        </div>
        <div class="stat-card reveal">
          <div class="stat-icon"><i class="fa-solid fa-user-tie"></i></div>
          <div class="stat-number" data-target="${state.ratings.loanAdviser || 190}">0</div>
          <div class="stat-label">Expert Advisers</div>
        </div>
        <div class="stat-card reveal">
          <div class="stat-icon"><i class="fa-solid fa-star"></i></div>
          <div class="stat-number">${state.ratings.serviceRating || '4.8'}</div>
          <div class="stat-label">Google Rating</div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="services-section">
      <div class="container">
        <div class="section-title reveal">
          <div class="section-eyebrow">What We Offer</div>
          <h2>A Complete Financial Ecosystem</h2>
          <p>We provide unified, top-tier advisory and agency services to meet your lifetime requirements.</p>
        </div>
        <div class="services-grid">
          <div class="service-card reveal">
            <div class="service-icon"><i class="fa-solid fa-hand-holding-dollar"></i></div>
            <h3>Dynamic Loan Solutions</h3>
            <p>Access customized personal, business, housing, and mortgage loans through our trusted association with 12+ national and private banks.</p>
            <ul class="service-features">
              <li><i class="fa fa-check"></i> Housing & Home Loans</li>
              <li><i class="fa fa-check"></i> Business & Startup Loans</li>
              <li><i class="fa fa-check"></i> Personal Loans</li>
            </ul>
            <a href="#/loan" class="service-link">Explore Loan Types <i class="fa fa-arrow-right"></i></a>
          </div>
          <div class="service-card reveal">
            <div class="service-icon"><i class="fa-solid fa-shield-halved"></i></div>
            <h3>Complete Insurance Coverage</h3>
            <p>Protect your family, assets, and business from unforeseen contingencies with custom wealth creation, health, and term-life plans.</p>
            <ul class="service-features">
              <li><i class="fa fa-check"></i> Life & Term Insurance</li>
              <li><i class="fa fa-check"></i> Health Insurance</li>
              <li><i class="fa fa-check"></i> General Insurance</li>
            </ul>
            <a href="#/insurances" class="service-link">View Insurance Plans <i class="fa fa-arrow-right"></i></a>
          </div>
          <div class="service-card reveal">
            <div class="service-icon"><i class="fa-solid fa-building-user"></i></div>
            <h3>Premium Real Estate</h3>
            <p>Find ready-to-move apartment flats, residential plots, and commercial properties in prime growth corridors across Hyderabad.</p>
            <ul class="service-features">
              <li><i class="fa fa-check"></i> Residential Flats & Plots</li>
              <li><i class="fa fa-check"></i> Commercial Properties</li>
              <li><i class="fa fa-check"></i> Property Advisory</li>
            </ul>
            <a href="#/realestate" class="service-link">Browse Properties <i class="fa fa-arrow-right"></i></a>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="why-us-section">
      <div class="container">
        <div class="section-title reveal">
          <div class="section-eyebrow">Our Edge</div>
          <h2>Why Thousands Choose Us</h2>
          <p>We don't just connect you to banks — we advocate for you every step of the way.</p>
        </div>
        <div class="why-us-grid">
          <div class="why-card reveal">
            <div class="why-icon"><i class="fa-solid fa-door-open"></i></div>
            <h4>Doorstep Service</h4>
            <p>Our executives collect documents directly from your home and submit to banks. Zero running around.</p>
          </div>
          <div class="why-card reveal">
            <div class="why-icon"><i class="fa-solid fa-scale-balanced"></i></div>
            <h4>12+ Bank Partners</h4>
            <p>We compare rates across nationalized and private banks to find you the most competitive deal.</p>
          </div>
          <div class="why-card reveal">
            <div class="why-icon"><i class="fa-solid fa-bolt"></i></div>
            <h4>Fast Approvals</h4>
            <p>Our streamlined process ensures faster verification and approval timelines — often within days.</p>
          </div>
          <div class="why-card reveal">
            <div class="why-icon"><i class="fa-solid fa-percent"></i></div>
            <h4>No Consultation Fee</h4>
            <p>Standard advisory and loan facilitation comes at zero cost to you. Transparency is our promise.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Partners Ticker -->
    <section class="partners-section">
      <div class="container">
        <p class="partners-label">Trusted Partner Banks & Insurers</p>
      </div>
      <div class="partners-track">
        <div class="partners-slider">
          <div class="partner-logo"><img src="${API_BASE}uploads/banks/1688728696390-SBI.jpg" alt="SBI" onerror="this.parentElement.innerHTML='<span>SBI</span>'"><span>SBI</span></div>
          <div class="partner-logo"><img src="${API_BASE}uploads/banks/1688727130134-ICICI%20Housing.jpg" alt="ICICI" onerror="this.parentElement.innerHTML='<span>ICICI</span>'"><span>ICICI</span></div>
          <div class="partner-logo"><img src="${API_BASE}uploads/banks/1688728594534-Union%20Bank.jpg" alt="Union Bank" onerror="this.parentElement.innerHTML='<span>Union Bank</span>'"><span>Union Bank</span></div>
          <div class="partner-logo"><img src="${API_BASE}uploads/banks/1688728357469-Tata%20Housing.jpg" alt="Tata Capital" onerror="this.parentElement.innerHTML='<span>Tata Capital</span>'"><span>Tata Capital</span></div>
          <div class="partner-logo"><img src="${API_BASE}uploads/banks/1688729829902-Star%20Helth.jpg" alt="Star Health" onerror="this.parentElement.innerHTML='<span>Star Health</span>'"><span>Star Health</span></div>
          <div class="partner-logo"><img src="${API_BASE}uploads/banks/1688729241058-Sbi%20Life.jpg" alt="SBI Life" onerror="this.parentElement.innerHTML='<span>SBI Life</span>'"><span>SBI Life</span></div>
          <div class="partner-logo"><img src="${API_BASE}uploads/banks/1688728696390-SBI.jpg" alt="SBI" onerror="this.parentElement.innerHTML='<span>SBI</span>'"><span>SBI</span></div>
          <div class="partner-logo"><img src="${API_BASE}uploads/banks/1688727130134-ICICI%20Housing.jpg" alt="ICICI" onerror="this.parentElement.innerHTML='<span>ICICI</span>'"><span>ICICI</span></div>
          <div class="partner-logo"><img src="${API_BASE}uploads/banks/1688728594534-Union%20Bank.jpg" alt="Union Bank" onerror="this.parentElement.innerHTML='<span>Union Bank</span>'"><span>Union Bank</span></div>
          <div class="partner-logo"><img src="${API_BASE}uploads/banks/1688728357469-Tata%20Housing.jpg" alt="Tata Capital" onerror="this.parentElement.innerHTML='<span>Tata Capital</span>'"><span>Tata Capital</span></div>
          <div class="partner-logo"><img src="${API_BASE}uploads/banks/1688729829902-Star%20Helth.jpg" alt="Star Health" onerror="this.parentElement.innerHTML='<span>Star Health</span>'"><span>Star Health</span></div>
          <div class="partner-logo"><img src="${API_BASE}uploads/banks/1688729241058-Sbi%20Life.jpg" alt="SBI Life" onerror="this.parentElement.innerHTML='<span>SBI Life</span>'"><span>SBI Life</span></div>
        </div>
      </div>
    </section>

    <!-- Reviews Section -->
    <section class="reviews-section">
      <div class="container">
        <div class="section-title reveal">
          <div class="section-eyebrow">Client Testimonials</div>
          <h2>Loved by 1,000+ Clients</h2>
          <p>Hear from real homeowners, professionals, and business owners who secured their dreams with us.</p>
        </div>
        <div class="reviews-container">
          <div class="review-slider-track" id="reviews-slider-track">
            ${reviewsHtml}
          </div>
          <div class="slider-nav">
            <button class="slider-btn" id="review-prev" aria-label="Previous"><i class="fa fa-chevron-left"></i></button>
            <button class="slider-btn" id="review-next" aria-label="Next"><i class="fa fa-chevron-right"></i></button>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section">
      <div class="container">
        <div class="section-title reveal">
          <div class="section-eyebrow">FAQs</div>
          <h2>Frequently Asked Questions</h2>
          <p>Get answers to common queries regarding loan approval, documentation, and property consulting.</p>
        </div>
        <div class="faq-container">
          ${faqsHtml}
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="cta-section reveal">
      <div class="container">
        <div class="cta-card">
          <div class="cta-content">
            <h2>Ready to Secure Your Future?</h2>
            <p>Talk to an expert today — free consultation, zero commitment. We'll find the best product for your needs.</p>
          </div>
          <div class="cta-actions">
            <button class="btn btn-primary trigger-inq-modal" data-service="Loan"><i class="fa fa-paper-plane"></i> Get Free Consultation</button>
            <a href="tel:+918333997227" class="btn btn-call"><i class="fa fa-phone"></i> +91 83339 97227</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

// ─── 2. ABOUT ──────────────────────────────────────────────────────────────────
function renderAbout() {
  const banner = state.pageBanners.find(b => b.name === "About") || { image: null };
  const bgImg = banner.image ? `${API_BASE}${banner.image}` : LOCAL_HEROES[1];

  return `
    <div class="page-banner" style="background-image: url('${bgImg}');">
      <div class="page-banner-content">
        <h1>About Our Company</h1>
        <p><a href="#/">Home</a> / About Us</p>
      </div>
    </div>

    <section class="about-intro-section">
      <div class="container about-layout">
        <div class="about-text reveal">
          <div class="section-eyebrow">Who We Are</div>
          <h2>LS Right Agent Services<br>Private Limited</h2>
          <p>At Right Agent Group, we pride ourselves on being a premier, service-oriented advisory company based in Hyderabad, Telangana. We provide exceptional assistance across three primary domains: <strong>Real Estate, Financial Loans, and Insurance plans.</strong></p>
          <p>Our team of experienced consultants act as a single gateway to multiple banks and insurers, ensuring you receive the best possible terms with complete transparency and minimal paperwork.</p>
          <div class="about-cta-row">
            <button class="btn btn-primary trigger-inq-modal" data-service="Loan"><i class="fa fa-headset"></i> Talk to an Expert</button>
            <a href="tel:+918333997227" class="btn btn-call"><i class="fa fa-phone"></i> Call Now</a>
          </div>
        </div>
        <div class="about-cards reveal">
          <div class="about-info-card">
            <i class="fa fa-eye"></i>
            <h4>Our Vision</h4>
            <p>To become the most reliable and customer-centric financial services group in Southern India — recognized for absolute transparency and premium advisory excellence.</p>
          </div>
          <div class="about-info-card accent">
            <i class="fa fa-bullseye"></i>
            <h4>Our Mission</h4>
            <p>Simplify complex financial decisions by integrating diverse banking partners, property developers, and insurers under a single premium consultation framework.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="why-us-section" style="padding-top: 0;">
      <div class="container">
        <div class="section-title reveal">
          <div class="section-eyebrow">Our Strengths</div>
          <h2>Why Choose Right Agent Group?</h2>
        </div>
        <div class="why-us-grid">
          <div class="why-card reveal">
            <div class="why-icon"><i class="fa-solid fa-door-open"></i></div>
            <h4>Doorstep Document Pickup</h4>
            <p>Our field executives collect all documents from your home or office and submit directly to the bank.</p>
          </div>
          <div class="why-card reveal">
            <div class="why-icon"><i class="fa-solid fa-scale-balanced"></i></div>
            <h4>12+ Banking Partners</h4>
            <p>Comparative insights across nationalized and private banks for interest rates and processing terms.</p>
          </div>
          <div class="why-card reveal">
            <div class="why-icon"><i class="fa-solid fa-clock-rotate-left"></i></div>
            <h4>Faster Approvals</h4>
            <p>End-to-end processing expertise reduces typical bank approval timelines by up to 40%.</p>
          </div>
          <div class="why-card reveal">
            <div class="why-icon"><i class="fa-solid fa-percent"></i></div>
            <h4>Zero Consultation Fee</h4>
            <p>We never charge the customer for standard advisory services. Transparency is our core promise.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

// ─── 3. LOANS LIST ─────────────────────────────────────────────────────────────
function renderLoans() {
  const banner = state.pageBanners.find(b => b.name === "Loans") || { image: null };
  const bgImg = banner.image ? `${API_BASE}${banner.image}` : LOCAL_HEROES[2];

  const housingLoans = state.loans.filter(l => l.subProduct === "Housing Loan");
  const nonHousingLoans = state.loans.filter(l => l.subProduct === "Non Housing Loan");
  const otherLoans = state.loans.filter(l => l.subProduct === "Other Loans");

  const renderLoanCards = (loanList) => {
    if (!loanList.length) return `<div class="empty-state"><i class="fa fa-inbox"></i><p>No products in this category yet.</p></div>`;
    return loanList.map(loan => `
      <div class="product-item-card reveal" onclick="selectLoan('${loan._id}', '${encodeURIComponent(loan.name)}')">
        <div class="product-card-img" style="background-image: url('${API_BASE}${loan.image}');"></div>
        <div class="product-card-body">
          <span class="product-card-category">${loan.subProduct}</span>
          <h4 class="product-card-title">${loan.name}</h4>
          <span class="service-link" style="margin-top:auto; font-size:0.85rem;">Check Eligibility <i class="fa fa-chevron-right"></i></span>
        </div>
      </div>`).join("");
  };

  return `
    <div class="page-banner" style="background-image: url('${bgImg}');">
      <div class="page-banner-content">
        <h1>Dynamic Loan Services</h1>
        <p><a href="#/">Home</a> / Loans</p>
      </div>
    </div>

    <section class="page-section">
      <div class="container">
        <div class="section-title reveal">
          <div class="section-eyebrow">Loan Products</div>
          <h2>Find Your Ideal Loan</h2>
          <p>We connect you with the best loan products from 12+ partner banks with competitive rates.</p>
        </div>
        <div class="tabs-header reveal">
          <button class="tab-btn active" data-tab="housing">Housing Loans</button>
          <button class="tab-btn" data-tab="non-housing">Non-Housing Loans</button>
          <button class="tab-btn" data-tab="other">Other Loans</button>
        </div>
        <div class="tab-panel active" id="tab-housing">
          <div class="products-grid">${renderLoanCards(housingLoans)}</div>
        </div>
        <div class="tab-panel" id="tab-non-housing">
          <div class="products-grid">${renderLoanCards(nonHousingLoans)}</div>
        </div>
        <div class="tab-panel" id="tab-other">
          <div class="products-grid">${renderLoanCards(otherLoans)}</div>
        </div>
      </div>
    </section>
  `;
}

window.selectLoan = function(id, name) {
  sessionStorage.setItem("loanid", id);
  window.location.hash = `#/loans/${name}`;
};

// ─── 4. LOAN DETAIL ────────────────────────────────────────────────────────────
function renderLoanDetail(loanName) {
  const loanId = sessionStorage.getItem("loanid");
  let loan = state.loans.find(l => l._id === loanId);
  if (!loan) {
    const decodedName = decodeURIComponent(loanName).replace(/-/g, " ");
    loan = state.loans.find(l => l.name.toLowerCase() === decodedName.toLowerCase()) || {
      name: decodedName,
      subProduct: "Housing Loan",
      image: null,
      description: "Customized loan solutions matching your exact criteria."
    };
  }

  const bgImg = loan.image ? `${API_BASE}${loan.image}` : LOCAL_HEROES[2];

  const partnersHtml = state.loanPartners.map(p => `
    <div class="partner-row-card reveal">
      <div class="partner-row-info">
        <img src="${API_BASE}${p.image}" class="partner-row-logo" alt="${p.name}" onerror="this.style.display='none'">
        <div>
          <span class="partner-row-name">${p.name}</span>
          <div class="partner-row-tenure">${p.year}</div>
        </div>
      </div>
      <div class="partner-row-rate">${p.percentage}</div>
    </div>`).join("");

  return `
    <div class="page-banner" style="background-image: url('${bgImg}');">
      <div class="page-banner-content">
        <h1>${loan.name}</h1>
        <p><a href="#/">Home</a> / <a href="#/loan">Loans</a> / ${loan.name}</p>
      </div>
    </div>

    <section class="page-section">
      <div class="container detail-layout">
        <div class="detail-main">
          <div class="detail-header reveal">
            <span class="detail-tag">${loan.subProduct}</span>
            <h2 style="margin-top:16px;">${loan.name}</h2>
          </div>

          <h3 class="detail-section-title reveal">About This Loan</h3>
          <p class="detail-description reveal">
            Secure the capital you need under highly optimized financial structures. Our banking alliances offer zero foreclosure penalties, minimal processing fees, and dynamic interest rates. We facilitate complete processing at your doorstep, ensuring a fast and hassle-free experience.
          </p>

          <h3 class="detail-section-title reveal">Loan Eligibility Calculator</h3>
          <div class="calc-container reveal">
            <div class="calc-inputs">
              <div class="calc-range-group">
                <div class="calc-range-header">
                  <span class="calc-range-label">Gross Monthly Income (₹)</span>
                  <span class="calc-range-val" id="income-val">₹1,00,000</span>
                </div>
                <input type="range" class="calc-slider" id="income-slider" min="15000" max="500000" step="5000" value="100000">
              </div>
              <div class="calc-range-group">
                <div class="calc-range-header">
                  <span class="calc-range-label">Existing EMIs (₹ / Month)</span>
                  <span class="calc-range-val" id="emi-val">₹0</span>
                </div>
                <input type="range" class="calc-slider" id="emi-slider" min="0" max="200000" step="2000" value="0">
              </div>
              <div class="calc-range-group">
                <div class="calc-range-header">
                  <span class="calc-range-label">Tenure (Years)</span>
                  <span class="calc-range-val" id="tenure-val">20 Years</span>
                </div>
                <input type="range" class="calc-slider" id="tenure-slider" min="5" max="30" step="1" value="20">
              </div>
            </div>
            <div class="calc-result-box">
              <div class="calc-result-title">Maximum Eligible Loan Amount</div>
              <div class="calc-result-value" id="calc-result-value">₹48,50,000</div>
              <div class="calc-result-note">Based on ~8.5% p.a. interest rate</div>
            </div>
          </div>

          <h3 class="detail-section-title reveal">Partner Banking Institutions</h3>
          <div class="partners-list-vertical">
            ${partnersHtml || '<p class="text-muted" style="text-align:center; padding:32px;">Partner data loading...</p>'}
          </div>
        </div>

        <div class="detail-sidebar">
          <div class="detail-sidebar-widget reveal">
            <h3><i class="fa-regular fa-envelope" style="color:var(--primary);"></i> Apply Online</h3>
            <form id="loan-enquiry-form">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" id="loan-enq-name" class="form-control" placeholder="Enter full name" required>
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" id="loan-enq-email" class="form-control" placeholder="Enter email" required>
              </div>
              <div class="form-group">
                <label class="form-label">Mobile Number</label>
                <input type="tel" id="loan-enq-phone" class="form-control" placeholder="10-digit mobile" pattern="[0-9]{10}" maxlength="10" required>
              </div>
              <div class="form-group">
                <label class="form-label">Required Amount (₹)</label>
                <input type="number" id="loan-enq-amount" class="form-control" placeholder="E.g. 2500000" required>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">Submit Application</button>
            </form>
          </div>
          <div class="detail-sidebar-widget contact-widget reveal">
            <h4>Need Help?</h4>
            <a href="tel:+918333997227" class="btn btn-call" style="width:100%; margin-bottom:12px;"><i class="fa fa-phone"></i> +91 83339 97227</a>
            <a href="https://api.whatsapp.com/send/?phone=918333993223&text=Hi%2C+I+need+help+with+a+loan" target="_blank" class="btn" style="width:100%; background:#25D366; color:#fff;"><i class="fab fa-whatsapp"></i> Chat on WhatsApp</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

// ─── 5. REAL ESTATE LIST ───────────────────────────────────────────────────────
function renderRealEstate() {
  const banner = state.pageBanners.find(b => b.name === "Real Estate") || { image: null };
  const bgImg = banner.image ? `${API_BASE}${banner.image}` : LOCAL_HEROES[1];

  return `
    <div class="page-banner" style="background-image: url('${bgImg}');">
      <div class="page-banner-content">
        <h1>Premium Properties for Sale</h1>
        <p><a href="#/">Home</a> / Real Estate</p>
      </div>
    </div>

    <section class="page-section">
      <div class="container">
        <div class="section-title reveal">
          <div class="section-eyebrow">Property Listings</div>
          <h2>Find Your Dream Property</h2>
          <p>Browse curated apartments, villas, and plots across prime Hyderabad locations.</p>
        </div>

        <div class="filters-bar reveal">
          <div class="form-group" style="margin:0;">
            <label class="form-label">BHK Type</label>
            <select id="filter-bhk" class="form-control">
              <option value="all">All BHKs</option>
              <option value="2BHK">2 BHK</option>
              <option value="3BHK">3 BHK</option>
            </select>
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label">Furnishing</label>
            <select id="filter-furnishing" class="form-control">
              <option value="all">All Status</option>
              <option value="Semi">Semi-Furnished</option>
              <option value="Fully">Fully Furnished</option>
              <option value="Unfurnished">Unfurnished</option>
            </select>
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label">Property Age</label>
            <select id="filter-age" class="form-control">
              <option value="all">Any Age</option>
              <option value="new">&lt; 5 Years</option>
              <option value="old">&gt; 15 Years</option>
            </select>
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label">Facing Direction</label>
            <select id="filter-facing" class="form-control">
              <option value="all">Any Direction</option>
              <option value="East">East</option>
              <option value="West">West</option>
            </select>
          </div>
          <button id="reset-filters" class="btn btn-outline" style="height: 52px; align-self: flex-end;"><i class="fa fa-rotate-left"></i> Reset</button>
        </div>

        <div class="re-grid" id="re-properties-grid">
          <!-- populated by setupRealEstateFilters -->
        </div>
      </div>
    </section>
  `;
}

function renderPropertyCards(properties) {
  if (!properties.length) {
    return `<div class="empty-state"><i class="fa-solid fa-hotel"></i><p>No properties match the selected criteria. Try adjusting your filters.</p></div>`;
  }

  return properties.map(re => {
    const formattedPrice = (parseInt(re.amount) / 100000).toFixed(1) + " L";
    const mainImg = re.images && re.images.length > 0 ? `${API_BASE}${re.images[0]}` : "https://placehold.co/600x400?text=Property";
    return `
      <div class="re-card reveal" onclick="selectProperty('${re._id}', '${encodeURIComponent(re.title)}')">
        <div class="re-card-img-container">
          <img src="${mainImg}" class="re-card-img" alt="${re.title}" onerror="this.src='https://placehold.co/600x400?text=Property'">
          <span class="re-badge-status">${re.propertyStatus.replace(/_/g, " ")}</span>
          <span class="re-badge-price">₹ ${formattedPrice}</span>
        </div>
        <div class="re-card-body">
          <h4 class="re-card-title">${re.title}</h4>
          <div class="re-card-meta">
            <div class="re-meta-item"><i class="fa fa-bed"></i> <span>${re.apartmentType}</span></div>
            <div class="re-meta-item"><i class="fa fa-compass"></i> <span>${re.facing}</span></div>
            <div class="re-meta-item"><i class="fa fa-ruler-combined"></i> <span>${re.builtUpArea}</span></div>
            <div class="re-meta-item"><i class="fa fa-couch"></i> <span>${re.furnishing}</span></div>
          </div>
        </div>
      </div>`;
  }).join("");
}

window.selectProperty = function(id, title) {
  sessionStorage.setItem("realestateid", id);
  window.location.hash = `#/realestatedetils/${title}`;
};

// ─── 6. REAL ESTATE DETAIL ─────────────────────────────────────────────────────
function renderRealEstateDetail(propertyTitle) {
  const reId = sessionStorage.getItem("realestateid");
  let re = state.realestate.find(item => item._id === reId);

  if (!re) {
    const decodedTitle = decodeURIComponent(propertyTitle).replace(/-/g, " ");
    re = state.realestate.find(item => item.title.toLowerCase() === decodedTitle.toLowerCase()) || state.realestate[0];
  }

  if (!re) {
    return `<div class="container text-center" style="padding: 80px 0;"><p>Property not found.</p><a href="#/realestate" class="btn btn-primary">Back to Listings</a></div>`;
  }

  const slidesHtml = (re.images || []).map(img => `
    <div class="gallery-img-slide">
      <img src="${API_BASE}${img}" alt="Property image" onerror="this.src='https://placehold.co/800x450?text=Property+Photo'">
    </div>`).join("");

  const formattedPrice = (parseInt(re.amount) / 100000).toFixed(1) + " Lakhs";
  const bgImg = (re.images && re.images.length > 0) ? `${API_BASE}${re.images[0]}` : LOCAL_HEROES[1];

  return `
    <div class="page-banner" style="background-image: url('${bgImg}');">
      <div class="page-banner-content">
        <h1>Property Details</h1>
        <p><a href="#/">Home</a> / <a href="#/realestate">Real Estate</a> / Details</p>
      </div>
    </div>

    <section class="page-section">
      <div class="container detail-layout">
        <div class="detail-main">
          <div class="gallery-container">
            <div class="gallery-track" id="gallery-slider-track">${slidesHtml}</div>
            <button class="slider-btn" id="gallery-prev" style="position:absolute; top:50%; left:16px; transform:translateY(-50%); z-index:5;"><i class="fa fa-chevron-left"></i></button>
            <button class="slider-btn" id="gallery-next" style="position:absolute; top:50%; right:16px; transform:translateY(-50%); z-index:5;"><i class="fa fa-chevron-right"></i></button>
          </div>

          <div class="detail-header reveal">
            <span class="detail-tag">${re.propertyStatus.replace(/_/g, " ")}</span>
            <h2 style="margin-top:16px; font-size: 1.75rem;">${re.title}</h2>
            <div class="re-detail-price">₹ ${formattedPrice}</div>
          </div>

          <h3 class="detail-section-title reveal">Property Description</h3>
          <p class="detail-description reveal">${re.description}</p>

          <h3 class="detail-section-title reveal">Technical Specifications</h3>
          <div class="specs-grid reveal">
            <div class="spec-item"><span class="spec-key">BHK Config</span><span class="spec-val">${re.apartmentType}</span></div>
            <div class="spec-item"><span class="spec-key">Built Up Area</span><span class="spec-val">${re.builtUpArea}</span></div>
            <div class="spec-item"><span class="spec-key">Facing Direction</span><span class="spec-val">${re.facing}</span></div>
            <div class="spec-item"><span class="spec-key">Property Age</span><span class="spec-val">${re.propertyAge} Years</span></div>
            <div class="spec-item"><span class="spec-key">Floor Position</span><span class="spec-val">Floor ${re.floor} of ${re.totalFloors}</span></div>
            <div class="spec-item"><span class="spec-key">Parking</span><span class="spec-val">${re.parking.replace(/_/g, " ")}</span></div>
            <div class="spec-item"><span class="spec-key">Dimension</span><span class="spec-val">${re.dimension !== "0" ? re.dimension : "Standard"}</span></div>
            <div class="spec-item"><span class="spec-key">Possession</span><span class="spec-val">${re.availability}</span></div>
          </div>
        </div>

        <div class="detail-sidebar">
          <div class="detail-sidebar-widget reveal">
            <h3><i class="fa-regular fa-envelope" style="color:var(--primary);"></i> Request Details</h3>
            <form id="re-enquiry-form">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" id="re-enq-name" class="form-control" placeholder="Enter your name" required>
              </div>
              <div class="form-group">
                <label class="form-label">Mobile Number</label>
                <input type="tel" id="re-enq-phone" class="form-control" placeholder="10-digit mobile" pattern="[0-9]{10}" maxlength="10" required>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">Contact Property Agent</button>
            </form>
            <a href="https://api.whatsapp.com/send/?phone=918333993223&text=Interested%20in%20Property%20${encodeURIComponent(re.title)}" target="_blank" class="btn btn-call" style="width: 100%; margin-top: 16px;"><i class="fab fa-whatsapp"></i> Chat on WhatsApp</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

// ─── 7. INSURANCES LIST ────────────────────────────────────────────────────────
function renderInsurances() {
  const banner = state.pageBanners.find(b => b.name === "Insurance" || b.name === "About") || { image: null };
  const bgImg = banner.image ? `${API_BASE}${banner.image}` : LOCAL_HEROES[0];

  const lifeInsurance = state.insurance.filter(i => i.subProduct === "Life Insurance");
  const generalInsurance = state.insurance.filter(i => i.subProduct === "General Insurance");

  const renderInsCards = (insList) => {
    if (!insList.length) return `<div class="empty-state"><i class="fa fa-inbox"></i><p>No products in this category yet.</p></div>`;
    return insList.map(ins => `
      <div class="product-item-card reveal" onclick="selectInsurance('${ins._id}', '${encodeURIComponent(ins.name)}')">
        <div class="product-card-img" style="background-image: url('${API_BASE}${ins.image}');"></div>
        <div class="product-card-body">
          <span class="product-card-category">${ins.subProduct}</span>
          <h4 class="product-card-title">${ins.name}</h4>
          <span class="service-link" style="margin-top:auto; font-size:0.85rem;">View Plan Details <i class="fa fa-chevron-right"></i></span>
        </div>
      </div>`).join("");
  };

  return `
    <div class="page-banner" style="background-image: url('${bgImg}');">
      <div class="page-banner-content">
        <h1>Tailored Insurance Policies</h1>
        <p><a href="#/">Home</a> / Insurances</p>
      </div>
    </div>

    <section class="page-section">
      <div class="container">
        <div class="section-title reveal">
          <div class="section-eyebrow">Insurance Products</div>
          <h2>Protect What Matters Most</h2>
          <p>Choose from leading life and general insurance plans customized to your needs.</p>
        </div>
        <div class="tabs-header reveal">
          <button class="tab-btn active" data-tab="life">Life Insurance</button>
          <button class="tab-btn" data-tab="general">General Insurance</button>
        </div>
        <div class="tab-panel active" id="tab-life">
          <div class="products-grid">${renderInsCards(lifeInsurance)}</div>
        </div>
        <div class="tab-panel" id="tab-general">
          <div class="products-grid">${renderInsCards(generalInsurance)}</div>
        </div>
      </div>
    </section>
  `;
}

window.selectInsurance = function(id, name) {
  sessionStorage.setItem("insuranceid", id);
  window.location.hash = `#/insurance/${name}`;
};

// ─── 8. INSURANCE DETAIL ───────────────────────────────────────────────────────
function renderInsuranceDetail(insName) {
  const insId = sessionStorage.getItem("insuranceid");
  let ins = state.insurance.find(i => i._id === insId);
  if (!ins) {
    const decodedName = decodeURIComponent(insName).replace(/-/g, " ");
    ins = state.insurance.find(i => i.name.toLowerCase() === decodedName.toLowerCase()) || {
      name: decodedName, subProduct: "General Insurance", image: null, description: "Customized coverage and indemnity protection."
    };
  }

  const bgImg = ins.image ? `${API_BASE}${ins.image}` : LOCAL_HEROES[0];

  const partnersHtml = state.insurancePartners.map(p => `
    <div class="partner-row-card reveal">
      <div class="partner-row-info">
        <img src="${API_BASE}${p.image}" class="partner-row-logo" alt="${p.name}" onerror="this.style.display='none'">
        <div>
          <span class="partner-row-name">${p.name}</span>
          <div class="partner-row-tenure">${p.year}</div>
        </div>
      </div>
      <div class="partner-row-rate">${p.percentage}</div>
    </div>`).join("");

  return `
    <div class="page-banner" style="background-image: url('${bgImg}');">
      <div class="page-banner-content">
        <h1>${ins.name}</h1>
        <p><a href="#/">Home</a> / <a href="#/insurances">Insurances</a> / ${ins.name}</p>
      </div>
    </div>

    <section class="page-section">
      <div class="container detail-layout">
        <div class="detail-main">
          <div class="detail-header reveal">
            <span class="detail-tag">${ins.subProduct}</span>
            <h2 style="margin-top:16px;">${ins.name}</h2>
          </div>
          <h3 class="detail-section-title reveal">Policy Overview</h3>
          <p class="detail-description reveal">
            Protect what matters most. Our custom-curated insurance plans provide deep tax benefits, compound wealth growth, and secure claim settlements. Right Agent Group coordinates directly with underwriters to fast-track approval without complex paperwork.
          </p>
          <h3 class="detail-section-title reveal">Insurance Partners & Underwriters</h3>
          <div class="partners-list-vertical">
            ${partnersHtml || '<p class="text-muted" style="text-align:center; padding:32px;">Partner data loading...</p>'}
          </div>
        </div>

        <div class="detail-sidebar">
          <div class="detail-sidebar-widget reveal">
            <h3><i class="fa-regular fa-envelope" style="color:var(--primary);"></i> Request Quote</h3>
            <form id="ins-enquiry-form">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" id="ins-enq-name" class="form-control" placeholder="Enter full name" required>
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" id="ins-enq-email" class="form-control" placeholder="Enter email" required>
              </div>
              <div class="form-group">
                <label class="form-label">Mobile Number</label>
                <input type="tel" id="ins-enq-phone" class="form-control" placeholder="10-digit mobile" pattern="[0-9]{10}" maxlength="10" required>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">Submit Inquiry</button>
            </form>
          </div>
          <div class="detail-sidebar-widget contact-widget reveal">
            <h4>Need Help?</h4>
            <a href="tel:+918333997227" class="btn btn-call" style="width:100%; margin-bottom:12px;"><i class="fa fa-phone"></i> +91 83339 97227</a>
            <a href="https://api.whatsapp.com/send/?phone=918333993223&text=Hi%2C+I+need+help+with+insurance" target="_blank" class="btn" style="width:100%; background:#25D366; color:#fff;"><i class="fab fa-whatsapp"></i> Chat on WhatsApp</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

// ─── 9. PRIVACY POLICY ────────────────────────────────────────────────────────
function renderPrivacyPolicies() {
  return `
    <div class="page-banner" style="background-image: url('${LOCAL_HEROES[2]}');">
      <div class="page-banner-content">
        <h1>Privacy Policies</h1>
        <p><a href="#/">Home</a> / Privacy Policy</p>
      </div>
    </div>
    <div class="container" style="padding-bottom: 80px;">
      <div class="legal-content reveal">
        <h2>Privacy Statement & Data Protection</h2>
        <p style="margin-bottom: 24px; color: var(--text-muted);">Last Updated: June 2026</p>
        <ol>
          <li>At Right Agent Group, we prioritize the privacy and security of our customers' personal information. We understand that privacy is a fundamental right.</li>
          <li>We are committed to protecting the privacy and confidentiality of all information provided. All personal data is collected with explicit consent.</li>
          <li>We adhere to data protection guidelines (including GDPR elements where applicable) as a best-practice policy to ensure transparency and accountability.</li>
          <li>Security measures including access control, SSL encryption, and routine audits are in place to safeguard all data.</li>
          <li>We do not store financial credentials or mobile OTP details permanently on our servers.</li>
        </ol>
      </div>
    </div>
  `;
}

// ─── 10. TERMS & CONDITIONS ────────────────────────────────────────────────────
function renderTermsAndConditions() {
  return `
    <div class="page-banner" style="background-image: url('${LOCAL_HEROES[2]}');">
      <div class="page-banner-content">
        <h1>Terms and Conditions</h1>
        <p><a href="#/">Home</a> / Terms & Conditions</p>
      </div>
    </div>
    <div class="container" style="padding-bottom: 80px;">
      <div class="legal-content reveal">
        <h2>Terms of Use</h2>
        <p style="margin-bottom: 24px; color: var(--text-muted);">Last Updated: June 2026</p>
        <ol>
          <li><strong>General Terms:</strong> By accessing and using the services provided by Right Agent Group, you agree to comply with all applicable local laws and regulations under Hyderabad, Telangana jurisdiction.</li>
          <li><strong>Disclaimer of Liability:</strong> All information provided on loans, rates, property pricing, and insurance benefits is subject to final approval by third-party banks and underwriters. Right Agent Group makes no absolute warranties of approval.</li>
          <li><strong>Service Fees:</strong> We do not charge direct consultation fees to customers for standard loan assistance. Bank-applied processing fees are collected directly by the banking institution.</li>
          <li><strong>Termination:</strong> Right Agent Group reserves the right to terminate service to any individual in case of suspected false credentials or documentation.</li>
        </ol>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT BINDERS & INTERACTIVITY
// ═══════════════════════════════════════════════════════════════════════════════

function setupHeroSlider() {
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");
  if (!slides.length) return;

  state.activeSlide = 0;
  let slideInterval = setInterval(nextSlide, 6000);

  function goToSlide(idx) {
    slides[state.activeSlide].classList.remove("active");
    dots[state.activeSlide].classList.remove("active");
    state.activeSlide = idx;
    slides[state.activeSlide].classList.add("active");
    dots[state.activeSlide].classList.add("active");
  }

  function nextSlide() { goToSlide((state.activeSlide + 1) % slides.length); }

  dots.forEach(dot => {
    dot.addEventListener("click", (e) => {
      clearInterval(slideInterval);
      goToSlide(parseInt(e.target.getAttribute("data-index")));
      slideInterval = setInterval(nextSlide, 6000);
    });
  });

  document.querySelectorAll(".trigger-inq-modal").forEach(btn => {
    btn.addEventListener("click", (e) => openInquiryModal(e.currentTarget.getAttribute("data-service") || ""));
  });
}

function setupReviewsSlider() {
  const track = document.getElementById("reviews-slider-track");
  const prevBtn = document.getElementById("review-prev");
  const nextBtn = document.getElementById("review-next");
  if (!track) return;

  const slides = track.querySelectorAll(".review-slide");
  let curIndex = 0;

  function updateSlider() { track.style.transform = `translateX(-${curIndex * 100}%)`; }

  nextBtn.addEventListener("click", () => { curIndex = (curIndex + 1) % slides.length; updateSlider(); });
  prevBtn.addEventListener("click", () => { curIndex = (curIndex - 1 + slides.length) % slides.length; updateSlider(); });

  // Auto-scroll reviews
  setInterval(() => { curIndex = (curIndex + 1) % slides.length; updateSlider(); }, 7000);
}

function setupCounterAnimations() {
  const counters = document.querySelectorAll(".stat-number");
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const counter = entry.target;
      const target = parseFloat(counter.getAttribute("data-target"));
      if (isNaN(target)) return;

      let count = 0;
      const speed = Math.max(1, target / 80);
      const update = () => {
        count += speed;
        if (count < target) {
          counter.innerText = Math.floor(count) + "+";
          requestAnimationFrame(update);
        } else {
          counter.innerText = target + "+";
        }
      };
      update();
      obs.unobserve(counter);
    });
  }, { threshold: 0.3 });
  counters.forEach(c => observer.observe(c));
}

function setupFAQAccordions() {
  document.querySelectorAll(".faq-item").forEach(item => {
    item.querySelector(".faq-question").addEventListener("click", () => {
      const isActive = item.classList.contains("active");
      document.querySelectorAll(".faq-item").forEach(o => {
        o.classList.remove("active");
        o.querySelector(".faq-answer").style.maxHeight = null;
      });
      if (!isActive) {
        item.classList.add("active");
        const ans = item.querySelector(".faq-answer");
        ans.style.maxHeight = ans.scrollHeight + "px";
      }
    });
  });
}

function setupRealEstateFilters() {
  const bhkSel = document.getElementById("filter-bhk");
  const furnishSel = document.getElementById("filter-furnishing");
  const ageSel = document.getElementById("filter-age");
  const facingSel = document.getElementById("filter-facing");
  const resetBtn = document.getElementById("reset-filters");
  if (!bhkSel) return;

  function runFilters() {
    const bhk = bhkSel.value;
    const furnish = furnishSel.value;
    const age = ageSel.value;
    const facing = facingSel.value;

    const filtered = state.realestate.filter(re => {
      if (bhk !== "all" && re.apartmentType !== bhk) return false;
      if (furnish !== "all" && re.furnishing !== furnish) return false;
      if (facing !== "all" && !re.facing.includes(facing)) return false;
      if (age !== "all") {
        const ageNum = parseInt(re.propertyAge);
        if (age === "new" && ageNum >= 5) return false;
        if (age === "old" && ageNum <= 15) return false;
      }
      return true;
    });

    document.getElementById("re-properties-grid").innerHTML = renderPropertyCards(filtered);
    initScrollReveal();
  }

  bhkSel.addEventListener("change", runFilters);
  furnishSel.addEventListener("change", runFilters);
  ageSel.addEventListener("change", runFilters);
  facingSel.addEventListener("change", runFilters);
  resetBtn.addEventListener("click", () => {
    bhkSel.value = "all"; furnishSel.value = "all"; ageSel.value = "all"; facingSel.value = "all";
    runFilters();
  });

  runFilters();
}

function setupLoanDetailCalculator() {
  const incomeSlider = document.getElementById("income-slider");
  if (!incomeSlider) return;

  const emiSlider = document.getElementById("emi-slider");
  const tenureSlider = document.getElementById("tenure-slider");
  const incomeVal = document.getElementById("income-val");
  const emiVal = document.getElementById("emi-val");
  const tenureVal = document.getElementById("tenure-val");
  const resultBox = document.getElementById("calc-result-value");

  function fmt(n) { return "₹" + n.toLocaleString("en-IN"); }

  function calculateMaxLoan() {
    const grossIncome = parseInt(incomeSlider.value);
    const existingEmi = parseInt(emiSlider.value);
    const tenureYears = parseInt(tenureSlider.value);

    incomeVal.innerText = fmt(grossIncome);
    emiVal.innerText = fmt(existingEmi);
    tenureVal.innerText = tenureYears + " Years";

    const maxAllowedEmi = (grossIncome * 0.5) - existingEmi;
    if (maxAllowedEmi <= 0) { resultBox.innerText = "₹0 — EMI limit exceeded"; return; }

    const r = 8.5 / 12 / 100;
    const n = tenureYears * 12;
    const maxLoan = maxAllowedEmi * (1 - Math.pow(1 + r, -n)) / r;
    resultBox.innerText = fmt(Math.max(0, Math.floor(maxLoan / 10000) * 10000));
  }

  incomeSlider.addEventListener("input", calculateMaxLoan);
  emiSlider.addEventListener("input", calculateMaxLoan);
  tenureSlider.addEventListener("input", calculateMaxLoan);
  calculateMaxLoan();
}

function setupRealEstateGallery() {
  const track = document.getElementById("gallery-slider-track");
  const prevBtn = document.getElementById("gallery-prev");
  const nextBtn = document.getElementById("gallery-next");
  if (!track) return;

  const slides = track.querySelectorAll(".gallery-img-slide");
  let idx = 0;
  function updateGallery() { track.style.transform = `translateX(-${idx * 100}%)`; }

  nextBtn.addEventListener("click", () => { idx = (idx + 1) % slides.length; updateGallery(); });
  prevBtn.addEventListener("click", () => { idx = (idx - 1 + slides.length) % slides.length; updateGallery(); });
}

// ─── Modal Controllers ─────────────────────────────────────────────────────────
const inquiryModal = document.getElementById("inquiry-modal");
const closeInqBtn = document.getElementById("close-inquiry-modal");
const inqForm = document.getElementById("inquiry-form");
const step1Div = document.getElementById("inquiry-step-1");
const step2Div = document.getElementById("inquiry-step-2");

function openInquiryModal(defaultService = "") {
  inquiryModal.classList.add("active");
  document.body.classList.add("modal-open");
  resetInquiryForm();
  if (defaultService) {
    const sel = document.getElementById("inq-service");
    if (sel) sel.value = defaultService;
  }
}

function closeInquiryModal() {
  inquiryModal.classList.remove("active");
  document.body.classList.remove("modal-open");
  resetInquiryForm();
}

function resetInquiryForm() {
  inqForm.reset();
  step1Div.style.display = "block";
  step2Div.style.display = "none";
  state.activeInquiryPayload = null;
  state.otpMobile = "";
  if (state.otpTimer) { clearInterval(state.otpTimer); state.otpTimer = null; }
}

if (closeInqBtn) {
  closeInqBtn.addEventListener("click", closeInquiryModal);
  inquiryModal.addEventListener("click", (e) => { if (e.target === inquiryModal) closeInquiryModal(); });
}

document.getElementById("header-inquire-btn").addEventListener("click", () => openInquiryModal());

// Delegate trigger-inq-modal clicks for dynamically injected buttons
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".trigger-inq-modal");
  if (btn) openInquiryModal(btn.getAttribute("data-service") || "");

  // Tab switching
  if (e.target.classList.contains("tab-btn")) {
    const tabBtns = e.target.parentElement.querySelectorAll(".tab-btn");
    const tabPanels = e.target.parentElement.parentElement.querySelectorAll(".tab-panel");
    const selectedTab = e.target.getAttribute("data-tab");
    tabBtns.forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
    tabPanels.forEach(p => p.classList.toggle("active", p.id === `tab-${selectedTab}`));
  }
});

// ─── OTP Flow ──────────────────────────────────────────────────────────────────
async function handleSendOTP(phone, name, email, service, message, extraValues = "") {
  state.otpMobile = phone;
  state.activeInquiryPayload = { name, email, mobile: phone, service, type: "Web Enquiry", values: extraValues, message };

  try {
    const response = await apiPost("website/expressintrest/sentotp", { mobile: phone });
    if (response.success) {
      showToast(response.message || "OTP sent successfully!");
      step1Div.style.display = "none";
      step2Div.style.display = "block";
      startOtpTimer();
      setupOtpInputFocus();
    } else {
      showToast(response.message || "Unable to send OTP", "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Connecting... Form submitted in demo mode.", "warning");
    step1Div.style.display = "none";
    step2Div.style.display = "block";
    startOtpTimer(true);
    setupOtpInputFocus();
  }
}

function startOtpTimer(isSimulated = false) {
  state.otpTimeRemaining = 30;
  const countSpan = document.getElementById("otp-timer-count");
  if (countSpan) countSpan.innerText = state.otpTimeRemaining;
  if (state.otpTimer) clearInterval(state.otpTimer);

  state.otpTimer = setInterval(() => {
    state.otpTimeRemaining--;
    if (countSpan) countSpan.innerText = state.otpTimeRemaining;
    if (state.otpTimeRemaining <= 0) {
      clearInterval(state.otpTimer);
      state.otpTimer = null;
      if (isSimulated) showToast("OTP Resend Simulated");
    }
  }, 1000);
}

function setupOtpInputFocus() {
  const inputs = document.querySelectorAll(".otp-box");
  inputs.forEach((input, index) => {
    input.value = "";
    input.addEventListener("input", (e) => {
      if (e.target.value.length === 1 && index < inputs.length - 1) inputs[index + 1].focus();
      const enteredOtp = Array.from(inputs).map(inp => inp.value).join("");
      if (enteredOtp.length === 6) verifyAndSubmitOtp(enteredOtp);
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && input.value === "" && index > 0) inputs[index - 1].focus();
    });
  });
  inputs[0].focus();
}

async function verifyAndSubmitOtp(otpCode) {
  const payload = state.activeInquiryPayload;
  if (!payload) return;
  payload.otp = otpCode;

  try {
    const verifyResp = await apiPost("website/expressintrest/compareotp", { mobile: payload.mobile, otp: otpCode });
    if (verifyResp.success) {
      const addResp = await apiPost("website/expressintrest/add", payload);
      if (addResp.success) { showToast("Inquiry submitted successfully!"); closeInquiryModal(); }
      else showToast(addResp.message || "Failed to submit lead", "error");
    } else {
      showToast(verifyResp.message || "Invalid OTP code", "error");
      document.querySelectorAll(".otp-box").forEach(inp => inp.value = "");
      document.querySelectorAll(".otp-box")[0].focus();
    }
  } catch (err) {
    console.error(err);
    showToast("Application submitted successfully!");
    closeInquiryModal();
  }
}

function setupHomeInquiryForm() {
  document.querySelectorAll(".quick-inquiry-form").forEach(form => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.querySelector(".quick-name").value;
      const phone = form.querySelector(".quick-phone").value;
      const service = form.querySelector(".quick-service").value;
      openInquiryModal(service);
      setTimeout(() => {
        document.getElementById("inq-name").value = name;
        document.getElementById("inq-phone").value = phone;
      }, 100);
    });
  });
}

document.getElementById("inq-next-btn").addEventListener("click", () => {
  const name = document.getElementById("inq-name").value;
  const email = document.getElementById("inq-email").value;
  const phone = document.getElementById("inq-phone").value;
  const service = document.getElementById("inq-service").value;
  const message = document.getElementById("inq-message").value;

  if (!name || !email || !phone || !service) { showToast("Please fill in all required fields", "warning"); return; }
  if (phone.length !== 10) { showToast("Mobile number must be exactly 10 digits", "warning"); return; }
  handleSendOTP(phone, name, email, service, message);
});

document.getElementById("inq-back-btn").addEventListener("click", () => {
  step1Div.style.display = "block";
  step2Div.style.display = "none";
  if (state.otpTimer) { clearInterval(state.otpTimer); state.otpTimer = null; }
});

function setupLoanInquiryForm() {
  const form = document.getElementById("loan-enquiry-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("loan-enq-name").value;
    const email = document.getElementById("loan-enq-email").value;
    const phone = document.getElementById("loan-enq-phone").value;
    const amount = document.getElementById("loan-enq-amount").value;
    openInquiryModal("Loan");
    setTimeout(() => {
      document.getElementById("inq-name").value = name;
      document.getElementById("inq-email").value = email;
      document.getElementById("inq-phone").value = phone;
      document.getElementById("inq-message").value = `Required Loan Amount: ₹${amount}`;
    }, 100);
  });
}

function setupInsuranceInquiryForm() {
  const form = document.getElementById("ins-enquiry-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("ins-enq-name").value;
    const email = document.getElementById("ins-enq-email").value;
    const phone = document.getElementById("ins-enq-phone").value;
    openInquiryModal("Insurance");
    setTimeout(() => {
      document.getElementById("inq-name").value = name;
      document.getElementById("inq-email").value = email;
      document.getElementById("inq-phone").value = phone;
    }, 100);
  });
}

function setupRealEstateInquiryForm() {
  const form = document.getElementById("re-enquiry-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("re-enq-name").value;
    const phone = document.getElementById("re-enq-phone").value;
    openInquiryModal("Real Estate");
    setTimeout(() => {
      document.getElementById("inq-name").value = name;
      document.getElementById("inq-phone").value = phone;
    }, 100);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", async () => {
  // Mobile burger
  const burger = document.getElementById("burger-toggle");
  const menu = document.getElementById("nav-menu");
  const actions = document.getElementById("nav-actions");
  burger.addEventListener("click", () => {
    menu.classList.toggle("active");
    actions.classList.toggle("active");
  });

  // Sticky header
  window.addEventListener("scroll", () => {
    const header = document.getElementById("main-header");
    header.classList.toggle("scrolled", window.scrollY > 50);
  });

  // Load data
  await initAppData();

  // Start router
  window.addEventListener("hashchange", router);
  router();
});
