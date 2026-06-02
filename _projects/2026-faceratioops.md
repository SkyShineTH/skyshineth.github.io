---
title: "FaceRatioOps — Privacy-First AI Inference API"
category: "MLOps"
stack: ["Python", "FastAPI", "MediaPipe", "Pillow", "NumPy", "Pydantic", "React", "Vite", "TypeScript", "Docker", "Docker Compose", "Caddy", "GHCR", "Prometheus", "Grafana", "Node Exporter", "GitHub Actions", "CodeQL", "Trivy", "k6", "pytest", "ruff"]
link: "https://github.com/SkyShineTH/FaceRatioOps"
repo_label: "View Repo on GitHub"
demo_link: "https://faceratioops.skyshine.online"
demo_label: "View Live Demo"
---

Privacy-first **FastAPI** inference service for facial geometry analysis using **MediaPipe** face landmarks, paired with a **React + TypeScript** workbench that runs in the browser. The API accepts bounded image uploads, processes image bytes in memory, returns geometric ratios with explainability overlay data, and exposes health, model-info, and Prometheus-style metrics endpoints. The **Vite**-built workbench and an interactive architecture diagram are served by FastAPI as a single container.  
**Outcome:** Deployed to production on a DigitalOcean Droplet with Caddy reverse proxy and Cloudflare DNS, monitored with Prometheus, Grafana, and Node Exporter. Automated delivery with GitHub Actions: image publishing to GHCR, SSH-based deployment with health checks and documented rollback, plus CodeQL, Trivy image scanning, Dependabot, and k6 load tests against a documented SLO. Image bytes stay in memory with structured JSON logs that exclude payloads, and documented safety boundaries avoid recognition, identity matching, attractiveness scoring, or sensitive attribute inference.
