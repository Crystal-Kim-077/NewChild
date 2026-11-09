import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import CheckIcon from '@mui/icons-material/Check';

const baseSx = { width: 17, height: 17, borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' };

/**
 * SquareCheckbox 컴포넌트 (17x17 사각 체크박스)
 *
 * Props:
 * @param {boolean} isChecked - 체크 여부 [Required]
 * @param {function} onChange - 변경 시 실행 [Required]
 * @param {string} label - 스크린리더용 이름 [Required]
 *
 * Example usage:
 * <SquareCheckbox isChecked={ true } onChange={ toggle } label="상품 선택" />
 */
function SquareCheckbox({ isChecked, onChange, label }) {
  return (
    <Checkbox
      checked={ isChecked }
      onChange={ onChange }
      slotProps={ { input: { 'aria-label': label } } }
      sx={ { p: 0.5 } }
      icon={ <Box sx={ { ...baseSx, border: '1px solid #ebebeb', bgcolor: '#fff' } } /> }
      checkedIcon={ <Box sx={ { ...baseSx, bgcolor: 'primary.main' } }><CheckIcon sx={ { fontSize: 14, color: '#fff' } } /></Box> }
    />
  );
}

export default SquareCheckbox;
