/* Site navigation and reference formatting for BK Research Group, LIPE.
 * Zero dependencies; classic scripts load content.js before this file. */
"use strict";

const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[ch]));
const safeUrl = value => /^https:\/\//i.test(String(value || "")) ? esc(value) : "#";
const routeUrl = page => page === "home" ? "./" : "?page=" + encodeURIComponent(page);
const originalRoot = "https://sites.google.com/view/bkimgroup";
const alias = {about: "professor", people: "members", projects: "research"};
const rawPage = new URLSearchParams(location.search).get("page") || "home";
const currentPage = alias[rawPage] || rawPage;
const validPages = new Set(["home", "professor", "members", "research", "publications", "courses", "news", "gallery"]);
const page = validPages.has(currentPage) ? currentPage : "home";

function buildNavigation() {
  const menu = [
    ["home", "Home"], ["research", "Research"],
    ["publications", "Publications"], ["courses", "Courses"],
    ["news", "News"], ["gallery", "Gallery"]
  ];
  const link = ([id, name]) =>
    '<a class="nav-link" href="' + routeUrl(id) + '"' +
      (page === id ? ' aria-current="page"' : '') + '>' + esc(name) + '</a>';
  const people =
    '<details class="nav-dropdown' + (["professor", "members"].includes(page) ? ' active' : '') + '">' +
      '<summary>People <span class="chevron" aria-hidden="true">⌄</span></summary>' +
      '<div class="nav-submenu">' +
        '<a href="?page=professor"' + (page === "professor" ? ' aria-current="page"' : '') + '>Professor</a>' +
        '<a href="?page=members"' + (page === "members" ? ' aria-current="page"' : '') + '>Current Members</a>' +
      '</div></details>';
  document.querySelector("#nav").innerHTML = link(menu[0]) + people + menu.slice(1).map(link).join("");
  document.querySelector("#menu").addEventListener("click", () => {
    const nav = document.querySelector("#nav");
    const opened = nav.classList.toggle("open");
    document.querySelector("#menu").setAttribute("aria-expanded", String(opened));
  });
  document.querySelector("#nav").querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    document.querySelector("#nav").classList.remove("open");
    document.querySelector("#menu").setAttribute("aria-expanded", "false");
  }));
}

function header(title, subtitle="") {
  return '<section class="page-heading"><div class="container"><h1>' + esc(title) + '</h1>' +
    (subtitle ? '<p>' + esc(subtitle) + '</p>' : '') + '</div></section>';
}
function part(title, body, cls="") {
  return '<section class="content-section '+ cls + '"><h2>' + esc(title) + '</h2>' + body + '</section>';
}
function items(xs, cls="plain-list") {
  return '<ul class="' + cls + '">' + xs.map(x => '<li>' + esc(x) + '</li>').join("") + '</ul>';
}
function yearOf(item) {
  const match = String(item.year || "").match(/(?:19|20)\d{2}/);
  return match ? match[0] : "Other";
}

