import { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import FormControlLabel from '@mui/material/FormControlLabel';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SnsButtons from '../components/common/sns-buttons.jsx';
import SoftField from '../components/ui/soft-field.jsx';
import TestNotice from '../components/ui/test-notice.jsx';
import { useShop } from '../hooks/use-shop.js';
import { guestOrderLookup, logIn } from '../utils/api.js';
import { getSavedLoginId, setSavedLoginId } from '../utils/storage.js';

const couponSx = { flex: 1, height: 58, border: '1px solid #b6b6b7', borderRadius: '4px', fontSize: 14 };
const percent = <Box component="span" sx={ { color: '#e85d04', mx: 0.25 } }>10%</Box>;

/** 로그인 페이지. 비회원 배송조회 입력 모드와 주문 전 안내 팝업을 포함한다. */
function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { afterAuth, showToast } = useShop();
  const next = params.get('next') ?? '/';
  const [isOrderPopup, setIsOrderPopup] = useState(params.get('order') === '1');
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [loginId, setLoginId] = useState(getSavedLoginId);
  const [password, setPassword] = useState('');
  const [isSaveId, setIsSaveId] = useState(Boolean(getSavedLoginId()));
  const [guest, setGuest] = useState({ name: '', orderNumber: '', password: '' });
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const nextQuery = next === '/' ? '' : `?next=${ encodeURIComponent(next) }`;

  const handleLogin = async () => {
    if (!loginId || !password) {
      setError('아이디와 비밀번호를 입력해 주세요.');
      return;
    }
    setIsBusy(true);
    setError('');
    try {
      await afterAuth(await logIn(loginId, password));
      setSavedLoginId(isSaveId ? loginId : null);
      navigate(next);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleGuestLookup = async () => {
    if (!guest.name || !guest.orderNumber || !guest.password) {
      setError('주문자명, 주문번호, 비회원주문 비밀번호를 모두 입력해 주세요.');
      return;
    }
    setIsBusy(true);
    setError('');
    try {
      const order = await guestOrderLookup(guest);
      navigate('/guest-order', { state: { order } });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isGuestMode) handleGuestLookup();
    else handleLogin();
  };

  const toggleMode = () => {
    setError('');
    setIsGuestMode(!isGuestMode);
  };

  return (
    <Box sx={ { pt: '90px', pb: '140px', display: 'flex', justifyContent: 'center' } }>
      <Box sx={ { width: 505 } }>
        <Box component="h1" sx={ { m: 0, textAlign: 'center', fontSize: '32pt', fontWeight: 700, color: '#333', mb: 5 } }>Welcome to NewChild</Box>
        <Box sx={ { display: 'flex', gap: 1.5, mb: 6 } }>
          <ButtonBase component={ RouterLink } to={ `/signup${ nextQuery }` } sx={ couponSx }>신규가입 후{ percent }할인쿠폰 받기</ButtonBase>
          <ButtonBase onClick={ () => showToast('테스트 사이트에서는 카카오톡 친구 연동을 제공하지 않습니다.') } sx={ couponSx }>카카오톡 친구{ percent }할인쿠폰 받기</ButtonBase>
        </Box>
        <SnsButtons next={ next } />
        <Box component="form" onSubmit={ handleSubmit } sx={ { mt: 7 } }>
          <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.25, mb: 1.25 } }>
            { isGuestMode ? (
              <>
                <SoftField value={ guest.name } onChange={ (value) => setGuest({ ...guest, name: value }) } placeholder="주문자명" />
                <SoftField value={ guest.orderNumber } onChange={ (value) => setGuest({ ...guest, orderNumber: value }) } placeholder="주문번호(-) 포함" />
                <SoftField type="password" value={ guest.password } onChange={ (value) => setGuest({ ...guest, password: value }) } placeholder="비회원주문 비밀번호" autoComplete="off" />
              </>
            ) : (
              <>
                <SoftField value={ loginId } onChange={ setLoginId } placeholder="ID" autoComplete="username" />
                <SoftField type="password" value={ password } onChange={ setPassword } placeholder="Password" autoComplete="current-password" />
              </>
            ) }
          </Box>
          { error && <Box role="alert" sx={ { color: 'error.main', fontSize: 13, mb: 1.25 } }>{ error }</Box> }
          <Box sx={ { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 } }>
            <Button type="button" onClick={ toggleMode } sx={ { height: 54, bgcolor: isGuestMode ? '#fff' : 'primary.main', border: isGuestMode ? '1px solid #333' : 'none', color: '#333', fontSize: '15pt', fontWeight: 600 } }>
              { isGuestMode ? '로그인' : '비회원 배송조회' }
            </Button>
            <Button type="submit" disabled={ isBusy } sx={ { height: 54, bgcolor: isGuestMode ? 'primary.main' : '#222', color: isGuestMode ? '#333' : '#fff', fontSize: '15pt', fontWeight: 600, '&:hover': { bgcolor: isGuestMode ? 'primary.main' : '#000' } } }>
              { isGuestMode ? '비회원 배송조회' : '로그인' }
            </Button>
          </Box>
        </Box>
        <Box sx={ { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 1, fontSize: '12pt' } }>
          <FormControlLabel
            control={ <Checkbox size="small" checked={ isSaveId } onChange={ (event) => setIsSaveId(event.target.checked) } sx={ { p: 0.5 } } /> }
            label="아이디 저장"
            sx={ { m: 0, '& .MuiFormControlLabel-label': { fontSize: '12pt' } } }
          />
          <Box sx={ { display: 'flex', alignItems: 'center', gap: 0.25 } }><LockOutlinedIcon sx={ { fontSize: 16, color: '#e85d04' } } />보안접속</Box>
        </Box>
        <Box sx={ { display: 'flex', justifyContent: 'center', gap: 3, mt: 4, fontSize: '14pt' } }>
          <RouterLink to="/find-account">아이디 찾기</RouterLink>
          <Box component="span" sx={ { color: '#b6b6b7' } }>|</Box>
          <RouterLink to="/find-account">비밀번호 찾기</RouterLink>
          <Box component="span" sx={ { color: '#b6b6b7' } }>|</Box>
          <RouterLink to={ `/signup${ nextQuery }` }>회원가입</RouterLink>
        </Box>
        <Box sx={ { mt: 4 } }>
          <TestNotice>이 사이트의 로그인과 회원가입은 테스트용 모의 동작입니다. 실제 개인정보를 입력하지 마세요.</TestNotice>
        </Box>
      </Box>

      <Dialog open={ isOrderPopup } onClose={ () => setIsOrderPopup(false) } slotProps={ { paper: { sx: { width: 420, p: 3.5, textAlign: 'center' } } } }>
        <Box sx={ { fontSize: 18, fontWeight: 700, mb: 1 } }>주문 방법을 선택해 주세요</Box>
        <Box sx={ { fontSize: 14, color: '#555', mb: 3 } }>로그인 또는 회원가입을 완료하면 이전 주문 화면으로 돌아갑니다.</Box>
        <Box sx={ { display: 'grid', gap: 1 } }>
          <Button variant="outlined" color="inherit" onClick={ () => navigate('/checkout') } sx={ { height: 50, borderColor: '#333', fontWeight: 600 } }>비회원 주문</Button>
          <Button variant="contained" disableElevation onClick={ () => setIsOrderPopup(false) } sx={ { height: 50, fontWeight: 700 } }>로그인/회원가입 후 주문</Button>
        </Box>
      </Dialog>
    </Box>
  );
}

export default LoginPage;
