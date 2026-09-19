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
image: "/assets/images/projects/shipyard-live-demo-case-study.webp"
image_alt: "Shipyard GitOps case study screenshot from the former demo environment"
image_caption: "Screenshot from the former Shipyard demo environment."
project_focus: "GitOps / Kubernetes automation"
project_summary: "A GitOps platform demonstrating Kubernetes delivery with Helm, Argo CD, progressive rollout, and scoped RBAC."
project_built: "React frontend, Go services, PostgreSQL, Helm charts, and Argo CD Applications."
project_validated: "Documented the former deployment and manual canary promotion in the deployment case study."
project_operations: "Scoped Kubernetes RBAC and platform status evidence supported the former demo."
project_status: "Demo decommissioned · 12 Jun 2026"
case_study_link: "https://github.com/SkyShineTH/Shipyard/blob/main/docs/doks-live-demo.md"
---

Full-stack **GitOps** platform previously deployed as an on-demand portfolio demo on **DigitalOcean Kubernetes**. The demo environment was decommissioned on 2026-06-12. The app combines a React/Vite frontend, Go auth, todo, and platform-status microservices, PostgreSQL, Helm charts, Argo CD Applications, and GHCR-backed GitHub Actions image delivery. See the [deployment case study](https://github.com/SkyShineTH/Shipyard/blob/main/docs/doks-live-demo.md) and repository screenshots.

**Outcome:** Provisioned a cost-conscious 1-node DOKS environment, exposed the app through a DigitalOcean Load Balancer with Cloudflare strict SSL, tuned resource requests to fit a small demo node, demonstrated manual canary promotion with **Argo Rollouts** (20% → 50% → 100%) on the todo API, and added a public case-study page — then backed by a platform-status API with scoped Kubernetes RBAC — that documented the architecture and read-only `kubectl` evidence of the former cluster.
