import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Dialog from '@mui/material/Dialog';

const chipSx = (isActive) => ({
  minWidth: 56,
  height: 34,
  px: 1.5,
  fontSize: 13,
  border: '1px solid',
  borderColor: isActive ? 'primary.main' : 'secondary.main',
  bgcolor: isActive ? 'primary.main' : '#fff',
  fontWeight: isActive ? 700 : 400,
});

/**
 * CartOptionDialog 컴포넌트
 *
 * Props:
 * @param {object} item - 옵션을 변경할 장바구니 항목 [Required]
 * @param {function} onClose - 닫을 때 실행 [Required]
 * @param {function} onSave - 변경 시 실행(size, color 전달) [Required]
 *
 * Example usage:
 * <CartOptionDialog item={ item } onClose={ close } onSave={ save } />
 */
function CartOptionDialog({ item, onClose, onSave }) {
  const [size, setSize] = useState(item.size);
  const [color, setColor] = useState(item.color);

  const optionRow = (label, values, selected, onSelect) => (
    <Box sx={ { mb: 2.5 } }>
      <Box sx={ { fontSize: 14, fontWeight: 700, mb: 1 } }>{ label }</Box>
      <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 1 } }>
        { values.map((value) => (
          <ButtonBase key={ value } sx={ chipSx(selected === value) } onClick={ () => onSelect(value) }>{ value }</ButtonBase>
        )) }
      </Box>
    </Box>
  );

  return (
    <Dialog open onClose={ onClose } slotProps={ { paper: { sx: { width: 420, p: 3 } } } }>
      <Box sx={ { fontSize: 18, fontWeight: 700, mb: 0.5 } }>옵션변경</Box>
      <Box sx={ { fontSize: 14, mb: 2.5 } }>{ item.name }</Box>
      { item.sizes?.length > 0 && optionRow('사이즈', item.sizes, size, setSize) }
      { item.colors?.length > 0 && optionRow('색상', item.colors, color, setColor) }
      <Box sx={ { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 } }>
        <Button variant="outlined" color="inherit" onClick={ onClose } sx={ { borderColor: '#333' } }>취소</Button>
        <Button variant="contained" disableElevation onClick={ () => onSave(size, color) } sx={ { fontWeight: 700 } }>변경</Button>
      </Box>
    </Dialog>
  );
}

export default CartOptionDialog;
