from pathlib import Path

from setuptools import find_packages, setup

BASE_DIR = Path(__file__).resolve().parent


readme = ""
with open(BASE_DIR / "README.md", "r") as readme_file:
    readme = readme_file.read()


requirements = []
with open(BASE_DIR / "requirements.txt", "r") as req_file:
    for item in req_file:
        requirements.append(item)


setup(
    name="check-auto-revs",
    version="0.0.0",
    packages=find_packages(),
    include_package_data=True,
    license="MIT",
    description="Something strange",
    long_description=readme,
    long_description_content_type="text/markdown",
    author="Daniela Rus Morales",
    url="https://github.com/Witmeet/check-auto-revs",
    install_requires=requirements,
    setup_requires=["wheel"],
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Environment :: Console",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Natural Language :: English",
        "Topic :: Scientific/Engineering :: Information Analysis",
    ],
    test_suite="dummy",
    zip_safe=True,
)
