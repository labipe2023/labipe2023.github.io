from PIL import Image,ImageOps,ImageDraw,ImageFont
from pathlib import Path
import base64, math
files=sorted(Path("source-original/images").glob("gallery*.jpg"))
cols=3
cell=(380,290)
rows=math.ceil(len(files)/cols)
sheet=Image.new("RGB",(cols*cell[0],rows*cell[1]),"white")
draw=ImageDraw.Draw(sheet)
for i,f in enumerate(files):
    im=Image.open(f).convert("RGB")
    im.thumbnail((360,245),Image.Resampling.LANCZOS)
    x=(i%cols)*cell[0]+(cell[0]-im.width)//2
    y=(i//cols)*cell[1]+5
    sheet.paste(im,(x,y))
    draw.text(((i%cols)*cell[0]+15,(i//cols)*cell[1]+251),f.name,fill="black")
out=Path("site-check");out.mkdir(exist_ok=True)
b=out/"gallery-contact-sheet.jpg"
sheet.save(b,quality=70)
(b.with_suffix(".b64.txt")).write_text(base64.b64encode(b.read_bytes()).decode("ascii"))
print("Contact sheet created:",len(files),"images",b.stat().st_size,"bytes")
