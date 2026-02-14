// src/components/Nhanvat/Description.jsx
import React, { useMemo } from "react";
import createDOMPurify from "dompurify";
import styles from "./Description.module.css";

// Khởi tạo DOMPurify một lần
const DOMPurify = createDOMPurify(
  typeof window !== "undefined" ? window : null
);

// Hàm sanitize và inject font-family
function sanitizeWithFont(html, fontFamilyString) {
  DOMPurify.removeAllHooks();
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    const tagName = node.tagName;
    const styledTags = ["P", "DIV", "SPAN", "LI", "STRONG", "EM", "A"];
    if (styledTags.includes(tagName) && fontFamilyString) {
      const prev = node.getAttribute("style") || "";
      node.setAttribute("style", `${prev}font-family: ${fontFamilyString};`);
    }
  });

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "ul", "li", "div", "span", "a"],
    ALLOWED_ATTR: ["href", "style"],
  });
}

/**
 * Description component nhận character và fontFamily từ cha
 * Hiển thị cả full và short descriptions đã sanitize
 */
const Description = ({ character, fontFamily,mode }) => {
  const rawFullDesc = character.fullDescription || "";
  const rawShortDesc = character.shortDescription || "";

  // Normalize fontFamily
  const fontFamilyString = Array.isArray(fontFamily)
    ? fontFamily.join(", ")
    : fontFamily;

  // Sanitize full và short
  const cleanedFullHtml = useMemo(
    () => sanitizeWithFont(rawFullDesc, fontFamilyString),
    [rawFullDesc, fontFamilyString]
  );
  const cleanedShortHtml = useMemo(
    () => sanitizeWithFont(rawShortDesc, fontFamilyString),
    [rawShortDesc, fontFamilyString]
  );

  return (
        <div className={styles.descriptionBlock}>
      {mode === "short" && cleanedShortHtml && (
        <div dangerouslySetInnerHTML={{ __html: cleanedShortHtml }} />
      )}
      {mode === "full" && cleanedFullHtml && (
        <div dangerouslySetInnerHTML={{ __html: cleanedFullHtml }} />
      )}
    </div>
  );
};

export default Description;
