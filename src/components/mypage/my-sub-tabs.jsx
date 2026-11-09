import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';

/**
 * MySubTabs 컴포넌트 (마이페이지 하위 탭)
 *
 * Props:
 * @param {array} tabs - { value, label } 목록 [Required]
 * @param {string} value - 선택된 값 [Required]
 * @param {function} onChange - 선택 변경 시 실행 [Required]
 *
 * Example usage:
 * <MySubTabs tabs={ tabs } value="wish" onChange={ onSub } />
 */
function MySubTabs({ tabs, value, onChange }) {
  return (
    <Box sx={ { display: 'flex', borderBottom: '1px solid', borderColor: 'secondary.main', my: 3.5 } }>
      { tabs.map((tab) => {
        const isActive = tab.value === value;
        return (
          <ButtonBase
            key={ tab.value }
            aria-current={ isActive ? 'true' : undefined }
            onClick={ () => onChange(tab.value) }
            sx={ { px: 3, py: 1.5, fontSize: '13pt', fontWeight: isActive ? 700 : 400, borderBottom: '2px solid', borderColor: isActive ? '#333' : 'transparent', mb: '-1px' } }
          >
            { tab.label }
          </ButtonBase>
        );
      }) }
    </Box>
  );
}

export default MySubTabs;
