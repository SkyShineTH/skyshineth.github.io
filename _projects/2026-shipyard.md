---
title: "Shipyard — GitOps Platform"
short_title: "Shipyard"
featured: true
featured_order: 1
featured_label: "GitOps"
category: "DevOps"
stack: ["React", "Go", "PostgreSQL", "Docker", "DOKS", "Helm", "Argo CD", "Argo Rollouts", "GitHub Actions", "GHCR"]
link: "https://github.com/SkyShineTH/Shipyard"
repo_label: "View Repo on GitHub"
demo_link: "https://shipyard.skyshine.online"
image: "/assets/images/projects/shipyard-live-demo-case-study.webp"
---

Full-stack **GitOps** platform deployed as an on-demand portfolio demo on **DigitalOcean Kubernetes**. The app combines a React/Vite frontend, Go auth, todo, and platform-status microservices, PostgreSQL, Helm charts, Argo CD Applications, and GHCR-backed GitHub Actions image delivery.

**Outcome:** Provisioned a cost-conscious 1-node DOKS environment, exposed the app through a DigitalOcean Load Balancer with Cloudflare strict SSL, tuned resource requests to fit a small demo node, demonstrated manual canary promotion with **Argo Rollouts** (20% → 50% → 100%) on the todo API, and added a public case-study page — backed by a live platform-status API with scoped Kubernetes RBAC — that surfaces the architecture and read-only `kubectl` evidence of the running cluster.
