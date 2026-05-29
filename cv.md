---
layout: cv
title: "CV - Fasai Utawan"
permalink: /cv/
---

## Professional Summary

Data Science & Software Innovation graduate with 4 months of hands-on DevOps internship experience building CI/CD pipelines, supporting Kubernetes workloads on AWS/GCP environments, and deploying containerized applications. Built practical portfolio projects across AI agent infrastructure, privacy-first AI inference, GitOps, computer vision, and data engineering with clear documentation and reproducible workflows. Seeking junior roles in DevOps, MLOps, AI infrastructure, or Data Engineering where automation and reliability matter.

---

## Education

### Ubon Ratchathani University
**Bachelor of Science in Data Science and Software Innovation**  
*2022 - 2026 (Expected)* | **GPAX: 3.35 / 4.00**

**Relevant Coursework:** Machine Learning & Deep Learning, Data Warehousing & Cloud Computing, Exploratory Data Analytics, Software Engineering & Web Programming, Image Analytics & Computer Vision

---

## Work Experience

### DevOps Engineering Intern — Artery Partner Co., Ltd.
*Nov 2025 - Mar 2026*

- Implemented and maintained 4+ CI/CD pipelines using GitLab CI/CD and GitHub Actions, automating build, test, and deployment stages across multiple services and reducing manual release steps
- Supported Kubernetes cluster operations for containerized applications; reduced average issue resolution time by diagnosing and troubleshooting failures using Prometheus and Grafana dashboards
- Supported cloud infrastructure tasks across AWS and GCP, monitoring resource utilization and helping maintain service availability for production workloads
- Developed 3+ internal tool integrations connecting project management platforms, streamlining cross-team workflows and cutting manual handoff steps
- Standardized containerization practices across projects using Docker and Docker Compose, improving environment consistency and onboarding speed for new services
- Contributed to ERP system development using Frappe/ERPNext, building custom modules to support business workflows (details under NDA)

---

## Technical Skills

**Programming Languages:** Python, Go, JavaScript, TypeScript, Dart, SQL, C/C++, Bash/Shell

**Machine Learning, AI & Agents:** TensorFlow, Keras, OpenCV, Scikit-learn, Deep Learning, AI Agent Tooling

**Web & API Development:** React, Next.js, Flutter, Django, FastAPI, Pydantic, Frappe/ERPNext, REST APIs, HTML/CSS

**DevOps & Infrastructure:** Docker, Docker Compose, Kubernetes, Helm, Argo CD, Argo Rollouts, Lens/OpenLens, GitLab CI/CD, GitHub Actions, Jenkins, Prometheus, Grafana, Nginx, Linux, Git

**Cloud Platforms:** AWS (Amazon Web Services), Google Cloud Platform (GCP)

**Database & Data:** PostgreSQL, MySQL, SQLite, Data Warehousing, ETL Processes

**Data Analysis & Visualization:** Pandas, NumPy, Matplotlib, Seaborn, Power BI, Looker

**Development Tools:** Visual Studio Code, Jupyter Notebook, Postman, Web3.py, Solidity

---

## Projects

