import Box from '@mui/material/Box';
import MyTable from './my-table.jsx';
import PaginationBar from '../ui/pagination-bar.jsx';
import { usePagedList } from '../../hooks/use-paged-list.js';
import { COLORS } from '../../theme.js';
import { listCoupons } from '../../utils/api.js';
import { formatDate, PAY_METHOD_LABELS, won } from '../../utils/format.js';

const COLUMNS = [
  { key: 'user_coupon_id', label: '번호' },
  { key: 'name', label: '쿠폰명' },
  { key: 'applicable_products', label: '쿠폰적용상품' },
  { key: 'min', label: '구매금액', render: (row) => (row.min_purchase_amount ? `${ won(row.min_purchase_amount) } 이상` : '제한 없음') },
  { key: 'pay', label: '결제수단', render: (row) => PAY_METHOD_LABELS[row.allowed_pay_method] ?? '제한 없음' },
  { key: 'benefit', label: '쿠폰혜택', render: (row) => (row.discount_type === 'fixed' ? won(row.discount_value) : `${ row.discount_value }%`) },
  { key: 'period', label: '사용가능 기간', render: (row) => (row.expires_at ? `~ ${ formatDate(row.expires_at) }` : '기간 미정') },
];

/** 사용가능 쿠폰 수와 쿠폰 목록 테이블. */
function MyCouponsView() {
  const { page, setPage, data, error } = usePagedList(listCoupons);

  return (
    <Box>
      <Box sx={ { mb: 2.5, fontWeight: 700 } }>
        사용가능 쿠폰 <Box component="span" sx={ { color: COLORS.text } }>{ data.available_count ?? 0 }장</Box>
      </Box>
      { error && <Box role="alert" sx={ { color: 'error.main', mb: 1.5 } }>{ error }</Box> }
      <MyTable columns={ COLUMNS } rows={ data.rows } getRowKey={ (row) => row.user_coupon_id } />
      <PaginationBar page={ page } total={ data.total } pageSize={ 5 } onChange={ setPage } />
    </Box>
  );
}

export default MyCouponsView;
