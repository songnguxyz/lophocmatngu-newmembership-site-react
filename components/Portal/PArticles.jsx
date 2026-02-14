// src/components/Portal/PArticles.jsx
import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, query, orderBy, limit, getDocs,where } from "firebase/firestore";
import styles from "./PArticles.module.css";
import { Link } from "react-router-dom";

const PArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      setError(null);

      try {
        const articlesCollection = collection(db, "home");
        const q = query(
          articlesCollection,
          where('approved', '==', true),
          orderBy("order", "desc"),
          limit(7)
        );

        const querySnapshot = await getDocs(q);
        const articlesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setArticles(articlesData);
        setLoading(false);
      } catch (e) {
        setError(e);
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  if (loading) {
    return <div>Đang tải bài viết...</div>;
  }

  if (error) {
    return <div>Lỗi: {error.message}</div>;
  }

  if (!articles || articles.length < 3) {
    return <div>Không đủ bài viết hoặc đang tải...</div>;
  }

  return (
    <div className={styles.articlesContainer}>
      <div className={styles.mainArticle}>
        <Link to={`/articles/${articles[0].id}`} className={styles.articleLink}>
          <img
            src={articles[0].coverImageUrl}
            alt={articles[0].title}
            className={styles.mainArticleImage}
          />
          <h3>{articles[0].title}</h3>
        </Link>
        <div className={styles.articleDivider} /> {/* Đường kẻ */}
        <p className={styles.articleSummary}>{articles[0].summary}</p>
      </div>

      <div className={styles.middleArticles}>
        <div className={styles.middleArticle}>
          <Link
            to={`/articles/${articles[1].id}`}
            className={styles.articleLink}
          >
            <img
              src={articles[1].coverImageUrl}
              alt={articles[1].title}
              className={styles.middleArticleImage}
            />
            <h3>{articles[1].title}</h3>
          </Link>
        </div>
        <div className={styles.middleArticle}>
          <Link
            to={`/articles/${articles[2].id}`}
            className={styles.articleLink}
          >
            <img
              src={articles[2].coverImageUrl}
              alt={articles[2].title}
              className={styles.middleArticleImage}
            />
            <h3>{articles[2].title}</h3>
          </Link>
        </div>
      </div>

      <div className={styles.sideArticles}>
        {articles.slice(3).map((article) => (
          <div key={article.id} className={styles.sideArticle}>
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className={styles.sideArticleImage}
            />
            <Link to={`/articles/${article.id}`} className={styles.articleLink}>
              <h3>{article.title}</h3>
            </Link>
          </div>
        ))}
      </div>

      <a href="/articles" className={styles.viewMoreButton}>
        Xem thêm
      </a>
    </div>
  );
};

export default PArticles;
