import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';

const baseSx = { width: '100%', height: 54, borderRadius: '10px', fontSize: 15, fontWeight: 600 };

/**
 * SnsButtons 컴포넌트 (카카오톡, 네이버 모의 로그인 버튼)
 *
 * Props:
 * @param {string} next - 로그인 후 이동할 경로 [Optional, 기본값: /]
 *
 * Example usage:
 * <SnsButtons next="/cart" />
 */
function SnsButtons({ next = '/' }) {
  const navigate = useNavigate();
  const go = (provider) => navigate(`/sns-consent/${ provider }?next=${ encodeURIComponent(next) }`);

  return (
    <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.25 } }>
      <ButtonBase onClick={ () => go('kakao') } sx={ { ...baseSx, bgcolor: '#FAE100', color: '#333' } }>카카오톡 로그인</ButtonBase>
      <ButtonBase onClick={ () => go('naver') } sx={ { ...baseSx, bgcolor: '#03C75A', color: '#fff' } }>네이버 로그인</ButtonBase>
    </Box>
  );
}

export default SnsButtons;
