export const getCroppedImg = (imageSrc, pixelCrop, maxWidth = 1600) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      let { width, height } = pixelCrop;

      // 👉 Nếu width lớn hơn maxWidth, scale lại
      if (width > maxWidth) {
        const scaleRatio = maxWidth / width;
        width = maxWidth;
        height = height * scaleRatio;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        width,
        height
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(blob);
      }, "image/jpeg");
    };
    image.onerror = (error) => reject(error);
  });
};
