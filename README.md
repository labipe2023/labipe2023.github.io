# BK Research Group, LIPE — GitHub Pages Migration

**Source website:** https://sites.google.com/view/bkimgroup/home  
**Migrated site:** https://labipe2023.github.io/  
**Repository:** https://github.com/labipe2023/labipe2023.github.io

This repository contains a dependency-free, responsive HTML/CSS/JavaScript migration of the **Laboratory for Intelligent Process Engineering (LIPE)** at Kongju National University. Page content and original photos were collected directly from the publicly available Google Sites pages on **11 October 2026** using a one-time GitHub Actions browser download.

## Page migration inventory

| Page | What was migrated from Google Sites |
| --- | --- |
| Home | Official research-laboratory title, bilingual welcome, research goal, email and university address |
| People → Professor | Prof. Boeun Kim's biography, contact details, education, professional experience, original portrait |
| People → Current Members | 5 members with the five original photographs, plus 3 verified alumni and research topics |
| Research | Five listed research areas and applications, including their nested structure |
| Publications | 25 journal papers with DOI links and 10 conference proceedings; original J/C numbering retained |
| Courses | Semester-by-semester courses from 2023 to 2026 |
| News | Seven announcements from 2023 to 2026 |
| Gallery | Events organized by 2026 / 2025 / 2024, with **10 original photographs** from the public gallery and verified captions |

**Image sources:** `source-original/images/` contains the publicly published originals (professor photo, member portraits, gallery/event images, and two publication-related images). The website loads them from the repository instead of depending on long-lived Google Sites media URLs. The page-text extraction with URLs and image provenance is in `source-original/manifest.json` and `source-original/rendered-gallery.json`. Original layout comparison screenshots are kept under `source-original/reference-screenshots/`.

**Visual fidelity:** Styling reflects actual screenshots of the original public site, including the purple headings, white header, navigation order, member portrait-and-text positioning, centered welcome paragraph, semester text listings and gallery photo captions. External embeds may not reproduce the original Google Sites runtime exactly.

## Publications

- Refereed Journal Articles **J25–J1** and Refereed Conference Proceedings **C10–C1**
- Direct DOI links for all 25 journal papers
- Annual headings for 2023 onward and one grouped archive labeled **`~2023.09 (Prior to Faculty Appointment)`** for papers from before the September 2023 faculty appointment
- Original author-marker notation: `*` corresponding author and `†` equal/co-first author
- **Boeun Kim:** bold black; **verified lab-member coauthors:** bold blue; others: regular. The member roster and original English-name spellings are defined in `assets/content.js`; add abbreviated citation names to `labMemberAuthorAliases` only when they can be verified.
- Left-hand navigation contains just **Journal Articles** and **Conference Proceedings**, with no TOC heading or year links.
- Original J20 Google Sites title did not match its DOI record; the DOI-matched publisher title is used on the migrated page, with a note.

## Project files

```
index.html                  Main page structure and navigation
assets/
  app.js                    Page renderers, research list, bibliography, gallery
  content.js                Research, member, course, news, gallery and paper data
  styles.css                Original-inspired responsive styles
source-original/
  images/                   Downloaded original site photos
  manifest.json             Original Google Sites page content and source metadata
  rendered-gallery.json     Lazy-loaded gallery photo captions and source URLs
  reference-screenshots/    Screenshots of the original public pages for design review
scripts/
  import_google_sites.py    One-time original-site content and image import
  capture_google_sites.py   Original-site visual reference capture
  collect_gallery_media.py  Additional lazy-loaded gallery images
  verify_deployed_site.py   Live GitHub Pages browser QA
```

The uploaded `kayhryu89.github.io-main.zip` was **only a reference for bibliography year-group and navigation concepts**; its photographs, staff, and publication records were not copied into the BK Research Group website.

## Local preview

No site build step is required. On Windows with Python:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000/` and `http://localhost:8000/?page=publications`.

## Deployment

GitHub Pages publishes the root of the `main` branch through the repository's Pages configuration. A browser-based check runs through `scripts/verify_deployed_site.py`, recording deployment, image-loading and script-error results under `site-check/` when the QA workflow is triggered.

For subsequent content changes, edit `assets/content.js`, commit to `main`, and allow GitHub Pages to redeploy.
