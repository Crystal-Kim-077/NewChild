import Box from '@mui/material/Box';

/**
 * LabeledField 컴포넌트 (좌측 라벨 + 우측 입력 영역)
 *
 * Props:
 * @param {string} label - 라벨 [Required]
 * @param {boolean} isRequired - 필수 표시 여부 [Optional, 기본값: false]
 * @param {string} hint - 입력 영역 아래 안내 문구 [Optional]
 * @param {node} children - 입력 요소 [Required]
 *
 * Example usage:
 * <LabeledField label="이름" isRequired><SoftField /></LabeledField>
 */
function LabeledField({ label, isRequired = false, hint, children }) {
  return (
    <Box sx={ { display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', columnGap: 2, py: 1 } }>
      <Box sx={ { fontWeight: 600 } }>
        { label }
        { isRequired && <Box component="span" sx={ { color: 'error.main', ml: 0.5 } }>*</Box> }
      </Box>
      <Box>
        { children }
        { hint && <Box sx={ { mt: 0.75, fontSize: 12, color: '#777' } }>{ hint }</Box> }
      </Box>
    </Box>
  );
}

export default LabeledField;
