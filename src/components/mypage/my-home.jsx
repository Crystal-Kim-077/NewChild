import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { useShop } from '../../hooks/use-shop.js';
import { COLORS } from '../../theme.js';
import { won } from '../../utils/format.js';

const LINKS = [
  { label: '주문내역', tab: 'orders', subs: [['주문내역', 'orders'], ['교환/반품조회', 'claims']] },
  { label: '활동정보', tab: 'activity', subs: [['관심상품', 'wish'], ['리뷰', 'reviews'], ['Q&A', 'qna']] },
  { label: '혜택정보', tab: 'benefits', subs: [['적립금', 'points'], ['쿠폰', 'coupons'], ['회원혜택 안내', 'guide']] },
  { label: '회원정보', tab: 'member', subs: [['회원정보 수정', 'profile'], ['배송 주소록 관리', 'address']] },
];
const STATUS = [
  ['결제 전', 'pending_payment'],
  ['배송준비중', 'preparing'],
  ['배송중', 'shipping'],
  ['배송 완료', 'delivered'],
];

const point = (text) => <Box component="span" sx={ { color: COLORS.primary, fontWeight: 700 } }>{ text }</Box>;
const borderSx = { borderBottom: '1px solid', borderColor: 'secondary.main' };

/**
 * MyHome 컴포넌트
 *
 * Props:
 * @param {object} user - get_me 결과 [Required]
 * @param {function} onGo - 탭 이동 시 실행(tab, sub 전달) [Required]
 *
 * Example usage:
 * <MyHome user={ user } onGo={ go } />
 */
function MyHome({ user, onGo }) {
  const navigate = useNavigate();
  const { logout } = useShop();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <Box>
      <Box sx={ { ...borderSx, px: 2, py: 4, lineHeight: 1.8 } }>
        { point(user.name) } 님 반갑습니다. 저희 쇼핑몰을 이용해 주셔서 감사합니다.<br />
        { point(user.name) } 님은 { point(`[${ user.grade_name }]`) } 회원이십니다.
        { user.next_grade_name && <> { point(`[${ user.next_grade_name }]`) } 까지 남은 구매금액은 { point(won(user.next_grade_remaining)) } 입니다.</> }
        { ` (최근 3개월 동안 구매금액 : ${ won(user.recent_3m_amount) })` }<br />
        <Box component="span" sx={ { fontSize: '13pt', color: '#777' } }>
          승급 기준에 따른 예상 금액이므로 총주문 금액과 다를 수 있습니다. 모의 결제 금액({ won(user.recent_3m_mock_amount) })은 구매금액에 포함되지 않습니다.
        </Box>
      </Box>
      <Box sx={ { ...borderSx, display: 'grid', gridTemplateColumns: '1fr 1fr', px: 2, py: 4 } }>
        <Box sx={ { display: 'flex', gap: 8 } }><Box sx={ { fontWeight: 700 } }>적립금</Box>{ point(won(user.points)) }</Box>
        <Box sx={ { display: 'flex', gap: 8 } }><Box sx={ { fontWeight: 700 } }>쿠폰</Box>{ point(`${ user.coupon_count }장`) }</Box>
      </Box>
      <Box sx={ { ...borderSx, display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 3.5, px: 2, py: 4 } }>
        { LINKS.map((group) => (
          <Box key={ group.tab } sx={ { display: 'flex', gap: 5, alignItems: 'center' } }>
            <ButtonBase onClick={ () => onGo(group.tab) } sx={ { fontSize: '13pt', fontWeight: 700, width: 90, justifyContent: 'flex-start' } }>{ group.label }</ButtonBase>
            <Box sx={ { display: 'flex', gap: 2.5 } }>
              { group.subs.map(([label, sub]) => (
                <ButtonBase key={ sub } onClick={ () => onGo(group.tab, sub) } sx={ { fontSize: '13pt', '&:hover': { color: COLORS.primary } } }>{ label }</ButtonBase>
              )) }
            </Box>
          </Box>
        )) }
      </Box>
      <Box sx={ { ...borderSx, display: 'grid', gridTemplateColumns: '1fr 1fr' } }>
        { STATUS.map(([label, key], index) => (
          <Box
            key={ key }
            sx={ {
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              px: 2,
              py: 7,
              borderRight: index % 2 === 0 ? '1px solid' : 'none',
              borderBottom: index < 2 ? '1px solid' : 'none',
              borderColor: 'secondary.main',
            } }
          >
            <Box sx={ { fontWeight: 700, width: 90 } }>{ label }</Box>
            <Box sx={ { fontSize: '13pt', color: COLORS.primary, fontWeight: 700 } }>{ user.status_counts[key] }</Box>
          </Box>
        )) }
      </Box>
      <ButtonBase onClick={ handleLogout } sx={ { mt: 2, fontSize: '13pt', fontWeight: 700, textDecoration: 'underline' } }>로그아웃</ButtonBase>
    </Box>
  );
}

export default MyHome;
