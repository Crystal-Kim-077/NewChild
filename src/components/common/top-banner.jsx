import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

/**
 * TopBanner 컴포넌트
 *
 * Props:
 * @param {function} onClose - 닫기 버튼 클릭 시 실행 [Required]
 *
 * Example usage:
 * <TopBanner onClose={ handleClose } />
 */
function TopBanner({ onClose }) {
  return (
    <Box sx={ { position: 'relative', height: 55, width: '100%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' } }>
      <Box sx={ { fontSize: 15, fontWeight: 600, color: 'text.primary' } }>
        신규 회원가입 시 3,000원 할인쿠폰 + 첫 구매 10% 할인쿠폰
      </Box>
      <IconButton aria-label="탑 배너 닫기" onClick={ onClose } sx={ { position: 'absolute', right: 40, color: 'text.primary' } }>
        <CloseIcon />
      </IconButton>
    </Box>
  );
}

export default TopBanner;
