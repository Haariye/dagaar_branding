# Dagaar Branding for Frappe/ERPNext v16

## Install

```bash
cd ~/frappe-bench
bench get-app https://github.com/Haariye/dagaar_branding.git
bench --site yoursite.com install-app dagaar_branding
bench build --app dagaar_branding
bench --site yoursite.com clear-cache
bench restart
```

Open **Dagaar Branding Settings** on each site to set its company name, company logo, login logo, navbar logo, and favicon.

## Rebranding included

- Frappe renamed visually to Framework.
- ERPNext product branding renamed visually to DagaarSoft.
- ERPNext in Installed Apps shown as DSoft with a D icon.
- Frappe/ERPNext external links redirect to https://dagaar.com.
- About dialog uses the DagaarSoft logo and Dagaar Technologies attribution.
- Marley Health desktop label changes to Healthcare.
- Internal Python package names remain unchanged for update safety.
