import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';

const SORTS = [
  { value: 'new', label: '신상품' },
  { value: 'low', label: '낮은가격' },
  { value: 'high', label: '높은가격' },
  { value: 'popular', label: '인기상품' },
  { value: 'rating', label: '평점순' },
];

/**
 * CategoryToolbar 컴포넌트
 *
 * Props:
 * @param {object} menu - GNB 메뉴 데이터 [Required]
 * @param {string} sub - 선택된 하위 카테고리 slug [Required]
 * @param {string} sort - 선택된 정렬 값 [Required]
 * @param {number} total - 상품 개수 [Required]
 * @param {function} onSub - 하위 카테고리 변경 시 실행 [Required]
 * @param {function} onSort - 정렬 변경 시 실행 [Required]
 * @param {function} onOpenFilter - 필터 버튼 클릭 시 실행 [Required]
 *
 * Example usage:
 * <CategoryToolbar menu={ menu } sub="" sort="new" total={ 9 } onSub={ a } onSort={ b } onOpenFilter={ c } />
 */
function CategoryToolbar({ menu, sub, sort, total, onSub, onSort, onOpenFilter }) {
  return (
    <Box sx={ { mb: '40px' } }>
      <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #333', pb: 1.25 } }>
        <Box sx={ { fontSize: '15pt', fontWeight: 700 } }>{ menu?.label }</Box>
        <Box sx={ { display: 'flex', gap: '20px' } }>
          { SORTS.map((item) => (
            <ButtonBase
              key={ item.value }
              aria-pressed={ sort === item.value }
              onClick={ () => onSort(item.value) }
              sx={ { fontSize: '14pt', fontWeight: sort === item.value ? 700 : 300 } }
            >
              { item.label }
            </ButtonBase>
          )) }
        </Box>
      </Box>
      { menu?.subs.length > 0 && (
        <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 2.5, mt: 1.75 } }>
          { menu.subs.map((item) => {
            const isActive = (item.slug ?? '') === sub;
            return (
              <ButtonBase
                key={ item.label }
                aria-pressed={ isActive }
                onClick={ () => onSub(item.slug ?? '') }
                sx={ { fontSize: '14pt', fontWeight: isActive ? 700 : 400, color: isActive ? '#333' : '#8a8a8a', '&:hover': { color: 'primary.main' } } }
              >
                { item.label }
              </ButtonBase>
            );
          }) }
        </Box>
      ) }
      <Box sx={ { display: 'flex', alignItems: 'center', gap: 2, mt: 3 } }>
        <ButtonBase onClick={ onOpenFilter } sx={ { width: 82, height: 30, bgcolor: 'primary.main', color: '#333', fontSize: 14, fontWeight: 600 } }>필터</ButtonBase>
        <Box sx={ { fontSize: '16pt' } }>{ total.toLocaleString('ko-KR') }개의 상품</Box>
      </Box>
    </Box>
  );
}

export default CategoryToolbar;
