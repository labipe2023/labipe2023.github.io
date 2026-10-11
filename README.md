# BK Research Group, LIPE — website migration

A dependency-free static website hosted in the `labipe2023/labipe2023.github.io` GitHub repository.

- **Original website:** https://sites.google.com/view/bkimgroup/home
- **Original Publications page:** https://sites.google.com/view/bkimgroup/publications
- **Original Research page:** https://sites.google.com/view/bkimgroup/research
- **GitHub Pages URL** (after Pages is enabled): https://labipe2023.github.io/

## Design

The site uses the original Google Sites information architecture and a restrained, Google Sites-like visual style: white sticky navigation, neutral content areas, simple text typography and original academic bibliography notation. This replaces the initial dark-gradient / tiled-card design.

Navigation matches the original:
Home · People (Professor / Current Members) · Research · Publications · Courses · News · Gallery.

The user-supplied `kayhryu89.github.io-main.zip` served as the reference for **year headers, hanging bibliography layout and table of contents**. No people, photos or publications from the other laboratory were imported.

The original **Home page visual imagery could not be verified** in the available retrieval environment. The neutral home cover is therefore a deliberate approximation, not a pixel-accurate copy of any unverified home banner image.

## Publication formatting update (October 2026)

- Professor **Boeun Kim** (abbreviated B. Kim or Kim, B.) is **bold black** in citations.
- Confirmed laboratory member coauthors are **bold blue**. The app matches whole author tokens, not just surnames. Add verified citation-format author aliases to `data.labMemberAuthorAliases` in `assets/content.js`, or add members with an `authorAliases` array to `data.people`. At present the original Current Members page is inaccessible to the retrieval service, so other people are not incorrectly labeled as group members.
- Publication headings use 2025 / 2024 / 2023, and **~2023.09 (Prior to Faculty Appointment)** for earlier work. Prof. Kim started the faculty appointment in Sep. 2023.
- J22 is in the earlier group on the basis of an August 2023 article index date; the original journal issue is dated Oct. 2023. J20 and J21 remain in the 2023 group.
- Both Journal Articles and Conference Proceedings retain their original reference numbers, DOI information and chronological ordering. The left TOC keeps only the two category links.

## Publications

The original public bibliography includes:
- **25 Refereed Journal Articles** (J25 through J1), grouped by publication year with direct DOI links and source numbering
- **10 Refereed Conference Proceedings** (C10 through C1), grouped by year
- Original corresponding-author (`*`) and co-first-author (`†`) notation
- Original front-cover article notes (where listed)
- Sticky **left "On this page" table of contents** with links to both categories and every publication year (on mobile, a compact table of contents appears above the bibliography)

**J20 metadata note:** The original website repeats the title of J18, even though it points to an Automatica DOI. This migration uses the publisher-confirmed title *Embedding active learning in batch-to-batch optimization using reinforcement learning* for DOI `10.1016/j.automatica.2023.111260`, and explains that adjustment on the page.

## Source files

```
index.html
assets/
  content.js    # Verified lab profile, research topics, 25 journal + 10 conference records
  styles.css    # Google Sites-inspired responsive CSS
  app.js        # Navigation, year groups, sticky TOC, page rendering
README.md
```

**To edit content**, update the `data` object inside `assets/content.js`. The `publications` array has DOI and bibliographic metadata, `conferences` has proceedings. Do not change original identifiers when adding or updating a record. Sections that still lack verified sources show a neutral notice rather than invented information.

## Local testing

No Node/Quarto/Python dependencies are required for deployment. If Python is installed, run:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000/` and `http://localhost:8000/?page=publications`. Test year links (e.g. `#journal-2025` and `#conference-2022`), DOI links and the mobile navigation menu.

## GitHub Pages activation

In repository **Settings → Pages → Build and deployment**:
1. Select **Deploy from a branch**.
2. Select **main** and **/(root)**.
3. Save and verify the first successful deployment.

The repository files have been updated, but the public Pages deployment is not asserted as verified.
