(function () {
  "use strict";

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    // ScrollTrigger loaded as separate script; register is handled by plugin load order if both present
  }
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Hero entrance (index.html hero-split + other pages' .hero) ── */
  function setupHeroEntrance() {
    if (prefersReducedMotion) return;

    var hero = document.querySelector(".hero-split") || document.querySelector(".hero");
    if (!hero) return;

    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Animate heading + paragraph together, then buttons with a stagger
    tl.from(hero.querySelectorAll("h1, p, .cta-buttons"),
      { y: 40, opacity: 0, stagger: 0.12, duration: 0.8, delay: 0.15 }
    );

    // On the index page, also bring in the carousel panel
    var movingEl = hero.querySelector(".hero-moving");
    if (movingEl) {
      tl.from(movingEl, { x: 60, opacity: 0, duration: 1 }, "-=0.5");
    }
  }

  /* ── Hero carousel – GSAP-driven ── */
  function setupHeroCarousel() {
    if (prefersReducedMotion) return;
    var images = [...document.querySelectorAll(".hero-image-swapping .swap-img")];
    if (images.length < 2) return;

    var current = images.findIndex(function (img) { return img.classList.contains("active"); });
    if (current < 0) current = 0;

    // Ensure all non-active images start hidden
    gsap.set(images, { opacity: 0, scale: 1.03 });
    gsap.set(images[current], { opacity: 1, scale: 1 });

    setInterval(function () {
      var prev = images[current];
      current = (current + 1) % images.length;
      var next = images[current];

      gsap.to(prev, { opacity: 0, scale: 1.03, duration: 0.6, ease: "power2.inOut" });
      gsap.fromTo(next,
        { opacity: 0, scale: 1.03 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }
      );
    }, 4000);
  }

  /* ── Scroll reveals via ScrollTrigger ── */
  function setupReveal() {
    if (prefersReducedMotion) return;
    var elements = document.querySelectorAll(".reveal-on-scroll");
    if (!elements.length) return;

    elements.forEach(function (el) {
      // Skip elements already visible (e.g. on quick load)
      if (el.classList.contains("is-visible")) return;

      gsap.fromTo(el,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none"
          }
        }
      );
    });
  }

  /* ── Geometric ornaments for body cards (non-index pages) ── */
  function setupGeometricOrnaments() {
    if (prefersReducedMotion) return;

    // Only decorate body cards on non-index pages
    if (document.querySelector(".hero-split")) return;

    var selectors = [".service-card", ".why-point", ".portfolio-item"];
    var hosts = [];
    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) { hosts.push(el); });
    });
    if (!hosts.length) return;

    // Unique SVG defs so each ornament rotates independently
    var defs = '<defs><linearGradient id="geo-grad" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#F2B31D"/><stop offset="100%" stop-color="#17171A"/></linearGradient></defs>';

    var shapes = [
      '<rect x="10" y="10" width="70" height="70" rx="14" fill="none" stroke="url(#geo-grad)" stroke-width="2.5" transform="rotate(8 45 45)"/>',
      '<circle cx="45" cy="45" r="32" fill="none" stroke="url(#geo-grad)" stroke-width="2.5"/>',
      '<polygon points="45,10 80,70 10,70" fill="none" stroke="url(#geo-grad)" stroke-width="2.5"/>',
      '<line x1="10" y1="10" x2="80" y2="80" stroke="url(#geo-grad)" stroke-width="2.5"/>' +
      '<line x1="80" y1="10" x2="10" y2="80" stroke="url(#geo-grad)" stroke-width="2.5"/>'
    ];

    hosts.forEach(function (host, i) {
      if (host.querySelector(".geometric-ornament")) return;
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "geometric-ornament");
      svg.setAttribute("viewBox", "0 0 90 90");
      svg.setAttribute("aria-hidden", "true");
      svg.innerHTML = defs + shapes[i % shapes.length];
      host.appendChild(svg);

      // Entrance: scale from 0 + rotate (always plays on load, not scroll-dependent)
      gsap.fromTo(svg,
        { scale: 0, rotation: -180, opacity: 0, transformOrigin: "center center" },
        { scale: 1, rotation: 0, opacity: 0.22, duration: 0.9, ease: "back.out(1.4)", delay: i * 0.08 }
      );

      // Subtle continuous idle rotation
      gsap.to(svg, {
        rotation: 360, duration: 22, ease: "none", repeat: -1, yoyo: true
      });
    });
  }

  /* ── Magnetic buttons – GSAP quickSetter ── */
  function setupMagneticButtons() {
    if (prefersReducedMotion) return;
    var buttons = document.querySelectorAll(".mag-btn");
    if (!buttons.length) return;

    buttons.forEach(function (button) {
      var xSetter = gsap.quickSetter(button, "x", "px");
      var ySetter = gsap.quickSetter(button, "y", "px");

      button.addEventListener("pointermove", function (e) {
        if (window.innerWidth < 821) return;
        var rect = button.getBoundingClientRect();
        var x = (e.clientX - rect.left - rect.width / 2) * 0.08;
        var y = (e.clientY - rect.top - rect.height / 2) * 0.08;
        xSetter(x);
        ySetter(y);
      });

      button.addEventListener("pointerleave", function () {
        gsap.to(button, { x: 0, y: 0, duration: 0.4, ease: "power2.out" });
      });
    });
  }

  /* ── Progress bar + heading swap (all non-index hero sections) ── */
  function setupHeroProgress() {
    if (prefersReducedMotion) return;
    var heroes = document.querySelectorAll(".hero");
    heroes.forEach(function (hero) {
      var bar = hero.querySelector(".hero-progress");
      var heading = hero.querySelector("h1[data-text-swap]");
      if (!bar || !heading) return;
      var originalText = heading.textContent.trim();
      var swapText = heading.getAttribute("data-text-swap");

      window.addEventListener("scroll", function () {
        var rect = hero.getBoundingClientRect();
        var progress = Math.max(0, Math.min(1, -rect.top / (rect.height + window.innerHeight)));
        bar.style.width = (progress * 100) + "%";
        if (progress >= 0.98 && swapText) {
          heading.textContent = swapText;
        } else {
          heading.textContent = originalText;
        }
      }, { passive: true });

      // Smooth fade-in for large background text
      var bg = hero.querySelector(".hero-bg-text");
      if (bg && typeof gsap !== "undefined") {
        gsap.fromTo(bg, { opacity: 0, scale: 0.95 }, { opacity: 0.08, scale: 1, duration: 1.2, ease: "power2.out", delay: 0.3 });
      }
    });
  }

  /* ── Floating mockup float animation ── */
  function setupFloatingMockups() {
    if (prefersReducedMotion) return;
    document.querySelectorAll(".floating-mockup").forEach(function (m, i) {
      gsap.to(m, {
        y: -14 + (i * 7),
        rotation: 1.5 - i,
        duration: 3.5 + i,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });
    });
  }



  /* ── Reference-style inner hero motion ── */
  function setupInnerHero() {
    var hero = document.querySelector('.inner-hero');
    if (!hero || typeof gsap === 'undefined') return;
    var projects = hero.querySelectorAll('.inner-hero-project');
    var bg = hero.querySelector('.inner-hero-bg-text');
    var title = hero.querySelector('h1');
    var text = hero.querySelector('p');
    var cats = hero.querySelectorAll('.inner-hero-cats .service-cat');
    var line = hero.querySelector('.inner-hero-line span');

    if (prefersReducedMotion) return;

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    gsap.set(projects, { opacity: 0, scale: .9 });
    gsap.set([title, text, line, cats], { opacity: 0, y: 24 });
    gsap.set(bg, { opacity: 0, scale: .94 });

    tl.to(bg, { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out' })
      .to(title, { opacity: 1, y: 0, duration: .8 }, '-=.65')
      .to(text, { opacity: 1, y: 0, duration: .65 }, '-=.5')
      .to(line, { opacity: 1, y: 0, duration: .45 }, '-=.35')
      .to(cats, { opacity: 1, y: 0, duration: .55, stagger: .08 }, '-=.25')
      .to(projects, { opacity: 1, scale: 1, duration: .85, stagger: .12, ease: 'back.out(1.15)' }, '-=.7');

    projects.forEach(function (project, i) {
      gsap.to(project, {
        y: i === 1 ? -10 : 10,
        duration: 3.2 + i * .5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: .9 + i * .15
      });
    });

    if (typeof ScrollTrigger !== 'undefined') {
      gsap.to(projects, {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 }
      });
      gsap.to(bg, {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 }
      });
    }
  }

  /* ── Init ── */
  document.addEventListener("DOMContentLoaded", function () {
    // Core interactions (always needed)
    setupMobileNav();
    setupContactForm();

    // Animation-only setup (guarded internally)
    setupHeroEntrance();
    setupInnerHero();
    setupHeroCarousel();
    setupReveal();
    setupGeometricOrnaments();
    setupFloatingMockups();
    setupHeroProgress();
    setupMagneticButtons();
    setupUpsideDown();
    restoreUpsideDownState();
  });

  /* ── Mobile nav (preserved from original) ── */
  function setupMobileNav() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.getElementById("mainNav");
    if (!toggle || !nav) return;

    function closeMenu() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    }

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("menu-open", isOpen);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (!nav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 820) closeMenu();
    });
  }

  /* ── Contact form (preserved from original) ── */
  function setupContactForm() {
    var form = document.getElementById("contactForm");
    var message = document.getElementById("formMessage");
    if (!form || !message) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      message.className = "";
      message.textContent = "";

      var name = form.elements.name.value.trim();
      var contact = form.elements.contact.value.trim();
      var business = form.elements.business.value.trim();
      var service = form.elements.service.value;
      var enquiry = form.elements.message.value.trim();

      var looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
      var looksLikePhone = /^[+()\d\s.-]{7,}$/.test(contact);

      if (!name || !contact || !service || !enquiry) {
        message.className = "error";
        message.textContent = "Please complete all required fields.";
        return;
      }

      if (!looksLikeEmail && !looksLikePhone) {
        message.className = "error";
        message.textContent = "Enter a valid email address or phone number.";
        form.elements.contact.focus();
        return;
      }

      var subject = encodeURIComponent("BuzzyBiz enquiry — " + service);
      var body = encodeURIComponent(
        "Name: " + name + "\n" +
        "Contact: " + contact + "\n" +
        "Business: " + (business || "Not provided") + "\n" +
        "Service: " + service + "\n\n" +
        "Message:\n" + enquiry
      );

      window.location.href = "mailto:hello@buzzybiz.com?subject=" + subject + "&body=" + body;
      message.className = "success";
      message.textContent = "Your email app should open with the enquiry ready to send.";
    });
  }
})();

