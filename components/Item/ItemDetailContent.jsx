// src/components/Item/ItemDetailContent.js
import React from 'react';
import styles from './Item.module.css';
import DOMPurify from 'dompurify';

const ItemDetailContent = ({ item }) => {
    return (
        <div className={styles['item-detail-container']}>
            <div className={styles['item-title']}>
                <h1>{item.title}</h1>
            </div>
            <hr />
            <img src={item.fbImageUrl} alt="FB Image" className={styles['item-fb-image']} />
            <div className={styles['item-summary-content']}>
                <div className={styles['item-summary-container-detail']}>
                    <div className={styles['cover-image-detail']}>
                        <img src={item.coverImageUrl} alt="Cover Image" />
                    </div>
                    <div className={styles['summary-and-buttons']}>
                          <div className={`${styles['summary-detail']} ${styles.textJustify}`} 
                             dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.summary) }} />
                        <hr className={styles['summary-divider']} />
                        <div className={styles['link-buttons-detail']}>
                            <span>Đặt mua tại:</span>
                            {item.fahasaLink && <a href={item.fahasaLink} target="_blank" rel="noopener noreferrer"><button>Fahasa</button></a>}
                            {item.phuongnamLink && <a href={item.phuongnamLink} target="_blank" rel="noopener noreferrer"><button>Phương Nam</button></a>}
                            {item.shopeeLink && <a href={item.shopeeLink} target="_blank" rel="noopener noreferrer"><button>Shopee</button></a>}
                        </div>
                    </div>
                </div>
            </div>
            <div className={`${styles['item-content']} ${styles.textJustify}`} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.content) }} />
            <div className={styles['gift-image']}>
                <a href={`/${item.type}/${item.id}`}><img src={item.giftImageUrl} alt="Gift Image" /></a>
            </div>
        </div>
    );
};

export default ItemDetailContent;