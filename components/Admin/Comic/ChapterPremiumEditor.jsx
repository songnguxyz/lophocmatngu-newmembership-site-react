// src/components/Admin/ChapterPremiumEditor.jsx
import React from 'react';
import styles from './ComicManager.css';

const ChapterPremiumEditor = ({ chapter, index, onChange }) => {
  return (
    <label className={styles.premiumLabel}>
      Premium:
      <input
        type="checkbox"
        checked={chapter?.isPremium || false} // Xử lý trường hợp undefined
        onChange={(e) => onChange(index, e.target.checked)}
      />
    </label>
  );
};

export default ChapterPremiumEditor;