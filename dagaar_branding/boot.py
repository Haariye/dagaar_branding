from dagaar_branding.api import get_branding_settings


def boot_session(bootinfo):
    """Expose branding values in Desk boot data."""
    settings = get_branding_settings()
    bootinfo.dagaar_branding = settings
    bootinfo.app_name = "DagaarSoft"
    bootinfo.app_title = "DagaarSoft"
