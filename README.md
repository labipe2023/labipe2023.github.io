# BKIM Group — Research Website

GitHub Pages-ready website for **BKIM Group**, based on the navigation and visual organization of the uploaded LASER/Quarto example.

## Source and migration status

Original Google Sites: https://sites.google.com/view/bkimgroup/home

**Draft migration:** Google Sites content could not be retrieved programmatically when this project was created. The professor's name, affiliation, research descriptions, publications, photographs and contact details are **not invented**; the site displays clearly marked migration placeholders until verified information is entered.

## Pages

Home · About · Research · Projects · Publications · People · News

Pages work at `index.html?page=research` etc. This project is a dependency-free static website, so no Quarto/Python build step is required for publication.

## Editing content

Open `assets/content.js` and replace the marked fields/arrays with the verified content from Google Sites.
- `profile`: lab name, PI, university, department, intro, mission, email, address.
- `research`: verified research topics and descriptions.
- `projects`: projects with title, status, description, and URL.
- `publications`: papers with title, authors, journal, year, URL.
- `people`: principal investigator and member roster.
- `news`: announcements with real dates.

Do not copy another laboratory's profile, photos or publication data from the reference archive; that archive is for layout inspiration.

## Publish on GitHub Pages

1. Open repository **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Choose branch **main**, folder **/(root)**, and **Save**.
4. Visit https://labipe2023.github.io/ after GitHub shows the deployment as successful.

No deployment is asserted until GitHub Pages is enabled and verified.

## Local preview

Open `index.html` directly, or serve it with:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000/

## Files

- `index.html`: app shell and metadata
- `assets/styles.css`: responsive design
- `assets/app.js`: navigation, page rendering and functionality
- `assets/content.js`: editable content only
- `.nojekyll`: GitHub Pages compatibility

