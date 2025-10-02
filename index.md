---
layout: default
title: "Fasai Utawan"
---
**Data Science & Software Innovation student**<br />
fasai.utawan@gmail.com · [Github](https://github.com/SkyShineTH)

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
**Programming Languages:** Python, JavaScript, Dart, SQL, C/C++ (Basic)
**AI/ML & Data Science:** TensorFlow, Keras, OpenCV, Scikit-learn
**Mobile Development:** Flutter
**Web Development:** Django, FastAPI, REST APIs, HTML/CSS, JavaScript 
**Cloud & Database:** PostgreSQL, MySQL, AWS
**DevOps & Tools:** Docker, Git, System Architecture, Jupyter Notebook
**Hardware Integration:** Raspberry Pi, Camera Systems [face recognition project](https://github.com/oatin/Face-Recognition-Attendance)

<div class="section"></div>

## Links
- GitHub: https://github.com/skyshineth
- Personal site: https://skyshineth.github.io
- LinkedIn: linkedin.com/in/fasai-utawan-894b82386