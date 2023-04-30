# linter-python

The package is wrapper around Python linters. Package used [linter](https://github.com/steelbrain/linter) top-level API to visualize errors and other types of messages with ease.

## Installation

The official [Atom packages store](https://atom.io/packages) has been disabled. To get latest version run the shell command

    apm install bacadra/atom-linter-python

and obtain the package directly from Github repository.

The package has compability with [Pulsar](https://pulsar-edit.dev/) and can be install

    pulsar -p install bacadra/atom-linter-python

## flake8

Package [flake8](https://github.com/PyCQA/flake8) contains:

* [pyflakes](https://flake8.pycqa.org/en/latest/user/error-codes.html): `/(F[f-9]..|E999)/` A simple program which checks Python source files for errors. `E999` can not be turned off.

* [pycodestyle](https://github.com/PyCQA/pycodestyle): `/(E[1-9]|W[1-6])../` pycodestyle is a tool to check your Python code against some of the style conventions in PEP 8.

* [mccabe](https://github.com/pycqa/mccabe): `/C901/` Ned's script to check McCabe complexity.

* [pydocstyle](https://github.com/pycqa/pydocstyle): `/D[1-4]../` pydocstyle is a static analysis tool for checking compliance with Python docstring conventions.

It is very important to install Flake8 on the correct version of Python for your needs. If you want Flake8 to properly parse new language features in Python 3.5 (for example), you need it to be installed on 3.5 for Flake8 to understand those features. In many ways, Flake8 is tied to the version of Python on which it runs. You can install flake8 by typing the following in a terminal:

    pip install flake8

To include built-in docstrings (pep257) support you will also need to install:

    pip install flake8-docstrings

Flags can be turned off by regular expression, e.g. `[EWCD]..` use only pyflakes


# Contributing

If you have ideas on how to improve the package, see bugs or want to support new features - feel free to share it via GitHub.

See my other packages for Atom Editor:

* [autocomplete-sofistik](https://github.com/bacadra/atom-autocomplete-sofistik)
* [bib-finder](https://github.com/bacadra/atom-bib-finder)
* [hydrogen-run](https://github.com/bacadra/atom-hydrogen-run)
* [image-paste](https://github.com/bacadra/atom-image-paste)
* [language-sofistik](https://github.com/bacadra/atom-language-sofistik)
* [language-sofistik](https://github.com/bacadra/atom-language-sofistik)
* [linter-python](https://github.com/bacadra/atom-linter-python)
* [open-external](https://github.com/bacadra/atom-open-external)
* [pdf-viewer](https://github.com/bacadra/atom-pdf-viewer)
* [project-files](https://github.com/bacadra/atom-project-files)
* [regex-aligner](https://github.com/bacadra/atom-regex-aligner)
* [sofistik-tools](https://github.com/bacadra/atom-sofistik-tools)
* [super-select](https://github.com/bacadra/atom-super-select)
* [word-map](https://github.com/bacadra/atom-word-map)
