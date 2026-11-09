import Box from '@mui/material/Box';

/**
 * CarouselTrack 컴포넌트
 *
 * Props:
 * @param {number} index - 현재 첫 번째로 보이는 아이템 위치 [Required]
 * @param {number} itemWidth - 아이템 너비(px) [Required]
 * @param {number} gap - 아이템 간격(px) [Required]
 * @param {node} children - 아이템 목록 [Required]
 *
 * Example usage:
 * <CarouselTrack index={ 0 } itemWidth={ 358 } gap={ 43 }>{ items }</CarouselTrack>
 */
function CarouselTrack({ index, itemWidth, gap, children }) {
  return (
    <Box sx={ { overflow: 'hidden' } }>
      <Box sx={ { display: 'flex', gap: `${ gap }px`, transform: `translateX(-${ index * (itemWidth + gap) }px)`, transition: 'transform .4s ease' } }>
        { children }
      </Box>
    </Box>
  );
}

export default CarouselTrack;
