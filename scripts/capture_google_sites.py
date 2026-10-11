#!/usr/bin/env python3
"""Capture PUBLIC Google Sites screenshots for visual migration parity review."""
import base64
from pathlib import Path
from playwright.sync_api import sync_playwright

routes={
    "home":"home",
    "members":"people/current-members",
    "research":"research",
    "courses":"courses",
    "news":"news",
    "gallery":"gallery"
}
out=Path("source-original/reference-screenshots")
out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    context=browser.new_context(viewport={"width":1440,"height":950},device_scale_factor=1)
    for name,path in routes.items():
        page=context.new_page()
        url="https://sites.google.com/view/bkimgroup/"+path
        try:
            r=page.goto(url,wait_until="domcontentloaded",timeout=60000)
            page.wait_for_timeout(2200)
            print(name,"HTTP",r.status if r else "none","title",page.title(),"h1",page.locator("h1").all_text_contents()[:6],flush=True)
            shot=page.screenshot(type="jpeg",quality=51,full_page=False)
            (out/(name+".jpg")).write_bytes(shot)
            (out/(name+".b64.txt")).write_text(base64.b64encode(shot).decode("ascii"),encoding="ascii")
        except Exception as ex:
            print(name,"ERROR",str(ex)[:250],flush=True)
        finally:page.close()
    browser.close()
