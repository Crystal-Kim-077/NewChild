import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import LabeledField from '../components/ui/labeled-field.jsx';
import SoftField from '../components/ui/soft-field.jsx';
import TestNotice from '../components/ui/test-notice.jsx';
import { useShop } from '../hooks/use-shop.js';
import { createOrder, listUsableCoupons, quoteOrder } from '../utils/api.js';
import { assetUrl, formatOption, PAY_METHOD_LABELS, shippingLabel, won } from '../utils/format.js';
import { getCheckoutDraft, setCheckoutDraft } from '../utils/storage.js';

const sectionTitleSx = { fontSize: 20, fontWeight: 700, mt: 5, mb: 1.5, pb: 1.5, borderBottom: '2px solid #333' };

/** 주문서 작성 페이지. 회원, 비회원 주문을 함께 처리하며 금액은 서버 계산값만 표시한다. */
function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isAuthReady, refreshCart, refreshUser } = useShop();
  const [draft] = useState(getCheckoutDraft);
  const [orderer, setOrderer] = useState({ name: '', email: '', phone: '' });
  const [receiver, setReceiver] = useState({ name: '', phone: '', address: '', message: '' });
  const [guestPassword, setGuestPassword] = useState('');
  const [payMethod, setPayMethod] = useState('card');
  const [coupons, setCoupons] = useState([]);
  const [couponId, setCouponId] = useState('');
  const [pointsText, setPointsText] = useState('');
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const points = Number(pointsText) || 0;

  useEffect(() => {
    if (!user) return;
    setOrderer({ name: user.name ?? '', email: user.email ?? '', phone: user.phone_mobile ?? '' });
    setReceiver((value) => ({ ...value, name: user.name ?? '', phone: user.phone_mobile ?? '', address: user.address ?? '' }));
    listUsableCoupons().then(setCoupons).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!draft || !isAuthReady) return undefined;
    let isActive = true;
    quoteOrder({ items: draft.items, userCouponId: couponId || null, points })
      .then((result) => {
        if (!isActive) return;
        setQuote(result);
        setError('');
      })
      .catch((requestError) => {
        if (isActive) setError(requestError.message);
      });
    return () => {
      isActive = false;
    };
  }, [draft, isAuthReady, couponId, points]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsBusy(true);
    setError('');
    try {
      const result = await createOrder({
        items: draft.items,
        cartItemIds: draft.cartItemIds,
        orderer,
        receiver,
        payMethod,
        userCouponId: couponId || null,
        points,
        guestPassword: user ? null : guestPassword,
        isTermsAgreed,
      });
      setCheckoutDraft(null);
      await Promise.all([refreshCart(), refreshUser()]);
      navigate('/order-complete', { state: { order: result } });
    } catch (requestError) {
      setError(requestError.message);
      setIsBusy(false);
    }
  };

  if (!draft) {
    return (
      <Box sx={ { py: '140px', textAlign: 'center', fontSize: 16 } }>
        주문할 상품이 없습니다.
        <Box component={ RouterLink } to="/cart" sx={ { display: 'block', mt: 2, textDecoration: 'underline' } }>장바구니로 가기</Box>
      </Box>
    );
  }

  const sumRow = (label, value) => (
    <Box sx={ { display: 'flex', justifyContent: 'space-between', mb: 1.25 } }>
      <Box>{ label }</Box>
      <Box sx={ { fontWeight: 600 } }>{ value }</Box>
    </Box>
  );

  return (
    <Box component="form" onSubmit={ handleSubmit } sx={ { width: 900, mx: 'auto', pt: '60px', pb: '120px', fontSize: 15 } }>
      <Box component="h1" sx={ { m: 0, fontSize: '26pt', fontWeight: 700, textAlign: 'center', mb: 3 } }>{ user ? '주문서 작성' : '비회원 주문' }</Box>
      <TestNotice>결제 서비스가 연동되어 있지 않아 실제 결제가 이루어지지 않으며, 모의 결제 기록만 저장됩니다.</TestNotice>

      <Box component="h2" sx={ sectionTitleSx }>주문자 정보</Box>
      <LabeledField label="주문자 이름" isRequired><SoftField value={ orderer.name } onChange={ (value) => setOrderer({ ...orderer, name: value }) } fontSize="12pt" /></LabeledField>
      <LabeledField label="이메일" isRequired={ !user }><SoftField type="email" value={ orderer.email } onChange={ (value) => setOrderer({ ...orderer, email: value }) } fontSize="12pt" /></LabeledField>
      <LabeledField label="휴대전화 번호" isRequired><SoftField value={ orderer.phone } onChange={ (value) => setOrderer({ ...orderer, phone: value }) } fontSize="12pt" /></LabeledField>

      <Box component="h2" sx={ sectionTitleSx }>배송지</Box>
      <LabeledField label="수취인명" isRequired><SoftField value={ receiver.name } onChange={ (value) => setReceiver({ ...receiver, name: value }) } fontSize="12pt" /></LabeledField>
      <LabeledField label="휴대전화" isRequired><SoftField value={ receiver.phone } onChange={ (value) => setReceiver({ ...receiver, phone: value }) } fontSize="12pt" /></LabeledField>
      <LabeledField label="주소" isRequired><SoftField value={ receiver.address } onChange={ (value) => setReceiver({ ...receiver, address: value }) } fontSize="12pt" /></LabeledField>
      <LabeledField label="배송메시지"><SoftField value={ receiver.message } onChange={ (value) => setReceiver({ ...receiver, message: value }) } fontSize="12pt" /></LabeledField>

      { !user && (
        <>
          <Box component="h2" sx={ sectionTitleSx }>비회원 주문조회 비밀번호</Box>
          <LabeledField label="비밀번호" isRequired hint="주문번호, 주문자명과 함께 배송조회에 사용합니다. 4자 이상 입력해 주세요.">
            <SoftField type="password" value={ guestPassword } onChange={ setGuestPassword } autoComplete="new-password" fontSize="12pt" />
          </LabeledField>
        </>
      ) }

      <Box component="h2" sx={ sectionTitleSx }>주문 상품</Box>
      { (quote?.lines ?? []).map((line) => (
        <Box key={ `${ line.product_id }-${ line.size }-${ line.color }` } sx={ { display: 'flex', alignItems: 'center', gap: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'secondary.main' } }>
          <Box component="img" src={ assetUrl(line.image_url) } alt="" sx={ { width: 80, height: 80, objectFit: 'cover', objectPosition: 'center 20%' } } />
          <Box sx={ { flexGrow: 1 } }>
            <Box sx={ { fontWeight: 700 } }>{ line.product_name }</Box>
            <Box sx={ { fontSize: 13, mt: 0.5 } }>[옵션: { formatOption(line) || '없음' }] · { line.quantity }개</Box>
          </Box>
          <Box sx={ { fontWeight: 700 } }>{ won(line.unit_price * line.quantity) }</Box>
        </Box>
      )) }

      { user && (
        <>
          <Box component="h2" sx={ sectionTitleSx }>쿠폰 / 적립금</Box>
          <LabeledField label="쿠폰">
            <Select
              fullWidth
              displayEmpty
              size="small"
              value={ couponId }
              onChange={ (event) => setCouponId(event.target.value) }
              inputProps={ { 'aria-label': '쿠폰 선택' } }
            >
              <MenuItem value="">사용 안 함</MenuItem>
              { coupons.map((coupon) => <MenuItem key={ coupon.user_coupon_id } value={ coupon.user_coupon_id }>{ coupon.name }</MenuItem>) }
            </Select>
          </LabeledField>
          <LabeledField label="적립금" hint={ `보유 적립금 ${ won(user.points) }` }>
            <SoftField type="number" value={ pointsText } onChange={ setPointsText } placeholder="사용할 금액" fontSize="12pt" />
          </LabeledField>
        </>
      ) }

      <Box component="h2" sx={ sectionTitleSx }>결제 수단 (모의)</Box>
      <RadioGroup row value={ payMethod } onChange={ (event) => setPayMethod(event.target.value) }>
        { Object.entries(PAY_METHOD_LABELS).map(([value, label]) => <FormControlLabel key={ value } value={ value } control={ <Radio /> } label={ label } />) }
      </RadioGroup>

      <Box component="h2" sx={ sectionTitleSx }>결제 금액</Box>
      { quote && (
        <Box>
          { sumRow('총 상품금액', won(quote.total_product_amount)) }
          { sumRow('할인 금액', `- ${ won(quote.discount_amount) }`) }
          { sumRow('적립금 사용', `- ${ won(quote.points_used) }`) }
          { sumRow('배송비', shippingLabel(quote.shipping_fee_status) ?? won(quote.shipping_fee)) }
          <Box sx={ { display: 'flex', justifyContent: 'space-between', fontSize: 22, fontWeight: 700, borderTop: '1px solid #333', pt: 2, mt: 2 } }>
            <Box>최종 금액</Box>
            <Box>{ won(quote.final_amount) }</Box>
          </Box>
          { quote.shipping_fee_status === 'undetermined' && (
            <Box sx={ { mt: 1, fontSize: 12, color: '#777' } }>30,000원 미만 주문의 배송비 정책이 아직 정해지지 않아 금액에 포함하지 않았습니다.</Box>
          ) }
        </Box>
      ) }

      <Box sx={ { mt: 3 } }>
        <FormControlLabel control={ <Checkbox checked={ isTermsAgreed } onChange={ (event) => setIsTermsAgreed(event.target.checked) } /> } label="[필수] 주문 내용 확인 및 약관에 동의합니다." />
      </Box>
      { error && <Box role="alert" sx={ { color: 'error.main', fontSize: 14, mt: 1 } }>{ error }</Box> }
      <Button type="submit" variant="contained" disableElevation fullWidth disabled={ isBusy || !quote } sx={ { height: 58, mt: 2.5, fontSize: 18, fontWeight: 700 } }>
        { quote ? `${ won(quote.final_amount) } 모의 결제하기` : '모의 결제하기' }
      </Button>
    </Box>
  );
}

export default CheckoutPage;
