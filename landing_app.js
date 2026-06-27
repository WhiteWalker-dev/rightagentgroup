/* ==========================================================================
   Right Agent Group - Premium Landing Page Interactions
   Vanilla ES6 Javascript - Animations, Dynamic Calculators, Modals & Live Chat
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Global State for Comparisons and Lead Forms
  const state = {
    comparedProjects: [],
    otpVerified: false,
    otpTimer: null,
    otpMobile: "",
    brochureDownloaded: false,
    customFormData: null
  };

  // Projects raw specifications database (matching DOM elements)
  const projectsData = {
    p1: {
      id: "p1",
      name: "Right Agent Residences",
      location: "Gachibowli, Hyderabad",
      price: "₹1.8 Cr",
      config: "3 BHK Premium Apartment",
      area: "2,450 Sq.Ft.",
      possession: "Dec 2027",
      rera: "Approved (TS/RERA/2026/045)",
      amenities: ["Infinity Pool", "Sky Lounge", "24/7 Smart Gym", "Home Automation", "Gated Security"],
      image: "featured_prop.png"
    },
    p2: {
      id: "p2",
      name: "Golden Crest Luxury Villas",
      location: "Kokapet, Hyderabad",
      price: "₹4.5 Cr",
      config: "4 BHK Ultra Villa",
      area: "4,800 Sq.Ft.",
      possession: "Ready to Move",
      rera: "Approved (TS/RERA/2025/112)",
      amenities: ["Private Lawn & Pool", "Home Theatre", "Private Elevator", "24/7 Concierge", "Clubhouse"],
      image: "hero_bg.png"
    },
    p3: {
      id: "p3",
      name: "Apex Premium Business Tower",
      location: "Hitec City, Hyderabad",
      price: "₹2.5 Cr",
      config: "Grade-A Executive Spaces",
      area: "1,200 Sq.Ft. upwards",
      possession: "June 2028",
      rera: "Approved (TS/RERA/2026/099)",
      amenities: ["Double Height Lobby", "High-speed Elevators", "LEED Gold Rating", "Retail Highstreet", "EV Charging"],
      image: "investment_bg.png"
    },
    p4: {
      id: "p4",
      name: "Royal Palm Gated Plots",
      location: "Mokila, Hyderabad",
      price: "₹1.2 Cr",
      config: "Premium Plots",
      area: "300 Sq.Yards",
      possession: "Ready to Construct",
      rera: "Approved (TS/RERA/2026/102)",
      amenities: ["Blacktop Roads", "Underground Cabling", "Club House", "24/7 Security", "Wide Avenue Trees"],
      image: "hero2.png"
    }
  };

  /* ------------------------------------------------------------------------
     1. SCREEN LOADER & PAGE ENTER TRANSITION
     ------------------------------------------------------------------------ */
  const loader = document.getElementById("page-loader");
  if (loader) {
    setTimeout(() => {
      loader.classList.add("fade-out");
      // Trigger entrance reveal for hero elements
      document.querySelectorAll(".fade-up-item").forEach(el => {
        el.classList.add("revealed");
      });
    }, 1000);
  }

  /* ------------------------------------------------------------------------
     2. DYNAMIC CURSOR GLOW EFFECT
     ------------------------------------------------------------------------ */
  const glow = document.getElementById("cursor-glow");
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  if (glow) {
    if (isTouchDevice) {
      glow.style.display = "none";
    } else {
      document.addEventListener("mousemove", (e) => {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
      });
    }
  }

  /* ------------------------------------------------------------------------
     3. HEADER ACTIONS: MOBILE MENU & SCROLL RESPONSIVENESS
     ------------------------------------------------------------------------ */
  const header = document.getElementById("main-header");
  const burger = document.getElementById("burger-menu");
  const navMenu = document.getElementById("nav-menu");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
    scrollspyActiveLink();
  });

  if (burger) {
    burger.addEventListener("click", () => {
      burger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    // Close menu when navigation link is clicked
    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        burger.classList.remove("active");
        navMenu.classList.remove("active");
      });
    });
  }

  // Scrollspy highlights current section in header
  function scrollspyActiveLink() {
    const scrollPos = window.scrollY + 100;
    document.querySelectorAll("section[id]").forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute("id");
      if (scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll(".nav-link").forEach(link => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. SCROLL REVEAL OBSERVER
     ------------------------------------------------------------------------ */
  const revealItems = document.querySelectorAll(".reveal-item");
  if (revealItems.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target); // Reveal only once
        }
      });
    }, { threshold: 0.15 });

    revealItems.forEach(item => revealObserver.observe(item));
  }

  /* ------------------------------------------------------------------------
     5. MAGNETIC BUTTON MICRO-INTERACTION
     ------------------------------------------------------------------------ */
  const magneticBtns = document.querySelectorAll(".btn-magnetic");
  if (magneticBtns.length > 0 && !isTouchDevice) {
    magneticBtns.forEach(btn => {
      btn.addEventListener("mousemove", (e) => {
        const bounds = btn.getBoundingClientRect();
        const x = e.clientX - bounds.left - bounds.width / 2;
        const y = e.clientY - bounds.top - bounds.height / 2;
        btn.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`;
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = `translate(0, 0)`;
      });
    });
  }

  /* ------------------------------------------------------------------------
     6. 3D CARD TILT EFFECT (Hover coordinates calculation)
     ------------------------------------------------------------------------ */
  const tiltCards = document.querySelectorAll(".tilt-card, .project-card");
  if (tiltCards.length > 0 && !isTouchDevice) {
    tiltCards.forEach(card => {
      card.addEventListener("mousemove", (e) => {
        const bounds = card.getBoundingClientRect();
        const mouseX = e.clientX - bounds.left;
        const mouseY = e.clientY - bounds.top;
        const rotateY = ((mouseX / bounds.width) - 0.5) * 8; // Max rotate Y = 4deg
        const rotateX = (0.5 - (mouseY / bounds.height)) * 8; // Max rotate X = 4deg
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
      });
    });
  }

  /* ------------------------------------------------------------------------
     7. LIVE HOME LOAN CALCULATOR
     ------------------------------------------------------------------------ */
  const amountSlider = document.getElementById("loan-amount-slider");
  const rateSlider = document.getElementById("loan-rate-slider");
  const tenureSlider = document.getElementById("loan-tenure-slider");

  const valAmount = document.getElementById("calc-val-amount");
  const valRate = document.getElementById("calc-val-rate");
  const valTenure = document.getElementById("calc-val-tenure");

  const resultEmi = document.getElementById("calc-emi-result");
  const resultPrincipal = document.getElementById("calc-principal-result");
  const resultInterest = document.getElementById("calc-interest-result");

  function formatCurrency(num) {
    if (num >= 10000000) {
      return `₹ ${(num / 10000000).toFixed(2)} Cr`;
    } else if (num >= 100000) {
      return `₹ ${(num / 100000).toFixed(2)} Lakhs`;
    }
    return `₹ ${num.toLocaleString("en-IN")}`;
  }

  function calculateMortgage() {
    if (!amountSlider) return;
    const P = parseFloat(amountSlider.value);
    const annualRate = parseFloat(rateSlider.value);
    const tenureYears = parseInt(tenureSlider.value);

    // Update Slider Value Label displays
    valAmount.innerText = formatCurrency(P);
    valRate.innerText = `${annualRate} %`;
    valTenure.innerText = `${tenureYears} Years`;

    // Monthly interest rate formula
    const r = (annualRate / 12) / 100;
    const n = tenureYears * 12;

    let emi = 0;
    if (annualRate > 0) {
      emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else {
      emi = P / n;
    }

    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    resultEmi.innerText = `₹ ${Math.round(emi).toLocaleString("en-IN")}`;
    resultPrincipal.innerText = formatCurrency(P);
    resultInterest.innerText = formatCurrency(Math.max(0, totalInterest));
  }

  if (amountSlider) {
    amountSlider.addEventListener("input", calculateMortgage);
    rateSlider.addEventListener("input", calculateMortgage);
    tenureSlider.addEventListener("input", calculateMortgage);
    calculateMortgage(); // Run initial calculation
  }

  /* ------------------------------------------------------------------------
     8. ANIMATED NUMBERS COUNTERS
     ------------------------------------------------------------------------ */
  const counters = document.querySelectorAll(".counter, .counter-text");
  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const targetEl = entry.target;
        const targetValue = parseInt(targetEl.getAttribute("data-target"), 10);
        const prefix = targetEl.getAttribute("data-prefix") || "";
        const suffix = targetEl.getAttribute("data-suffix") || "";
        
        let startValue = 0;
        const duration = 2000; // 2 seconds animation
        const frameTime = 1000 / 60; // 60 FPS
        const totalFrames = duration / frameTime;
        const increment = targetValue / totalFrames;

        let frame = 0;
        const animate = () => {
          frame++;
          startValue += increment;
          if (frame < totalFrames) {
            targetEl.innerText = prefix + Math.floor(startValue).toLocaleString("en-IN") + suffix;
            requestAnimationFrame(animate);
          } else {
            targetEl.innerText = prefix + targetValue.toLocaleString("en-IN") + suffix;
          }
        };

        animate();
        observer.unobserve(targetEl);
      });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));
  }

  /* ------------------------------------------------------------------------
     9. TOAST NOTIFICATION UTILITY
     ------------------------------------------------------------------------ */
  function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let icon = "fa-circle-check";
    if (type === "error") icon = "fa-circle-xmark";
    if (type === "warning") icon = "fa-circle-exclamation";

    toast.innerHTML = `
      <i class="fa-solid ${icon}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add("active"), 10);
    
    setTimeout(() => {
      toast.classList.remove("active");
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  /* ------------------------------------------------------------------------
     10. FEATURED PROPERTY CAROUSEL/SLIDER
     ------------------------------------------------------------------------ */
  const track = document.getElementById("property-carousel-track");
  const prevBtn = document.getElementById("prop-prev-btn");
  const nextBtn = document.getElementById("prop-next-btn");
  const indicatorsContainer = document.getElementById("carousel-indicators");
  
  if (track) {
    const slides = Array.from(track.children);
    const slideCount = slides.length;
    let currentIndex = 0;

    // Create dot indicators
    for (let i = 0; i < slideCount; i++) {
      const dot = document.createElement("div");
      dot.className = `carousel-indicator-dot ${i === 0 ? 'active' : ''}`;
      dot.setAttribute("data-index", i);
      indicatorsContainer.appendChild(dot);
      
      dot.addEventListener("click", () => {
        goToSlide(i);
      });
    }

    const dots = Array.from(indicatorsContainer.children);

    function getItemsPerView() {
      if (window.innerWidth <= 600) return 1;
      if (window.innerWidth <= 992) return 2;
      return 3;
    }

    function goToSlide(index) {
      const itemsPerView = getItemsPerView();
      const maxIndex = Math.max(0, slideCount - itemsPerView);
      
      currentIndex = Math.min(Math.max(index, 0), maxIndex);
      
      const slideWidth = slides[0].getBoundingClientRect().width;
      const gap = 24; // matches gap in CSS track
      
      const translateX = currentIndex * (slideWidth + gap);
      track.style.transform = `translateX(-${translateX}px)`;
      
      // Update dots
      dots.forEach((dot, idx) => {
        dot.classList.toggle("active", idx === currentIndex);
      });

      // Disable/enable nav buttons
      prevBtn.style.opacity = currentIndex === 0 ? "0.4" : "1";
      nextBtn.style.opacity = currentIndex === maxIndex ? "0.4" : "1";
    }

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener("click", () => {
        goToSlide(currentIndex - 1);
      });

      nextBtn.addEventListener("click", () => {
        goToSlide(currentIndex + 1);
      });
    }

    // Adapt on resize
    window.addEventListener("resize", () => {
      goToSlide(currentIndex);
    });

    // Touch Swiping Support
    let startX = 0;
    let endX = 0;

    track.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    });

    track.addEventListener("touchmove", (e) => {
      endX = e.touches[0].clientX;
    });

    track.addEventListener("touchend", () => {
      const diff = startX - endX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToSlide(currentIndex + 1);
        } else {
          goToSlide(currentIndex - 1);
        }
      }
    });

    // Init state
    goToSlide(0);
  }

  /* ------------------------------------------------------------------------
     11. SIMPLE PROCESS INTERACTIVE TIMELINE
     ------------------------------------------------------------------------ */
  const timelineNodes = document.querySelectorAll(".timeline-node");
  const progressActive = document.getElementById("timeline-progress-active");

  if (timelineNodes.length > 0) {
    timelineNodes.forEach((node, idx) => {
      node.addEventListener("click", () => {
        // Activate nodes up to the clicked one
        timelineNodes.forEach((otherNode, oIdx) => {
          otherNode.classList.toggle("active", oIdx <= idx);
        });

        // Set progress width
        if (progressActive) {
          const percent = (idx / (timelineNodes.length - 1)) * 100;
          progressActive.style.width = `${percent}%`;
        }

        showToast(`Process Step ${idx + 1} activated: ${node.querySelector('h3').innerText}`);
      });
    });
  }

  /* ------------------------------------------------------------------------
     12. DYNAMIC PROPERTY COMPARISON MATRIX
     ------------------------------------------------------------------------ */
  const compareCheckboxes = document.querySelectorAll(".compare-checkbox");
  const compareCountEl = document.getElementById("compare-count");
  const compareModal = document.getElementById("compare-modal");
  const closeCompareBtn = document.getElementById("close-compare-modal");

  function updateCompareCount() {
    const selected = Array.from(compareCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
    state.comparedProjects = selected;
    if (compareCountEl) {
      compareCountEl.innerText = selected.length;
    }
  }

  if (compareCheckboxes.length > 0) {
    compareCheckboxes.forEach(cb => {
      cb.addEventListener("change", () => {
        const selected = Array.from(compareCheckboxes).filter(c => c.checked);
        if (selected.length > 3) {
          cb.checked = false;
          showToast("You can compare up to 3 projects only.", "warning");
          return;
        }
        updateCompareCount();
        if (cb.checked) {
          showToast(`Added ${projectsData[cb.value].name} to comparison list.`);
        }
      });
    });
  }

  // Open Compare Modal & Generate Matrix Table dynamically
  document.querySelectorAll(".compare-trigger").forEach(btn => {
    btn.addEventListener("click", () => {
      if (state.comparedProjects.length === 0) {
        showToast("Please select at least 1 project to compare.", "warning");
        return;
      }
      generateCompareMatrix();
      compareModal.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  if (closeCompareBtn) {
    closeCompareBtn.addEventListener("click", () => {
      compareModal.classList.remove("active");
      document.body.style.overflow = "auto";
    });
  }

  function generateCompareMatrix() {
    const container = document.getElementById("compare-modal-content");
    if (!container) return;

    const list = state.comparedProjects.map(id => projectsData[id]);
    
    let headersHtml = "<th>Specification</th>";
    let imageRow = "<td>Visuals</td>";
    let nameRow = "<td>Project Name</td>";
    let priceRow = "<td>Starting Price</td>";
    let typeRow = "<td>Configuration</td>";
    let areaRow = "<td>Built Up Area</td>";
    let possessionRow = "<td>Possession Date</td>";
    let reraRow = "<td>RERA Registry</td>";
    let amenitiesRow = "<td>Key Amenities</td>";
    let actionsRow = "<td>Action</td>";

    list.forEach(p => {
      headersHtml += `<th>${p.name}</th>`;
      imageRow += `<td><img src="${p.image}" style="width:100%; max-width:200px; height:120px; object-fit:cover; border-radius:8px; border:1px solid var(--glass-border);" alt="${p.name}"></td>`;
      nameRow += `<td><strong>${p.name}</strong><br><span style="font-size:0.75rem; color:var(--gold);">${p.location}</span></td>`;
      priceRow += `<td><span style="font-family:var(--font-heading); color:var(--gold); font-size:1.15rem; font-weight:600;">${p.price}*</span></td>`;
      typeRow += `<td>${p.config}</td>`;
      areaRow += `<td>${p.area}</td>`;
      possessionRow += `<td>${p.possession}</td>`;
      reraRow += `<td><i class="fa-solid fa-circle-check" style="color:#10B981;"></i> ${p.rera}</td>`;
      
      let ams = p.amenities.map(a => `<span style="display:inline-block; font-size:0.7rem; background:rgba(255,255,255,0.03); padding:4px 8px; border-radius:4px; margin:2px; border:1px solid var(--glass-border);">${a}</span>`).join("");
      amenitiesRow += `<td><div style="max-width:220px; display:flex; flex-wrap:wrap;">${ams}</div></td>`;
      actionsRow += `<td><button class="btn btn-gold btn-sm btn-full open-callback-modal" data-pref="${p.name}">Inquire Now</button></td>`;
    });

    container.innerHTML = `
      <div style="overflow-x: auto;">
        <table class="compare-matrix-table">
          <thead>
            <tr>${headersHtml}</tr>
          </thead>
          <tbody>
            <tr>${imageRow}</tr>
            <tr>${nameRow}</tr>
            <tr>${priceRow}</tr>
            <tr>${typeRow}</tr>
            <tr>${areaRow}</tr>
            <tr>${possessionRow}</tr>
            <tr>${reraRow}</tr>
            <tr>${amenitiesRow}</tr>
            <tr>${actionsRow}</tr>
          </tbody>
        </table>
      </div>
    `;

    // Re-attach consultation triggers inside the compared matrix
    container.querySelectorAll(".open-callback-modal").forEach(btn => {
      btn.addEventListener("click", () => {
        compareModal.classList.remove("active");
        const pref = btn.getAttribute("data-pref");
        openCallbackFlow(pref);
      });
    });
  }

  /* ------------------------------------------------------------------------
     13. VIP SITE VISIT CALLBACK FLOW & SIMULATED OTP VERIFICATION
     ------------------------------------------------------------------------ */
  const callbackModal = document.getElementById("callback-modal");
  const closeCallbackBtn = document.getElementById("close-callback-modal");
  const modalNextBtn = document.getElementById("modal-next-btn");
  const modalBackBtn = document.getElementById("modal-otp-back-btn");
  const callbackForm = document.getElementById("modal-callback-form");

  const step1 = document.getElementById("modal-step-1");
  const step2 = document.getElementById("modal-step-2");

  const targetPhoneDisplay = document.getElementById("target-phone-display");
  const timerSecondsEl = document.getElementById("m-timer-seconds");
  const otpInputs = document.querySelectorAll(".otp-box-input");

  function openCallbackFlow(defaultProduct = "") {
    if (!callbackModal) return;
    callbackModal.classList.add("active");
    document.body.style.overflow = "hidden";
    
    // Reset steps
    step1.style.display = "block";
    step2.style.display = "none";
    callbackForm.reset();
    
    if (defaultProduct) {
      const select = document.getElementById("m-service");
      if (select) {
        // Pre-select based on project text
        for (let i = 0; i < select.options.length; i++) {
          if (select.options[i].text.toLowerCase().includes(defaultProduct.toLowerCase()) || 
              select.options[i].value.toLowerCase().includes(defaultProduct.toLowerCase())) {
            select.selectedIndex = i;
            break;
          }
        }
      }
    }
  }

  document.querySelectorAll(".open-callback-modal").forEach(btn => {
    btn.addEventListener("click", () => {
      const pId = btn.getAttribute("data-project");
      const pref = pId ? projectsData[pId].name : btn.getAttribute("data-proj") || "";
      openCallbackFlow(pref);
    });
  });

  if (closeCallbackBtn) {
    closeCallbackBtn.addEventListener("click", () => {
      callbackModal.classList.remove("active");
      document.body.style.overflow = "auto";
      if (state.otpTimer) clearInterval(state.otpTimer);
    });
  }

  // Step 1 -> Send OTP -> Step 2
  if (modalNextBtn) {
    modalNextBtn.addEventListener("click", () => {
      const phoneInput = document.getElementById("m-phone");
      const serviceInput = document.getElementById("m-service");
      
      if (!phoneInput.checkValidity() || phoneInput.value.length < 10) {
        showToast("Please enter a valid 10-digit mobile number.", "warning");
        return;
      }
      if (!serviceInput.value) {
        showToast("Please select a service or property interest.", "warning");
        return;
      }

      state.otpMobile = phoneInput.value;
      targetPhoneDisplay.innerText = `+91 ${state.otpMobile.substring(0, 5)} ${state.otpMobile.substring(5)}`;
      
      // Simulate sending OTP SMS API call
      showToast("OTP Code '123456' sent successfully to your mobile number.", "success");
      
      step1.style.display = "none";
      step2.style.display = "block";
      startOTPTimer();
      setupOTPFocus();
    });
  }

  if (modalBackBtn) {
    modalBackBtn.addEventListener("click", () => {
      step2.style.display = "none";
      step1.style.display = "block";
      if (state.otpTimer) clearInterval(state.otpTimer);
    });
  }

  function startOTPTimer() {
    let timeLeft = 30;
    if (timerSecondsEl) timerSecondsEl.innerText = timeLeft;
    if (state.otpTimer) clearInterval(state.otpTimer);

    state.otpTimer = setInterval(() => {
      timeLeft--;
      if (timerSecondsEl) timerSecondsEl.innerText = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(state.otpTimer);
        showToast("You can now request a new code resend.", "warning");
      }
    }, 1000);
  }

  function setupOTPFocus() {
    otpInputs.forEach((input, index) => {
      input.value = "";
      input.addEventListener("input", (e) => {
        if (e.target.value.length === 1 && index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
        
        // Auto submit if all 6 filled
        const otpCode = Array.from(otpInputs).map(i => i.value).join("");
        if (otpCode.length === 6) {
          verifyOTP(otpCode);
        }
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && input.value === "" && index > 0) {
          otpInputs[index - 1].focus();
        }
      });
    });
    setTimeout(() => otpInputs[0].focus(), 100);
  }

  function verifyOTP(code) {
    // Demonstration hardcoded code: 123456
    if (code === "123456") {
      state.otpVerified = true;
      showToast("OTP Verified successfully! Consultation details queued.", "success");
      
      // Submit successful lead
      setTimeout(() => {
        callbackModal.classList.remove("active");
        document.body.style.overflow = "auto";
        if (state.otpTimer) clearInterval(state.otpTimer);
        
        // Direct WhatsApp follow up link
        const selVal = document.getElementById("m-service").value;
        const textMsg = `Hi Right Agent Group, I just verified my contact number (+91 ${state.otpMobile}) and want to book a VIP consultation/site visit for: ${selVal}.`;
        const waLink = `https://api.whatsapp.com/send/?phone=918333993223&text=${encodeURIComponent(textMsg)}`;
        window.open(waLink, "_blank");
      }, 800);
    } else {
      showToast("Invalid code entered. Please type '123456' for demo.", "error");
      otpInputs.forEach(i => i.value = "");
      otpInputs[0].focus();
    }
  }

  // Form submit fallbacks
  if (callbackForm) {
    callbackForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const code = Array.from(otpInputs).map(i => i.value).join("");
      verifyOTP(code);
    });
  }

  /* ------------------------------------------------------------------------
     14. LEAD CAPTURE CONSULTATION FORM SUBMIT
     ------------------------------------------------------------------------ */
  const contactForm = document.getElementById("landing-contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("c-name").value;
      const phone = document.getElementById("c-phone").value;
      const email = document.getElementById("c-email").value;
      const service = document.getElementById("c-service").value;
      const budget = document.getElementById("c-budget").value || "Not Specified";
      const requirements = document.getElementById("c-message").value || "None";

      // Trigger OTP Modal for verification safety
      openCallbackFlow(service);
      
      // Auto-fill values in memory
      setTimeout(() => {
        const phoneField = document.getElementById("m-phone");
        if (phoneField) phoneField.value = phone;
        
        // Pre-fill requirements logs
        state.customFormData = { name, phone, email, service, budget, requirements };
      }, 100);
    });
  }

  /* ------------------------------------------------------------------------
     15. DETAIL POPUP & VIRTUAL TOUR VIEWERS
     ------------------------------------------------------------------------ */
  const detailModal = document.getElementById("detail-modal");
  const detailModalBody = document.getElementById("detail-modal-body");
  const detailModalTitle = document.getElementById("detail-modal-title");
  const closeDetailBtn = document.getElementById("close-detail-modal");

  if (closeDetailBtn) {
    closeDetailBtn.addEventListener("click", () => {
      detailModal.classList.remove("active");
      document.body.style.overflow = "auto";
    });
  }

  document.querySelectorAll(".view-details-trigger").forEach(btn => {
    btn.addEventListener("click", () => {
      const pid = btn.getAttribute("data-project");
      const p = projectsData[pid];
      if (!p) return;

      detailModalTitle.innerText = p.name;
      detailModalBody.innerHTML = `
        <div style="margin-bottom: 20px;">
          <img src="${p.image}" style="width:100%; height:260px; object-fit:cover; border-radius:12px; margin-bottom:20px; border:1px solid var(--glass-border);" alt="${p.name}">
          <p style="font-size:0.9rem; color:var(--gray-muted); margin-bottom:16px;"><strong>Address:</strong> ${p.location}</p>
          <p style="font-size:1rem; margin-bottom:20px; color:var(--gray);">Enjoy ultra-exclusive luxury structures in a secured community designed by award-winning architects. Features integrated spaces, private security towers, eco-parks, and double-height structural lobbies.</p>
          
          <h4 style="color:var(--gold); margin-bottom:12px; font-family:var(--font-heading);">Key Parameters:</h4>
          <ul style="color:var(--gray); margin-bottom:24px; padding-left:20px; list-style-type:square;">
            <li><strong>Starting Price:</strong> ${p.price}</li>
            <li><strong>Configurations:</strong> ${p.config}</li>
            <li><strong>Built Up Area:</strong> ${p.area}</li>
            <li><strong>Possession Date:</strong> ${p.possession}</li>
            <li><strong>RERA Registry:</strong> ${p.rera}</li>
          </ul>

          <button class="btn btn-gold btn-full open-callback-modal" data-proj="${p.name}"><i class="fa-solid fa-headset"></i> Book Private Site Tour</button>
        </div>
      `;

      // Connect button inside detail modal to callback form
      detailModalBody.querySelector(".open-callback-modal").addEventListener("click", () => {
        detailModal.classList.remove("active");
        openCallbackFlow(p.name);
      });

      detailModal.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  /* ------------------------------------------------------------------------
     16. BROCHURE DOWNLOAD CAPTURE SYSTEM
     ------------------------------------------------------------------------ */
  const brochurePopup = document.getElementById("brochure-popup");
  const closeBrochureBtn = document.getElementById("close-brochure-popup");
  const brochureForm = document.getElementById("brochure-capture-form");

  function openBrochurePopup() {
    if (state.brochureDownloaded || sessionStorage.getItem("brochureClosed")) return;
    brochurePopup.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  // Trigger popup after 12 seconds
  setTimeout(openBrochurePopup, 12000);

  // Trigger popup when scroll past 50% height
  let scrollTriggered = false;
  window.addEventListener("scroll", () => {
    if (scrollTriggered) return;
    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    if (scrollPercent > 50) {
      scrollTriggered = true;
      openBrochurePopup();
    }
  });

  if (closeBrochureBtn) {
    closeBrochureBtn.addEventListener("click", () => {
      brochurePopup.classList.remove("active");
      document.body.style.overflow = "auto";
      sessionStorage.setItem("brochureClosed", "true");
    });
  }

  if (brochureForm) {
    brochureForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("b-name").value;
      const phone = document.getElementById("b-phone").value;
      const email = document.getElementById("b-email").value;

      state.brochureDownloaded = true;
      showToast("Verification code requested. Form submitted successfully!");
      
      brochurePopup.classList.remove("active");
      document.body.style.overflow = "auto";

      // Simulate a direct PDF download trigger
      const link = document.createElement("a");
      link.href = "#"; // dummy
      link.setAttribute("download", "Right_Agent_Group_Brochure.pdf");
      showToast("Downloading Brochure PDF...", "success");
      
      // Auto open callback OTP verification
      openCallbackFlow("Brochure Download Request");
      setTimeout(() => {
        const phoneField = document.getElementById("m-phone");
        if (phoneField) phoneField.value = phone;
      }, 100);
    });
  }

  /* ------------------------------------------------------------------------
     17. LIVE CHAT WIDGET & AI AGENT SIMULATOR
     ------------------------------------------------------------------------ */
  const chatToggle = document.getElementById("live-chat-toggle");
  const chatWidget = document.getElementById("live-chat-widget");
  const chatCloseBtn = document.getElementById("chat-minimize");
  const chatForm = document.getElementById("chat-input-form");
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");

  if (chatToggle) {
    chatToggle.addEventListener("click", () => {
      chatWidget.classList.toggle("active");
    });
  }

  if (chatCloseBtn) {
    chatCloseBtn.addEventListener("click", () => {
      chatWidget.classList.remove("active");
    });
  }

  // Auto welcome greeting after 5 seconds
  setTimeout(() => {
    if (!chatWidget.classList.contains("active")) {
      showToast("💬 Right Agent Group Advisor Online. Need assistance?", "success");
    }
  }, 5000);

  function appendChatMessage(message, sender = "user") {
    const msg = document.createElement("div");
    msg.className = `chat-msg ${sender}`;
    msg.innerHTML = `<p>${message}</p>`;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto scroll to bottom
  }

  // Handle Quick Replies intents
  document.querySelectorAll(".quick-reply-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const intent = btn.getAttribute("data-intent");
      const text = btn.innerText;
      
      appendChatMessage(text, "user");
      simulateAgentResponse(intent);
    });
  });

  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      appendChatMessage(text, "user");
      chatInput.value = "";

      // Simple keywords processor
      const textLower = text.toLowerCase();
      let intent = "general";
      
      if (textLower.includes("villa") || textLower.includes("plots") || textLower.includes("land")) {
        intent = "realestate";
      } else if (textLower.includes("apartment") || textLower.includes("flat") || textLower.includes("bhk")) {
        intent = "realestate";
      } else if (textLower.includes("calc") || textLower.includes("emi") || textLower.includes("interest") || textLower.includes("loan")) {
        intent = "loans";
      } else if (textLower.includes("insurance") || textLower.includes("health") || textLower.includes("life")) {
        intent = "insurance";
      } else if (textLower.includes("brochure") || textLower.includes("download") || textLower.includes("pdf")) {
        intent = "brochure";
      } else if (textLower.includes("contact") || textLower.includes("call") || textLower.includes("phone")) {
        intent = "callback";
      }

      setTimeout(() => simulateAgentResponse(intent), 1000);
    });
  }

  function simulateAgentResponse(intent) {
    let response = "";
    
    switch (intent) {
      case "realestate":
        response = "We represent premium properties across Hyderabad: Right Agent Residences (Gachibowli, ₹1.8 Cr+), Golden Crest Villas (Kokapet, ₹4.5 Cr+), and Royal Palm Gated Plots (Mokila, ₹1.2 Cr+). All projects are legally vetted and RERA approved. Shall I schedule a site tour?";
        break;
      case "loans":
        response = "We partner with SBI, HDFC, ICICI, and Axis. Interest rates start at 8.4% P.A. with processing waivers. You can calculate your monthly EMI using our interactive calculator on the page. Shall I connect you with our bank nodal officer?";
        break;
      case "insurance":
        response = "Protect your assets. We structure custom plans for health, life, property, and motor coverages with leading underwriters like TATA AIG and STAR HEALTH. Would you like a call back for a custom quote?";
        break;
      case "brochure":
        response = "You can download our 2026 Gated Community Investment Guide brochure PDF by submitting details in the brochure capture popup, or I can email it to you. Please provide your Email ID.";
        break;
      case "callback":
        response = "I'll be happy to arrange a call with our senior advisor. Click on the 'Request Call' button in the header or the 'Book Site Visit' widget to verify your mobile number. We'll connect in 30 minutes!";
        break;
      default:
        response = "Thank you for reaching out to Right Agent Group. We assist with real estate, home loans, and insurance under one trusted platform. Our advisor will connect shortly, or reach us directly at +91 83339 97227.";
    }

    appendChatMessage(response, "agent");
  }

  /* ------------------------------------------------------------------------
     18. HEADER BOOK CONSULTATION BTNS CLICK ACTION
     ------------------------------------------------------------------------ */
  document.querySelectorAll(".trigger-consultation").forEach(btn => {
    btn.addEventListener("click", () => {
      // scroll to contact form
      const sec = document.getElementById("contact");
      if (sec) {
        sec.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => {
          const firstInput = document.getElementById("c-name");
          if (firstInput) firstInput.focus();
        }, 800);
      }
    });
  });

});
