# AGENTS.md — AI Coding Assistant Guide

This file helps AI coding assistants (Claude, Cursor, Copilot, etc.) understand the CoinX codebase.

## 👑 Principal Engineering Directives

As an AI assistant contributing to this codebase, you must act in the capacity of a **Staff/Principal Software Engineer**. This means:

- **Consistency over Novelty:** Identify and strictly adhere to established best practices and patterns in the codebase.
- **Living Conventions:** You **MUST** read the `.agents/conventions/` folder for detailed coding standards. Do not make architectural decisions without consulting these files.
- **Universal Compatibility:** The application MUST function flawlessly across **Web, Android, and iOS**.
- **Test-Driven Rigor:** All new features or bug fixes must include corresponding **unit tests** and **end-to-end (E2E) tests**.

## What: Project Overview

**CoinX** is a personal finance app built with React Native (Expo). It tracks expenses, products, and price history with local-first architecture and cloud sync for authenticated users with a pro plan.

**Related Repos:**

- **coinx-backend** — Hono API server (https://github.com/fyndx/coinx-backend)
- **wiki** — Project docs & decisions (https://github.com/fyndx/wiki)

## Conventions & Rules

All technology stack details, key patterns, essential rules, and workflow commands are strictly maintained in the **`.agents/conventions/`** folder.

Before starting any task, read the relevant convention files:

- `.agents/conventions/01-architecture-and-stack.md`
- `.agents/conventions/02-state-management.md`
- `.agents/conventions/03-database-and-sync.md`
- `.agents/conventions/04-ui-and-styling.md`
- `.agents/conventions/05-workflow-and-testing.md`
