// src/components/Admin/Item-List.jsx
import React from 'react';

const ItemList = ({ type, items, onApprove, onDelete, onMoveUp, onMoveDown, onUpdateOrder, onEdit }) => {
    const truncateTitle = (title, maxLength) => {
        if (title.length > maxLength) {
            return title.substring(0, maxLength) + "...";
        }
        return title;
    };

    return (
        <div className="item-list">
            {items.map((item, index) => (
                <div key={item.id} className="item-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
                    <div style={{ width: '135px', marginRight: '10px' }}>
                        {item.fbImageUrl ? (
                            <img src={item.fbImageUrl} alt={item.title} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
                        ) : (
                            <span>Không có ảnh</span>
                        )}
                    </div>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                        <span>{truncateTitle(item.title, 58)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => onApprove(item.id, item.approved)} style={{ padding: '5px 10px' }}>
                            {item.approved ? 'Hủy duyệt' : 'Duyệt'}
                        </button>
                        <button onClick={() => onDelete(item.id)} style={{ padding: '5px 10px' }}>Xóa</button>
                        <button onClick={() => onEdit(item.id)} style={{ padding: '5px 10px' }}>Sửa</button>
                        <button onClick={() => onMoveUp(item.id)} style={{ padding: '5px 10px' }}>Lên</button>
                        <button onClick={() => onMoveDown(item.id)} style={{ padding: '5px 10px' }}>Xuống</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ItemList;