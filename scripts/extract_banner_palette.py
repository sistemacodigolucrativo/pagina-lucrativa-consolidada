from collections import Counter
from pathlib import Path
from PIL import Image

image_path = Path('/home/ubuntu/Pagina-Lucrativa-2026/client/public/codigo-lucrativo-banner.png')
image = Image.open(image_path).convert('RGB')
# Quantize to a deterministic palette so nearby anti-aliased pixels are grouped.
quantized = image.quantize(colors=24, method=Image.Quantize.MEDIANCUT).convert('RGB')
counts = Counter(quantized.getdata())
total = image.width * image.height
print(f'IMAGE={image.width}x{image.height}')
print('COLOR\tPIXELS\tSHARE')
for (red, green, blue), count in counts.most_common(24):
    share = count / total
    print(f'#{red:02X}{green:02X}{blue:02X}\t{count}\t{share:.4%}')
