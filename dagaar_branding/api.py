import frappe

DEFAULT_LOGO = "/assets/dagaar_branding/images/dagaarsoft-logo.png"
DEFAULT_FAVICON = "/assets/dagaar_branding/images/dagaarsoft-favicon.svg"
PRODUCT_ICON = "/assets/dagaar_branding/images/dagaarsoft-d-icon.svg"
FRAMEWORK_ICON = "/assets/dagaar_branding/images/framework-icon.svg"


def _single_value(doctype, fieldname):
    try:
        if frappe.db.exists("DocType", doctype) and frappe.get_meta(doctype).has_field(fieldname):
            return frappe.db.get_single_value(doctype, fieldname)
    except Exception:
        return None
    return None


@frappe.whitelist(allow_guest=True)
def get_branding_settings():
    company_name = None
    company_logo = None
    login_logo = None
    navbar_logo = None
    favicon = None

    if frappe.db.exists("DocType", "Dagaar Branding Settings"):
        settings = frappe.get_single("Dagaar Branding Settings")
        company_name = settings.company_name
        company_logo = settings.company_logo
        login_logo = settings.login_logo
        navbar_logo = settings.navbar_logo
        favicon = settings.favicon

    company_name = company_name or _single_value("Website Settings", "app_name") or frappe.local.site
    website_logo = (
        _single_value("Website Settings", "app_logo")
        or _single_value("Website Settings", "banner_image")
    )
    website_favicon = _single_value("Website Settings", "favicon")

    company_logo = company_logo or website_logo or DEFAULT_LOGO
    login_logo = login_logo or company_logo
    navbar_logo = navbar_logo or company_logo
    favicon = favicon or website_favicon or DEFAULT_FAVICON

    return {
        "company_name": company_name,
        "company_logo": company_logo,
        "login_logo": login_logo,
        "navbar_logo": navbar_logo,
        "favicon": favicon,
        "product_name": "DagaarSoft",
        "framework_name": "Framework",
        "product_logo": DEFAULT_LOGO,
        "product_icon": PRODUCT_ICON,
        "framework_icon": FRAMEWORK_ICON,
        "vendor_url": "https://dagaar.com",
    }
