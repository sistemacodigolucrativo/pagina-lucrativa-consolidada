const TARGET_PROFILE_IMAGE_BYTES = 700 * 1024;
const MAX_PROFILE_SOURCE_BYTES = 20 * 1024 * 1024;
const MAX_PROFILE_DIMENSION = 1600;

export type PreparedProfilePhoto = {
  dataUrl: string;
  contentType: "image/jpeg" | "image/png" | "image/gif";
  compressed: boolean;
};

function readBlobAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Não foi possível preparar a foto."));
    reader.onerror = () => reject(new Error("Não foi possível preparar a foto."));
    reader.readAsDataURL(blob);
  });
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("A imagem selecionada não pôde ser processada."));
    };
    image.src = url;
  });
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Não foi possível compactar a foto.")), "image/jpeg", quality);
  });
}

function drawImage(image: HTMLImageElement, scale: number) {
  const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
  const baseScale = longestSide > MAX_PROFILE_DIMENSION ? MAX_PROFILE_DIMENSION / longestSide : 1;
  const width = Math.max(1, Math.round(image.naturalWidth * baseScale * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * baseScale * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Seu navegador não conseguiu preparar a foto.");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  return canvas;
}

export async function prepareProfilePhoto(file: File): Promise<PreparedProfilePhoto> {
  if (file.size > MAX_PROFILE_SOURCE_BYTES) throw new Error("A imagem é muito grande para processamento. Use uma foto de até 20 MB.");

  if (file.size <= 1024 * 1024) {
    return {
      dataUrl: await readBlobAsDataUrl(file),
      contentType: file.type as PreparedProfilePhoto["contentType"],
      compressed: false,
    };
  }

  const image = await loadImage(file);
  const qualitySteps = [0.86, 0.76, 0.66, 0.56, 0.46];
  let scale = 1;

  for (let resizeAttempt = 0; resizeAttempt < 5; resizeAttempt += 1) {
    const canvas = drawImage(image, scale);
    for (const quality of qualitySteps) {
      const blob = await canvasBlob(canvas, quality);
      if (blob.size <= TARGET_PROFILE_IMAGE_BYTES) {
        return { dataUrl: await readBlobAsDataUrl(blob), contentType: "image/jpeg", compressed: true };
      }
    }
    scale *= 0.78;
  }

  throw new Error("Não foi possível reduzir a foto para o tamanho aceito. Escolha outra imagem.");
}
