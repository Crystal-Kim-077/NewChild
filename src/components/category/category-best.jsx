import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import ProductCard from '../common/product-card.jsx';
import CarouselArrows from '../ui/carousel-arrows.jsx';
import CarouselTrack from '../ui/carousel-track.jsx';
import { useCarousel } from '../../hooks/use-carousel.js';
import { fetchRanking } from '../../utils/api.js';

const CARD_SIZE = 429;
const GAP = 43;
const VISIBLE = 4;

/**
 * CategoryBest 컴포넌트
 *
 * Props:
 * @param {string} parentSlug - 상위 카테고리 slug [Required]
 * @param {string} title - 상위 카테고리명 [Required]
 *
 * Example usage:
 * <CategoryBest parentSlug="outer" title="아우터" />
 */
function CategoryBest({ parentSlug, title }) {
  const [products, setProducts] = useState([]);
  const carousel = useCarousel(products.length, VISIBLE);

  useEffect(() => {
    let isActive = true;
    fetchRanking('category_best', parentSlug).then((rows) => {
      if (isActive) setProducts(rows.slice(0, 8));
    }).catch(() => {});
    return () => {
      isActive = false;
    };
  }, [parentSlug]);

  if (products.length === 0) return null;

  const barWidth = (Math.min(VISIBLE, products.length) / products.length) * 100;
  const barLeft = (carousel.index / products.length) * 100;

  return (
    <Box component="section" sx={ { bgcolor: '#f7f7f7', pl: '46px', pt: '40px', pb: '50px' } }>
      <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: '46px', mb: 2.5 } }>
        <Box component="h1" sx={ { m: 0, fontSize: '24pt', fontWeight: 700 } }>{ title } BEST</Box>
        <CarouselArrows carousel={ carousel } />
      </Box>
      <CarouselTrack index={ carousel.index } itemWidth={ CARD_SIZE } gap={ GAP }>
        { products.map((product) => (
          <Box key={ product.product_id } sx={ { flex: `0 0 ${ CARD_SIZE }px` } }>
            <ProductCard product={ product } size={ CARD_SIZE } isZoomOnHover />
          </Box>
        )) }
      </CarouselTrack>
      <Box sx={ { position: 'relative', mt: 4, mr: '46px', height: 3, bgcolor: 'secondary.main' } }>
        <Box sx={ { position: 'absolute', top: 0, height: '100%', bgcolor: 'primary.main', width: `${ barWidth }%`, left: `${ barLeft }%`, transition: 'left .4s ease' } } />
      </Box>
    </Box>
  );
}

export default CategoryBest;
