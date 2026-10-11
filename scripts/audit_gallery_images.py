#!/usr/bin/env python3
"""Recover public original gallery photos rendered via CSS/iframes/carousels."""
from pathlib import Path
from urllib.parse import urlparse
import json,re,requests
from playwright.sync_api import sync_playwright

root=Path("source-original")
manifest=json.loads((root/"manifest.json").read_text(encoding="utf-8"))
existing=(root/"images")
known=set()
def norm(url):
    return re.split(r"=(?:w\d+|s\d+|h\d+)",url)[0].split("?")[0]
for item in manifest["pages"]["gallery"]["images"]:known.add(norm(item["url"]))
if (root/"rendered-gallery.json").exists():
    for item in json.loads((root/"rendered-gallery.json").read_text(encoding="utf-8"))["new_files"]:
        known.add(norm(item["src"]))
def extract_bg(frame):
    try:
        return frame.evaluate("""() => Array.from(document.querySelectorAll('*')).map((el)=>{
           const r=el.getBoundingClientRect();
           const css=getComputedStyle(el);
           const bg=css.backgroundImage;
           if(!bg||bg==='none'||r.width<140||r.height<120)return null;
           const urls=[...bg.matchAll(/url\\(["']?(.*?)["']?\\)/g)].map(m=>m[1]);
           let ancestor=el,caption='';
           for(let i=0;i<6&&ancestor;i++,ancestor=ancestor.parentElement){
             const text=(ancestor.innerText||'').trim().replace(/\\s+/g,' ');
             if(text.length>4&&text.length<110){caption=text;break;}
           }
           return {urls,caption,width:r.width,height:r.height,x:Math.round(r.left+scrollX),y:Math.round(r.top+scrollY)};
        }).filter(Boolean)""")
    except Exception as e:
        return [{"error":str(e)[:180]}]
network=[]
with sync_playwright() as p:
    b=p.chromium.launch(headless=True)
    page=b.new_page(viewport={"width":1440,"height":950})
    page.on("response",lambda resp: network.append({"url":resp.url,"type":resp.request.resource_type}) if resp.request.resource_type=="image" else None)
    page.goto("https://sites.google.com/view/bkimgroup/gallery",wait_until="domcontentloaded",timeout=65000)
    page.wait_for_timeout(1800)
    height=page.evaluate("document.documentElement.scrollHeight")
    frames=[{"url":fr.url,"imageCount":fr.locator("img").count()} for fr in page.frames]
    backgrounds=[]
    for y in range(0,height+700,550):
        page.evaluate("(y)=>scrollTo(0,y)",y)
        page.wait_for_timeout(150)
        for fr in page.frames:
            for e in extract_bg(fr):
                if e.get("urls"):backgrounds.extend([{**e,"frame":fr.url}])
    page.wait_for_timeout(600)
    b.close()
seen=set()
urls=[]
for r in backgrounds:
    for u in r["urls"]:
        if u not in seen and u.startswith("http"):
            seen.add(u);urls.append({"url":u,"source":"background","y":r["y"],"caption":r["caption"]})
for r in network:
    u=r["url"]
    if u not in seen and u.startswith("http"):
        seen.add(u);urls.append({"url":u,"source":"network","y":None,"caption":""})
sess=requests.Session();sess.headers.update({"User-Agent":"Mozilla/5.0","Referer":"https://sites.google.com/"})
saved=[]
for item in urls:
    u=item["url"]
    if not any(host in urlparse(u).netloc for host in ["googleusercontent.com","sites.google.com","ggpht.com"]):continue
    if "favicon" in u or "logo" in u:continue
    if norm(u) in known:continue
    if len(saved)>=35:break
    try:
        response=sess.get(u,timeout=24)
        ct=response.headers.get("content-type","")
        if not response.ok or not ct.startswith("image/") or not(20000<=len(response.content)<=5000000):continue
        ext=".png" if "png" in ct else ".webp" if "webp" in ct else ".jpg"
        fn="gallery-discovered-"+str(len(saved)+1).zfill(2)+ext
        (existing/fn).write_bytes(response.content)
        saved.append({"file":"source-original/images/"+fn,**item})
        known.add(norm(u))
    except Exception as e:
        print("DOWNLOAD ERROR",str(e)[:90])
out={"frames":frames,"backgrounds":backgrounds[:200],"networkImages":network[:250],"candidates":urls[:250],"newFiles":saved}
(root/"gallery-browser-audit.json").write_text(json.dumps(out,indent=2,ensure_ascii=False),encoding="utf-8")
print("Frames",frames)
print("CSS backgrounds",len(backgrounds),"image network",len(network),"candidates",len(urls),"new downloaded",len(saved))
for x in saved:print(x["file"],x["source"],x["caption"],x["y"])
