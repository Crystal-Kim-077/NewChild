export const assetUrl = (path) => `${ import.meta.env.BASE_URL }${ path }`;

export const iconUrl = (name) => assetUrl(`icon/${ name }`);

export const won = (amount) => `${ Number(amount ?? 0).toLocaleString('ko-KR') }원`;

export const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  const pad = (number) => String(number).padStart(2, '0');
  return `${ date.getFullYear() }-${ pad(date.getMonth() + 1) }-${ pad(date.getDate()) }`;
};

export const formatOption = ({ size, color }) => [size, color].filter(Boolean).join(' / ');

export const ORDER_STATUS_LABELS = {
  pending_payment: '결제 전',
  preparing: '배송준비중',
  shipping: '배송중',
  delivered: '배송완료',
};

export const PAY_METHOD_LABELS = {
  card: '신용카드',
  bank_transfer: '무통장입금',
  kakao_pay: '카카오페이',
  naver_pay: '네이버페이',
};

export const CLAIM_LABELS = { cancel: '취소', exchange: '교환', return: '반품' };

/** 화면 표시용 계산. 실제 주문 금액은 서버(quote_order, create_order)가 다시 계산한다. */
export const FREE_SHIPPING_THRESHOLD = 30000;

export const SHIPPING_FEE = 2500;

export const shippingText = ({ shipping_fee_status: status, shipping_fee: fee }) => (status === 'free' ? '무료' : won(fee));
