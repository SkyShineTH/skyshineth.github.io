# Fasai Utawan — Portfolio (GitHub Pages)
Minimal Jekyll portfolio for Fasai Utawan, a Junior System Engineer at BBTV New Media Co., Ltd.

The career path shown here runs from a Data Science and Software Innovation degree through a DevOps internship to the current system engineering role. DevOps, cloud, and software development projects document hands-on learning; DevSecOps and Cloud Security are long-term directions.

The home page is a 3D scroll story (Three.js + GSAP ScrollTrigger): about, projects, skills and contact in one continuous camera move. Its text lives in the `index.md` front matter; the layout is `_layouts/story.html`, with `assets/css/story.css` and `assets/js/story.js`. Visitors with reduced motion, or without WebGL, get a plain version of the same content.

The full CV is at `/cv` (`cv.md`, `_layouts/cv.html`).

To rebuild the slim Three.js file after changing which parts the page uses:

```
npm install
npm run build:three
```