/* =========================================================
   UPSIDE DOWN MODE
   ========================================================= */

function setupUpsideDown() {

  var trigger = document.getElementById("upsideTrigger");
  var modal = document.getElementById("upsideModal");
  var noButton = document.getElementById("upsideNo");
  var yesButton = document.getElementById("upsideYes");

  if (!trigger || !modal || !noButton || !yesButton) return;

  /* Prevent duplicate setup */
  if (trigger.dataset.upsideReady === "true") return;

  trigger.dataset.upsideReady = "true";


  /* =======================================================
     UPSIDE DOWN BUTTON
     ======================================================= */

  trigger.addEventListener("click", function (event) {
  event.preventDefault();
  event.stopPropagation();

  if (document.documentElement.classList.contains("upside-down")) {
    toggleUpsideDown();
    return;
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
});


  /* =======================================================
     NO BUTTON
     ======================================================= */

  noButton.addEventListener("click", function (event) {

    event.preventDefault();
    event.stopPropagation();

    closeUpsideWarning();

  });


  /* =======================================================
     YES BUTTON
     ======================================================= */

  yesButton.addEventListener("click", function (event) {

    event.preventDefault();
    event.stopPropagation();

    var warning =
      modal.querySelector(".upside-warning");

    if (!warning) return;

    /* Prevent double clicking */
    if (
      warning.classList.contains("upside-shatter")
    ) {
      return;
    }

    createUpsidePieces(warning);

    warning.classList.add("upside-shatter");

    setTimeout(function () {

    closeUpsideWarning();

    startUpsideEntryTransition();

  }, 700);

  });


  /* =======================================================
     CLICK OUTSIDE WARNING
     ======================================================= */

  modal.addEventListener("click", function (event) {

    if (event.target === modal) {
      closeUpsideWarning();
    }

  });


  /* Initialize chaos listeners ONCE */
  setupUpsideDownChaos();

}


/* =========================================================
   CLOSE WARNING
   ========================================================= */

function closeUpsideWarning() {

  var modal =
    document.getElementById("upsideModal");

  if (!modal) return;

  modal.classList.remove("is-open");

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  var warning =
    modal.querySelector(".upside-warning");

  if (warning) {

    warning.classList.remove(
      "upside-shatter"
    );

  }

}


/* =========================================================
   TOGGLE UPSIDE DOWN
   ========================================================= */

function toggleUpsideDown() {

  var html = document.documentElement;


  /* =======================================================
     RETURN TO NORMAL
     ======================================================= */

  if (
    html.classList.contains("upside-down")
  ) {

    html.classList.remove(
      "upside-down"
    );

    sessionStorage.removeItem(
      "buzzyUpsideDown"
    );

    closeUpsideWarning();


    /* Restore moved elements */
    document.querySelectorAll(
      "[data-upside-moved='true']"
    ).forEach(function (element) {

      element.style.position = "";
      element.style.left = "";
      element.style.top = "";
      element.style.zIndex = "";

      element.removeAttribute(
        "data-upside-moved"
      );

    });


    /* Restore destroyed elements */
    document.querySelectorAll(
      "[data-upside-destroyed='true']"
    ).forEach(function (element) {

      element.style.visibility = "";

      element.removeAttribute(
        "data-upside-destroyed"
      );

    });


    /* Remove leftover explosion pieces */
    document.querySelectorAll(
      ".upside-button-piece, .upside-piece"
    ).forEach(function (piece) {

      piece.remove();

    });

    return;
  }


  /* =======================================================
     ENTER UPSIDE DOWN
     ======================================================= */

  html.classList.add(
    "upside-down"
  );

  sessionStorage.setItem(
    "buzzyUpsideDown",
    "true"
  );

}


/* =========================================================
   RESTORE AFTER PAGE CHANGE / REFRESH
   ========================================================= */

function restoreUpsideDownState() {

  if (
    sessionStorage.getItem(
      "buzzyUpsideDown"
    ) === "true"
  ) {

    document.documentElement
      .classList
      .add("upside-down");

  }

}


/* =========================================================
   WARNING SHATTER EFFECT
   ========================================================= */

function createUpsidePieces(element) {

  var rect =
    element.getBoundingClientRect();

  var pieces = 180;


  for (var i = 0; i < pieces; i++) {

    var piece =
      document.createElement("span");

    piece.className =
      "upside-piece";


    piece.style.left =
      (
        rect.left +
        Math.random() * rect.width
      ) + "px";


    piece.style.top =
      (
        rect.top +
        Math.random() * rect.height
      ) + "px";


    piece.style.setProperty(
      "--x",
      (
        (Math.random() - 0.5) *
        window.innerWidth *
        1.5
      ) + "px"
    );


    piece.style.setProperty(
      "--y",
      (
        (Math.random() - 0.5) *
        window.innerHeight *
        1.5
      ) + "px"
    );


    piece.style.setProperty(
      "--r",
      (
        (Math.random() - 0.5) *
        1440
      ) + "deg"
    );


    piece.style.width =
      (3 + Math.random() * 10) + "px";

    piece.style.height =
      (3 + Math.random() * 10) + "px";


    document.body.appendChild(piece);


    setTimeout(function () {

      if (piece.parentNode) {
        piece.remove();
      }

    }, 1000);

  }

}

/* =========================================================
   UPSIDE DOWN ENTRY TRANSITION
   ========================================================= */

function startUpsideEntryTransition() {

  var transition = document.createElement("div");

  transition.className = "upside-entry-transition";

  transition.innerHTML = `
    <div class="upside-entry-portal"></div>

    <div
      class="upside-entry-text"
      data-text="ENTERING THE UPSIDE DOWN..."
    >
      ENTERING THE UPSIDE DOWN...
    </div>
  `;

  document.body.appendChild(transition);

  /* Start animation */
  requestAnimationFrame(function () {
    transition.classList.add("is-active");
  });

  /*
     Activate the actual Upside Down mode
     near the end of the transition.
  */
  setTimeout(function () {

    document.documentElement.classList.add(
      "upside-down"
    );

    sessionStorage.setItem(
      "buzzyUpsideDown",
      "true"
    );

  }, 1100);

  /*
     Remove transition completely
     after animation finishes.
  */
  setTimeout(function () {

    if (transition.parentNode) {
      transition.remove();
    }

  }, 2000);
}

/* =========================================================
   UPSIDE DOWN CHAOS
   ========================================================= */

var upsideChaosInitialized = false;


function setupUpsideDownChaos() {

  if (upsideChaosInitialized) return;

  upsideChaosInitialized = true;


  /* Desktop */
  setupReverseScroll();

  setupEscapingButtons();

  setupDestroyButtons();


  /* Tablet + Phone */
  setupTouchChaos();

}


/* =========================================================
   REVERSE SCROLL
   ========================================================= */

function setupReverseScroll() {

  window.addEventListener(
    "wheel",
    function (event) {

      if (
        !document.documentElement
          .classList
          .contains("upside-down")
      ) {
        return;
      }

      /* Desktop only */
      if (window.innerWidth <= 1100) {
        return;
      }

      event.preventDefault();

      window.scrollBy({
        top: -event.deltaY * 1.5,
        left: 0,
        behavior: "auto"
      });

    },
    {
      passive: false
    }
  );

}


function setupEscapingButtons() {

  document.addEventListener(
    "mouseover",
    function (event) {

      if (
        !document.documentElement
          .classList
          .contains("upside-down")
      ) {
        return;
      }

      if (window.innerWidth <= 1100) {
        return;
      }

      var button = event.target.closest(
        "button:not(.upside-trigger):not(.upside-no):not(.upside-yes)"
      );

      if (!button) {
        return;
      }

      if (button.id === "upsideTrigger") {
        return;
      }

      if (
        button.dataset.upsideDestroyed === "true"
      ) {
        return;
      }

      /* Prevent repeatedly triggering while moving
         around inside the same button */
      if (
        event.relatedTarget &&
        button.contains(event.relatedTarget)
      ) {
        return;
      }

      var rect =
        button.getBoundingClientRect();

      var moveX =
        (Math.random() - 0.5) * 220;

      var moveY =
        (Math.random() - 0.5) * 140;

      var newX =
        rect.left + moveX;

      var newY =
        rect.top + moveY;

      newX = Math.max(
        10,
        Math.min(
          window.innerWidth -
            rect.width -
            10,
          newX
        )
      );

      newY = Math.max(
        10,
        Math.min(
          window.innerHeight -
            rect.height -
            10,
          newY
        )
      );

      button.style.position = "fixed";
      button.style.left = newX + "px";
      button.style.top = newY + "px";
      button.style.zIndex = "99998";

      button.dataset.upsideMoved = "true";

    },
    true
  );

}


/* =========================================================
   DESKTOP BUTTON DESTRUCTION
   ========================================================= */

function setupDestroyButtons() {

  document.addEventListener(
    "click",
    function (event) {

      if (
        !document.documentElement
          .classList
          .contains("upside-down")
      ) {
        return;
      }


      /* Desktop only */
      if (window.innerWidth <= 1100) {
        return;
      }


      var element =
        event.target.closest(
          "button:not(.upside-trigger):not(.upside-no):not(.upside-yes), " +
          "a.cta-button, " +
          "a.submit-button"
        );


      if (!element) return;


      /* ? button must NEVER destroy itself */
      if (
        element.id === "upsideTrigger"
      ) {
        return;
      }


      /* Already destroyed */
      if (
        element.dataset.upsideDestroyed === "true"
      ) {
        return;
      }


      event.preventDefault();
      event.stopImmediatePropagation();


      destroyUpsideButton(element);

    },
    true
  );

}


/* =========================================================
   TABLET + PHONE TOUCH CHAOS
   ========================================================= */

function setupTouchChaos() {

  document.addEventListener(
    "touchstart",
    function (event) {

      if (
        !document.documentElement
          .classList
          .contains("upside-down")
      ) {
        return;
      }


      /* Tablet + phone only */
      if (window.innerWidth > 1100) {
        return;
      }


      var target = event.target;


      /* ? button must ALWAYS remain usable */
      if (
        target.closest("#upsideTrigger")
      ) {
        return;
      }


      /* Ignore warning buttons */
      if (
        target.closest(".upside-no") ||
        target.closest(".upside-yes")
      ) {
        return;
      }


      /* ===================================================
         BUTTON TAP = EXPLOSION
         =================================================== */

      var button =
        target.closest(
          "button:not(.upside-trigger):not(.upside-no):not(.upside-yes), " +
          "a.cta-button, " +
          "a.submit-button"
        );


      if (button) {

        event.preventDefault();
        event.stopImmediatePropagation();

        destroyUpsideButton(button);

        return;
      }


      /* ===================================================
         CARD TAP = GLITCH
         =================================================== */

      var card =
        target.closest(
          ".service-card, " +
          ".portfolio-card, " +
          ".testimonial-card, " +
          ".project-card, " +
          ".feature-card"
        );


      if (card) {

        makeUpsideCardGlitch(card);

      }

    },
    {
      passive: false,
      capture: true
    }
  );

}


/* =========================================================
   MOBILE / TABLET CARD GLITCH
   ========================================================= */

function makeUpsideCardGlitch(card) {

  if (!card) return;


  /* Don't stack animations */
  if (
    card.classList.contains(
      "upside-card-glitch"
    )
  ) {
    return;
  }


  card.classList.add(
    "upside-card-glitch"
  );


  var x =
    (Math.random() - 0.5) * 18;

  var y =
    (Math.random() - 0.5) * 12;

  var r =
    (Math.random() - 0.5) * 5;


  card.style.setProperty(
    "--upside-x",
    x + "px"
  );

  card.style.setProperty(
    "--upside-y",
    y + "px"
  );

  card.style.setProperty(
    "--upside-r",
    r + "deg"
  );


  setTimeout(function () {

    card.classList.remove(
      "upside-card-glitch"
    );

  }, 450);

}


/* =========================================================
   BUTTON EXPLOSION
   ========================================================= */

function destroyUpsideButton(button) {

  if (!button) return;


  var rect =
    button.getBoundingClientRect();


  /*
   * Hide instead of deleting.
   * This allows the button to be restored
   * when Upside Down is turned off.
   */

  button.dataset.upsideDestroyed =
    "true";

  button.style.visibility =
    "hidden";


  var pieces = 35;


  for (var i = 0; i < pieces; i++) {

    var piece =
      document.createElement("span");


    piece.className =
      "upside-button-piece";


    piece.style.left =
      (
        rect.left +
        Math.random() * rect.width
      ) + "px";


    piece.style.top =
      (
        rect.top +
        Math.random() * rect.height
      ) + "px";


    piece.style.setProperty(
      "--x",
      (
        (Math.random() - 0.5) * 500
      ) + "px"
    );


    piece.style.setProperty(
      "--y",
      (
        (Math.random() - 0.5) * 400
      ) + "px"
    );


    piece.style.setProperty(
      "--r",
      (
        (Math.random() - 0.5) * 1000
      ) + "deg"
    );


    document.body.appendChild(
      piece
    );


    setTimeout(function () {

      if (piece.parentNode) {
        piece.remove();
      }

    }, 900);

  }

}

/* BuzzyBiz home showcase: fixed pointer targets + one-way selection. */
(function setupBuzzyBizShowcase(){
  const root = document.querySelector('.bz-showcase');
  if (!root) return;
  const buttons = Array.from(root.querySelectorAll('.bz-service-item[data-service]'));
  const panel = root.querySelector('[data-service-panel]');
  const bg = root.querySelector('.bz-showcase-bg');
  const number = root.querySelector('.bz-panel-number');
  const title = root.querySelector('[data-panel-title]');
  const copy = root.querySelector('[data-panel-copy]');
  const points = root.querySelector('[data-panel-points]');
  const link = root.querySelector('[data-panel-link]');
  if (!buttons.length || !panel || !bg || !number || !title || !copy || !points || !link) return;

  const data = {
    seo:{number:'01',title:'SEO Optimization',copy:'Improve search visibility, strengthen relevance, and attract people already looking for what the business offers.',points:['Technical and on-page SEO improvements','Keyword and content direction','Search visibility focused on useful traffic'],href:'services.html#seo',image:'assets/images/bz-service-seo.svg'},
    gbp:{number:'02',title:'Google Business Profile',copy:'Make the business easier to discover in local Search and Maps with a clearer, more useful profile.',points:['Profile optimization and local relevance','Business information and content direction','Stronger local discovery signals'],href:'services.html#gbp',image:'assets/images/bz-service-gbp.svg'},
    linkedin:{number:'03',title:'LinkedIn Management',copy:'Build a consistent professional presence that communicates expertise and keeps the brand active.',points:['Profile and company presence management','Content planning and publishing','Consistent professional positioning'],href:'services.html#linkedin',image:'assets/images/bz-service-linkedin.svg'},
    social:{number:'04',title:'Social Media Management',copy:'Plan and manage social content that keeps the brand recognizable, useful, and connected with its audience.',points:['Content planning and scheduling','Brand-consistent communication','Ongoing social presence management'],href:'services.html#social',image:'assets/images/bz-service-social.svg'},
    website:{number:'05',title:'Website Creation',copy:'Create responsive websites that communicate clearly, feel trustworthy, and guide visitors toward action.',points:['Responsive page structure and UI','Clear content and conversion paths','Professional, maintainable front-end build'],href:'services.html#website',image:'assets/images/bz-service-website.svg'}
  };
  let active='seo';
  let timer=null;
  function select(key){
    if (!data[key] || key===active) return;
    active=key;
    const d=data[key];
    buttons.forEach(btn=>{const on=btn.dataset.service===key; btn.classList.toggle('is-active',on); btn.setAttribute('aria-selected',String(on));});
    panel.classList.add('is-changing');
    number.textContent=d.number; title.textContent=d.title; copy.textContent=d.copy; link.href=d.href;
    points.innerHTML=d.points.map(p=>`<li>${p}</li>`).join('');
    bg.style.backgroundImage=`url("${d.image}")`;
    window.setTimeout(()=>panel.classList.remove('is-changing'),260);
  }
  buttons.forEach(btn=>{
    btn.addEventListener('pointerenter',()=>{ clearTimeout(timer); select(btn.dataset.service); },{passive:true});
    btn.addEventListener('focus',()=>select(btn.dataset.service));
    btn.addEventListener('click',()=>select(btn.dataset.service));
    btn.addEventListener('keydown',e=>{
      if(e.key==='Enter' || e.key===' '){ e.preventDefault(); select(btn.dataset.service); return; }
      if(e.key==='ArrowDown'||e.key==='ArrowRight'||e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault(); const i=buttons.indexOf(btn); const dir=(e.key==='ArrowDown'||e.key==='ArrowRight')?1:-1; buttons[(i+dir+buttons.length)%buttons.length].focus(); }
    });
  });
})();


/* ============================================================
   Mobile Nurturing service accordion
   ============================================================ */
(function setupMobileNurturingAccordion() {
  const mq = window.matchMedia('(max-width: 700px)');

  function getShowcase() {
    return document.querySelector('.bz-showcase');
  }

  function getItems(showcase) {
    return showcase ? Array.from(showcase.querySelectorAll('.bz-service-item')) : [];
  }

  function getPanel(showcase) {
    return showcase ? showcase.querySelector('.bz-showcase-panel') : null;
  }

  function getItemTitle(item) {
    const el = item.querySelector('.bz-service-name, .service-name, h3, h4');
    return el ? el.textContent.trim() : 'Service';
  }

  function getItemKey(item, index) {
    return item.dataset.service || item.dataset.serviceKey || String(index);
  }

  function findPanelData(panel, key, index) {
    if (!panel) return { background: '', title: '', description: '', points: [] };

    const source = panel.querySelector(`[data-service="${CSS.escape(key)}"]`);
    const el = source || panel;

    const bg = getComputedStyle(el).backgroundImage;
    const img = el.querySelector('img');
    const title = el.querySelector('h2, h3, h4');
    const desc = el.querySelector('p');
    const pointEls = Array.from(el.querySelectorAll('li, .point, .service-point'));

    let background = '';
    if (bg && bg !== 'none') {
      const match = bg.match(/url\(["']?(.*?)["']?\)/);
      if (match) background = match[1];
    }
    if (!background && img) background = img.currentSrc || img.src || '';

    return {
      background,
      title: title ? title.textContent.trim() : '',
      description: desc ? desc.textContent.trim() : '',
      points: pointEls.slice(0, 4).map(p => p.textContent.trim()).filter(Boolean)
    };
  }

  function createPanel(item, index, panel) {
    let wrap = item.nextElementSibling;
    if (wrap && wrap.classList.contains('bz-mobile-accordion-panel')) return wrap;

    wrap = document.createElement('div');
    wrap.className = 'bz-mobile-accordion-panel';

    const inner = document.createElement('div');
    inner.className = 'bz-mobile-accordion-panel-inner';

    const visual = document.createElement('div');
    visual.className = 'bz-mobile-accordion-visual';

    const copy = document.createElement('div');
    copy.className = 'bz-mobile-accordion-copy';

    const data = findPanelData(panel, getItemKey(item, index), index);
    const fallbackTitle = getItemTitle(item);

    if (data.background) {
      visual.style.backgroundImage = `url("${data.background.replace(/"/g, '\\"')}")`;
    }

    copy.innerHTML = `
      <h3></h3>
      <p></p>
      <div class="bz-mobile-points"></div>
    `;

    copy.querySelector('h3').textContent = data.title || fallbackTitle;
    copy.querySelector('p').textContent = data.description || '';
    const points = copy.querySelector('.bz-mobile-points');
    data.points.forEach(point => {
      const span = document.createElement('span');
      span.className = 'bz-mobile-point';
      span.textContent = point;
      points.appendChild(span);
    });

    visual.appendChild(copy);
    inner.appendChild(visual);
    wrap.appendChild(inner);

    item.parentNode.insertBefore(wrap, item.nextSibling);
    return wrap;
  }

  function closeAll(items) {
    items.forEach((item, index) => {
      item.classList.remove('is-mobile-open');
      item.setAttribute('aria-expanded', 'false');

      const btn = item.querySelector('.bz-mobile-accordion-control');
      if (btn) {
        btn.setAttribute('aria-expanded', 'false');
        const plus = btn.querySelector('.bz-mobile-accordion-plus');
        if (plus) plus.textContent = '+';
      }

      const panel = item.nextElementSibling;
      if (panel && panel.classList.contains('bz-mobile-accordion-panel')) {
        panel.classList.remove('is-open');
      }
    });
  }

  function toggle(item, index, items, desktopPanel) {
    const alreadyOpen = item.classList.contains('is-mobile-open');
    closeAll(items);

    if (alreadyOpen) return;

    const mobilePanel = createPanel(item, index, desktopPanel);
    item.classList.add('is-mobile-open');
    item.setAttribute('aria-expanded', 'true');

    const btn = item.querySelector('.bz-mobile-accordion-control');
    if (btn) {
      btn.setAttribute('aria-expanded', 'true');
      const plus = btn.querySelector('.bz-mobile-accordion-plus');
      if (plus) plus.textContent = '−';
    }

    requestAnimationFrame(() => mobilePanel.classList.add('is-open'));
  }

  function init() {
    const showcase = getShowcase();
    if (!showcase) return;

    const items = getItems(showcase);
    const panel = getPanel(showcase);

    items.forEach((item, index) => {
      if (item.dataset.mobileAccordionReady === 'true') return;
      item.dataset.mobileAccordionReady = 'true';
      item.setAttribute('aria-expanded', 'false');

      const button = item.querySelector('.bz-mobile-accordion-control');
      if (!button) return;

      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (mq.matches) toggle(item, index, items, panel);
      });
    });
  }

  init();

  if (mq.addEventListener) {
    mq.addEventListener('change', () => {
      if (!mq.matches) {
        const showcase = getShowcase();
        if (showcase) closeAll(getItems(showcase));
      }
    });
  } else {
    window.addEventListener('resize', () => {
      if (!mq.matches) {
        const showcase = getShowcase();
        if (showcase) closeAll(getItems(showcase));
      }
    });
  }
})();

/* =========================================================
   BuzzyBiz 5-second enquiry popup
   ========================================================= */
(function () {
  function setupBuzzyEnquiryPopup() {
    var overlay = document.getElementById("bzEnquiryOverlay");
    var close = document.getElementById("bzEnquiryClose");
    var form = document.getElementById("bzEnquiryForm");
    var message = document.getElementById("bzFormMessage");
    if (!overlay || !close || !form || !message) return;

    var opened = false;
    var popupSeenKey = "buzzybiz_enquiry_popup_seen";

    var savedScrollY = 0;

function lockPageScroll() {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
}

function unlockPageScroll() {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
}

    function hasSeenPopup() {
      try { return sessionStorage.getItem(popupSeenKey) === "1"; }
      catch (e) { return false; }
    }

    function markPopupSeen() {
      try { sessionStorage.setItem(popupSeenKey, "1"); }
      catch (e) {}
    }

    function openPopup() {
      if (opened || hasSeenPopup()) return;
      opened = true;
      markPopupSeen();
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");

      lockPageScroll();
      setTimeout(function () {
        var first = document.getElementById("bzName");
        if (first) first.focus();
      }, 50);
    }
    function closePopup() {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");

      unlockPageScroll();
    }

    var timer = window.setTimeout(openPopup, 5000);
    close.addEventListener("click", closePopup);
    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) closePopup();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && overlay.classList.contains("is-open")) closePopup();
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      message.className = "bz-form-message";
      message.textContent = "";

      var name = form.elements.name.value.trim();
      var contact = form.elements.contact.value.trim();
      var business = form.elements.business.value.trim();
      var service = form.elements.service.value;
      var enquiry = form.elements.message.value.trim();
      var looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
      var looksLikePhone = /^[+()\d\s.-]{7,}$/.test(contact);

      if (!name || !contact || !service || !enquiry) {
        message.classList.add("error");
        message.textContent = "Please complete all required fields.";
        return;
      }
      if (!looksLikeEmail && !looksLikePhone) {
        message.classList.add("error");
        message.textContent = "Enter a valid email address or phone number.";
        form.elements.contact.focus();
        return;
      }

      var subject = encodeURIComponent("BuzzyBiz enquiry — " + service);
      var body = encodeURIComponent(
        "Name: " + name + "\n" +
        "Contact: " + contact + "\n" +
        "Business: " + (business || "Not provided") + "\n" +
        "Service: " + service + "\n\n" +
        "Message:\n" + enquiry
      );
      window.location.href = "mailto:hello@buzzybiz.com?subject=" + subject + "&body=" + body;
      message.classList.add("success");
      message.textContent = "Your email app should open with the enquiry ready to send.";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupBuzzyEnquiryPopup);
  } else {
    setupBuzzyEnquiryPopup();
  }
})();
