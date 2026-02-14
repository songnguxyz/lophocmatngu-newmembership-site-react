// src/components/Item/Item.js
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import ItemSummary from './ItemSummary';
import styles from './Item.module.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Item = ({ type }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    const loadItems = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Thay đổi dòng này
        const collectionName = type === 'articles' ? 'home' : type;

        try {
            const approvedQuery = query(
                collection(db, collectionName), // Sử dụng collectionName
                where('approved', '==', true),
                orderBy('order', 'desc')
            );

            const unsubscribeSnapshot = onSnapshot(approvedQuery, (snapshot) => {
                const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type }));
                setItems(itemsData);
                setLoading(false);
            }, (err) => {
                setError(err);
                setLoading(false);
                console.error('Lỗi khi lắng nghe snapshot:', err);
            });

            return () => {
                unsubscribeSnapshot();
            };
        } catch (e) {
            setError(e);
            setLoading(false);
            console.error('Lỗi khi tải items:', e);
        }
    }, [type]);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        loadItems();

        return () => {
            unsubscribeAuth();
        };
    }, [loadItems]);

    if (loading) {
        return <div>Đang tải {type}...</div>;
    }

    if (error) {
        return <div>Lỗi: {error.message}</div>;
    }

    return (
        <div className={styles['items-container']}>
            {user ? (
                <div className={styles['item-list']}>
                    {items.map((item) => (
                        <ItemSummary key={item.id} item={item} type={type} />
                    ))}
                </div>
            ) : (
                <p>Bạn cần đăng nhập để xem nội dung {type}.</p>
            )}
        </div>
    );
};

export default Item;