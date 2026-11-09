import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import { COLORS } from '../../theme.js';
import { iconUrl } from '../../utils/format.js';

/**
 * PaginationBar 컴포넌트
 *
 * Props:
 * @param {number} page - 현재 페이지 [Required]
 * @param {number} total - 전체 아이템 수 [Required]
 * @param {number} pageSize - 페이지당 아이템 수 [Required]
 * @param {function} onChange - 페이지 변경 시 실행 [Required]
 *
 * Example usage:
 * <PaginationBar page={ 1 } total={ 12 } pageSize={ 5 } onChange={ setPage } />
 */
function PaginationBar({ page, total, pageSize, onChange }) {
  const lastPage = Math.ceil(total / pageSize);
  if (lastPage <= 1) return null;

  const pages = Array.from({ length: lastPage }, (_, index) => index + 1);

  return (
    <Box component="nav" aria-label="페이지 이동" sx={ { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 4 } }>
      <IconButton aria-label="이전 페이지" disabled={ page <= 1 } onClick={ () => onChange(page - 1) } sx={ { opacity: page <= 1 ? 0.3 : 1 } }>
        <Box component="img" src={ iconUrl('angle-left.svg') } alt="" sx={ { width: 14, height: 14 } } />
      </IconButton>
      { pages.map((number) => (
        <ButtonBase
          key={ number }
          aria-current={ number === page ? 'page' : undefined }
          onClick={ () => onChange(number) }
          sx={ { width: 32, height: 32, fontSize: 14, fontWeight: number === page ? 700 : 400, bgcolor: number === page ? COLORS.primary : 'transparent' } }
        >
          { number }
        </ButtonBase>
      )) }
      <IconButton aria-label="다음 페이지" disabled={ page >= lastPage } onClick={ () => onChange(page + 1) } sx={ { opacity: page >= lastPage ? 0.3 : 1 } }>
        <Box component="img" src={ iconUrl('angle-right.svg') } alt="" sx={ { width: 14, height: 14 } } />
      </IconButton>
    </Box>
  );
}

export default PaginationBar;
