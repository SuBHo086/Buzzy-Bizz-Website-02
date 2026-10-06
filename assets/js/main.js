/*!
 * BuzzyBiz — main.js (cleaned)
 *
 * Needs only GSAP (optional). ScrollTrigger is no longer used: remove its
 * <script> tag from every page. If GSAP fails to load, the site still works
 * (nav, forms, popup, showcase, carousel); only the entrance/ornament
 * animations are skipped.
 */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Config
     ------------------------------------------------------------------ */
  var NAV_BREAKPOINT = 1100;            // keep in sync with the CSS
  var POPUP_DELAY_MS = 5000;
  var POPUP_SEEN_KEY = "buzzybiz_enquiry_popup_seen";
  var CONTACT_EMAIL = "hello@buzzybiz.com";
  // Set to a form-service URL (Formspree, Basin, your own API...) to POST
  // enquiries as JSON. Leave empty to fall back to a mailto: link.
  var FORM_ENDPOINT = "";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canAnimate = typeof window.gsap !== "undefined" && !reduceMotion;

  var SERVICES = {
    seo: {
      number: "01", title: "SEO Optimization",
      copy: "Improve search visibility, strengthen relevance, and attract people already looking for what the business offers.",
      points: ["Technical and on-page SEO improvements", "Keyword and content direction", "Search visibility focused on useful traffic"],
      href: "services.html#seo", image: "assets/images/bz-service-seo.svg"
    },
    gbp: {
      number: "02", title: "Google Business Profile",
      copy: "Make the business easier to discover in local Search and Maps with a clearer, more useful profile.",
      points: ["Profile optimization and local relevance", "Business information and content direction", "Stronger local discovery signals"],
      href: "services.html#gbp", image: "assets/images/bz-service-gbp.svg"
    },
    linkedin: {
      number: "03", title: "LinkedIn Management",
      copy: "Build a consistent professional presence that communicates expertise and keeps the brand active.",
      points: ["Profile and company presence management", "Content planning and publishing", "Consistent professional positioning"],
      href: "services.html#linkedin", image: "assets/images/bz-service-linkedin.svg"
    },
    social: {
      number: "04", title: "Social Media Management",
      copy: "Plan and manage social content that keeps the brand recognizable, useful, and connected with its audience.",
      points: ["Content planning and scheduling", "Brand-consistent communication", "Ongoing social presence management"],
      href: "services.html#social", image: "assets/images/bz-service-social.svg"
    },
    website: {
      number: "05", title: "Website Creation",
      copy: "Create responsive websites that communicate clearly, feel trustworthy, and guide visitors toward action.",
      points: ["Responsive page structure and UI", "Clear content and conversion paths", "Professional, maintainable front-end build"],
      href: "services.html#website", image: "assets/images/bz-service-website.svg"
    }
  };

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */
  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function safeStorage(action, key, value) {
    try {
      if (action === "get") return window.sessionStorage.getItem(key);
      window.sessionStorage.setItem(key, value);
    } catch (e) { /* private mode / blocked storage */ }
    return null;
  }

  /* ------------------------------------------------------------------
     Mobile / tablet navigation
     ------------------------------------------------------------------ */
  function setupNav() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.getElementById("mainNav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      document.body.classList.toggle("menu-open", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setOpen(false); });
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (!nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > NAV_BREAKPOINT) setOpen(false);
    });
  }

  /* ------------------------------------------------------------------
     Enquiry forms (contact page + popup share one handler)
     ------------------------------------------------------------------ */
  function setStatus(node, type, text) {
    node.classList.remove("success", "error");
    if (type) node.classList.add(type);
    node.textContent = text || "";
  }

  function bindEnquiryForm(form, statusNode) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      setStatus(statusNode, "", "");

      var f = form.elements;
      var serviceSelect = f.namedItem("service");
      var data = {
        name: f.namedItem("name").value.trim(),
        contact: f.namedItem("contact").value.trim(),
        business: f.namedItem("business").value.trim(),
        service: serviceSelect.value,
        serviceLabel: serviceSelect.selectedIndex > -1 ? serviceSelect.options[serviceSelect.selectedIndex].text : "",
        message: f.namedItem("message").value.trim()
      };

      if (!data.name || !data.contact || !data.service || !data.message) {
        setStatus(statusNode, "error", "Please complete all required fields.");
        return;
      }

      var looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact);
      var looksLikePhone = /^[+()\d\s.-]{7,}$/.test(data.contact);
      if (!looksLikeEmail && !looksLikePhone) {
        setStatus(statusNode, "error", "Enter a valid email address or phone number.");
        f.namedItem("contact").focus();
        return;
      }

      if (FORM_ENDPOINT) {
        fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(data)
        }).then(function (response) {
          if (!response.ok) throw new Error("Request failed");
          form.reset();
          setStatus(statusNode, "success", "Thanks! Your enquiry has been sent. We'll be in touch soon.");
        }).catch(function () {
          setStatus(statusNode, "error", "Something went wrong. Please email " + CONTACT_EMAIL + " instead.");
        });
        return;
      }

      var subject = encodeURIComponent("BuzzyBiz enquiry — " + data.serviceLabel);
      var body = encodeURIComponent(
        "Name: " + data.name + "\n" +
        "Contact: " + data.contact + "\n" +
        "Business: " + (data.business || "Not provided") + "\n" +
        "Service: " + data.serviceLabel + "\n\n" +
        "Message:\n" + data.message
      );
      window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;
      setStatus(statusNode, "success", "Your email app should open with the enquiry ready to send. If it doesn't, email " + CONTACT_EMAIL + ".");
    });
  }

  function setupContactForm() {
    var form = document.getElementById("contactForm");
    var status = document.getElementById("formMessage");
    if (form && status) bindEnquiryForm(form, status);
  }

  /* ------------------------------------------------------------------
     Enquiry popup (skipped on the contact page, focus-trapped, restores focus)
     ------------------------------------------------------------------ */
  function setupEnquiryPopup() {
    var overlay = document.getElementById("bzEnquiryOverlay");
    var closeBtn = document.getElementById("bzEnquiryClose");
    var form = document.getElementById("bzEnquiryForm");
    var status = document.getElementById("bzFormMessage");
    if (!overlay || !closeBtn || !form || !status) return;

    // The contact page already has the form; don't interrupt it.
    if (document.getElementById("contactForm")) return;

    bindEnquiryForm(form, status);

    var opened = false;
    var lastFocus = null;

    function focusables() {
      return Array.prototype.slice.call(
        overlay.querySelectorAll("button, input, select, textarea, a[href]")
      ).filter(function (node) { return !node.disabled && node.offsetParent !== null; });
    }

    function openPopup() {
      if (opened || safeStorage("get", POPUP_SEEN_KEY) === "1") return;
      // Don't pop over an open mobile menu.
      if (document.body.classList.contains("menu-open")) return;
      opened = true;
      safeStorage("set", POPUP_SEEN_KEY, "1");
      lastFocus = document.activeElement;
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      var first = document.getElementById("bzName");
      if (first) first.focus();
    }

    function closePopup() {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      if (lastFocus && document.contains(lastFocus) && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
    }

    window.setTimeout(openPopup, POPUP_DELAY_MS);

    closeBtn.addEventListener("click", closePopup);
    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) closePopup();
    });

    document.addEventListener("keydown", function (event) {
      if (!overlay.classList.contains("is-open")) return;
      if (event.key === "Escape") { closePopup(); return; }
      if (event.key !== "Tab") return;

      var items = focusables();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /* ------------------------------------------------------------------
     Home: service showcase
     Desktop  (>1100px): hover/focus/click swaps the dark panel.
     Tablet/phone      : each row is an accordion that opens a card under it.
     ARIA is set here so the markup doesn't need role="tab" without a tablist.
     ------------------------------------------------------------------ */
  function setupShowcase() {
    var root = document.querySelector(".bz-showcase");
    if (!root) return;

    var list = root.querySelector(".bz-service-list");
    var items = Array.prototype.slice.call(root.querySelectorAll(".bz-service-item[data-service]"));
    var panel = root.querySelector("[data-service-panel]");
    var bg = root.querySelector(".bz-showcase-bg");
    var number = root.querySelector(".bz-panel-number");
    var title = root.querySelector("[data-panel-title]");
    var copy = root.querySelector("[data-panel-copy]");
    var points = root.querySelector("[data-panel-points]");
    var link = root.querySelector("[data-panel-link]");
    if (!list || !items.length || !panel || !bg || !number || !title || !copy || !points || !link) return;

    var mq = window.matchMedia("(max-width: " + NAV_BREAKPOINT + "px)");
    var active = null;
    var changeTimer = null;

    /* --- semantics: a group of buttons, not a half-built tablist --- */
    list.setAttribute("role", "group");
    panel.setAttribute("aria-live", "polite");
    items.forEach(function (item) {
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");
      item.removeAttribute("aria-selected");
      var ctrl = item.querySelector(".bz-mobile-accordion-control");
      if (ctrl) {
        ctrl.removeAttribute("role");
        ctrl.removeAttribute("tabindex");
        ctrl.removeAttribute("aria-label");
        ctrl.removeAttribute("aria-expanded");
        ctrl.setAttribute("aria-hidden", "true");
      }
    });

    function syncAria() {
      items.forEach(function (item) {
        if (mq.matches) {
          item.removeAttribute("aria-pressed");
          item.setAttribute("aria-expanded", String(item.classList.contains("is-mobile-open")));
        } else {
          item.removeAttribute("aria-expanded");
          item.setAttribute("aria-pressed", String(item.dataset.service === active));
        }
      });
    }

    /* --- desktop: swap the panel --- */
    function select(key) {
      var d = SERVICES[key];
      if (!d || key === active) return;
      active = key;
      items.forEach(function (item) {
        item.classList.toggle("is-active", item.dataset.service === key);
      });
      panel.classList.add("is-changing");
      number.textContent = d.number;
      title.textContent = d.title;
      copy.textContent = d.copy;
      link.href = d.href;
      points.textContent = "";
      d.points.forEach(function (text) {
        var li = el("li");
        li.textContent = text;
        points.appendChild(li);
      });
      bg.style.backgroundImage = 'url("' + d.image + '")';
      window.clearTimeout(changeTimer);
      changeTimer = window.setTimeout(function () { panel.classList.remove("is-changing"); }, 260);
      syncAria();
    }

    /* --- tablet/phone: accordion --- */
    function buildMobilePanel(item) {
      var next = item.nextElementSibling;
      if (next && next.classList.contains("bz-mobile-accordion-panel")) return next;

      var d = SERVICES[item.dataset.service];
      var wrap = el("div", "bz-mobile-accordion-panel");
      var inner = el("div", "bz-mobile-accordion-panel-inner");
      var visual = el("div", "bz-mobile-accordion-visual");
      var body = el("div", "bz-mobile-accordion-copy");
      var h3 = el("h3");
      var p = el("p");
      var pts = el("div", "bz-mobile-points");

      wrap.setAttribute("aria-hidden", "true");
      visual.style.backgroundImage = 'url("' + d.image + '")';
      h3.textContent = d.title;
      p.textContent = d.copy;
      d.points.forEach(function (text) {
        var span = el("span", "bz-mobile-point");
        span.textContent = text;
        pts.appendChild(span);
      });

      body.appendChild(h3);
      body.appendChild(p);
      body.appendChild(pts);
      visual.appendChild(body);
      inner.appendChild(visual);
      wrap.appendChild(inner);
      item.parentNode.insertBefore(wrap, item.nextSibling);
      return wrap;
    }

    function setRowOpen(item, open) {
      item.classList.toggle("is-mobile-open", open);
      var plus = item.querySelector(".bz-mobile-accordion-plus");
      if (plus) plus.textContent = open ? "\u2212" : "+";
      var next = item.nextElementSibling;
      if (next && next.classList.contains("bz-mobile-accordion-panel")) {
        next.classList.toggle("is-open", open);
        next.setAttribute("aria-hidden", String(!open));
      }
    }

    function closeAll() {
      items.forEach(function (item) { setRowOpen(item, false); });
    }

    function toggleRow(item) {
      var wasOpen = item.classList.contains("is-mobile-open");
      closeAll();
      if (!wasOpen) {
        var wrap = buildMobilePanel(item);
        setRowOpen(item, true);
        // next frame so the grid-rows transition actually runs
        window.requestAnimationFrame(function () { wrap.classList.add("is-open"); });
      }
      syncAria();
    }

    function activate(item) {
      if (mq.matches) toggleRow(item);
      else select(item.dataset.service);
    }

    items.forEach(function (item) {
      item.addEventListener("click", function () { activate(item); });

      item.addEventListener("pointerenter", function (event) {
        if (!mq.matches && event.pointerType === "mouse") select(item.dataset.service);
      }, { passive: true });

      item.addEventListener("focus", function () {
        if (!mq.matches) select(item.dataset.service);
      });

      item.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate(item);
          return;
        }
        var step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
        if (step) {
          event.preventDefault();
          var i = items.indexOf(item);
          items[(i + step + items.length) % items.length].focus();
        }
      });
    });

    function onBreakpointChange() {
      closeAll();
      syncAria();
    }
    if (mq.addEventListener) mq.addEventListener("change", onBreakpointChange);
    else if (mq.addListener) mq.addListener(onBreakpointChange);

    syncAria();
  }

  /* ------------------------------------------------------------------
     Home: hero image carousel (pure CSS transitions, no GSAP needed)
     ------------------------------------------------------------------ */
    function setupHeroCarousel() {
  if (reduceMotion) return;
  var images = Array.prototype.slice.call(document.querySelectorAll(".hero-image-swapping .swap-img"));
  if (images.length < 2) return;

  var current = Math.max(0, images.findIndex(function (img) { return img.classList.contains("active"); }));
  images[current].classList.add("active");

  window.setInterval(function () {
    if (document.hidden) return;
    var prev = images[current];
    current = (current + 1) % images.length;
    prev.classList.remove("active");
    prev.classList.add("leaving");
    images[current].classList.remove("leaving");
    images[current].classList.add("active");
    window.setTimeout(function () { prev.classList.remove("leaving"); }, 1000);
  }, 4500);
}

  /* ------------------------------------------------------------------
     GSAP-only polish (all skipped if GSAP is missing or motion is reduced)
     ------------------------------------------------------------------ */

  function setupGeometricOrnaments() {
    if (!canAnimate) return;
    if (document.querySelector(".hero-split")) return; // inner pages only

    var hosts = document.querySelectorAll(".why-point, .portfolio-item");
    if (!hosts.length) return;

    var NS = "http://www.w3.org/2000/svg";
    var shapes = [
      '<rect x="10" y="10" width="70" height="70" rx="14" fill="none" stroke="url(#G)" stroke-width="2.5" transform="rotate(8 45 45)"/>',
      '<circle cx="45" cy="45" r="32" fill="none" stroke="url(#G)" stroke-width="2.5"/>',
      '<polygon points="45,10 80,70 10,70" fill="none" stroke="url(#G)" stroke-width="2.5"/>',
      '<line x1="10" y1="10" x2="80" y2="80" stroke="url(#G)" stroke-width="2.5"/><line x1="80" y1="10" x2="10" y2="80" stroke="url(#G)" stroke-width="2.5"/>'
    ];

    hosts.forEach(function (host, i) {
      if (host.querySelector(".geometric-ornament")) return;

      var gradId = "geo-grad-" + i; // unique per ornament (no duplicate IDs)
      var svg = document.createElementNS(NS, "svg");
      svg.setAttribute("class", "geometric-ornament");
      svg.setAttribute("viewBox", "0 0 90 90");
      svg.setAttribute("aria-hidden", "true");
      svg.innerHTML =
        '<defs><linearGradient id="' + gradId + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#F2B31D"/><stop offset="100%" stop-color="#17171A"/>' +
        "</linearGradient></defs>" + shapes[i % shapes.length].replace(/#G/g, "#" + gradId);
      host.appendChild(svg);

      // Entrance first, then the idle spin (one tween per property at a time).
      window.gsap.fromTo(svg,
        { scale: 0, rotation: -180, opacity: 0, transformOrigin: "center center" },
        {
          scale: 1, rotation: 0, opacity: 0.22, duration: 0.9, ease: "back.out(1.4)", delay: i * 0.08,
          onComplete: function () {
            window.gsap.to(svg, { rotation: 360, duration: 22, ease: "none", repeat: -1, yoyo: true });
          }
        });
    });
  }

  function setupMagneticButtons() {
    if (!canAnimate) return;
    document.querySelectorAll(".mag-btn").forEach(function (button) {
      var xTo = window.gsap.quickSetter(button, "x", "px");
      var yTo = window.gsap.quickSetter(button, "y", "px");

      button.addEventListener("pointermove", function (event) {
        if (window.innerWidth < 821) return;
        var rect = button.getBoundingClientRect();
        xTo((event.clientX - rect.left - rect.width / 2) * 0.08);
        yTo((event.clientY - rect.top - rect.height / 2) * 0.08);
      });
      button.addEventListener("pointerleave", function () {
        window.gsap.to(button, { x: 0, y: 0, duration: 0.4, ease: "power2.out" });
      });
    });
  }

  /* ------------------------------------------------------------------
     Footer entrance (hides content only once JS is confirmed running)
     ------------------------------------------------------------------ */
  function setupFooterAnimation() {
    var footer = document.querySelector(".footer");
    if (!footer || reduceMotion || !("IntersectionObserver" in window)) return;

    footer.classList.add("footer-anim");
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          footer.classList.add("footer-in");
          observer.disconnect();
        }
      });
    }, { threshold: 0.12 });
    observer.observe(footer);
  }

  /* ------------------------------------------------------------------
     Init — each step is isolated so one failure can't stop the rest
     ------------------------------------------------------------------ */
  function run(fn) {
    try { fn(); } catch (error) { if (window.console) console.error("[BuzzyBiz]", fn.name, error); }
  }

  function init() {
    // Core behaviour first
    run(setupNav);
    run(setupContactForm);
    run(setupEnquiryPopup);
    run(setupShowcase);
    run(setupHeroCarousel);
    run(setupFooterAnimation);
    // Optional GSAP polish
    
    run(setupGeometricOrnaments);
    run(setupMagneticButtons);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();