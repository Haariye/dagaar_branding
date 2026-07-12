import frappe


def after_install():
    """Initialize per-site settings without forcing any logo."""
    settings = frappe.get_single("Dagaar Branding Settings")
    if not settings.company_name:
        settings.company_name = frappe.local.site
        settings.save(ignore_permissions=True)
    frappe.clear_cache()
