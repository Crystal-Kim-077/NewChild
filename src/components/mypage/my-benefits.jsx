import Box from '@mui/material/Box';
import MyCouponsView from './my-coupons-view.jsx';
import MyGuideView from './my-guide-view.jsx';
import MyPointsView from './my-points-view.jsx';
import MySubTabs from './my-sub-tabs.jsx';

const TABS = [{ value: 'points', label: '적립금' }, { value: 'coupons', label: '쿠폰' }, { value: 'guide', label: '회원혜택 안내' }];

/**
 * MyBenefits 컴포넌트
 *
 * Props:
 * @param {string} sub - 하위 탭 값 [Required]
 * @param {function} onSub - 하위 탭 변경 시 실행 [Required]
 *
 * Example usage:
 * <MyBenefits sub="points" onSub={ onSub } />
 */
function MyBenefits({ sub, onSub }) {
  const current = TABS.some((tab) => tab.value === sub) ? sub : 'points';
  return (
    <Box>
      <MySubTabs tabs={ TABS } value={ current } onChange={ onSub } />
      { current === 'points' && <MyPointsView /> }
      { current === 'coupons' && <MyCouponsView /> }
      { current === 'guide' && <MyGuideView /> }
    </Box>
  );
}

export default MyBenefits;
