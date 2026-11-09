import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { COLORS } from '../../theme.js';

/**
 * TabButtons 컴포넌트
 *
 * Props:
 * @param {array} tabs - { value, label } 목록 [Required]
 * @param {any} value - 선택된 값 [Required]
 * @param {function} onChange - 선택 변경 시 실행 [Required]
 *
 * Example usage:
 * <TabButtons tabs={ tabs } value={ tab } onChange={ setTab } />
 */
function TabButtons({ tabs, value, onChange }) {
  return (
    <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 1.25 } }>
      { tabs.map((tab) => {
        const isActive = tab.value === value;
        return (
          <ButtonBase
            key={ tab.value }
            onClick={ () => onChange(tab.value) }
            sx={ {
              height: 40,
              px: '25px',
              fontSize: 14,
              border: `1px solid ${ isActive ? COLORS.primary : COLORS.muted }`,
              bgcolor: isActive ? COLORS.primary : '#fff',
              color: isActive ? COLORS.text : COLORS.muted,
              fontWeight: isActive ? 700 : 400,
              '&:hover': { bgcolor: COLORS.primary, borderColor: COLORS.primary, color: COLORS.text, fontWeight: 700 },
            } }
          >
            { tab.label }
          </ButtonBase>
        );
      }) }
    </Box>
  );
}

export default TabButtons;
