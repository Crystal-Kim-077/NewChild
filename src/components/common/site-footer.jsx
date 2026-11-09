import Box from '@mui/material/Box';
import { assetUrl } from '../../utils/format.js';

const titleSx = { fontSize: '16pt', fontWeight: 700, mb: 1.5 };
const bodySx = { fontSize: '14pt', fontWeight: 400, lineHeight: 1.6 };
const linkSx = { ...bodySx, display: 'block', textDecoration: 'underline', color: '#333' };

/** 사이트 공통 푸터. 회사 정보는 테스트용 샘플 문구다. */
function SiteFooter() {
  return (
    <Box component="footer" sx={ { bgcolor: 'secondary.main', px: '46px', pt: 7, pb: 8, mt: 'auto' } }>
      <Box component="img" src={ assetUrl('logo.png') } alt="NewChild" sx={ { width: 150, height: 100, objectFit: 'contain', mb: 2 } } />
      <Box sx={ { borderTop: '1px solid #333', pt: 4, display: 'grid', gridTemplateColumns: '1.5fr .8fr 1fr 1fr', gap: 5 } }>
        <Box>
          <Box sx={ titleSx }>주식회사 뉴차일드</Box>
          <Box sx={ bodySx }>대표: 홍길동(샘플)</Box>
          <Box sx={ bodySx }>사업자등록번호: 000-00-00000(샘플)</Box>
          <Box sx={ bodySx }>주소: 서울특별시 테스트구 샘플로 1</Box>
        </Box>
        <Box>
          <Box sx={ titleSx }>안내</Box>
          <Box component="a" href="#privacy" sx={ { ...linkSx, fontWeight: 700 } }>개인정보처리방침</Box>
          <Box component="a" href="#terms" sx={ linkSx }>이용약관</Box>
        </Box>
        <Box>
          <Box sx={ titleSx }>고객센터</Box>
          <Box sx={ bodySx }>1500-0000(샘플)</Box>
          <Box sx={ bodySx }>월-금 10:00 - 17:00</Box>
          <Box sx={ bodySx }>토·일·공휴일 휴무</Box>
        </Box>
        <Box>
          <Box sx={ titleSx }>오프라인 매장 안내</Box>
          <Box sx={ bodySx }>서울 테스트점 (샘플)</Box>
          <Box sx={ { ...titleSx, mt: 2.5 } }>입점 문의</Box>
          <Box sx={ bodySx }>partner@newchild.example</Box>
        </Box>
      </Box>
    </Box>
  );
}

export default SiteFooter;