// Boeun Kim joined Kongju National University as Assistant Professor in Sep 2023.
// Group earlier publications in one archival block, retaining the original reference numbers and years.
// For J22 (2023) the earliest online record is Aug 2023, although the journal issue is Oct 2023.
const PRE_APPOINTMENT = "pre-appointment";
const PRE_APPOINTMENT_LABEL = "~2023.09 (Prior to Faculty Appointment)";
function publicationGroup(pub) {
  const year = Number(yearOf(pub));
  if (year && year < 2023) return PRE_APPOINTMENT;
  if (year === 2023 && /^2023-0[1-8]$/.test(pub.firstOnlineMonth || "")) return PRE_APPOINTMENT;
  return Number.isFinite(year) ? String(year) : "Other";
}
function groupedYears(records) {
  return [...new Set(records.map(publicationGroup))].sort((a,b) => {
    if (a === PRE_APPOINTMENT) return 1;
    if (b === PRE_APPOINTMENT) return -1;
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return Number(b)-Number(a);
  });
}
function authorKey(author) {
  return String(author || "").replace(/[†*]/g, "").toLowerCase().replace(/[^a-z가-힣]/g, "");
}
const PI_AUTHOR_NAMES = new Set(["B. Kim", "Kim, B.", "Boeun Kim", "Kim, Boeun"].map(authorKey));
// Lab-member aliases must correspond to confirmed current or former group members;
// names are not guessed from coauthorship alone.
const LAB_MEMBER_NAMES = new Set([
  ...(data.labMemberAuthorAliases || []),
  ...(data.people || []).filter(p => !/principal investigator/i.test(p.role || "")).flatMap(p => [p.name, ...(p.authorAliases || [])])
].map(authorKey));
function styledAuthors(pub) {
  return String(pub.authors || "").split(/\s*;\s*/).map(part => {
    const name = part.trim();
    const key = authorKey(name);
    const role = PI_AUTHOR_NAMES.has(key) ? "author-pi" : LAB_MEMBER_NAMES.has(key) ? "author-lab" : "";
    return role ? '<strong class="' + role + '">' + esc(name) + '</strong>' : esc(name);
  }).join(", ");
}
function bibliographyItem(pub, type="journal") {
  const authors = styledAuthors(pub);
  const code = esc(pub.code || "");
  const doi = type === "journal" && pub.doi
    ? ' <a class="ref-doi" href="' + safeUrl(pub.url) + '" target="_blank" rel="noopener noreferrer">doi.org/' + esc(pub.doi) + ' ↗</a>'
    : "";
  const cover = type === "journal" && /Selected as the front cover article/i.test(pub.note || "")
    ? ' <span class="ref-cover">Selected as the front cover article.</span>' : "";
  const journal = esc(pub.journal || "");
  return '<li class="reference-item" id="ref-' + code.toLowerCase() + '">' +
    '<span class="ref-index">[' + code + ']</span>' +
    '<div class="ref-body">' + authors + ', “<span class="ref-title">' + esc(pub.title) +
    '</span>,” <em>' + journal + '</em>, ' + esc(pub.year || "") + '.' + doi + cover + '</div>' +
    '</li>';
}
function yearlyReferences(records, type) {
  return groupedYears(records).map(group => {
    const id = type + '-' + group;
    const label = group === PRE_APPOINTMENT ? PRE_APPOINTMENT_LABEL : group;
    const pubList = records.filter(x => publicationGroup(x) === group);
    return '<div class="year-group"><h3 class="pub-year' + (group === PRE_APPOINTMENT ? ' archive-period' : '') +
      '" id="' + id + '">' + esc(label) + '</h3>' +
      '<ol class="reference-list" aria-label="' + esc(label) + ' ' + (type === "journal" ? "journal articles" : "conference proceedings") + '">' +
      pubList.map(x => bibliographyItem(x, type)).join("") + '</ol></div>';
  }).join("");
}
function toc() {
  return '<aside class="toc" aria-label="Publication page navigation">' +
    '<nav class="toc-categories" aria-label="Jump to publication section">' +
      '<a class="toc-category" href="#journals">Journal Articles</a>' +
      '<a class="toc-category" href="#proceedings">Conference Proceedings</a>' +
    '</nav></aside>';
}
function publications() {
  return '<div class="container main-content publications-layout">' + toc() +
    '<div class="publications-content">' +
      '<section class="publication-section" id="journals">' +
        '<h2>Refereed Journal Articles</h2>' +
        '<p class="bib-note">* Corresponding author, † Co-first authors</p>' +
        yearlyReferences(data.publications, "journal") +
      '</section>' +
      '<section class="publication-section" id="proceedings">' +
        '<h2>Refereed Conference Proceedings</h2>' +
        yearlyReferences(data.conferences, "conference") +
      '</section>' +
      '<p class="bib-note">Publication numbers [J1]–[J25] and [C1]–[C10] follow the original laboratory website. The title of J20 was corrected to match the linked publisher DOI record. Conference DOI links are omitted because they are not listed in the original page.</p>' +
      '<p class="back-to-top"><a href="#app">↑ Back to top</a></p>' +
    '</div></div>';
}

