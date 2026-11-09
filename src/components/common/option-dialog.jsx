import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import { useShop } from '../../hooks/use-shop.js';
import { addToCart } from '../../utils/api.js';
import { assetUrl, won } from '../../utils/format.js';

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
 * OptionDialog 컴포넌트
 *
 * Props:
 * @param {object} product - 옵션을 선택할 상품 [Required]
 * @param {function} onClose - 창을 닫을 때 실행 [Required]
 *
 * Example usage:
 * <OptionDialog product={ product } onClose={ handleClose } />
 */
function OptionDialog({ product, onClose }) {
  const { refreshCart, showToast, startCheckout } = useShop();
  const [size, setSize] = useState(product.sizes?.length === 1 ? product.sizes[0] : '');
  const [color, setColor] = useState(product.colors?.length === 1 ? product.colors[0] : '');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const validate = () => {
    if (product.sizes?.length && !size) return '사이즈를 선택해 주세요.';
    if (product.colors?.length && !color) return '색상을 선택해 주세요.';
    return '';
  };

  const handleCart = async () => {
    const message = validate();
    setError(message);
    if (message) return;
    setIsBusy(true);
    try {
      await addToCart({ productId: product.product_id, size, color, quantity });
      await refreshCart();
      showToast('장바구니에 담았습니다.');
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleBuy = () => {
    const message = validate();
    setError(message);
    if (message) return;
    onClose();
    startCheckout({ items: [{ product_id: product.product_id, size, color, quantity }] }, '/checkout');
  };

  const optionRow = (label, values, selected, onSelect) => (
    <Box sx={ { mb: 2 } }>
      <Box sx={ { fontSize: 14, fontWeight: 700, mb: 1 } }>{ label }</Box>
      <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 1 } }>
        { values.map((value) => (
          <ButtonBase key={ value } sx={ chipSx(selected === value) } onClick={ () => onSelect(value) }>{ value }</ButtonBase>
        )) }
      </Box>
    </Box>
  );

  return (
    <Dialog open onClose={ onClose } slotProps={ { paper: { sx: { width: 480, maxWidth: 480, p: 3 } } } }>
      <IconButton aria-label="닫기" onClick={ onClose } sx={ { position: 'absolute', right: 12, top: 12 } }><CloseIcon /></IconButton>
      <Box sx={ { fontSize: 18, fontWeight: 700, mb: 2 } }>옵션 선택</Box>
      <Box sx={ { display: 'flex', gap: 2, mb: 2.5 } }>
        <Box component="img" src={ assetUrl(product.main_image_url) } alt={ product.name } sx={ { width: 96, height: 96, objectFit: 'cover', objectPosition: 'center 20%' } } />
        <Box>
          <Box sx={ { fontSize: 15, fontWeight: 700, mb: 1 } }>{ product.name }</Box>
          <Box sx={ { fontSize: 15 } }>{ won(product.sale_price) }</Box>
        </Box>
      </Box>
      { product.sizes?.length > 0 && optionRow('사이즈', product.sizes, size, setSize) }
      { product.colors?.length > 0 && optionRow('색상', product.colors, color, setColor) }
      <Box sx={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 } }>
        <Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
          <IconButton aria-label="수량 줄이기" size="small" disabled={ quantity <= 1 } onClick={ () => setQuantity(quantity - 1) } sx={ { border: '1px solid', borderColor: 'secondary.main' } }><RemoveIcon fontSize="small" /></IconButton>
          <Box sx={ { width: 32, textAlign: 'center', fontSize: 15 } }>{ quantity }</Box>
          <IconButton aria-label="수량 늘리기" size="small" disabled={ quantity >= product.stock } onClick={ () => setQuantity(quantity + 1) } sx={ { border: '1px solid', borderColor: 'secondary.main' } }><AddIcon fontSize="small" /></IconButton>
        </Box>
        <Box sx={ { fontSize: 18, fontWeight: 700 } }>{ won(product.sale_price * quantity) }</Box>
      </Box>
      { error && <Box role="alert" sx={ { color: 'error.main', fontSize: 13, mb: 1.5 } }>{ error }</Box> }
      <Box sx={ { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 } }>
        <Button variant="outlined" color="inherit" disabled={ isBusy } onClick={ handleCart } sx={ { height: 50, fontWeight: 700, borderColor: '#333' } }>장바구니</Button>
        <Button variant="contained" disableElevation disabled={ isBusy } onClick={ handleBuy } sx={ { height: 50, fontWeight: 700 } }>바로 구매하기</Button>
      </Box>
    </Dialog>
  );
}

export default OptionDialog;
