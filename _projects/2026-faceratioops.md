---
title: "FaceRatioOps — Privacy-First AI Inference API"
category: "MLOps"
stack: ["Python", "FastAPI", "MediaPipe", "Pillow", "NumPy", "Pydantic", "Docker", "Docker Compose", "GitHub Actions", "pytest", "ruff"]
link: "https://github.com/SkyShineTH/FaceRatioOps"
repo_label: "View Repo on GitHub"
---

Privacy-first **FastAPI** inference service for facial geometry analysis using **MediaPipe** face landmarks. The API accepts bounded image uploads, processes image bytes in memory, returns geometric ratios with explainability overlay data, and exposes health, model-info, and metrics endpoints for operations.  
**Outcome:** Built a production-style AI inference project with Docker and Docker Compose workflows, GitHub Actions checks, deterministic tests, structured JSON logs without image payloads, and documented safety boundaries that avoid recognition, identity matching, attractiveness scoring, or sensitive attribute inference.