function photo(src, alt, cls="") {
  const path = String(src || "");
  const url = path.startsWith("source-original/images/") ? path : "";
  return url ? '<img class="' + esc(cls) + '" src="' + esc(url) + '" alt="' + esc(alt) +
    '" loading="lazy" decoding="async">' : "";
}
function home() {
  return '<section class="home-cover"><div class="container home-cover-inner">' +
      '<h1>' + esc(data.home.title) + '</h1>' +
      '<p class="home-subtitle">LIPE · 지능형공정공학연구실</p>' +
    '</div></section>' +
    '<div class="container main-content home-main">' +
      '<section class="content-section home-welcome">' +
        '<h2>' + esc(data.home.welcome) + '</h2>' +
        '<p class="intro-copy">' + esc(data.home.goal) + '</p>' +
        '<p class="intro-copy">' + esc(data.home.contact.replace(" via bkim@kongju.ac.kr"," via ")) +
          '<a href="mailto:' + esc(data.email) + '">' + esc(data.email) + '</a></p>' +
      '</section>' +
      '<section class="content-section home-contact">' +
        '<p>' + data.home.addressKo.map(esc).join("<br>") + '</p>' +
        '<p>' + esc(data.home.addressEn) + '</p>' +
      '</section>' +
    '</div>';
}
function research() {
  return header("Research") + '<div class="container main-content slim">' +
    part("Research Area", items(data.research.map(r => r.title))) +
    part("Applications", '<p class="text-muted">(will be updated)</p>' +
      items(data.applications)) + '</div>';
}
function professor() {
  return header("Professor") + '<div class="container main-content slim">' +
    '<section class="professor-profile">' +
      photo(data.professorPhoto,"Portrait of Professor Boeun Kim","professor-photo") +
      '<div class="professor-details"><h2>김보은, Boeun Kim</h2>' +
      '<p>조교수 / Assistant Professor<br>공주대학교 천안공과대학 화학공학부<br>' +
      esc(data.department) + ',<br>' + esc(data.university) + '</p>' +
      '<p>Office: 9공학관 1001호<br>Tel: ' + esc(data.phone) + '<br>' +
      'Email: <a href="mailto:' + esc(data.email) + '">' + esc(data.email) + '</a></p></div></section>' +
    part("Education", items(data.education, "profile-list")) +
    part("Professional Experiences", items(data.experience, "profile-list")) + '</div>';
}
function memberCard(member) {
  return '<article class="member-card">' +
    photo(member.image, member.name + ' / ' + member.nameEn,"member-photo") +
    '<div class="member-info"><h3>' + esc(member.name) + '</h3>' +
      '<p class="member-en">' + esc(member.nameEn) + '</p>' +
      '<p>' + esc(member.role) + '<br><span class="text-muted">(' + esc(member.period) + ')</span></p>' +
    '</div></article>';
}
function alumniRow(alum) {
  return '<li class="alumni-item"><strong>' + esc(alum.name) + '</strong> (' + esc(alum.nameEn) + ')' +
    '<div class="alumni-work">“' + esc(alum.work) + '”</div>' +
    '<div class="text-muted">' + esc(alum.period) + '</div></li>';
}
function members() {
  const groupList=data.members.map(memberCard).join("");
  return header("Current Members") + '<div class="container main-content slim">' +
    '<section class="content-section"><div class="members-grid">' + groupList + '</div></section>' +
    '<section class="content-section"><h2>Alumni</h2>' +
      '<h3>Graduate</h3><ul class="alumni-list">' +
      data.alumni.filter(x=>x.category==="Graduate").map(alumniRow).join("") + '</ul>' +
      '<h3>Undergraduate</h3><ul class="alumni-list">' +
      data.alumni.filter(x=>x.category==="Undergraduate").map(alumniRow).join("") + '</ul>' +
    '</section></div>';
}
function courses() {
  return header("Courses") + '<div class="container main-content slim">' +
    data.courses.map(yr =>
      '<section class="course-year">' +
      '<h2>' + esc(yr.year) + '</h2>' +
      '<div class="course-terms">' + yr.terms.map(term => '<div class="course-term">' +
      '<strong>' + esc(term.name) + '</strong><span class="course-list">' +
      (term.classes.length ? term.classes.map(esc).join(', ') : '') +
      '</span></div>').join("") + '</div></section>').join("") +
    '</div>';
}
function news() {
  const years = [...new Set(data.news.map(n=>n.date.slice(0,4)))].sort().reverse();
  return header("News") + '<div class="container main-content slim"><div class="news-list">' +
    years.map(year => '<section class="news-year">' +
      '<h2>' + year + '</h2>' +
      data.news.filter(n=>n.date.startsWith(year)).map(n=>
        '<div class="news-item"><span class="news-date">' + esc(n.date.slice(5).replace("-", ". ")) +
        '.</span><span class="news-text">' + esc(n.title) + '</span></div>').join("") +
      '</section>').join("") + '</div></div>';
}
function gallery() {
  const all = data.galleryImages || [];
  return header("Gallery") + '<div class="container main-content slim gallery-page">' +
    data.gallery.map((year, i) => '<section class="gallery-year">' +
      '<h2>' + esc(year.year) + '</h2>' +
      (year.events.length ? '<ul class="gallery-events">' +
         year.events.map(label=>'<li>' + esc(label) + '</li>').join("") + '</ul>' : '') +
      '</section>').join("") +
    '<section class="gallery-photos"><h2>Photos</h2>' +
      '<p class="text-muted">Photos copied from the original LIPE Gallery page. The original site does not label each image in the accessible HTML, so individual event captions have not been assigned.</p>' +
      '<div class="gallery-photo-grid">' +
      all.map((img,i)=>'<a href="' + esc(img) + '" target="_blank" rel="noopener noreferrer" aria-label="Open gallery photo ' + (i+1) + '">' +
         photo(img,"LIPE group gallery photograph "+(i+1),"gallery-photo")+'</a>').join("") +
      '</div></section></div>';
}

function updateToc() {
  const nav = document.querySelector(".toc nav");
  if (!nav || !("IntersectionObserver" in window)) return;
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const observed = links.map(a => document.getElementById(a.getAttribute("href").slice(1))).filter(Boolean);
  let activeId = "";
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) activeId = entry.target.id;
    if (activeId) links.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + activeId));
  }, {rootMargin:"-100px 0px -65% 0px", threshold: 0});
  observed.forEach(el => observer.observe(el));
}
function render() {
  buildNavigation();
  const title = {home:"Home",professor:"Professor",members:"Current Members",research:"Research",
    publications:"Publications",courses:"Courses",news:"News",gallery:"Gallery"}[page];
  document.title = title === "Home" ? "BK Research Group, LIPE" : title + " - BK Research Group, LIPE";
  const views = {home, professor, members, research, publications, courses, news, gallery};
  document.querySelector("#app").innerHTML = views[page] ? views[page]() :
    unverified(title);
  document.querySelector("#year").textContent = new Date().getFullYear();
  updateToc();
  if (location.hash) {
    const anchor = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (anchor) requestAnimationFrame(() => anchor.scrollIntoView());
  }
}
render();
