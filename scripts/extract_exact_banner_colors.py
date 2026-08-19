from collections import Counter
from pathlib import Path
from PIL import Image

path = Path('/home/ubuntu/Pagina-Lucrativa-2026/client/public/codigo-lucrativo-banner.png')
image = Image.open(path).convert('RGB')
counts = Counter(image.getdata())
print('HEX\tPIXELS\tSHARE')
total = image.width * image.height
for (red, green, blue), count in counts.most_common(40):
    print(f'#{red:02X}{green:02X}{blue:02X}\t{count}\t{count / total:.4%}')
