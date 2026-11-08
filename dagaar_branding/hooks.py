app_name = "dagaar_branding"
app_title = "DagaarSoft"
app_publisher = "Dagaar Technologies Pvt. Ltd."
app_description = "Per-site company branding and DagaarSoft white-labeling for Frappe and ERPNext v16"
app_email = "info@dagaar.com"
app_license = "MIT"

app_logo_url = "/assets/dagaar_branding/images/dagaarsoft-d-icon.svg"

app_include_css = ["/assets/dagaar_branding/css/dagaar_branding.css?v=20261106"]
app_include_js = ["/assets/dagaar_branding/js/dagaar_branding.js?v=20261106"]
web_include_css = ["/assets/dagaar_branding/css/dagaar_branding.css?v=20261106"]
web_include_js = ["/assets/dagaar_branding/js/dagaar_branding.js?v=20261106"]

boot_session = "dagaar_branding.boot.boot_session"
after_install = "dagaar_branding.install.after_install"
after_migrate = ["dagaar_branding.clinic_workspaces.ensure"]
