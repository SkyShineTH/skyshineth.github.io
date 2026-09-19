---
title: "AgentGate — Permission Gateway for AI Agents"
short_title: "AgentGate"
featured: true
featured_order: 3
featured_label: "Platform"
category: "AI Infrastructure"
stack: ["Python", "Pydantic", "Typer", "SQLite", "pytest", "ruff", "CLI", "Policy Engine", "Audit Logs"]
link: "https://github.com/SkyShineTH/AgentGate"
repo_label: "View Repo on GitHub"
project_focus: "AI agent permissions / audit logging"
project_summary: "A permission gateway that evaluates structured tool requests against deterministic rules before sensitive actions proceed."
project_built: "Policy engine, request-specific approval queue, CLI, and SQLite or JSONL audit trail."
project_validated: "Regression tests cover scoped file and shell-style access and path traversal boundaries."
project_operations: "Allow and deny rules, public/private workspace boundaries, and inspectable approval history."
project_status: "Repository available"
---

Provider-agnostic **permission gateway** for tool-using AI agents. AgentGate normalizes proposed tool calls into structured requests, evaluates deterministic policy, sends sensitive actions to a request-specific human approval queue, and records the lifecycle through audit logs before execution.

**Outcome:** Built an inspectable AI infrastructure project covering scoped file-oriented and shell-style tool access, public/private workspace boundaries with path traversal protection, SQLite approval history, JSONL or SQLite audit logging, optional adapter helpers, and regression tests for safer agent automation.
