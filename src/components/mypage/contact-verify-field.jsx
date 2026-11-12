import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import SoftField from '../ui/soft-field.jsx';
import { useShop } from '../../hooks/use-shop.js';
import { confirmContactVerification, requestContactVerification } from '../../utils/api.js';

const LIMIT_SECONDS = 180;
const ERROR_COLOR = '#DC143C';
const SUCCESS_COLOR = '#555';
const buttonSx = { flexShrink: 0, width: 110, bgcolor: '#444', color: '#fff', '&:hover': { bgcolor: '#333' } };

const formatTime = (seconds) => `${ Math.floor(seconds / 60) }:${ String(seconds % 60).padStart(2, '0') }`;

/**
 * ContactVerifyField 컴포넌트 (이메일/휴대전화 입력 + 인증번호 확인)
 *
 * Props:
 * @param {string} kind - 인증 종류(email | phone) [Required]
 * @param {string} value - 입력값 [Required]
 * @param {function} onChange - 값 변경 시 실행(문자열 전달) [Required]
 * @param {string} originalValue - 저장된 기존 값. 같으면 인증하지 않아도 된다 [Required]
 * @param {function} onVerified - 인증 성공 시 실행(인증된 값 전달) [Required]
 * @param {string} fontSize - 글자 크기 [Optional]
 * @param {string} type - input 타입 [Optional, 기본값: text]
 *
 * Example usage:
 * <ContactVerifyField kind="email" value={ email } onChange={ setEmail } originalValue={ user.email } onVerified={ setVerifiedEmail } />
 */
function ContactVerifyField({ kind, value, onChange, originalValue, onVerified, fontSize, type = 'text' }) {
  const { showToast } = useShop();
  const [expiresAt, setExpiresAt] = useState(null);
  const [code, setCode] = useState('');
  const [remaining, setRemaining] = useState(0);
  const [message, setMessage] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  const isSent = expiresAt !== null;
  const isChanged = value.trim() !== (originalValue ?? '');

  /** 인증번호 유효 시간(3분) 카운트다운. 0이 되면 다시 인증해야 한다. */
  useEffect(() => {
    if (!expiresAt) return undefined;
    const timer = setInterval(() => {
      const seconds = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0) {
        setExpiresAt(null);
        setMessage({ text: '인증 시간이 만료되었습니다. 다시 인증해 주세요.', color: ERROR_COLOR });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const handleValue = (nextValue) => {
    setExpiresAt(null);
    setCode('');
    setMessage(null);
    onChange(nextValue);
  };

  const handleRequest = async () => {
    setIsBusy(true);
    try {
      const issuedCode = await requestContactVerification(kind, value.trim());
      setCode('');
      setRemaining(LIMIT_SECONDS);
      setExpiresAt(Date.now() + LIMIT_SECONDS * 1000);
      setMessage(null);
      /** 테스트 사이트라 실제 메일/문자를 보내지 않고 화면에 인증번호를 알려준다. */
      showToast(`[테스트] ${ kind === 'email' ? '이메일' : '휴대전화' }로 인증번호 ${ issuedCode }를 발송했습니다.`);
    } catch (error) {
      setMessage({ text: error.message, color: ERROR_COLOR });
    } finally {
      setIsBusy(false);
    }
  };

  const handleConfirm = async () => {
    setIsBusy(true);
    try {
      const isMatched = await confirmContactVerification(kind, value.trim(), code);
      if (isMatched) {
        setExpiresAt(null);
        setMessage({ text: '인증되었습니다.', color: SUCCESS_COLOR });
        onVerified(value.trim());
      } else {
        setMessage({ text: '인증번호를 올바르게 입력해 주세요.', color: ERROR_COLOR });
      }
    } catch (error) {
      setExpiresAt(null);
      setMessage({ text: error.message, color: ERROR_COLOR });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <Box>
      <Box sx={ { display: 'flex', gap: 1 } }>
        <SoftField value={ value } onChange={ handleValue } type={ type } fontSize={ fontSize } />
        { !isSent && (
          <Button type="button" variant="contained" disableElevation disabled={ !isChanged || isBusy } onClick={ handleRequest } sx={ buttonSx }>인증</Button>
        ) }
      </Box>
      { isSent && (
        <Box sx={ { display: 'flex', gap: 1, mt: 1 } }>
          <Box sx={ { position: 'relative', flex: 1 } }>
            <SoftField value={ code } onChange={ setCode } placeholder="인증번호 6자리" fontSize={ fontSize } autoComplete="one-time-code" />
            <Box aria-live="polite" sx={ { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: ERROR_COLOR } }>
              { formatTime(remaining) }
            </Box>
          </Box>
          <Button type="button" variant="contained" disableElevation disabled={ !code || isBusy } onClick={ handleConfirm } sx={ buttonSx }>확인</Button>
        </Box>
      ) }
      { message && <Box role="status" sx={ { mt: 0.75, fontSize: 12, color: message.color } }>{ message.text }</Box> }
    </Box>
  );
}

export default ContactVerifyField;
