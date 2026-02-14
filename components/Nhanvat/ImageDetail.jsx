import React, { useEffect } from 'react';
import './ImageDetail.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronLeft,
    faChevronRight,
    faTimes,
    faHeart,
    faComment,
    faShare
} from '@fortawesome/free-solid-svg-icons';
import { useSwipeable } from "react-swipeable";

const AlbumImageDetail = ({ image, album, selectedImageIndex, setSelectedImageIndex, onClose }) => {
    const handlePrev = () => {
        setSelectedImageIndex((prev) =>
            prev > 0 ? prev - 1 : album.length - 1
        );
    };

    const handleNext = () => {
        setSelectedImageIndex((prev) =>
            prev < album.length - 1 ? prev + 1 : 0
        );
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'ArrowLeft') handlePrev();
            if (event.key === 'ArrowRight') handleNext();
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const swipeHandlers = useSwipeable({
      onSwipedLeft: handleNext,
      onSwipedRight: handlePrev,
      preventDefaultTouchmoveEvent: true,
      trackMouse: true,
    });

    return (
      <div className="insta-modal-overlay" data-modal-open {...swipeHandlers}>
        {/* Nút overlay (desktop) */}
        <button className="chevron-btn left" onClick={handlePrev}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <button className="chevron-btn right" onClick={handleNext}>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>

        <div className="insta-modal-content">
          {/* Nút đóng */}
          <button className="close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>

          {/* Ảnh chính */}
          <div className="insta-image-section">
            {image?.url && (
              <img
                src={image.url}
                alt={image.description || "Album Image"}
                className="insta-main-image"
              />
            )}
          </div>

          {/* Nav dưới ảnh (chỉ hiện trên mobile) */}
          <div className="mobile-nav-under">
            <button className="chevron-btn mobile left" onClick={handlePrev}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button className="chevron-btn mobile right" onClick={handleNext}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>

          {/* Phần info luôn hiển thị dưới ảnh */}
          <div className="insta-info-section">
            <div className="insta-info-header">
              <strong>
                Ảnh {selectedImageIndex + 1} / {album.length}
              </strong>
            </div>
            <div className="insta-description">
              {image.description || "Không có mô tả."}
            </div>
            <div className="insta-divider" />
            <div className="insta-actions">
              <button>
                <FontAwesomeIcon icon={faHeart} />
              </button>
              <button>
                <FontAwesomeIcon icon={faComment} />
              </button>
              <button>
                <FontAwesomeIcon icon={faShare} />
              </button>
            </div>
            <div className="insta-comment-area">
              <p className="muted-text">Chức năng bình luận sẽ có sau.</p>
            </div>
          </div>
        </div>
      </div>
    );
    
    
};

export default AlbumImageDetail;
