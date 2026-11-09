import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SquareCheckbox from '../ui/square-checkbox.jsx';
import { assetUrl, formatOption, won } from '../../utils/format.js';

const roundSx = { width: 26, height: 26, border: '1px solid', borderColor: 'secondary.main', color: '#333' };

/**
 * CartRow 컴포넌트
 *
 * Props:
 * @param {object} item - 장바구니 항목 [Required]
 * @param {boolean} isSelected - 선택 여부 [Required]
 * @param {function} onToggle - 체크 변경 시 실행 [Required]
 * @param {function} onQuantity - 수량 변경 시 실행(수량 전달) [Required]
 * @param {function} onEditOption - 옵션변경 클릭 시 실행 [Required]
 *
 * Example usage:
 * <CartRow item={ item } isSelected onToggle={ a } onQuantity={ b } onEditOption={ c } />
 */
function CartRow({ item, isSelected, onToggle, onQuantity, onEditOption }) {
  return (
    <Box sx={ { display: 'grid', gridTemplateColumns: '50px 200px minmax(0, 1fr) 160px 170px 160px', alignItems: 'center', columnGap: 3, py: 1.5, borderTop: '1px solid', borderColor: 'secondary.main' } }>
      <SquareCheckbox isChecked={ isSelected } onChange={ onToggle } label={ `${ item.name } 선택` } />
      <Box component="img" src={ assetUrl(item.main_image_url) } alt={ item.name } sx={ { width: 200, height: 200, objectFit: 'cover', objectPosition: 'center 20%' } } />
      <Box sx={ { pl: 3 } }>
        <Box sx={ { fontSize: '14pt', fontWeight: 700, color: '#333' } }>{ item.name }</Box>
        <Box sx={ { fontSize: '12pt', color: '#333', mt: 0.5 } }>[옵션: { formatOption(item) || '없음' }]</Box>
        <ButtonBase onClick={ onEditOption } sx={ { fontSize: '14pt', color: '#333', textDecoration: 'underline', mt: 0.5 } }>옵션변경</ButtonBase>
      </Box>
      <Box sx={ { fontSize: '14pt', fontWeight: 700 } }>{ won(item.sale_price) }</Box>
      <Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
        <IconButton aria-label="수량 줄이기" disabled={ item.quantity <= 1 } onClick={ () => onQuantity(item.quantity - 1) } sx={ roundSx }><RemoveIcon sx={ { fontSize: 15 } } /></IconButton>
        <Box aria-label="수량" sx={ { width: 32, textAlign: 'center', fontSize: '15pt', fontWeight: 300 } }>{ item.quantity }</Box>
        <IconButton aria-label="수량 늘리기" disabled={ item.quantity >= item.stock } onClick={ () => onQuantity(item.quantity + 1) } sx={ roundSx }><AddIcon sx={ { fontSize: 15 } } /></IconButton>
      </Box>
      <Box sx={ { fontSize: '14pt', fontWeight: 300 } }>{ won(item.sale_price * item.quantity) }</Box>
    </Box>
  );
}

export default CartRow;
