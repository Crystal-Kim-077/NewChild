import Box from '@mui/material/Box';
import { assetUrl } from '../../utils/format.js';

/** 전용 인스타그램 이미지가 제공되지 않아 상품 착용 컷을 임시로 사용한다. */
const POSTS = ['product/pho6.png', 'product/pho15.png', 'product/pho21.jpg', 'product/pho26.jpg', 'product/pho9.png'];

/** 메인 Instagram. 343x447 포스트 5개. */
function InstagramSection() {
  return (
    <Box component="section" sx={ { pb: '90px', textAlign: 'center' } }>
      <Box component="h2" sx={ { m: 0, fontSize: 32, fontWeight: 700 } }>Instagram</Box>
      <Box sx={ { mt: '4px', mb: 3.5, fontSize: 14, color: 'secondary.main' } }>@NewChild_</Box>
      <Box sx={ { display: 'flex', justifyContent: 'center', gap: '20px' } }>
        { POSTS.map((post) => (
          <Box key={ post } component="img" loading="lazy" src={ assetUrl(post) } alt="NewChild 인스타그램 포스트" sx={ { width: 343, height: 447, objectFit: 'cover', flexShrink: 1, minWidth: 0 } } />
        )) }
      </Box>
      <Box component="a" href="#instagram" sx={ { display: 'inline-block', mt: 4, px: 3.5, py: 1, fontSize: 14, border: '1px solid', borderColor: 'secondary.main', borderRadius: '5px' } }>
        더보기
      </Box>
    </Box>
  );
}

export default InstagramSection;
