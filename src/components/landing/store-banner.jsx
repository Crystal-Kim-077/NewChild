import Box from '@mui/material/Box';
import { assetUrl } from '../../utils/format.js';

/** 오프라인 매장 안내 배너. 화면 너비, 세로 535px. */
function StoreBanner() {
  return (
    <Box component="section" aria-label="오프라인 매장 안내" sx={ { width: '100%', height: 535, mb: '130px' } }>
      <Box component="img" loading="lazy" src={ assetUrl('main/storebanner.jpg') } alt="오프라인 매장 안내" sx={ { width: '100%', height: '100%', objectFit: 'cover' } } />
    </Box>
  );
}

export default StoreBanner;
