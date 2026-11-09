import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import TuneIcon from '@mui/icons-material/Tune';
import { fetchKeywords } from '../../utils/api.js';
import { EMPTY_FILTER, FILTER_SIZES, PRICE_MAX, PRICE_MIN } from '../../utils/filter-data.js';
import { won } from '../../utils/format.js';

const toggle = (list, value) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

const chipSx = (isActive) => ({
  height: 34,
  px: 2,
  fontSize: 14,
  border: '1px solid',
  borderColor: isActive ? 'primary.main' : '#d5d5d5',
  bgcolor: isActive ? 'primary.main' : '#fff',
  color: isActive ? '#333' : '#777',
  fontWeight: isActive ? 700 : 400,
});

/**
 * FilterDrawer 컴포넌트
 *
 * Props:
 * @param {boolean} isOpen - 열림 여부 [Required]
 * @param {object} filter - 현재 적용된 필터 [Required]
 * @param {function} onClose - 닫을 때 실행 [Required]
 * @param {function} onSearch - 검색하기 클릭 시 실행(필터 전달) [Required]
 *
 * Example usage:
 * <FilterDrawer isOpen={ true } filter={ filter } onClose={ close } onSearch={ search } />
 */
function FilterDrawer({ isOpen, filter, onClose, onSearch }) {
  const [draft, setDraft] = useState(filter);
  const [keywords, setKeywords] = useState([]);

  useEffect(() => {
    fetchKeywords().then(setKeywords).catch(() => {});
  }, []);

  const sectionSx = { borderBottom: '1px solid #333', py: 3 };
  const titleSx = { fontSize: 18, fontWeight: 600, mb: 2.5 };

  return (
    <Drawer anchor="left" open={ isOpen } onClose={ onClose } slotProps={ { paper: { sx: { width: 620, px: '76px', py: 6 } } } }>
      <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', pb: 2.5 } }>
        <Box sx={ { display: 'flex', alignItems: 'center', gap: 1, fontSize: 26, fontWeight: 700 } }>필터 <TuneIcon /></Box>
        <IconButton aria-label="필터 닫기" onClick={ onClose }><CloseIcon /></IconButton>
      </Box>
      <Box sx={ sectionSx }>
        <Box sx={ titleSx }>가격</Box>
        <Slider
          getAriaLabel={ (index) => (index === 0 ? '최저 가격' : '최고 가격') }
          value={ draft.price }
          min={ PRICE_MIN }
          max={ PRICE_MAX }
          step={ 1000 }
          onChange={ (_, value) => setDraft({ ...draft, price: value }) }
        />
        <Box sx={ { display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 } }>
          <Box>{ won(draft.price[0]) }</Box>
          <Box>{ won(draft.price[1]) }</Box>
        </Box>
      </Box>
      <Box sx={ sectionSx }>
        <Box sx={ titleSx }>키워드</Box>
        <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 1 } }>
          { keywords.map((keyword) => (
            <ButtonBase
              key={ keyword }
              aria-pressed={ draft.keywords.includes(keyword) }
              sx={ chipSx(draft.keywords.includes(keyword)) }
              onClick={ () => setDraft({ ...draft, keywords: toggle(draft.keywords, keyword) }) }
            >
              { keyword }
            </ButtonBase>
          )) }
        </Box>
      </Box>
      <Box sx={ sectionSx }>
        <Box sx={ titleSx }>사이즈</Box>
        <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 1 } }>
          { FILTER_SIZES.map((size) => (
            <ButtonBase
              key={ size }
              aria-pressed={ draft.sizes.includes(size) }
              sx={ chipSx(draft.sizes.includes(size)) }
              onClick={ () => setDraft({ ...draft, sizes: toggle(draft.sizes, size) }) }
            >
              { size }
            </ButtonBase>
          )) }
        </Box>
      </Box>
      <Box sx={ { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 4 } }>
        <Button
          startIcon={ <RefreshIcon sx={ { color: 'primary.main' } } /> }
          onClick={ () => setDraft(EMPTY_FILTER) }
          sx={ { height: 56, bgcolor: '#222', color: 'primary.main', fontSize: 16, fontWeight: 700, '&:hover': { bgcolor: '#000' } } }
        >
          초기화
        </Button>
        <Button variant="contained" disableElevation onClick={ () => onSearch(draft) } sx={ { height: 56, fontSize: 16, fontWeight: 700 } }>검색하기</Button>
      </Box>
    </Drawer>
  );
}

export default FilterDrawer;
