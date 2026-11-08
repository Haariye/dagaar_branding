"""Keep the custom clinic workspaces (Laboratory, Pharmacy, Reception) alive across migrations.

The workspaces themselves are normal *custom* site records (no module / app set,
non-standard sidebar + desktop icon), which `bench migrate` never deletes or
overwrites. As a safety net, a snapshot of each record is stored in
``clinic_workspaces/`` and :func:`ensure` (an ``after_migrate`` hook) re-creates
any record that has gone missing. Existing records are never touched, so edits
made in the UI are kept.

To refresh the snapshot after editing a workspace in the UI:
    bench --site <site> execute dagaar_branding.clinic_workspaces.export
"""

import json
import os

import frappe

WORKSPACES = ["Laboratory", "Pharmacy", "Reception"]
HTML_BLOCKS = ["Patient Laboratory Queue"]
# Custom (DB-only) reports linked from the workspaces.
REPORTS = ["End of Day", "End of Day Procedure", "Outpatient Report"]
# Order matters: reports/blocks before workspaces, workspaces before sidebars, sidebars before icons.
DOCTYPES = ["Report", "Custom HTML Block", "Workspace", "Workspace Sidebar", "Desktop Icon"]
REQUIRED_APP = "healthcare"
SNAPSHOT_DIR = os.path.join(os.path.dirname(__file__), "clinic_workspaces")


def _file(doctype, name):
	return os.path.join(SNAPSHOT_DIR, f"{frappe.scrub(doctype)}__{frappe.scrub(name)}.json")


def _names(doctype):
	return {"Custom HTML Block": HTML_BLOCKS, "Report": REPORTS}.get(doctype, WORKSPACES)


def export():
	"""Write the current site records to the snapshot folder."""
	os.makedirs(SNAPSHOT_DIR, exist_ok=True)
	for doctype in DOCTYPES:
		for name in _names(doctype):
			if not frappe.db.exists(doctype, name):
				print(f"skip {doctype} {name}: not found")
				continue
			data = frappe.get_doc(doctype, name).as_dict(no_default_fields=True, no_child_table_fields=True)
			data["doctype"] = doctype
			data["name"] = name
			with open(_file(doctype, name), "w") as f:
				json.dump(data, f, indent=1, default=str, ensure_ascii=False, sort_keys=True)
			print(f"exported {doctype} {name}")


def ensure():
	"""after_migrate: re-create any clinic workspace record that is missing.

	Opt-in per site:  bench --site <site> set-config dagaar_clinic_workspaces 1
	"""
	if not frappe.conf.get("dagaar_clinic_workspaces"):
		return
	if REQUIRED_APP not in frappe.get_installed_apps():
		return
	for doctype in DOCTYPES:
		for name in _names(doctype):
			path = _file(doctype, name)
			if not os.path.exists(path) or frappe.db.exists(doctype, name):
				continue
			try:
				with open(path) as f:
					data = json.load(f)
				doc = frappe.get_doc(data)
				doc.flags.ignore_links = True
				doc.insert(ignore_permissions=True, ignore_mandatory=True, set_name=name)
				frappe.db.commit()
				print(f"dagaar_branding: restored {doctype} {name}")
			except Exception:
				frappe.db.rollback()
				frappe.log_error(title=f"dagaar_branding: could not restore {doctype} {name}")
