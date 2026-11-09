import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

/** 아이디·비밀번호 찾기 연결 화면. 본인 확인 방식이 정해지면 이 페이지에 구현한다. */
function FindAccountPage() {
  return (
    <Box sx={ { py: '140px', textAlign: 'center' } }>
      <Box component="h1" sx={ { m: 0, fontSize: '26pt', fontWeight: 700, mb: 2 } }>아이디 / 비밀번호 찾기</Box>
      <Box sx={ { fontSize: 16, mb: 4 } }>본인 확인 방법이 정해지지 않아 아직 제공되지 않는 기능입니다.</Box>
      <Button component={ RouterLink } to="/login" variant="contained" disableElevation sx={ { px: 5, height: 50, fontWeight: 700 } }>로그인으로 돌아가기</Button>
    </Box>
  );
}

export default FindAccountPage;
