import { useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import SnsButtons from '../components/common/sns-buttons.jsx';
import TestNotice from '../components/ui/test-notice.jsx';

/** 회원가입 방법 선택 페이지. */
function SignupPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') ?? '/';

  return (
    <Box sx={ { pt: '90px', pb: '140px', display: 'flex', justifyContent: 'center' } }>
      <Box sx={ { width: 505 } }>
        <Box component="h1" sx={ { m: 0, textAlign: 'center', fontSize: '32pt', fontWeight: 700, color: '#333', mb: 6 } }>Welcome to NewChild</Box>
        <SnsButtons next={ next } />
        <ButtonBase
          onClick={ () => navigate(`/signup/form?next=${ encodeURIComponent(next) }`) }
          sx={ { width: '100%', height: 54, mt: 1.25, borderRadius: '10px', bgcolor: 'primary.main', color: '#333', fontSize: 15, fontWeight: 600 } }
        >
          이메일 회원가입
        </ButtonBase>
        <Box sx={ { mt: 4 } }>
          <TestNotice>이 사이트의 회원가입은 테스트용 모의 동작입니다. 실제 개인정보를 입력하지 마세요.</TestNotice>
        </Box>
      </Box>
    </Box>
  );
}

export default SignupPage;
