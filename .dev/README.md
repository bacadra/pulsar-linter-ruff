# linter-ruff

The package is wrapper around Python linter called [ruff](https://github.com/charliermarsh/ruff). Package used [linter](https://github.com/steelbrain/linter) top-level API to visualize errors and other types of messages with ease.

## Installation

<%installation%>

## ruff

A package [ruff](https://github.com/charliermarsh/ruff) is an extremely fast Python linter, written in Rust. Ruff can be used to replace Flake8 (plus dozens of plugins), isort, pydocstyle, yesqa, eradicate, pyupgrade, and autoflake, all while executing tens or hundreds of times faster than any individual tool.

For command line use, pylint is installed with:

    pip install ruff

Ruff supports over 500 lint [rules](https://beta.ruff.rs/docs/rules/), many of which are inspired by popular tools like Flake8, isort, pyupgrade, and others. Regardless of the rule's origin, Ruff re-implements every rule in Rust as a first-party feature.

Package config settings `Rule selection: ...` are send to ruff executable and `Class selection: ...` are use internally by package.

# Contributing

<%contributing%>
