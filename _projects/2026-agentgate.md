---
title: "AgentGate — Permission Gateway for AI Agents"
category: "AI Infrastructure"
stack: ["Python", "Pydantic", "Typer", "SQLite", "pytest", "ruff", "CLI", "Policy Engine", "Audit Logs"]
link: "https://github.com/SkyShineTH/AgentGate"
repo_label: "View Repo on GitHub"
---

Provider-agnostic **permission gateway** for tool-using AI agents. AgentGate normalizes proposed tool calls into structured requests, evaluates deterministic policy, sends sensitive actions to a request-specific human approval queue, and records the lifecycle through audit logs before execution.

**Outcome:** Built an inspectable AI infrastructure project covering scoped file-oriented and shell-style tool access, public/private workspace boundaries with path traversal protection, SQLite approval history, JSONL or SQLite audit logging, optional adapter helpers, and regression tests for safer agent automation.
