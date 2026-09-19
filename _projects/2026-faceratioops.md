---
title: "FaceRatioOps — Privacy-First AI Inference API"
short_title: "FaceRatioOps"
featured: true
featured_order: 2
featured_label: "AI Inference"
category: "MLOps"
stack: ["Python", "FastAPI", "MediaPipe", "Pillow", "NumPy", "Pydantic", "React", "Vite", "TypeScript", "Docker", "Docker Compose", "Caddy", "GHCR", "Prometheus", "Grafana", "Node Exporter", "GitHub Actions", "CodeQL", "Trivy", "k6", "pytest", "ruff"]
link: "https://github.com/SkyShineTH/FaceRatioOps"
repo_label: "View Repo on GitHub"
image: "/assets/images/projects/faceratioops-live-demo.png"
image_alt: "FaceRatioOps workbench screenshot from the former public deployment"
image_caption: "Workbench screenshot from the former public deployment."
project_focus: "AI inference / observability / security"
project_summary: "A privacy-conscious facial geometry analysis service with an explainable browser workbench, automated delivery, and monitoring."
project_built: "FastAPI inference API and React workbench with health, model-info, and metrics endpoints."
project_validated: "Repository documents tests, load checks, former deployment architecture, and screenshots."
project_operations: "In-memory image handling, payload-free logs, CodeQL, Trivy, Prometheus, and Grafana."
project_status: "Demo decommissioned · 9 Jul 2026"
case_study_link: "https://github.com/SkyShineTH/FaceRatioOps#project-status-decommissioned"
card_excerpt: >-
  A privacy-first FastAPI service for facial geometry analysis, paired with a
  React and TypeScript workbench. Image bytes stay in memory, and the API returns
  explainable geometric ratios without identity or attractiveness claims.
  Previously deployed with monitoring and automated delivery; the demo was
  decommissioned on 2026-07-09. See the repository for screenshots and
  deployment documentation.
---

Privacy-first **FastAPI** inference service for facial geometry analysis using **MediaPipe** face landmarks, paired with a **React + TypeScript** workbench that runs in the browser. The API accepts bounded image uploads, processes image bytes in memory, returns geometric ratios with explainability overlay data, and exposes health, model-info, and Prometheus-style metrics endpoints. The **Vite**-built workbench and an interactive architecture diagram are served by FastAPI as a single container.  
**Outcome:** Previously deployed on a DigitalOcean Droplet with Caddy reverse proxy and Cloudflare DNS, monitored with Prometheus, Grafana, and Node Exporter. The demo environment was decommissioned on 2026-07-09; [screenshots and deployment documentation](https://github.com/SkyShineTH/FaceRatioOps#project-status-decommissioned) remain in the repository. Automated delivery with GitHub Actions: image publishing to GHCR, SSH-based deployment with health checks and documented rollback, plus CodeQL, Trivy image scanning, Dependabot, and k6 load tests against a documented SLO. Image bytes stay in memory with structured JSON logs that exclude payloads, and documented safety boundaries avoid recognition, identity matching, attractiveness scoring, or sensitive attribute inference.
