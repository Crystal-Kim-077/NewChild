import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import ProductCard from '../common/product-card.jsx';
import CarouselArrows from '../ui/carousel-arrows.jsx';
import CarouselTrack from '../ui/carousel-track.jsx';
import TabButtons from '../ui/tab-buttons.jsx';
import { useCarousel } from '../../hooks/use-carousel.js';
import { fetchRanking } from '../../utils/api.js';
import { MAIN_CATEGORIES } from '../../utils/menu-data.js';

const TABS = MAIN_CATEGORIES.map((menu) => ({ value: menu.slug, label: menu.label }));
const CARD_SIZE = 358;
const GAP = 43;

/** 메인 Weekly Best. 분류별 1~10위, 한 화면 5개. */
function WeeklyBestSection() {
  const [tab, setTab] = useState(TABS[0].value);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const carousel = useCarousel(products.length, 5);

  useEffect(() => {
    let isActive = true;
    fetchRanking('weekly_best', tab)
      .then((rows) => {
        if (isActive) setProducts(rows);
      })
      .catch((requestError) => {
        if (isActive) setError(requestError.message);
      });
    return () => {
      isActive = false;
    };
  }, [tab]);

  const handleTab = (value) => {
    setError('');
    setProducts([]);
    carousel.reset();
    setTab(value);
  };

  return (
    <Box component="section" sx={ { pl: '46px', pb: '130px' } }>
      <Box component="h2" sx={ { m: 0, fontSize: 32, fontWeight: 700, mb: 3 } }>Weekly Best</Box>
      <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: '46px', mb: 4 } }>
        <TabButtons tabs={ TABS } value={ tab } onChange={ handleTab } />
        <CarouselArrows carousel={ carousel } />
      </Box>
      { error && <Box role="alert" sx={ { color: 'error.main' } }>{ error }</Box> }
      { !error && products.length === 0 && <Box sx={ { py: 8, color: '#777' } }>등록된 상품이 없습니다.</Box> }
      <CarouselTrack index={ carousel.index } itemWidth={ CARD_SIZE } gap={ GAP }>
        { products.map((product, rankIndex) => (
          <Box key={ product.product_id } sx={ { flex: `0 0 ${ CARD_SIZE }px` } }>
            <Box sx={ { fontSize: 28, fontWeight: 700, mb: 1.5, borderBottom: '2px solid #333', display: 'inline-block', lineHeight: 1.2 } }>
              { rankIndex + 1 }<Box component="span" sx={ { fontSize: 15, fontWeight: 500 } }>위</Box>
            </Box>
            <ProductCard product={ product } size={ CARD_SIZE } />
          </Box>
        )) }
      </CarouselTrack>
    </Box>
  );
}

export default WeeklyBestSection;
