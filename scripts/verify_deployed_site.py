#!/usr/bin/env python3
"""Visual and functional smoke test of deployed BK group GitHub Pages."""
from pathlib import Path
from datetime import datetime,timezone
import json,base64
from playwright.sync_api import sync_playwright
out=Path("site-check")
out.mkdir(exist_ok=True)
routes={
 "home":"/",
 "professor":"/?page=professor",
 "members":"/?page=members",
 "research":"/?page=research",
 "publications":"/?page=publications",
 "courses":"/?page=courses",
 "news":"/?page=news",
 "gallery":"/?page=gallery",
}
result={"checked_at":datetime.now(timezone.utc).isoformat(),"pages":{}}
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 context=browser.new_context(viewport={"width":1440,"height":950},device_scale_factor=1)
 for name,path in routes.items():
  page=context.new_page()
  errors=[]
  page.on("pageerror",lambda err:errors.append(str(err)))
  try:
   response=page.goto("https://labipe2023.github.io"+path,wait_until="networkidle",timeout=60000)
   page.wait_for_timeout(700)
   status=response.status if response else 0
   summary=page.evaluate("""() => ({
      documentTitle:document.title,
      headline:document.querySelector('h1')?.innerText||'',
      mainText:(document.querySelector('main')?.innerText||'').slice(0,500),
      members:document.querySelectorAll('.member-card').length,
      galleryEvents:document.querySelectorAll('.gallery-figure').length,
      news:document.querySelectorAll('.news-item').length,
      courses:document.querySelectorAll('.course-year').length,
      refs:document.querySelectorAll('.reference-item').length,
      doi:document.querySelectorAll('a.ref-doi').length,
      images:[...document.querySelectorAll('main img')].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0})),
      headerTitleColor:document.querySelector('h1')?getComputedStyle(document.querySelector('h1')).color:'',
    })""")
   summary.update({"url":page.url,"http":status,"jsErrors":errors})
   result["pages"][name]=summary
   if name in ["home","members","gallery","courses"]:
    image=page.screenshot(type="jpeg",quality=51,full_page=False)
    (out/(name+".jpg")).write_bytes(image)
    (out/(name+".b64.txt")).write_text(base64.b64encode(image).decode("ascii"),encoding="ascii")
   print("CHECK",name,"http",status,"errors",len(errors),"imgs",summary["images"],"refs",summary["refs"],flush=True)
  except Exception as e:
   result["pages"][name]={"error":str(e)}
   print("ERROR",name,str(e),flush=True)
  finally:page.close()
 browser.close()
(out/"report.json").write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding="utf-8")
bad=[k for k,x in result["pages"].items() if x.get("http")!=200 or x.get("jsErrors") or any(not i["loaded"] for i in x.get("images",[]))]
print("Verification found errors:",bad,flush=True)
