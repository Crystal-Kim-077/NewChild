import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { fetchGrades } from '../../utils/api.js';
import { won } from '../../utils/format.js';

const DESCRIPTIONS = { bronze: '일반 신규회원 : 구매금액 300,000원 이하' };

/** 회원 등급별 혜택 안내. */
function MyGuideView() {
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    fetchGrades().then(setGrades).catch(() => {});
  }, []);

  return (
    <Box sx={ { lineHeight: 2 } }>
      { grades.map((grade) => (
        <Box key={ grade.grade_code } sx={ { display: 'grid', gridTemplateColumns: '140px 1fr 200px', py: 1.5, borderBottom: '1px solid', borderColor: 'secondary.main' } }>
          <Box sx={ { fontWeight: 700 } }>{ grade.grade_name }</Box>
          <Box>{ DESCRIPTIONS[grade.grade_code] ?? `구매금액 ${ won(grade.min_purchase_amount) } 이상` }</Box>
          <Box>할인쿠폰 { grade.coupon_rate }%</Box>
        </Box>
      )) }
      <Box sx={ { mt: 3, fontWeight: 700 } }>공통사항</Box>
      <Box>신규회원 가입 시 3천 원 할인쿠폰 지급, 첫 구매 10% 할인쿠폰</Box>
      <Box>회원등급은 최근 3개월 결제 금액을 기준으로 산정</Box>
      <Box>쿠폰, 적립금 사용 후 결제 금액 30,000원 이상 배송비 무료, 미만 시 배송비 2,500원</Box>
      <Box>최종 결제 금액의 3% 적립</Box>
    </Box>
  );
}

export default MyGuideView;
