import { useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Popover from '@mui/material/Popover';
import HistoryIcon from '@mui/icons-material/History';
import NorthIcon from '@mui/icons-material/North';
import { useShop } from '../../hooks/use-shop.js';
import { assetUrl, won } from '../../utils/format.js';
import { getRecentProducts } from '../../utils/storage.js';

const buttonSx = {
  width: 52,
  height: 52,
  borderRadius: '50%',
  bgcolor: '#fff',
  border: '1px solid #333',
  color: '#333',
  '&:hover': { bgcolor: 'primary.main' },
};

/** 화면 우측 하단 고정 버튼. 최근 본 상품은 옵션 선택 창을 연 상품 기준으로 기록된다. */
function FloatingButtons() {
  const { openOptions } = useShop();
  const [anchor, setAnchor] = useState(null);
  const [recent, setRecent] = useState([]);

  const handleRecent = (event) => {
    setRecent(getRecentProducts());
    setAnchor(event.currentTarget);
  };

  const handleSelect = (product) => {
    setAnchor(null);
    openOptions(product);
  };

  return (
    <Box sx={ { position: 'fixed', right: 28, bottom: 36, zIndex: 30, display: 'flex', flexDirection: 'column', gap: 1.25 } }>
      <ButtonBase aria-label="최근 본 상품" sx={ buttonSx } onClick={ handleRecent }>
        <HistoryIcon />
      </ButtonBase>
      <ButtonBase aria-label="맨 위로" sx={ buttonSx } onClick={ () => window.scrollTo({ top: 0, behavior: 'smooth' }) }>
        <NorthIcon />
      </ButtonBase>
      <Popover
        open={ Boolean(anchor) }
        anchorEl={ anchor }
        onClose={ () => setAnchor(null) }
        anchorOrigin={ { vertical: 'top', horizontal: 'left' } }
        transformOrigin={ { vertical: 'bottom', horizontal: 'right' } }
      >
        <Box sx={ { width: 320, p: 2, maxHeight: 420 } }>
          <Box sx={ { fontWeight: 700, fontSize: 16, mb: 1.5 } }>최근 본 상품</Box>
          { recent.length === 0 && <Box sx={ { fontSize: 14, color: '#777' } }>최근 본 상품이 없습니다.</Box> }
          { recent.map((product) => (
            <ButtonBase
              key={ product.product_id }
              onClick={ () => handleSelect(product) }
              sx={ { display: 'flex', width: '100%', gap: 1.5, justifyContent: 'flex-start', textAlign: 'left', mb: 1 } }
            >
              <Box component="img" src={ assetUrl(product.main_image_url) } alt="" sx={ { width: 56, height: 56, objectFit: 'cover', flexShrink: 0 } } />
              <Box sx={ { fontSize: 13 } }>
                <Box>{ product.name }</Box>
                <Box sx={ { fontWeight: 700, mt: 0.5 } }>{ won(product.sale_price) }</Box>
              </Box>
            </ButtonBase>
          )) }
        </Box>
      </Popover>
    </Box>
  );
}

export default FloatingButtons;
