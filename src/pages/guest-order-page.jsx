import { Navigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import TestNotice from '../components/ui/test-notice.jsx';
import { assetUrl, formatDate, formatOption, ORDER_STATUS_LABELS, PAY_METHOD_LABELS, shippingText, won } from '../utils/format.js';

const rowSx = { display: 'grid', gridTemplateColumns: '160px 1fr', py: 1.25, borderBottom: '1px solid', borderColor: 'secondary.main' };

/** 비회원 배송조회 결과 페이지. 서버 검증을 통과한 주문만 라우터 상태로 전달받는다. */
function GuestOrderPage() {
  const { state } = useLocation();
  const order = state?.order;

  if (!order) return <Navigate to="/login" replace />;

  const info = [
    ['주문번호', order.order_number],
    ['주문일자', formatDate(order.ordered_at)],
    ['주문 상태', ORDER_STATUS_LABELS[order.order_status]],
    ['수령인', order.receiver_name],
    ['연락처', order.receiver_phone],
    ['주소', order.receiver_address],
    ['배송메시지', order.delivery_message ?? '-'],
    ['결제 수단', `${ PAY_METHOD_LABELS[order.payment.pay_method] } (모의)`],
    ['배송비', shippingText(order.payment)],
    ['최종 금액', won(order.payment.final_amount)],
  ];

  return (
    <Box sx={ { width: 900, mx: 'auto', pt: '60px', pb: '120px', fontSize: 15 } }>
      <Box component="h1" sx={ { m: 0, fontSize: '26pt', fontWeight: 700, textAlign: 'center', mb: 3 } }>비회원 배송조회</Box>
      <TestNotice>모의 결제로 생성된 테스트 주문입니다.</TestNotice>
      <Box sx={ { mt: 3 } }>
        { info.map(([label, value]) => (
          <Box key={ label } sx={ rowSx }><Box sx={ { fontWeight: 600 } }>{ label }</Box><Box>{ value }</Box></Box>
        )) }
      </Box>
      <Box component="h2" sx={ { fontSize: 20, mt: 5, mb: 1 } }>주문 상품</Box>
      { order.items.map((item) => (
        <Box key={ `${ item.product_name }-${ item.size }-${ item.color }` } sx={ { display: 'flex', alignItems: 'center', gap: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'secondary.main' } }>
          <Box component="img" src={ assetUrl(item.image_url) } alt="" sx={ { width: 80, height: 80, objectFit: 'cover', objectPosition: 'center 20%' } } />
          <Box sx={ { flexGrow: 1 } }>
            <Box sx={ { fontWeight: 700 } }>{ item.product_name }</Box>
            <Box sx={ { fontSize: 13, mt: 0.5 } }>[옵션: { formatOption(item) || '없음' }] · { item.quantity }개</Box>
          </Box>
          <Box sx={ { fontWeight: 700 } }>{ won(item.unit_price * item.quantity) }</Box>
        </Box>
      )) }
    </Box>
  );
}

export default GuestOrderPage;
