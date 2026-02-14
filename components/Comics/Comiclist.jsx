// src/components/Comics/ComicList.jsx
import React from "react";
import { Link } from "react-router-dom";
import styles from "./ComicList.module.css";

const ComicList = ({ categories = [], groupedComics = {} }) => {
  if (!categories.length) {
    return <div className={styles.noCategories}>Chưa có thể loại nào.</div>;
  }

  return (
    <div className={styles.listContainer}>
      {categories.map((cat) => {
        const comicsInCat = groupedComics[cat.id] || [];
        if (!comicsInCat.length) return null;
        return (
          <section key={cat.id} className={styles.categorySection}>
            <h2 className={styles.categoryTitle}>{cat.name}</h2>
            <div className={styles.grid}>
              {comicsInCat.map((comic) => (
                <Link
                  key={comic.id}
                  to={`/comic-info/${comic.slug}`}
                  className={styles.card}
                >
                  <div className={styles.cover}>
                    <img src={comic.coverImageUrl} alt={comic.title} />
                  </div>
                  <div className={styles.info}>
                    <h3>{comic.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default ComicList;
