# linter-ruff

The package is wrapper around Python linter called [ruff](https://github.com/charliermarsh/ruff). Package used [linter](https://github.com/steelbrain/linter) top-level API to visualize errors and other types of messages with ease.

## Installation

The official [Atom packages store](https://atom.io/packages) has been disabled. To get latest version run the shell command

    apm install bacadra/atom-linter-ruff

and obtain the package directly from Github repository. The package has compability with [Pulsar](https://pulsar-edit.dev/) and can be install

    pulsar -p install bacadra/atom-linter-ruff

or directly [linter-ruff](https://web.pulsar-edit.dev/packages/linter-ruff) from Pulsar package store.

## ruff

A package ruff is an extremely fast Python linter, written in Rust. Ruff can be used to replace Flake8 (plus dozens of plugins), isort, pydocstyle, yesqa, eradicate, pyupgrade, and autoflake, all while executing tens or hundreds of times faster than any individual tool.

For command line use, ruff is installed with:

    pip install ruff

Ruff supports over 500 lint [rules](https://beta.ruff.rs/docs/rules/), many of which are inspired by popular tools like Flake8, isort, pyupgrade, and others. Regardless of the rule's origin, Ruff re-implements every rule in Rust as a first-party feature.

Ruff can attempt to automatically fix lint violations. List of rule codes to treat as eligible & ineligible can be set in package setting or in configuration file.

## Commands

The following commands are available:

* `linter-ruff:toggle-noqa`: toggle package setting of noqa's used,
* `linter-ruff:lint`: run lint of file. Please note. if you have installed [linter](https://github.com/steelbrain/linter) package, then linter will be run automatically,
* `linter-ruff:fix`: run fix violations.

## Settings

The linter settings can be set by package options or via configuration file. The package options has higher priority, so if you want use configuration file, then leave empty `Rule selection` items. The details of configuration file (e.g. commands, file discovery) can be found at ruff [docs](https://beta.ruff.rs/docs/configuration/).

# Contributing

If you have ideas on how to improve the package, see bugs or want to support new features - feel free to share it via GitHub.

See my other packages for Atom Editor & Pulsar Editor:

* [autocomplete-sofistik](https://github.com/bacadra/atom-autocomplete-sofistik)
* [bib-finder](https://github.com/bacadra/atom-bib-finder)
* [hydrogen-run](https://github.com/bacadra/atom-hydrogen-run)
* [image-paste](https://github.com/bacadra/atom-image-paste)
* [language-sofistik](https://github.com/bacadra/atom-language-sofistik)
* [language-sofistik](https://github.com/bacadra/atom-language-sofistik)
* [linter-ruff](https://github.com/bacadra/atom-linter-ruff)
* [open-external](https://github.com/bacadra/atom-open-external)
* [pdf-viewer](https://github.com/bacadra/atom-pdf-viewer)
* [project-files](https://github.com/bacadra/atom-project-files)
* [regex-aligner](https://github.com/bacadra/atom-regex-aligner)
* [sofistik-tools](https://github.com/bacadra/atom-sofistik-tools)
* [super-select](https://github.com/bacadra/atom-super-select)
* [word-map](https://github.com/bacadra/atom-word-map)
