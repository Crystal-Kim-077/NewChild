import { useEffect } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TestNotice from '../components/ui/test-notice.jsx';

const REDIRECT_MS = 2500;

/** 가입 완료 축하 페이지. 주문 중 가입했다면 잠시 후 원래 화면으로 자동 이동한다. */
function WelcomePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') ?? '/';

  useEffect(() => {
    if (next === '/') return undefined;
    const timer = setTimeout(() => navigate(next), REDIRECT_MS);
    return () => clearTimeout(timer);
  }, [navigate, next]);

  return (
    <Box sx={ { py: '140px', display: 'flex', justifyContent: 'center' } }>
      <Box sx={ { width: 560, textAlign: 'center' } }>
        <Box component="h1" sx={ { m: 0, fontSize: '26pt', fontWeight: 700, mb: 2 } }>NewChild의 회원이 되신 걸 환영합니다!</Box>
        <Box sx={ { fontSize: 16, mb: 3 } }>3,000원 할인쿠폰과 첫 구매 10% 할인쿠폰을 드렸어요.</Box>
        <Box sx={ { mb: 4 } }><TestNotice>테스트용 가입입니다. 실제 회원 가입이 이루어진 것은 아닙니다.</TestNotice></Box>
        <Button component={ RouterLink } to={ next } variant="contained" disableElevation sx={ { px: 5, height: 50, fontWeight: 700 } }>쇼핑 계속하기</Button>
      </Box>
    </Box>
  );
}

export default WelcomePage;
