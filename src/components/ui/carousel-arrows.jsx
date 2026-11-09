import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { iconUrl } from '../../utils/format.js';

/**
 * CarouselArrows 컴포넌트
 *
 * Props:
 * @param {object} carousel - useCarousel 반환값 [Required]
 *
 * Example usage:
 * <CarouselArrows carousel={ carousel } />
 */
function CarouselArrows({ carousel }) {
  return (
    <Box sx={ { display: 'flex', gap: 1 } }>
      <IconButton aria-label="이전 상품" disabled={ !carousel.canPrev } onClick={ carousel.prev } sx={ { opacity: carousel.canPrev ? 1 : 0.3 } }>
        <Box component="img" src={ iconUrl('angle-left.svg') } alt="" sx={ { width: 18, height: 18 } } />
      </IconButton>
      <IconButton aria-label="다음 상품" disabled={ !carousel.canNext } onClick={ carousel.next } sx={ { opacity: carousel.canNext ? 1 : 0.3 } }>
        <Box component="img" src={ iconUrl('angle-right.svg') } alt="" sx={ { width: 18, height: 18 } } />
      </IconButton>
    </Box>
  );
}

export default CarouselArrows;
