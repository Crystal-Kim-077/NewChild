import { useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import MyActivity from '../components/mypage/my-activity.jsx';
import MyBenefits from '../components/mypage/my-benefits.jsx';
import MyHome from '../components/mypage/my-home.jsx';
import MyMember from '../components/mypage/my-member.jsx';
import MyOrders from '../components/mypage/my-orders.jsx';
import { useShop } from '../hooks/use-shop.js';

const TABS = [
  { value: 'home', label: '마이페이지' },
  { value: 'orders', label: '주문내역' },
  { value: 'activity', label: '활동정보' },
  { value: 'benefits', label: '혜택정보' },
  { value: 'member', label: '회원정보' },
];

/** 마이페이지. 분류 탭과 하위 탭은 URL 파라미터로 관리한다. */
function MyPage() {
  const { user, isAuthReady, refreshUser } = useShop();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') ?? 'home';
  const sub = params.get('sub') ?? '';

  useEffect(() => {
    if (isAuthReady) refreshUser();
  }, [isAuthReady, refreshUser, tab]);

  if (isAuthReady && !user) return <Navigate to="/login?next=%2Fmypage" replace />;
  if (!user) return <Box sx={ { py: '160px' } } />;

  const go = (nextTab, nextSub = '') => setParams(nextSub ? { tab: nextTab, sub: nextSub } : { tab: nextTab });

  return (
    <Box sx={ { width: 1200, mx: 'auto', pt: '70px', pb: '120px', fontSize: '13pt', color: '#333' } }>
      <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 3.5, borderBottom: '2px solid', borderColor: 'secondary.main' } }>
        <Box component="h1" sx={ { m: 0, fontSize: '26pt', fontWeight: 700 } }>My page</Box>
        <Box sx={ { display: 'flex', gap: 1.25 } }>
          { TABS.map((item) => {
            const isActive = item.value === tab;
            return (
              <ButtonBase
                key={ item.value }
                aria-current={ isActive ? 'page' : undefined }
                onClick={ () => go(item.value) }
                sx={ { height: 50, px: 3, borderRadius: '20px', fontSize: '15pt', fontWeight: 700, bgcolor: isActive ? '#333' : 'secondary.main', color: isActive ? '#fff' : '#333' } }
              >
                { item.label }
              </ButtonBase>
            );
          }) }
        </Box>
      </Box>
      { tab === 'home' && <MyHome user={ user } onGo={ go } /> }
      { tab === 'orders' && <MyOrders sub={ sub } onSub={ (value) => go('orders', value) } /> }
      { tab === 'activity' && <MyActivity sub={ sub } onSub={ (value) => go('activity', value) } /> }
      { tab === 'benefits' && <MyBenefits sub={ sub } onSub={ (value) => go('benefits', value) } /> }
      { tab === 'member' && <MyMember sub={ sub } onSub={ (value) => go('member', value) } /> }
    </Box>
  );
}

export default MyPage;
