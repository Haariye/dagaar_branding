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
      const parsed = new URL(url, window.location.origin);
      const host = parsed.hostname.toLowerCase();
      return [
        "frappe.io",
        "www.frappe.io",
        "erpnext.com",
        "www.erpnext.com",
        "discuss.frappe.io",
        "github.com"
      ].some((domain) => host === domain || host.endsWith(`.${domain}`));
    } catch (_) {
      return false;
    }
  };

  const replaceGeneralText = (text) => {
    if (!text) return text;
    return text
      .replace(/Open Source applications for the web\.?/gi, "DagaarSoft Web Applications.")
      .replace(/Framework Technologies Pvt\. Ltd\. and contributors/gi, "Dagaar Technologies Pvt. Ltd. and contributors")
      .replace(/Frappe Technologies Pvt\. Ltd\. and contributors/gi, "Dagaar Technologies Pvt. Ltd. and contributors")
      .replace(/\bERPNext Settings\b/g, "DagaarSoft Settings")
      .replace(/\bAbout ERPNext\b/g, "About DagaarSoft")
      .replace(/\bPowered by ERPNext\b/g, "Powered by DagaarSoft")
      .replace(/\bFrappe Framework\b/g, "Framework")
      .replace(/\bFrappe Support\b/g, "Framework Support")
      .replace(/\bFrappe\b/g, "Framework");
  };

  function setImage(img, src) {
    if (!img || !src || img.dataset.dagaarBrandSrc === src) return;
    img.src = src;
    img.dataset.dagaarBrandSrc = src;
    img.style.objectFit = "contain";
    img.style.borderRadius = "0";
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

  function updateGeneralText(root) {
    const base = root.body || root;
    if (!base) return;
    const walker = document.createTreeWalker(base, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || ["SCRIPT", "STYLE", "CODE", "PRE", "TEXTAREA", "INPUT"].includes(parent.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        return /Frappe|Open Source applications for the web|Framework Technologies Pvt\. Ltd|Frappe Technologies Pvt\. Ltd/.test(node.nodeValue || "")
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      node.nodeValue = replaceGeneralText(node.nodeValue);
    });

    base.querySelectorAll?.("[title], [aria-label], [placeholder], img[alt]").forEach((el) => {
      ["title", "aria-label", "placeholder", "alt"].forEach((attr) => {
        const value = el.getAttribute(attr);
        if (value) el.setAttribute(attr, replaceGeneralText(value));
      });
    });
  }

  function updateAboutDialog(root) {
    const base = root.body || root;
    if (!base?.querySelectorAll) return;

    base.querySelectorAll(".modal, .about-dialog, [role='dialog']").forEach((dialog) => {
      const text = dialog.textContent || "";
      if (!/Framework Version|Installed Apps|Open Source applications|Frappe/i.test(text)) return;
      dialog.classList.add("dagaar-about-dialog");

      dialog.querySelectorAll("h1, h2, h3, h4, .modal-title, .about-app-name").forEach((el) => {
        if (/^\s*(Frappe|Framework)\s*$/i.test(el.textContent || "")) el.textContent = "DagaarSoft";
      });

      const descriptionCandidates = dialog.querySelectorAll("p, .about-description, .text-muted");
      descriptionCandidates.forEach((el) => {
        if (/Open Source applications for the web/i.test(el.textContent || "")) {
          el.textContent = "DagaarSoft Web Applications.";
        }
      });

      dialog.querySelectorAll("img").forEach((img) => {
        const context = `${img.alt || ""} ${img.title || ""} ${img.closest("div")?.textContent || ""}`;
        if (/DagaarSoft|Frappe|Framework/i.test(context)) setImage(img, settings.product_logo);
      });

      dialog.querySelectorAll("a[href]").forEach((a) => {
        a.href = settings.vendor_url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      });
    });
  }

  function setCardLabel(card, oldPattern, newLabel) {
    card.querySelectorAll(".widget-title, .module-name, .app-name, .sidebar-item-label, .standard-sidebar-label, .title-text, .ellipsis, span, div").forEach((el) => {
      const value = (el.textContent || "").trim();
      if (oldPattern.test(value) && el.children.length === 0) el.textContent = newLabel;
    });
  }

  function updateInstalledApps(root) {
    const base = root.body || root;
    if (!base?.querySelectorAll) return;
    base.querySelectorAll(".installed-app, .app-item, .app-card, .about-app, .app-logo-and-title, .app-list-item, .modal .row").forEach((card) => {
      const text = (card.textContent || "").trim();
      if (/\berpnext\b|^ERPNext$/i.test(text)) {
        setCardLabel(card, /^ERPNext$/i, "DSoft");
        const img = card.querySelector("img");
        if (img) setImage(img, settings.product_icon);
        card.querySelectorAll(".app-logo, .icon, [class*='avatar']").forEach((icon) => {
          if (!icon.querySelector("img")) {
            icon.textContent = "D";
            icon.classList.add("dagaar-letter-icon");
          }
        });
      }
    });
  }

  function updateDesktopCards(root) {
    const base = root.body || root;
    if (!base?.querySelectorAll) return;
    const selector = ".widget, .shortcut-widget-box, .link-item, .workspace-sidebar-item, .standard-sidebar-item, .desk-sidebar-item, .module-card, .app-card";
    base.querySelectorAll(selector).forEach((card) => {
      const label = (card.textContent || "").trim();

      if (/ERPNext Settings|DagaarSoft Settings|^ERPNext$/i.test(label)) {
        setCardLabel(card, /^ERPNext$/i, "DagaarSoft");
        setCardLabel(card, /^ERPNext Settings$/i, "DagaarSoft Settings");
        const img = card.querySelector("img");
        if (img) setImage(img, settings.product_icon);
      }

      if (/^Marley Health$/i.test(label)) {
        setCardLabel(card, /^Marley Health$/i, "Healthcare");
      }

      if (/^Frappe$/i.test(label)) {
        setCardLabel(card, /^Frappe$/i, "Framework");
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
    let current = replaceGeneralText(document.title || "");
    current = current.replace(/\bERPNext\b/g, "DagaarSoft");
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
    updateGeneralText(root);
    updateAboutDialog(root);
    updateInstalledApps(root);
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
  }, true);

  async function start() {
    await loadSettings();
    apply(document);
    const observer = new MutationObserver(scheduleApply);
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["href", "title", "aria-label"] });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
