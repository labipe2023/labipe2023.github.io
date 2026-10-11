# BK Research Group, LIPE — GitHub Pages

This is a responsive static-site migration of the [BK Research Group, LIPE Google Sites](https://sites.google.com/view/bkimgroup/home), using the separately uploaded Quarto laboratory website ZIP as an **information architecture and design reference**, not a source of lab content.

## Migration status (11 October 2026)

| Section | Status |
|---|---|
| Publications: 25 referee-reviewed journal papers (J1–J25) | Migrated with each original DOI link |
| Refereed conference proceedings: C1–C10 | Migrated from Google Sites; original listing does not provide DOI links |
| Principal investigator: Prof. Boeun Kim | Profile, institution, office/contact, education, experience migrated |
| Research | Five research areas and six applications migrated/organized |
| Current members | **Pending**; original member page not available to crawler |
| Home, Projects, News, Courses, Gallery | **Not fully migrated**; unavailable content is not invented |

### Bibliographic discrepancy corrected

The original Google Sites listing associates **J20** (Automatica, 157, 111260, 2023; DOI `10.1016/j.automatica.2023.111260`) with the same title as J18. The **publisher's article page** verifies the actual J20 title is *Embedding active learning in batch-to-batch optimization using reinforcement learning*. This correction is explicitly documented on the GitHub Publications page.

- Source: https://sites.google.com/view/bkimgroup/publications
- Publisher: https://www.sciencedirect.com/science/article/abs/pii/S0005109823004211

Other journal metadata reflects what is displayed on Google Sites; publisher metadata was not independently verified for every DOI.

## Website

- `index.html`: responsive style, page templates, site data and navigation. The JavaScript `data` object holds publication, conference, professor and research data.
- `README.md`: status and instructions.
- GitHub repo: https://github.com/labipe2023/labipe2023.github.io

### Local preview

```powershell
python -m http.server 8000
```

Visit http://localhost:8000/ and http://localhost:8000/?page=publications.

### Deploy to GitHub Pages

Go to **Settings → Pages → Build and deployment**, set **Deploy from a branch**, choose **main** and **/(root)**, then click **Save**.

Once GitHub confirms deployment, the Pages URL should be https://labipe2023.github.io/

The connector can edit repository files but has not activated GitHub Pages settings. Therefore live deployment should not be considered verified.

## Editing publications

Find `publications:[...]` and `conferences:[...]` within the `const data` object in `index.html`. Every journal record contains `code`, `year`, `title`, `authors`, `journal`, `doi`, `url`, and `note`. Conference records contain `code`, `year`, `title`, `authors`, and `journal`.

Author markers: `*` corresponding author, `†` co-first authors.
