import Box from '@mui/material/Box';

/**
 * TestNotice 컴포넌트 (테스트 동작 안내 문구)
 *
 * Props:
 * @param {node} children - 안내 문구 [Required]
 *
 * Example usage:
 * <TestNotice>실제 결제가 이루어지지 않습니다.</TestNotice>
 */
function TestNotice({ children }) {
  return (
    <Box role="note" sx={ { bgcolor: '#fff8e6', border: '1px solid', borderColor: 'primary.main', px: 2, py: 1.25, fontSize: 13, lineHeight: 1.5 } }>
      [테스트] { children }
    </Box>
  );
}

export default TestNotice;
