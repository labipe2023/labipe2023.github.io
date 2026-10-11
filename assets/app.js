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
function groupedYears(records) {
  return [...new Set(records.map(yearOf))].sort((a, b) => a === "Other" ? 1 : b === "Other" ? -1 : Number(b) - Number(a));
}
function bibliographyItem(pub, type="journal") {
  const authors = esc(pub.authors || "").replace(/;\s*/g, ", ");
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
  return groupedYears(records).map(year => {
    const id = type + '-' + year;
    const pubList = records.filter(x => yearOf(x) === year);
    return '<div class="year-group"><h3 class="pub-year" id="' + id + '">' + esc(year) + '</h3>' +
      '<ol class="reference-list" aria-label="' + esc(year) + ' ' + (type === "journal" ? "journal articles" : "conference proceedings") + '">' +
      pubList.map(x => bibliographyItem(x, type)).join("") + '</ol></div>';
  }).join("");
}
function yearToc(records, type) {
  return groupedYears(records).map(yr =>
    '<a class="toc-year" href="#' + type + '-' + yr + '">' + esc(yr) + ' <small>(' +
    records.filter(x => yearOf(x) === yr).length + ')</small></a>').join("");
}
function toc() {
  return '<aside class="toc" aria-label="Publication page navigation"><div class="toc-title">On this page</div>' +
    '<nav><div class="toc-categories">' +
      '<a class="toc-category" href="#journals">Refereed Journal Articles</a>' +
      '<a class="toc-category" href="#proceedings">Refereed Conference Proceedings</a>' +
    '</div><div class="toc-year-lists">' +
      '<div class="toc-list-heading">Journal Articles by Year</div>' +
      yearToc(data.publications, "journal") +
      '<div class="toc-list-heading">Conference Proceedings by Year</div>' +
      yearToc(data.conferences, "conference") +
    '</div></nav></aside>';
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
function home() {
  const recent = data.publications.slice(0,3);
  return '<section class="home-cover"><div class="container home-cover-inner">' +
      '<p class="institution">KONGJU NATIONAL UNIVERSITY · DEPARTMENT OF CHEMICAL ENGINEERING</p>' +
      '<h1>BK Research Group, LIPE</h1>' +
      '<p class="home-subtitle">Process Systems Engineering · Modeling · Optimization · Control</p>' +
    '</div></section>' +
    '<div class="container main-content">' +
      part("Welcome", '<p class="intro-copy">' + esc(data.mission) + '</p>') +
      part("Research Area", items(data.research.map(r => r.title), "research-list") +
        '<a class="content-link" href="?page=research">Learn more about our research →</a>') +
      part("Recent Publications", '<ol class="reference-list">' + recent.map(r => bibliographyItem(r)).join("") + '</ol>' +
        '<a class="content-link" href="?page=publications">View all publications →</a>') +
      part("Contact", '<p>' + esc(data.professor) + '<br>' + esc(data.department) + ', ' + esc(data.university) +
        '<br><a href="mailto:' + esc(data.email) + '">' + esc(data.email) + '</a></p>') +
    '</div>';
}
function research() {
  return header("Research") + '<div class="container main-content slim">' +
    part("Research Area", items(data.research.map(r => r.title))) +
    part("Applications", '<p class="text-muted">(Research directions will continue to be updated.)</p>' +
      items(data.applications)) +
    '<p class="site-info-line">Source: <a href="' + originalRoot + '/research" target="_blank" rel="noopener noreferrer">Original Research page ↗</a></p>' +
    '</div>';
}
function professor() {
  return header("Professor") + '<div class="container main-content slim">' +
    part("Boeun Kim (김보은)", '<p>Assistant Professor, ' + esc(data.department) +
      '<br>' + esc(data.university) + '</p>' +
      '<p>Email: <a href="mailto:' + esc(data.email) + '">' + esc(data.email) + '</a>' +
      '<br>Office: ' + esc(data.address) + '<br>Tel: +82-41-521-9356</p>') +
    '<div class="columns">' +
      part("Education", items(data.education, "profile-list")) +
      part("Professional Experience", items(data.experience, "profile-list")) +
    '</div></div>';
}
function members() {
  const msg = '<p class="empty-note">Current member profiles and photos will be added after the original member information has been verified.</p>';
  return header("Current Members") + '<div class="container main-content slim">' +
    part("Group Members", msg) +
    '<p>Principal Investigator: <a href="?page=professor">' + esc(data.professor) + '</a></p></div>';
}
function unverified(name) {
  const origin = originalRoot + "/" + name.toLowerCase();
  return header(name) + '<div class="container main-content slim">' +
    '<p class="empty-note">The original ' + esc(name) +
    ' content has not yet been confirmed for migration. No entries or photos have been invented.</p>' +
    '<p><a class="content-link" href="' + safeUrl(origin) +
    '" target="_blank" rel="noopener noreferrer">View the original ' + esc(name) + ' page ↗</a></p></div>';
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
  const views = {home, professor, members, research, publications};
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
