import React, { useEffect } from "react";

/**
 * Component preload tất cả icon kỹ năng bằng cách:
 * 1. Tạo đối tượng Image() để load vào cache.
 * 2. Gắn ảnh nhỏ (1x1) ẩn vào DOM để giữ không bị GC.
 */
export function PreloadAbilityIconsRenderer({ availableAbilitiesMap }) {
  useEffect(() => {
    if (!availableAbilitiesMap) return;

    const urls = [];

    Object.values(availableAbilitiesMap).forEach((abilities) => {
      abilities.forEach((ability) => {
        const url = ability?.meta?.imageUrl;
        if (url) urls.push(url);
      });
    });

    const uniqueUrls = Array.from(new Set(urls));

    for (const url of uniqueUrls) {
      const img = new Image();
      img.src = url;
    }
  }, [availableAbilitiesMap]);

  // Gắn thẻ <img> vào DOM ẩn để giữ cache
  const uniqueUrls = Array.from(
    new Set(
      Object.values(availableAbilitiesMap || {})
        .flat()
        .map((a) => a.meta?.imageUrl)
        .filter(Boolean)
    )
  );

  return (
    <div style={{ display: "none" }}>
      {uniqueUrls.map((url) => (
        <img key={url} src={url} alt="" width={1} height={1} />
      ))}
    </div>
  );
}
