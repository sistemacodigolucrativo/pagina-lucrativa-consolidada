from collections import Counter
from pathlib import Path
from PIL import Image

path = Path('/home/ubuntu/Pagina-Lucrativa-2026/client/public/codigo-lucrativo-banner.png')
image = Image.open(path).convert('RGB')
counts = Counter(image.getdata())
total = image.width * image.height
print('HEX\tPIXELS\tSHARE')
filtered = []
for (red, green, blue), count in counts.items():
    maximum = max(red, green, blue)
    minimum = min(red, green, blue)
    saturation = maximum - minimum
    if maximum >= 150 and saturation >= 45 and green >= red and green >= blue:
        filtered.append(((red, green, blue), count))
for (red, green, blue), count in sorted(filtered, key=lambda item: item[1], reverse=True)[:80]:
    print(f'#{red:02X}{green:02X}{blue:02X}\t{count}\t{count / total:.4%}')
