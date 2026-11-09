import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, won } from '../../utils/format.js';

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
  const saleTotal = selectedItems.reduce((sum, item) => sum + item.sale_price * item.quantity, 0);
  const isEmpty = selectedItems.length === 0;
  const shippingFee = isEmpty || saleTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  const row = (label, value) => (
    <Box sx={ { display: 'flex', justifyContent: 'space-between', mb: 1.5, fontSize: 16 } }>
      <Box>{ label }</Box>
      <Box sx={ { fontWeight: 700 } }>{ value }</Box>
    </Box>
  );

  return (
    <Box sx={ { width: 460, ml: 'auto', mt: 6, p: 3, border: '1px solid', borderColor: 'secondary.main' } }>
      { row('총 상품금액', won(saleTotal)) }
      { row('총 배송비', !isEmpty && shippingFee === 0 ? '무료' : won(shippingFee)) }
      <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid', borderColor: 'secondary.main', pt: 2.5, mt: 2.5, fontSize: 22, fontWeight: 700 } }>
        <Box>결제예정 금액</Box>
        <Box>{ won(saleTotal + shippingFee) }</Box>
      </Box>
      { !isEmpty && (
        <Box sx={ { mt: 1, fontSize: 12, color: '#777' } }>쿠폰, 적립금을 사용한 뒤 결제 금액이 30,000원 미만이면 주문서에서 배송비 2,500원이 추가됩니다.</Box>
      ) }
      <Box sx={ { display: 'grid', gridTemplateColumns: '1fr 1fr', mt: 3 } }>
        <ButtonBase onClick={ onOrderSelected } sx={ { ...orderButtonSx, color: '#333', bgcolor: '#fff', border: '1px solid #333' } }>선택상품주문</ButtonBase>
        <ButtonBase onClick={ onOrderAll } sx={ { ...orderButtonSx, color: '#fff', bgcolor: 'primary.main' } }>전체상품주문</ButtonBase>
      </Box>
    </Box>
  );
}

export default CartSummary;
