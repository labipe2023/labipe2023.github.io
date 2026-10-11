#!/usr/bin/env python3
"""Recover lazy loaded public gallery photos and adjacent original captions."""
from pathlib import Path
import json,re,requests
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

ROOT=Path("source-original")
folder=ROOT/"images"
folder.mkdir(parents=True,exist_ok=True)
manifest=json.loads((ROOT/"manifest.json").read_text(encoding="utf-8"))
original=manifest["pages"]["gallery"]["images"]
def key(url):
    return re.split(r"=(?:w\d+|s\d+|h\d+)",url)[0].split("?")[0]
known={key(x["url"]) for x in original if x["url"].startswith("https://sites.google.com/sitesv-images-rt/")}
all_photos=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={"width":1440,"height":960},device_scale_factor=1)
    page.goto("https://sites.google.com/view/bkimgroup/gallery",wait_until="domcontentloaded",timeout=60000)
    page.wait_for_timeout(2200)
    height=page.evaluate("document.documentElement.scrollHeight")
    print("Gallery height:",height)
    for pos in range(0,height+600,650):
        page.evaluate("(y) => window.scrollTo(0,y)",pos)
        page.wait_for_timeout(240)
    page.wait_for_timeout(1100)
    rows=page.locator("img").evaluate_all("""images=>images.map((img,i)=>{
      let a=img,context='';
      for(let n=0;n<7 && a;n++,a=a.parentElement){
        const v=(a.innerText||'').trim().replace(/\\s+/g,' ');
        if(v.length>3 && v.length<150){context=v;break;}
      }
      const r=img.getBoundingClientRect();
      return {i,src:img.currentSrc||img.src,alt:img.alt||'',width:Math.round(r.width),
        height:Math.round(r.height),y:Math.round(r.y+window.scrollY),caption:context};
    })""")
    all_photos=rows
    buttons=page.locator("button").evaluate_all("""els=>els.map(b=>({
      label:b.getAttribute('aria-label')||'',title:b.getAttribute('title')||'',text:(b.innerText||'').trim().slice(0,35)
    })).filter(x=>x.label||x.title||x.text).slice(0,100)""")
    browser.close()

result={"page":"https://sites.google.com/view/bkimgroup/gallery","rendered_images":all_photos,"buttons":buttons,"new_files":[]}
ses=requests.Session()
ses.headers.update({"User-Agent":"Mozilla/5.0","Referer":"https://sites.google.com/"})
for it in all_photos:
    src=it["src"]
    if not (src.startswith("https://") and "sites.google.com/sitesv-images-rt/" in src):continue
    k=key(src)
    if k in known:continue
    if len(result["new_files"])>=55:break
    try:
        response=ses.get(src,timeout=22)
        typ=response.headers.get("Content-Type","")
        if not response.ok or not typ.startswith("image/") or len(response.content)<10000 or len(response.content)>4000000:continue
        ext=".png" if "png" in typ else ".webp" if "webp" in typ else ".jpg"
        filename="gallery-extra-"+str(len(result["new_files"])+1).zfill(2)+ext
        (folder/filename).write_bytes(response.content)
        result["new_files"].append({"file":"source-original/images/"+filename,"src":src,"caption":it["caption"],"y":it["y"]})
        known.add(k)
    except Exception as ex:
        print("failed:",str(ex)[:130])
(ROOT/"rendered-gallery.json").write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding="utf-8")
print("Found rendered images:",len(all_photos),"extra images downloaded:",len(result["new_files"]))
print("BUTTONS",buttons[:25])
for obj in result["new_files"]:print("FILE",obj["file"],"caption",obj["caption"],"y",obj["y"])
