import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import styles from './Item.module.css';
import DOMPurify from 'dompurify';

const ItemSummary = memo(({ item, type }) => {
    return (
        <div className={styles['item-item']}>
            <Link to={`/${type}/${item.id}`} className={styles['fb-image-container']}>
                <img src={item.fbImageUrl} alt="FB Image" title={item.title} className={styles['fb-image']} />
            </Link>
            <div className={styles['summary-content']}>
                <Link to={`/${type}/${item.id}`} className={styles['item-link']}>
                    <h2>{item.title}</h2>
                </Link>
                <p className={`${styles.textJustify} ${styles['summary-content p']}`} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.summary) }} />
            </div>
        </div>
    );
});

export default ItemSummary;