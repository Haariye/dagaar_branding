(() => {
  "use strict";

  const DEFAULTS = {
    company_name: "",
    company_logo: "/assets/dagaar_branding/images/dagaarsoft-logo.png",
    login_logo: "/assets/dagaar_branding/images/dagaarsoft-logo.png",
    navbar_logo: "/assets/dagaar_branding/images/dagaarsoft-logo.png",
    favicon: "/assets/dagaar_branding/images/dagaarsoft-favicon.svg",
    product_name: "DagaarSoft",
    framework_name: "Framework",
    product_logo: "/assets/dagaar_branding/images/dagaarsoft-logo.png",
    product_icon: "/assets/dagaar_branding/images/dagaarsoft-d-icon.svg",
    framework_icon: "/assets/dagaar_branding/images/framework-icon.svg",
    vendor_url: "https://dagaar.com"
  };

  let settings = { ...DEFAULTS };
  let scheduled = false;

  const isFrappeExternalUrl = (url) => {
    if (!url) return false;
    try {
      const host = new URL(url, window.location.origin).hostname.toLowerCase();
      return ["frappe.io", "erpnext.com", "discuss.frappe.io", "github.com"].some(
        (domain) => host === domain || host.endsWith(`.${domain}`)
      );
    } catch (_) {
      return false;
    }
  };

  const replaceVisibleText = (text) => {
    if (!text) return text;
    return text
      .replace(/Open Source applications for the web\.?/gi, "DagaarSoft Web Applications.")
      .replace(/(?:Frappe|Framework) Technologies Pvt\. Ltd\. and contributors/gi, "Dagaar Technologies Pvt. Ltd. and contributors")
      .replace(/\bERPNext Settings\b/gi, "DagaarSoft Settings")
      .replace(/\bAbout ERPNext\b/gi, "About DagaarSoft")
      .replace(/\bPowered by ERPNext\b/gi, "Powered by DagaarSoft")
      .replace(/\bERPNext\b/g, "DagaarSoft")
      .replace(/\bFrappe Framework\b/gi, "Framework")
      .replace(/\bFrappe Support\b/gi, "Framework Support")
      .replace(/\bFrappe\b/g, "Framework");
  };

  function setImage(img, src) {
    if (!img || !src || img.dataset.dagaarBrandSrc === src) return;
    img.src = src;
    img.dataset.dagaarBrandSrc = src;
    img.style.objectFit = "contain";
    img.style.borderRadius = "0";
  }

  function replaceTextNodes(root) {
    const base = root.body || root;
    if (!base) return;
    const walker = document.createTreeWalker(base, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || ["SCRIPT", "STYLE", "CODE", "PRE", "TEXTAREA", "INPUT"].includes(parent.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        return /ERPNext|Frappe|Open Source applications for the web|Technologies Pvt\. Ltd\. and contributors/i.test(node.nodeValue || "")
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      node.nodeValue = replaceVisibleText(node.nodeValue);
    });

    base.querySelectorAll?.("[title], [aria-label], [placeholder], img[alt]").forEach((el) => {
      ["title", "aria-label", "placeholder", "alt"].forEach((attr) => {
        const value = el.getAttribute(attr);
        if (value) el.setAttribute(attr, replaceVisibleText(value));
      });
    });
  }

  function rewriteExternalLinks(root) {
    const base = root.body || root;
    if (!base?.querySelectorAll) return;
    base.querySelectorAll("a[href]").forEach((a) => {
      if (isFrappeExternalUrl(a.getAttribute("href"))) {
        a.href = settings.vendor_url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
    });
  }

  function hideTechnicalLine(el) {
    if (!el) return;
    el.classList.add("dagaar-hide-technical-version");
    el.setAttribute("aria-hidden", "true");
  }

  function updateAboutDialog(root) {
    const base = root.body || root;
    if (!base?.querySelectorAll) return;

    base.querySelectorAll(".modal, .about-dialog, [role='dialog']").forEach((dialog) => {
      const text = dialog.textContent || "";
      if (!/Framework Version|Installed Apps|DagaarSoft Web Applications|Open Source applications|ERPNext|Frappe/i.test(text)) return;
      dialog.classList.add("dagaar-about-dialog");

      dialog.querySelectorAll("h1, h2, h3, h4, .modal-title, .about-app-name").forEach((el) => {
        if (/^\s*(Frappe|Framework)\s*$/i.test(el.textContent || "")) el.textContent = "DagaarSoft";
      });

      dialog.querySelectorAll("p, .about-description, .text-muted").forEach((el) => {
        if (/Open Source applications for the web/i.test(el.textContent || "")) {
          el.textContent = "DagaarSoft Web Applications.";
        }
      });

      // Hide framework and installed-app technical version/branch lines.
      dialog.querySelectorAll("*").forEach((el) => {
        if (el.children.length) return;
        const value = (el.textContent || "").trim();
        if (/^(?:frappe|framework|erpnext|dagaarsoft|solvronix_desk|healthcare|dagaar_branding)\s*:\s*\d/i.test(value)) {
          hideTechnicalLine(el);
        } else if (/^\d+(?:\.\d+)+(?:\s*\([^)]*\))?$/.test(value)) {
          hideTechnicalLine(el);
        }
      });

      // Product row: DagaarSoft name, D icon, no internal package/version details.
      dialog.querySelectorAll(".installed-app, .app-item, .app-card, .about-app, .app-logo-and-title, .app-list-item, .row, li").forEach((card) => {
        const cardText = card.textContent || "";
        if (!/ERPNext|erpnext\s*:|DagaarSoft/i.test(cardText)) return;
        card.querySelectorAll("*").forEach((el) => {
          if (el.children.length) return;
          const value = (el.textContent || "").trim();
          if (/^ERPNext$/i.test(value)) el.textContent = "DagaarSoft";
          if (/^erpnext\s*:/i.test(value)) hideTechnicalLine(el);
        });
        const img = card.querySelector("img");
        if (img) setImage(img, settings.product_icon);
      });

      // Replace the main About logo only, not every installed-app icon.
      const mainLogo = dialog.querySelector(".about-logo img, .about-app-logo img, .modal-body > div:first-child img, .modal-body img");
      if (mainLogo) setImage(mainLogo, settings.product_logo);

      dialog.querySelectorAll("a[href]").forEach((a) => {
        a.href = settings.vendor_url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      });
    });
  }

  function findCardFromText(el) {
    return el.closest(
      ".installed-app, .app-item, .app-card, .about-app, .app-logo-and-title, .app-list-item, .dropdown-item, .sidebar-item, .workspace-sidebar-item, .widget, .shortcut-widget-box, .module-card, li, [role='menuitem']"
    ) || el.parentElement;
  }

  function brandProductCards(root) {
    const base = root.body || root;
    if (!base?.querySelectorAll) return;

    base.querySelectorAll("*").forEach((el) => {
      if (el.children.length) return;
      const value = (el.textContent || "").trim();
      if (!/^ERPNext$/i.test(value)) return;

      el.textContent = "DagaarSoft";
      const card = findCardFromText(el);
      if (!card) return;
      card.classList.add("dagaar-product-card");
      const img = card.querySelector("img");
      if (img) setImage(img, settings.product_icon);

      card.querySelectorAll(".app-logo, .icon, [class*='avatar']").forEach((icon) => {
        if (icon.tagName === "IMG" || icon.querySelector("img")) return;
        const iconText = (icon.textContent || "").trim();
        if (/^E$/i.test(iconText)) {
          icon.textContent = "D";
          icon.classList.add("dagaar-letter-icon");
        }
      });
    });

    // Handle app cards where the icon and title are separate siblings.
    base.querySelectorAll(".app-item, .app-card, .installed-app, .dropdown-menu .row, .dropdown-menu li").forEach((card) => {
      if (!/DagaarSoft|ERPNext/i.test(card.textContent || "")) return;
      card.querySelectorAll("*").forEach((el) => {
        if (!el.children.length && /^ERPNext$/i.test((el.textContent || "").trim())) el.textContent = "DagaarSoft";
      });
      const img = card.querySelector("img");
      if (img) setImage(img, settings.product_icon);
      card.querySelectorAll(".app-logo, .icon, [class*='avatar']").forEach((icon) => {
        if (!icon.querySelector("img") && /^E$/i.test((icon.textContent || "").trim())) {
          icon.textContent = "D";
          icon.classList.add("dagaar-letter-icon");
        }
      });
    });
  }

  function updateDesktopCards(root) {
    const base = root.body || root;
    if (!base?.querySelectorAll) return;
    const selector = ".widget, .shortcut-widget-box, .link-item, .workspace-sidebar-item, .standard-sidebar-item, .desk-sidebar-item, .module-card, .app-card";
    base.querySelectorAll(selector).forEach((card) => {
      const label = (card.textContent || "").trim();
      card.querySelectorAll("*").forEach((el) => {
        if (el.children.length) return;
        const value = (el.textContent || "").trim();
        if (/^ERPNext$/i.test(value)) el.textContent = "DagaarSoft";
        if (/^ERPNext Settings$/i.test(value)) el.textContent = "DagaarSoft Settings";
        if (/^Marley Health$/i.test(value)) el.textContent = "Healthcare";
        if (/^Frappe$/i.test(value)) el.textContent = "Framework";
      });
      if (/ERPNext|DagaarSoft Settings/i.test(label)) {
        const img = card.querySelector("img");
        if (img) setImage(img, settings.product_icon);
      }
      if (/^Frappe$/i.test(label)) {
        const img = card.querySelector("img");
        if (img) setImage(img, settings.framework_icon);
      }
    });
  }

  function updateLogos(root) {
    const base = root.body || root;
    if (!base?.querySelectorAll) return;
    base.querySelectorAll(".navbar-home img, header .app-logo, .desk-navbar img.app-logo").forEach((img) => setImage(img, settings.navbar_logo));
    base.querySelectorAll(".page-card-head img, .login-content img, .for-login .app-logo, .web-login img").forEach((img) => setImage(img, settings.login_logo));
  }

  function updateHead() {
    let current = replaceVisibleText(document.title || "");
    document.title = settings.company_name
      ? `${settings.company_name}${current && !current.includes(settings.company_name) ? ` - ${current}` : ""}`
      : current || "DagaarSoft";

    let icon = document.querySelector("link[rel~='icon']");
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      document.head.appendChild(icon);
    }
    icon.href = settings.favicon;
  }

  function addCompanyName() {
    if (!settings.company_name) return;
    const loginHead = document.querySelector(".page-card-head");
    if (loginHead && !loginHead.querySelector(".dagaar-company-name")) {
      const name = document.createElement("div");
      name.className = "dagaar-company-name";
      name.textContent = settings.company_name;
      loginHead.appendChild(name);
    }
  }

  function apply(root = document) {
    updateHead();
    replaceTextNodes(root);
    updateAboutDialog(root);
    brandProductCards(root);
    updateDesktopCards(root);
    updateLogos(root);
    rewriteExternalLinks(root);
    addCompanyName();
  }

  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      apply(document);
    });
  }

  async function loadSettings() {
    try {
      const bootSettings = window.frappe?.boot?.dagaar_branding;
      if (bootSettings) {
        settings = { ...DEFAULTS, ...bootSettings };
        return;
      }
      const response = await fetch("/api/method/dagaar_branding.api.get_branding_settings", {
        credentials: "same-origin",
        headers: { Accept: "application/json" }
      });
      if (response.ok) {
        const data = await response.json();
        settings = { ...DEFAULTS, ...(data.message || {}) };
      }
    } catch (error) {
      console.warn("Dagaar branding settings could not be loaded", error);
    }
  }

  document.addEventListener("click", (event) => {
    const anchor = event.target.closest?.("a[href]");
    if (anchor && isFrappeExternalUrl(anchor.href)) {
      event.preventDefault();
      window.open(settings.vendor_url, "_blank", "noopener");
    }
    setTimeout(scheduleApply, 0);
  }, true);

  async function start() {
    await loadSettings();
    apply(document);
    const observer = new MutationObserver(scheduleApply);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["href", "title", "aria-label", "src"]
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
