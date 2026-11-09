import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';

const KEYWORDS = ['#최예나 PICK', '#컬러라마 경량패딩', '#플리스 시리즈', '#포인트 니트', '#USA 컬렉션', '#윈터 슈즈', '#데일리 코튼'];

/** 메인 키워드 버튼. 154x50, 주조색 배경. */
function KeywordButtons() {
  return (
    <Box component="section" aria-label="키워드" sx={ { display: 'flex', justifyContent: 'center', gap: 2, pt: '110px', pb: '110px' } }>
      { KEYWORDS.map((keyword) => (
        <Box
          key={ keyword }
          component={ RouterLink }
          to="/category/new"
          sx={ { width: 154, height: 50, px: '20px', bgcolor: 'primary.main', color: '#333', fontSize: 13, fontWeight: 600, letterSpacing: '-.3px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center' } }
        >
          { keyword }
        </Box>
      )) }
    </Box>
  );
}

export default KeywordButtons;
