import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import ProductCard from '../common/product-card.jsx';
import CarouselArrows from '../ui/carousel-arrows.jsx';
import CarouselTrack from '../ui/carousel-track.jsx';
import TabButtons from '../ui/tab-buttons.jsx';
import { useCarousel } from '../../hooks/use-carousel.js';
import { fetchProducts } from '../../utils/api.js';
import { MAIN_CATEGORIES } from '../../utils/menu-data.js';

const TABS = [{ value: 'all', label: 'ALL' }, ...MAIN_CATEGORIES.map((menu) => ({ value: menu.slug, label: menu.label }))];
const CARD_SIZE = 358;
const GAP = 43;

/** 메인 New In. 등록일이 최신인 상품을 분류별로 보여준다. */
function NewInSection() {
  const [tab, setTab] = useState('all');
  const [products, setProducts] = useState([]);
  const carousel = useCarousel(products.length, 5);

  useEffect(() => {
    let isActive = true;
    fetchProducts({ parentSlug: tab === 'all' ? undefined : tab, sort: 'new', pageSize: 10 })
      .then(({ rows }) => {
        if (isActive) setProducts(rows);
      })
      .catch(() => {});
    return () => {
      isActive = false;
    };
  }, [tab]);

  const handleTab = (value) => {
    setProducts([]);
    carousel.reset();
    setTab(value);
  };

  return (
    <Box component="section" sx={ { pl: '46px', pb: '54px' } }>
      <Box component="h2" sx={ { m: 0, fontSize: 32, fontWeight: 700, mb: '20px' } }>New In</Box>
      <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: '46px', mb: 4 } }>
        <TabButtons tabs={ TABS } value={ tab } onChange={ handleTab } />
        <Box sx={ { display: 'flex', alignItems: 'center', gap: 2 } }>
          <CarouselArrows carousel={ carousel } />
          <Box component={ RouterLink } to="/category/new" sx={ { fontSize: 15, color: 'secondary.main' } }>+더보기</Box>
        </Box>
      </Box>
      { products.length === 0 && <Box sx={ { py: 8, color: '#777' } }>등록된 상품이 없습니다.</Box> }
      <CarouselTrack index={ carousel.index } itemWidth={ CARD_SIZE } gap={ GAP }>
        { products.map((product) => (
          <Box key={ product.product_id } sx={ { flex: `0 0 ${ CARD_SIZE }px` } }>
            <ProductCard product={ product } size={ CARD_SIZE } />
          </Box>
        )) }
      </CarouselTrack>
    </Box>
  );
}

export default NewInSection;
