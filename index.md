---
layout: story
title: "Fasai Utawan"
role: "Junior System Engineer"
tagline: "Junior System Engineer · AWS / DevOps · Software Development · Data Technologies"
description: "Fasai Utawan, junior system engineer. Public projects in GitOps, CI/CD, monitoring and security scanning, growing toward DevSecOps and cloud security."

# 01 / About: three scenes, shown during the flight over the grid.
about:
  - label: "ORIGIN"
    en_title: "I learn by building."
    en: "I came to infrastructure through data: I studied data science and software at Ubon Ratchathani University, then found that what I enjoy most is system security, keeping what we build and deploy running safely."
    th_title: "เรียนรู้จากการลงมือสร้าง"
    th: "ผมเข้าสู่งาน infrastructure ผ่านงานข้อมูล เรียน Data Science และ Software ที่ มอ.อุบลฯ แล้วพบว่าสิ่งที่สนุกที่สุดคือความปลอดภัยของระบบ คือทำให้ระบบที่ถูกสร้างและ deploy แล้วทำงานต่อเนื่องได้อย่างปลอดภัย"
  - label: "NOW"
    en_title: "Early, and in public."
    en: "I'm early in my career as a junior system engineer, and I keep my projects public on GitHub so the work can be checked. They cover GitOps, CI/CD, monitoring, and security scanning."
    th_title: "ช่วงต้นอาชีพ งานเปิดให้ตรวจได้"
    th: "ผมยังอยู่ช่วงต้นอาชีพในฐานะ Junior System Engineer และเปิดโปรเจกต์ไว้บน GitHub เพื่อให้ตรวจสอบงานได้ โปรเจกต์ครอบคลุม GitOps, CI/CD, monitoring และ security scanning"
  - label: "DIRECTION"
    en_title: "Toward DevSecOps."
    en: "I'm growing toward DevSecOps and cloud security, and improving my English alongside my technical skills."
    th_title: "มุ่งสู่ DevSecOps"
    th: "กำลังเติบโตไปทาง DevSecOps และ cloud security และฝึกภาษาอังกฤษควบคู่กับทักษะเทคนิค"

# 02 / Projects: one billboard per project in the city. Keep 3 or fewer, with at most one "coming soon".
# Leave a list empty ([]) to hide that block on the card.
projects:
  - title: "Shipyard"
    billboard: ["SHIPYARD", "GITOPS"]
    # Optional picture on the 3D sign (about 1024 x 640). Leave it out to show the big text instead.
    bill_image: "/assets/images/projects/shipyard-billboard.webp"
    badge: "Personal project · Demo decommissioned"
    tagline: "A GitOps platform built to learn progressive delivery on Kubernetes."
    tags: ["React", "Go", "PostgreSQL", "Helm", "Argo CD", "Argo Rollouts"]
    about: "Shipyard is a small microservices app (React frontend, Go services, PostgreSQL) deployed entirely through Git. Argo CD syncs the cluster from the repository, and Argo Rollouts releases new versions as canaries. I built it on my own while studying, to see how a GitOps delivery flow works end to end."
    built:
      - "A React frontend and Go services for login, to-dos and platform status, backed by PostgreSQL"
      - "Helm charts and an Argo CD setup that deploy the services from Git"
      - "Canary releases with Argo Rollouts"
    learned: []  # TODO: one thing, in your own words
    links:
      - label: "GitHub"
        url: "https://github.com/SkyShineTH/Shipyard"
      - label: "Case study"
        url: "https://github.com/SkyShineTH/Shipyard/blob/main/docs/doks-live-demo.md"
  - title: "Coming soon"
    billboard: ["NEXT", "SOON"]
    badge: "In progress"
    tagline: "I'm building a new set of projects. They will land here, and on GitHub first."
    tags: []
    about: ""
    built: []
    learned: []
    links:
      - label: "Follow on GitHub"
        url: "https://github.com/SkyShineTH"

# 04 / Skills & credentials: shown on the terminal screen.
skills:
  core: ["Python", "Go", "SQL", "Bash", "AWS", "Linux", "Docker", "Kubernetes/Helm", "Argo CD", "GitHub Actions/GitLab CI/CD", "Prometheus/Grafana"]
  familiar: ["GCP", "Jenkins", "Nginx", "JS/TS", "PostgreSQL/MySQL", "Pandas/ETL", "Power BI", "React/Next.js", "Django/FastAPI", "Flutter", "TensorFlow/OpenCV"]
credentials:
  - name: "AWS Certified Cloud Practitioner (CLF-C02)"
    short: "AWS Cloud Practitioner"
    issued: "Oct 2026"
    source: "Credly"
    url: ""  # TODO: Credly link
  - name: "AWS Academy Graduate: Data Engineering"
    short: "AWS Academy: Data Engineering"
    issued: "Oct 2025"
    source: "Credly"
    url: "https://www.credly.com/badges/1178b4a3-611b-49ac-a78f-b6a9d9374283/public_url"
  - name: "AWS Academy Graduate: Cloud Foundations"
    short: "AWS Academy: Cloud Foundations"
    issued: "Jul 2025"
    source: "Credly"
    url: "https://www.credly.com/badges/dc13967f-2aab-43a8-ac04-c046d6400546/public_url"
  - name: "OpenSecurityTraining2: x86-64 Assembly"
    short: "OST2: x86-64 Assembly"
    issued: "Jun 2025"
    source: "OpenSecurityTraining2"
    url: "https://p.ost2.fyi/certificates/e13de2675d4f4a528df1f67b788c794d"

# 05 / Contact. GitHub Pages has no backend, so there is no form yet.
contact:
  title: "Get in touch"
  text: "Want to talk about DevOps, cloud, or security? Send a message. I reply in Thai or English."
  github: "https://github.com/SkyShineTH"
  linkedin: "https://www.linkedin.com/in/fasai-utawan/"
  cv: "/cv/"
---
