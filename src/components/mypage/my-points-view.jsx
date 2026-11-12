import Box from '@mui/material/Box';
import MyTable from './my-table.jsx';
import PaginationBar from '../ui/pagination-bar.jsx';
import { usePagedList } from '../../hooks/use-paged-list.js';
import { COLORS } from '../../theme.js';
import { listPoints } from '../../utils/api.js';
import { formatDate, won } from '../../utils/format.js';

const COLUMNS = [
  { key: 'date', label: '주문날짜', render: (row) => formatDate(row.created_at) },
  { key: 'amount', label: '적립금', render: (row) => won(row.amount) },
  { key: 'order', label: '관련주문', render: (row) => row.order_number ?? '-' },
  { key: 'description', label: '내용' },
];

/** 적립금 요약과 내역 테이블. */
function MyPointsView() {
  const { page, setPage, data, error } = usePagedList(listPoints);
  const summary = [
    ['사용가능 적립금', data.available],
    ['총 적립금', data.total_earned],
    ['사용된 적립금', data.used],
    ['미가용 적립금', data.unavailable],
    ['환불예정 적립금', data.refund_pending],
  ];

  return (
    <Box>
      <Box sx={ { display: 'flex', border: '1px solid', borderColor: 'secondary.main', mb: 3 } }>
        { summary.map(([label, amount]) => (
          <Box key={ label } sx={ { flex: 1, textAlign: 'center', py: 3 } }>
            <Box sx={ { fontWeight: 700, mb: 1 } }>{ label }</Box>
            <Box sx={ { color: COLORS.text, fontWeight: 700 } }>{ won(amount) }</Box>
          </Box>
        )) }
      </Box>
      { error && <Box role="alert" sx={ { color: 'error.main', mb: 1.5 } }>{ error }</Box> }
      <MyTable columns={ COLUMNS } rows={ data.rows } getRowKey={ (row) => row.id } />
      <PaginationBar page={ page } total={ data.total } pageSize={ 5 } onChange={ setPage } />
    </Box>
  );
}

export default MyPointsView;
