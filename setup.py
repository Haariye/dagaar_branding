from pathlib import Path
from setuptools import find_packages, setup

root = Path(__file__).parent
requirements_file = root / "requirements.txt"
install_requires = [
    line.strip()
    for line in requirements_file.read_text(encoding="utf-8").splitlines()
    if line.strip() and not line.lstrip().startswith("#")
]

setup(
    name="dagaar_branding",
    version="1.1.0",
    description="Per-site company branding and DagaarSoft white-labeling for Frappe/ERPNext v16",
    author="Dagaar Technology",
    author_email="info@dagaar.com",
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    install_requires=install_requires,
)
