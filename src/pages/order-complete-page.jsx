import { Link as RouterLink, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TestNotice from '../components/ui/test-notice.jsx';
import { ORDER_STATUS_LABELS, won } from '../utils/format.js';

/** 주문 완료 페이지. 비회원은 주문번호를 배송조회에 사용해야 하므로 눈에 띄게 안내한다. */
function OrderCompletePage() {
  const { state } = useLocation();
  const order = state?.order;

  if (!order) {
    return <Box sx={ { py: '140px', textAlign: 'center', fontSize: 16 } }>주문 정보가 없습니다.</Box>;
  }

  return (
    <Box sx={ { py: '110px', display: 'flex', justifyContent: 'center' } }>
      <Box sx={ { width: 560, textAlign: 'center' } }>
        <Box component="h1" sx={ { m: 0, fontSize: '26pt', fontWeight: 700, mb: 3 } }>주문이 접수되었습니다</Box>
        <Box sx={ { fontSize: 16, lineHeight: 2, mb: 3 } }>
          <Box>주문번호 <Box component="strong">{ order.order_number }</Box></Box>
          <Box>주문 상태 { ORDER_STATUS_LABELS[order.order_status] }</Box>
          <Box>최종 금액 { won(order.final_amount) }</Box>
        </Box>
        { order.is_guest && <Box sx={ { fontSize: 14, mb: 2, fontWeight: 600 } }>비회원 배송조회에 주문번호가 필요합니다. 꼭 메모해 주세요.</Box> }
        <Box sx={ { mb: 4 } }><TestNotice>모의 결제입니다. 실제 결제나 배송은 이루어지지 않습니다.</TestNotice></Box>
        <Box sx={ { display: 'flex', justifyContent: 'center', gap: 1 } }>
          <Button component={ RouterLink } to="/" variant="outlined" color="inherit" sx={ { px: 4, height: 50, borderColor: '#333' } }>메인으로</Button>
          { !order.is_guest && <Button component={ RouterLink } to="/mypage?tab=orders" variant="contained" disableElevation sx={ { px: 4, height: 50, fontWeight: 700 } }>주문내역 보기</Button> }
        </Box>
      </Box>
    </Box>
  );
}

export default OrderCompletePage;
