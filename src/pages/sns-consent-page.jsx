import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TestNotice from '../components/ui/test-notice.jsx';
import { useShop } from '../hooks/use-shop.js';
import { mockSnsLogin } from '../utils/api.js';

const PROVIDERS = {
  kakao: { label: '카카오톡', bgcolor: '#FAE100', color: '#333' },
  naver: { label: '네이버', bgcolor: '#03C75A', color: '#fff' },
};

/** SNS 약관 동의를 흉내 내는 모의 화면. 실제 플랫폼과 통신하지 않는다. */
function SnsConsentPage() {
  const { provider } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { afterAuth } = useShop();
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const info = PROVIDERS[provider] ?? PROVIDERS.kakao;
  const next = params.get('next') ?? '/';

  const handleAgree = async () => {
    setIsBusy(true);
    try {
      const session = await mockSnsLogin(provider);
      await afterAuth(session);
      if (session.is_new) navigate(`/welcome?next=${ encodeURIComponent(next) }`);
      else navigate(next);
    } catch (requestError) {
      setError(requestError.message);
      setIsBusy(false);
    }
  };

  return (
    <Box sx={ { py: '120px', display: 'flex', justifyContent: 'center' } }>
      <Box sx={ { width: 480, textAlign: 'center' } }>
        <Box component="h1" sx={ { m: 0, fontSize: 26, fontWeight: 700, mb: 2 } }>{ info.label } 간편 로그인 동의</Box>
        <Box sx={ { mb: 3 } }>
          <TestNotice>실제 { info.label } 계정과 연결되지 않는 모의 화면입니다. 이 브라우저 전용 테스트 회원으로 로그인됩니다.</TestNotice>
        </Box>
        { error && <Box role="alert" sx={ { color: 'error.main', fontSize: 13, mb: 2 } }>{ error }</Box> }
        <Box sx={ { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 } }>
          <Button variant="outlined" color="inherit" onClick={ () => navigate(-1) } sx={ { height: 50, borderColor: '#333' } }>취소</Button>
          <Button disabled={ isBusy } onClick={ handleAgree } sx={ { height: 50, fontWeight: 700, bgcolor: info.bgcolor, color: info.color, '&:hover': { bgcolor: info.bgcolor } } }>동의하고 계속하기</Button>
        </Box>
      </Box>
    </Box>
  );
}

export default SnsConsentPage;
