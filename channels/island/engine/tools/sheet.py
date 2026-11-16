import sys,glob
from PIL import Image,ImageDraw
src,out=sys.argv[1],sys.argv[2]
fs=sorted(glob.glob(src+'/*.jpg'),key=lambda f:(f.split('/')[-1][:3],float(f.split('_')[-1][:-4])))
w,h=180,320
for part in range((len(fs)+20)//21):
  sub=fs[part*21:(part+1)*21]; sheet=Image.new('RGB',(w*7,h*3))
  for i,f in enumerate(sub):
    im=Image.open(f).convert('RGB').resize((w,h)); ImageDraw.Draw(im).text((4,4),f.split('/')[-1][:-4],fill='yellow'); sheet.paste(im,((i%7)*w,(i//7)*h))
  sheet.save(f'{out}{part}.jpg',quality=85)
