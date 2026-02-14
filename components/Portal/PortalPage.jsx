// src/components/Portal/PortalPage.jsx
import React from 'react';
import PArticles from './PArticles';
import styles from './PortalPage.module.css';
import SliderRight from './SliderRight';
import SectionWrapper from './SectionWrapper';
import PComics from './PComics';
import PCharacters from './Pcharacters'; // Import PCharacters

const PortalPage = () => {
  return (
    <div className={styles.portalPageContainer}>
      <div className={styles.portalContent}>
        <SectionWrapper>
          <h2>Demo gì đó</h2>
        </SectionWrapper>
        <SectionWrapper>
          <h2 className={styles.articlesTitle}>Tin tức</h2>
          <PArticles />
        </SectionWrapper>
        <SectionWrapper>
          <PComics />
        </SectionWrapper>
        <SectionWrapper>
          <h2>Nhân vật nổi bật</h2> {/* Thêm tiêu đề cho phần nhân vật */}
          <PCharacters /> {/* Sử dụng PCharacters */}
        </SectionWrapper>
      </div>
      <SliderRight /> {/* Đặt SliderRight bên ngoài portalContent */}
    </div>
  );
};

export default PortalPage;