### AgentGate — Permission Gateway for AI Agents
[GitHub](https://github.com/SkyShineTH/AgentGate) | **Technologies:** Python, Pydantic, Typer, SQLite, pytest, ruff, CLI, Policy Engine, Audit Logs

- Built a provider-agnostic permission gateway that normalizes proposed AI-agent tool calls into structured requests before policy evaluation and execution
- Implemented deterministic allow, deny, and require-approval policy decisions for file-oriented and shell-style actions with public/private workspace boundaries and path traversal protection
- Added a SQLite approval queue, approval edit history, JSONL or SQLite audit logs, CLI inspection commands, and regression tests for safer agent automation workflows

### FaceRatioOps — Privacy-First AI Inference API
[Live](https://faceratioops.skyshine.online) | [GitHub](https://github.com/SkyShineTH/FaceRatioOps) | **Technologies:** Python, FastAPI, MediaPipe, Pillow, NumPy, Pydantic, Caddy, Docker, Docker Compose, Prometheus, Grafana, GitHub Actions, pytest, ruff

- Built a FastAPI inference service that analyzes MediaPipe face landmarks from bounded image uploads and returns geometric ratios with explainability overlay data
- Processed uploaded images in memory only, avoided image payload logging, and documented safety boundaries against recognition, identity matching, attractiveness scoring, and sensitive attribute inference
- Added health, model-info, compatibility, and Prometheus-style metrics endpoints for operational visibility
- Containerized the API with Docker and Docker Compose, added GitHub Actions checks for linting, tests, and Docker image build validation, and deployed to production on a DigitalOcean Droplet with Caddy reverse proxy, Cloudflare DNS, and a Prometheus + Grafana monitoring stack

### Clinic Demo — DevOps-Focused Next.js Deployment Project
[GitHub](https://github.com/SkyShineTH/Clinic-Demo) | [Live](https://clinic-demo.skyshine.online) | **Technologies:** Next.js, React, TypeScript, Tailwind CSS v4, next-intl, Docker, Docker Compose, GitHub Actions

- Repositioned a bilingual Next.js clinic demo as a production-style deployment project covering CI/CD, Docker workflows, environment configuration, and operational readiness
- Implemented GitHub Actions checks for linting, TypeScript validation, production builds, smoke flow validation, Docker image build, and Compose readiness
- Added health and readiness endpoints, safe `.env.example` defaults, Dependabot grouping, and structured booking API logs without exposing booking payloads
- Deployed to custom domain [clinic-demo.skyshine.online](https://clinic-demo.skyshine.online) with documented release and rollback workflow

### FootyBrain - Football Analytics Platform
[GitHub](https://github.com/SkyShineTH/FootyBrain) | **Technologies:** Python, FastAPI, Next.js, TypeScript, PostgreSQL, Docker, Generative AI

- Developed a comprehensive Data Warehouse system for collecting and storing football data from multiple sources
- Built an AI-powered prediction system to forecast match outcomes using machine learning algorithms
- Created automated reporting dashboards with real-time analytics and data visualizations
- Implemented Generative AI for natural language report generation and insights extraction
- Designed ETL (Extract, Transform, Load) pipelines for processing large-scale football datasets
- Utilized Docker Compose for orchestrating multi-container application deployment

### Shipyard — GitOps Platform
[Live Demo](https://shipyard.skyshine.online) | [GitHub](https://github.com/SkyShineTH/Shipyard) | **Technologies:** React, Go, PostgreSQL, Docker, DOKS, Helm, Argo CD, Argo Rollouts, GitHub Actions, GHCR

- Built a full-stack GitOps portfolio platform with a React (Vite) frontend and Go microservices (JWT auth, todo CRUD, platform-status snapshot API) backed by PostgreSQL
- Deployed an on-demand DigitalOcean Kubernetes demo with Argo CD Applications, a DigitalOcean Load Balancer, Cloudflare strict SSL, and PostgreSQL on Block Storage
- Tuned resource requests and replica counts to keep the live demo running on a small 1-node cluster while preserving the GitOps workflow
- Packaged services with Helm charts and used Argo Rollouts for canary-style progressive delivery on the todo service
- Implemented 4 path-filtered GitHub Actions CI workflows per service; added a public case-study page backed by the platform-status API with scoped Kubernetes RBAC

### Face Recognition Attendance System
[GitHub](https://github.com/oatin/Face-Recognition-Attendance) | **Technologies:** Python, Django REST Framework, FastAPI, PostgreSQL, Docker, OpenCV, TensorFlow, Raspberry Pi

- Developed an automated Face Recognition Attendance System to improve check-in accuracy and operational efficiency
- Designed a decentralized architecture where Raspberry Pi devices perform local face recognition and sync results to backend API
- Implemented offline mode with automatic data synchronization when internet connectivity is restored
- Built a training service using Docker for continuous model updates and improvements
- Enabled seamless multi-classroom deployment with centralized PostgreSQL database management

### PyCPBoost - Python C++ Extension
[GitHub](https://github.com/SkyShineTH/PyCPBoost) | **Technologies:** Python, C++, Python C API (Python.h)

- Created a Python C++ extension to study performance optimization and computational overhead
- Implemented C++ bindings using Python C API for high-performance mathematical operations
- Conducted comprehensive benchmarking demonstrating 92-93x speedup for heavy computational tasks
- Analyzed the trade-offs between Python and C++ for different types of workloads

### Carbon Credit Trading Platform
**Technologies:** Django, Web3.py, Solidity (Smart Contracts), Docker

- Built a web-based marketplace for carbon credit trading using Django and blockchain technology
- Developed Solidity smart contracts for secure token minting, transfers, and escrow mechanisms
- Integrated Web3.py for blockchain interaction and transaction management
- Containerized the application using Docker for simplified deployment and scalability

### Call Taxi Website
**Technologies:** Django, Leaflet.js API, PostgreSQL

- Developed a taxi booking platform with Django backend and interactive map integration
- Implemented Leaflet.js API for real-time visualization of customer locations and nearby taxis
- Designed database schema for efficient storage and retrieval of booking and location data

---

## Certifications & Achievements

### Architecture 1001: x86-64 Assembly — OpenSecurityTraining2
*Issued June 2025* | [Verify Credential](https://p.ost2.fyi/certificates/e13de2675d4f4a528df1f67b788c794d)

- Completed a 28.5-hour x86-64 assembly course covering low-level computing foundations for computer architecture, reverse engineering, operating systems, and system security

### 3rd Place Winner, UBU Data Analytics Hackathon
*November 2024*

- Competed with 12 teams (60 participants) in analyzing university network usage Big Data
- Utilized Power BI and Looker for advanced data visualization and analysis
- Presented data-driven solutions for Digital University transformation initiatives
- Addressed the challenge: "How can we develop new services to enhance information systems supporting Digital University through Data Analytics and Visualizations?"

### UBU Startup Academy
*December 2023*

- Completed entrepreneurial thinking and business planning training program
- Gained hands-on experience in market analysis, team management, and investor pitch presentation
- Learned startup methodologies from idea validation to professional product development
- Received mentorship from experienced entrepreneurs and business advisors

### IoT Smart Natural Rubber Hackathon
*2024*

- Designed system architecture and technology stack for IoT-based natural rubber monitoring solution
- Applied design patterns and best practices for scalable IoT system development
- Collaborated with cross-functional team to deliver innovative agricultural technology solution

---

## Additional Information

**Languages:** Thai (Native), English (B1 - Good reading & listening, basic speaking)

**Learning Focus:** Deepening knowledge in DevOps practices, cloud infrastructure management, MLOps, and CI/CD automation

**Open Source Contributions:** Active GitHub contributor with multiple public repositories showcasing diverse technical skills

**Technical Interests:** Infrastructure automation, containerization, machine learning operations (MLOps), and distributed systems
