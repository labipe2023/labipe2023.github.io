#!/usr/bin/env python3
"""One-time read-only scrape of the group's public Google Sites pages.
Results are checked into this GitHub Pages repo by the accompanying workflow.
Only website content, public source image URLs and successfully copied images
are stored; no account authentication or private Google APIs are used.
"""
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse
import requests
from bs4 import BeautifulSoup

BASE = "https://sites.google.com/view/bkimgroup"
PAGES = {
    "home": "/home",
    "professor": "/people/professor",
    "current-members": "/people/current-members",
    "research": "/research",
    "publications": "/publications",
    "courses": "/courses",
    "news": "/news",
    "gallery": "/gallery",
}
CAPS = {"home":8, "professor":4, "current-members":16, "research":8,
        "publications":2, "courses":3, "news":9, "gallery":28}
ROOT=Path("source-original")
(ROOT/"images").mkdir(parents=True,exist_ok=True)
ses=requests.Session()
ses.headers.update({"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
                    "Accept-Language":"en-US,en;q=0.9,ko;q=0.8"})
result={"captured_at":datetime.now(timezone.utc).isoformat(),"pages":{}}
all_images=set()
for slug,path in PAGES.items():
    url=BASE+path
    item={"url":url,"status":None,"title":"","headings":[],"text":"","images":[],"error":""}
    try:
        r=ses.get(url,timeout=35)
        item["status"]=r.status_code
        print(f"PAGE {slug}: HTTP {r.status_code}; {len(r.content)} bytes; final_url={r.url}",flush=True)
        if not r.ok:
            item["error"]=r.text[:300]
            result["pages"][slug]=item
            continue
        soup=BeautifulSoup(r.text,"html.parser")
        item["title"]=soup.title.get_text(" ",strip=True) if soup.title else ""
        item["headings"]=[x.get_text(" ",strip=True)[:350] for x in soup.select("h1,h2,h3,h4")]
        for x in soup(["script","style","noscript","svg","path","meta","button"]):
            x.decompose()
        body=soup.body or soup
        text_blocks=[]
        for line in body.get_text("\n",strip=True).splitlines():
            s=" ".join(line.split())
            if s and (not text_blocks or text_blocks[-1]!=s):
                text_blocks.append(s)
        item["text"]="\n".join(text_blocks)[:70000]
        raw_html=r.text
        im_soup=BeautifulSoup(raw_html,"html.parser")
        candidates=[]
        for img in im_soup.select("img"):
            vals=[img.get(k,"") for k in ("src","data-src","data-lazy-src")]
            for v in vals:
                if isinstance(v,str) and v.startswith("http"):
                    candidates.append({"url":v,"alt":img.get("alt",""),"origin":"img"})
            srcset=img.get("srcset","")
            for part in srcset.split(","):
                v=part.strip().split(" ")[0]
                if v.startswith("http"):
                    candidates.append({"url":v,"alt":img.get("alt",""),"origin":"srcset"})
        for v in re.findall(r'https?(?:%3A|:)(?:%2F|/){2}[^\s"\\<>]+',raw_html)[:500]:
            v=v.replace("\\u003d","=").replace("\\u0026","&").replace("&amp;","&")
            if "googleusercontent.com" in v or "ggpht.com" in v:
                candidates.append({"url":v,"alt":"","origin":"html"})
        seen=set()
        for it in candidates:
            u=it["url"].replace("&amp;","&")
            if not (u.startswith("https://") and any(host in urlparse(u).netloc for host in ["googleusercontent.com","ggpht.com","google.com"])):
                continue
            if u in seen or "favicon" in u.lower() or "googlelogo" in u.lower(): continue
            seen.add(u)
            item["images"].append({"url":u,"alt":it["alt"],"origin":it["origin"],"local":""})
            if len(item["images"])>=200: break
        downloaded=0
        for k,image in enumerate(item["images"]):
            if downloaded>=CAPS.get(slug,6): break
            u=image["url"]
            if u in all_images:continue
            try:
                ri=ses.get(u,timeout=22)
                typ=ri.headers.get("content-type","")
                if not ri.ok or not typ.startswith("image/"):continue
                if len(ri.content)<12000 or len(ri.content)>3500000:continue
                ext=".png" if "png" in typ else ".webp" if "webp" in typ else ".jpg"
                dst=ROOT/"images"/(slug+"-"+str(downloaded+1).zfill(2)+ext)
                dst.write_bytes(ri.content)
                image["local"]="/"+dst.as_posix()
                all_images.add(u)
                downloaded+=1
            except Exception as e:
                image["download_error"]=str(e)[:120]
        print(f"  title={item['title']!r}, body={len(item['text'])} chars, images={len(item['images'])}, copied={downloaded}, headings={item['headings'][:12]}",flush=True)
    except Exception as e:
        item["error"]=repr(e)
        print(f"  ERROR: {item['error']}",flush=True)
    result["pages"][slug]=item

(ROOT/"manifest.json").write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding="utf-8")
success=sum(x["status"]==200 for x in result["pages"].values())
print(f"Completed: fetched {success}/{len(PAGES)} pages, image files {len(list((ROOT/'images').glob('*')))}",flush=True)
