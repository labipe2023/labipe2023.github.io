# BKIM Group website (GitHub Pages)

A responsive, zero-dependency **migration preview** of the BKIM Group laboratory website.

- Original Google Sites: https://sites.google.com/view/bkimgroup/home
- Target repository: https://github.com/labipe2023/labipe2023.github.io
- Expected Pages URL after deployment: https://labipe2023.github.io/

## Important migration limitation

The original Google Sites page could not be read in the available browser/search environment, so the **original site's contents have not been copied**. This preview provides a complete navigation system and editable templates for the seven pages: Home, About, Research, Projects, Publications, People, News. Empty profile and academic records intentionally appear as "awaiting verification", not as invented data.

The uploaded `kayhryu89.github.io-main.zip` (LASER research lab) was used **only as a reference for general layout and information architecture**. Its members, photos, addresses, publications, and project data do not belong to BKIM Group and have not been copied.

## Files

- `index.html`: all HTML, CSS, client-side routing, and editable site data
- `README.md`: setup and migration status

## Edit site contents

Open `index.html` and locate:

```javascript
const data={
 lab:"BKIM Group",
 description:"...",
 mission:"...",
 professor:"",university:"",department:"",email:"",address:"",
 research:[],projects:[],publications:[],people:[],news:[]
};
```

Fill in verified data obtained from the original Google Sites page. Example item structures are noted immediately underneath the data object. For research, use `{title,description,keywords}`; projects `{title,period,status,description,url}`; publications `{title,authors,journal,year,url}`; people `{name,role,description,image}`; and news `{date,title,body}`. Do not use unverified content.

## GitHub Pages deployment

1. Open the repository's **Settings → Pages**.
2. **Build and deployment → Source:** Deploy from a branch.
3. **Branch:** main, **Folder:** /(root).
4. Click **Save**; wait for GitHub to display a successful Pages deployment.
5. Open https://labipe2023.github.io/

The GitHub connector can create and update repository files, but this workflow did **not** enable GitHub Pages in repository settings, and the live URL has not yet been confirmed. 

## Preview locally

```powershell
python -m http.server 8000
```

Browse to http://localhost:8000/. No Quarto, Node.js, or Python dependencies are required to build the site.
