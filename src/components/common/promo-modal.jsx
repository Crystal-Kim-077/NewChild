import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Dialog from '@mui/material/Dialog';
import { assetUrl } from '../../utils/format.js';
import { getPromoHiddenDate, setPromoHiddenDate } from '../../utils/storage.js';

const todayKey = () => new Date().toDateString();

/** 메인 진입 시 화면 중앙에 표시되는 450x450 모달 팝업. */
function PromoModal() {
  const [isOpen, setIsOpen] = useState(() => getPromoHiddenDate() !== todayKey());

  const handleHideToday = () => {
    setPromoHiddenDate(todayKey());
    setIsOpen(false);
  };

  return (
    <Dialog
      open={ isOpen }
      onClose={ () => setIsOpen(false) }
      slotProps={ { paper: { sx: { width: 450, height: 450, maxWidth: 450, m: 0, display: 'flex', flexDirection: 'column' } } } }
    >
      <Box sx={ { flexGrow: 1, bgcolor: '#fff8e6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', px: 4 } }>
        <Box component="img" src={ assetUrl('logo.png') } alt="NewChild" sx={ { width: 150, height: 100, objectFit: 'contain', mb: 2 } } />
        <Box sx={ { fontSize: 24, fontWeight: 700, lineHeight: 1.4, mb: 1.5 } }>
          첫 구매 <Box component="span" sx={ { color: 'error.main' } }>10%</Box> 할인쿠폰
        </Box>
        <Box sx={ { fontSize: 15, lineHeight: 1.6, mb: 2.5 } }>
          새로운 시대를 주도할 당신에게 어울리는<br />자연스러운 에너지를 입어보세요.
        </Box>
        <Button component={ RouterLink } to="/signup" onClick={ () => setIsOpen(false) } variant="contained" disableElevation sx={ { px: 3, fontWeight: 700 } }>
          회원가입 하러 가기
        </Button>
      </Box>
      <Box sx={ { height: 64, px: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid', borderColor: 'secondary.main' } }>
        <ButtonBase onClick={ handleHideToday } sx={ { fontSize: 14, color: '#555' } }>오늘 하루 보지 않기</ButtonBase>
        <Button onClick={ () => setIsOpen(false) } variant="outlined" color="inherit" sx={ { borderColor: '#333', fontSize: 14 } }>닫기</Button>
      </Box>
    </Dialog>
  );
}

export default PromoModal;
