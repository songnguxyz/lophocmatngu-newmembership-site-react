import React, { useEffect } from "react";

export const PreloadPickPhaseAbilities = ({ abilityMap }) => {
  useEffect(() => {
    if (!abilityMap) return;

    const urls = [];

    Object.values(abilityMap).forEach((abilities) => {
      abilities.forEach((ab) => {
        const url = ab?.meta?.imageUrl;
        if (url) urls.push(url);
      });
    });

    const unique = Array.from(new Set(urls));
    for (const url of unique) {
      const img = new Image();
      img.src = url;
    }
  }, [abilityMap]);

  const uniqueUrls = Array.from(
    new Set(
      Object.values(abilityMap || {})
        .flat()
        .map((ab) => ab.meta?.imageUrl)
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
};
