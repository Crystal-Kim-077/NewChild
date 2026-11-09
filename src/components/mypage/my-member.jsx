import Box from '@mui/material/Box';
import MyAddressBook from './my-address-book.jsx';
import MyProfileForm from './my-profile-form.jsx';
import MySubTabs from './my-sub-tabs.jsx';

const TABS = [{ value: 'profile', label: '회원정보 수정' }, { value: 'address', label: '배송 주소록 관리' }];

/**
 * MyMember 컴포넌트
 *
 * Props:
 * @param {string} sub - 하위 탭 값 [Required]
 * @param {function} onSub - 하위 탭 변경 시 실행 [Required]
 *
 * Example usage:
 * <MyMember sub="profile" onSub={ onSub } />
 */
function MyMember({ sub, onSub }) {
  const current = sub === 'address' ? 'address' : 'profile';
  return (
    <Box>
      <MySubTabs tabs={ TABS } value={ current } onChange={ onSub } />
      { current === 'profile' ? <MyProfileForm /> : <MyAddressBook /> }
    </Box>
  );
}

export default MyMember;
