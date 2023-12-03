# linter-ruff

<p align="center">
  <a href="https://github.com/bacadra/pulsar-linter-ruff/tags">
  <img src="https://img.shields.io/github/v/tag/bacadra/pulsar-linter-ruff?style=for-the-badge&label=Latest&color=blue" alt="Latest">
  </a>
  <a href="https://github.com/bacadra/pulsar-linter-ruff/issues">
  <img src="https://img.shields.io/github/issues-raw/bacadra/pulsar-linter-ruff?style=for-the-badge&color=blue" alt="OpenIssues">
  </a>
  <a href="https://github.com/bacadra/pulsar-linter-ruff/blob/master/package.json">
  <img src="https://img.shields.io/github/languages/top/bacadra/pulsar-linter-ruff?style=for-the-badge&color=blue" alt="Language">
  </a>
  <a href="https://github.com/bacadra/pulsar-linter-ruff/blob/master/LICENSE">
  <img src="https://img.shields.io/github/license/bacadra/pulsar-linter-ruff?style=for-the-badge&color=blue" alt="Licence">
  </a>
</p>

The package is wrapper around Python linter called [ruff](https://github.com/astral-sh/ruff). Package used [linter](https://github.com/steelbrain/linter) top-level API to visualize errors and other types of messages with ease.

## Installation

To install `linter-ruff` search for [linter-ruff](https://web.pulsar-edit.dev/packages/linter-ruff) in the Install pane of the Pulsar settings or run `ppm install linter-ruff`. Alternatively, you can run `ppm install bacadra/pulsar-linter-ruff` to install a package directly from the Github repository.

## ruff

A package ruff is an extremely fast Python linter, written in Rust. Ruff can be used to replace Flake8 (plus dozens of plugins), isort, pydocstyle, yesqa, eradicate, pyupgrade, and autoflake, all while executing tens or hundreds of times faster than any individual tool.

For command line use, ruff is installed with `pip install ruff`.

Ruff supports over 500 lint [rules](https://docs.astral.sh/ruff/rules/), many of which are inspired by popular tools like Flake8, isort, pyupgrade, and others. Regardless of the rule's origin, Ruff re-implements every rule in Rust as a first-party feature.

Ruff can attempt to automatically fix lint violations. List of rule codes to treat as eligible & ineligible can be set in package setting or in configuration file.

## Commands

The following commands are available:

* `linter:lint`: a command of [linter](https://github.com/steelbrain/linter) package,
* `linter-ruff:fix`: run fix violations,
* `linter-ruff:toggle-noqa`: toggle package setting of noqa's used,
* `linter-ruff:open-default-config`: open ruff default config file.

## Settings

The linter settings can be set by package options or via configuration file. The package options has higher priority, so if you want use configuration file, then leave empty `Rule selection` items.

A default configuration `pyproject.toml` can be opened (and created if doesn't exists) by command `linter-ruff:open-default-config`.

The details of configuration file (e.g. commands, file discovery) can be found at ruff [config discovery](https://docs.astral.sh/ruff/configuration/#config-file-discovery).

# Contributing [🍺](https://www.buymeacoffee.com/asiloisad)

If you have any ideas on how to improve the package, spot any bugs, or would like to support the development of new features, please feel free to share them via GitHub.
