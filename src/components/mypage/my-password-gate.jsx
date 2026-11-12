import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import SoftField from '../ui/soft-field.jsx';
import { useShop } from '../../hooks/use-shop.js';
import { verifyPassword } from '../../utils/api.js';

/**
 * MyPasswordGate 컴포넌트 (회원정보 화면 진입 전 비밀번호 재확인)
 *
 * Props:
 * @param {function} onVerified - 확인 성공 시 실행 [Required]
 *
 * Example usage:
 * <MyPasswordGate onVerified={ () => setIsVerified(true) } />
 */
function MyPasswordGate({ onVerified }) {
  const { user } = useShop();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsBusy(true);
    try {
      await verifyPassword(password);
      onVerified();
    } catch (requestError) {
      setError(requestError.message);
      setIsBusy(false);
    }
  };

  return (
    <Box component="form" onSubmit={ handleSubmit } sx={ { maxWidth: 480, mx: 'auto', py: 6, textAlign: 'center' } }>
      <Box sx={ { fontSize: 18, fontWeight: 700, mb: 1 } }>비밀번호 재확인</Box>
      <Box sx={ { fontSize: 15, color: '#555', mb: 3 } }>
        회원님의 정보를 안전하게 보호하기 위해 비밀번호를 다시 한 번 입력해 주세요.
        { user.sns_provider && <><br />SNS 로그인 회원은 비밀번호를 설정하지 않았다면 바로 확인을 눌러 주세요.</> }
      </Box>
      <SoftField type="password" value={ password } onChange={ setPassword } placeholder="비밀번호" autoComplete="current-password" fontSize="13pt" />
      { error && <Box role="alert" sx={ { mt: 1, fontSize: 12, color: '#DC143C', textAlign: 'left' } }>{ error }</Box> }
      <Button type="submit" variant="contained" disableElevation disabled={ isBusy } sx={ { width: 200, height: 50, mt: 3, fontSize: '13pt', fontWeight: 700 } }>확인</Button>
    </Box>
  );
}

export default MyPasswordGate;
