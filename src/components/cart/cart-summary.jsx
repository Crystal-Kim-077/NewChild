import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { FREE_SHIPPING_THRESHOLD, won } from '../../utils/format.js';

const orderButtonSx = { height: 56, fontSize: '16pt', fontWeight: 700 };

/**
 * CartSummary 컴포넌트
 *
 * Props:
 * @param {array} selectedItems - 선택된 장바구니 항목 [Required]
 * @param {function} onOrderSelected - 선택상품주문 클릭 시 실행 [Required]
 * @param {function} onOrderAll - 전체상품주문 클릭 시 실행 [Required]
 *
 * Example usage:
 * <CartSummary selectedItems={ items } onOrderSelected={ a } onOrderAll={ b } />
 */
function CartSummary({ selectedItems, onOrderSelected, onOrderAll }) {
  const listTotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const saleTotal = selectedItems.reduce((sum, item) => sum + item.sale_price * item.quantity, 0);
  const isFreeShipping = Math.min(listTotal, saleTotal) >= FREE_SHIPPING_THRESHOLD;
  const isEmpty = selectedItems.length === 0;

  const row = (label, value) => (
    <Box sx={ { display: 'flex', justifyContent: 'space-between', mb: 1.5, fontSize: 16 } }>
      <Box>{ label }</Box>
      <Box sx={ { fontWeight: 700 } }>{ value }</Box>
    </Box>
  );

  let shippingText = '미정';
  if (isEmpty) shippingText = won(0);
  else if (isFreeShipping) shippingText = '무료';

  return (
    <Box sx={ { width: 460, ml: 'auto', mt: 6, p: 3, border: '1px solid', borderColor: 'secondary.main' } }>
      { row('총 상품금액', won(saleTotal)) }
      { row('총 배송비', shippingText) }
      <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid', borderColor: 'secondary.main', pt: 2.5, mt: 2.5, fontSize: 22, fontWeight: 700 } }>
        <Box>결제예정 금액</Box>
        <Box>{ won(saleTotal) }</Box>
      </Box>
      { !isEmpty && !isFreeShipping && (
        <Box sx={ { mt: 1, fontSize: 12, color: '#777' } }>30,000원 미만 주문의 배송비 정책이 아직 정해지지 않아 결제예정 금액에 포함하지 않았습니다.</Box>
      ) }
      <Box sx={ { display: 'grid', gridTemplateColumns: '1fr 1fr', mt: 3 } }>
        <ButtonBase onClick={ onOrderSelected } sx={ { ...orderButtonSx, color: '#333', bgcolor: '#fff', border: '1px solid #333' } }>선택상품주문</ButtonBase>
        <ButtonBase onClick={ onOrderAll } sx={ { ...orderButtonSx, color: '#fff', bgcolor: 'primary.main' } }>전체상품주문</ButtonBase>
      </Box>
    </Box>
  );
}

export default CartSummary;
