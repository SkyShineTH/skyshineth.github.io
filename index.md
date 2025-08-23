---
layout: default
title: "Fasai Utawan"
---
**Data Science & Software Innovation student**<br />
Bangkok, Thailand · +66 9432 86466 · oat404404oat@gmail.com · [skyshineth.github.io](https://skyshineth.github.io)

---

## Projects
{% for project in site.projects %}
### {{ project.title }}
- **Stack:** {% for s in project.stack %}<span class="badge">{{ s }}</span>{% endfor %}  
- {{ project.content | markdownify }}  
- <a class="repo-link" href="{{ project.link }}">
    {{ project.repo_label | default: "View Repo" }}
  </a>
{% endfor %}

---

<div class="section"></div>

## Technical Skills
**Programming:** Python, JavaScript, C/C++ (Basic)  
**AI/ML & DS:** TensorFlow, Keras, OpenCV, scikit-learn, Computer Vision, Deep Learning, Statistical Analysis  
**Web/Frameworks:** Django, FastAPI, REST APIs  
**Databases:** PostgreSQL, MySQL  
**DevOps & Tools:** Docker, Git, System Architecture

<div class="section"></div>

## Education
**B.Sc. Data Science and Software Innovation**, Ubon Ratchathani University  
*Jun 2022 – Present*

<div class="section"></div>

## Languages
Thai (Native), English – B1 (Good reading & listening, basic speaking)

<div class="section"></div>

## Awards / Activities
- 3rd Place Winner, **UBU Data Analytics Hackathon (2024)**

<div class="section"></div>

## Links
- GitHub: https://github.com/skyshineth
- Personal site: https://skyshineth.github.io
- LinkedIn: 