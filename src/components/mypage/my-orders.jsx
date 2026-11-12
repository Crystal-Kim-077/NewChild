import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import MySubTabs from './my-sub-tabs.jsx';
import MyTable from './my-table.jsx';
import PaginationBar from '../ui/pagination-bar.jsx';
import { usePagedList } from '../../hooks/use-paged-list.js';
import { listOrders } from '../../utils/api.js';
import { assetUrl, CLAIM_LABELS, formatDate, ORDER_STATUS_LABELS } from '../../utils/format.js';

const TABS = [{ value: 'orders', label: '주문내역' }, { value: 'claims', label: '교환/반품조회' }];
const PERIODS = [
  { label: '오늘', days: 0 },
  { label: '1주일', days: 7 },
  { label: '1개월', months: 1 },
  { label: '3개월', months: 3 },
  { label: '6개월', months: 6 },
];

const toDateText = (date) => {
  const pad = (number) => String(number).padStart(2, '0');
  return `${ date.getFullYear() }-${ pad(date.getMonth() + 1) }-${ pad(date.getDate()) }`;
};

const rangeOf = ({ days, months }) => {
  const from = new Date();
  if (months) from.setMonth(from.getMonth() - months);
  if (days) from.setDate(from.getDate() - days);
  return { from: toDateText(from), to: toDateText(new Date()) };
};

const buttonSx = { height: 36, px: 2, fontSize: '13pt', border: '1px solid', borderColor: 'secondary.main' };
const dateSx = { height: 36, px: 1, font: 'inherit', border: '1px solid #ebebeb', color: '#333' };

const COLUMNS = [
  {
    key: 'order',
    label: '주문일자(주문번호)',
    render: (row) => <>{ formatDate(row.ordered_at) }<br />({ row.order_number })</>,
  },
  {
    key: 'items',
    label: '상품명',
    render: (row) => {
      const [first, ...others] = row.items;
      return (
        <Box sx={ { display: 'inline-flex', alignItems: 'center', gap: 1 } }>
          { first.image_url && (
            <Box component="img" src={ assetUrl(first.image_url) } alt="" sx={ { width: 20, height: 20, objectFit: 'cover', flexShrink: 0 } } />
          ) }
          { others.length ? `${ first.product_name } 외 ${ others.length }건` : first.product_name }
        </Box>
      );
    },
  },
  {
    key: 'status',
    label: '주문처리 상태',
    render: (row) => `${ ORDER_STATUS_LABELS[row.order_status] }${ row.is_mock ? ' (모의)' : '' }`,
  },
  {
    key: 'claims',
    label: '취소, 교환, 반품',
    render: (row) => (row.claims.length ? row.claims.map((claim) => `${ CLAIM_LABELS[claim.claim_type] } ${ claim.claim_status }`).join(', ') : '-'),
  },
];

/**
 * MyOrders 컴포넌트
 *
 * Props:
 * @param {string} sub - 하위 탭 값 [Required]
 * @param {function} onSub - 하위 탭 변경 시 실행 [Required]
 *
 * Example usage:
 * <MyOrders sub="orders" onSub={ onSub } />
 */
function MyOrders({ sub, onSub }) {
  const current = sub === 'claims' ? 'claims' : 'orders';
  const [draft, setDraft] = useState(() => rangeOf({ months: 3 }));
  const [range, setRange] = useState(draft);

  const fetcher = useCallback((page) => listOrders({
    isClaimsOnly: current === 'claims', from: range.from, to: range.to, page,
  }), [current, range]);
  const { page, setPage, data, error } = usePagedList(fetcher);

  const handleSearch = () => {
    setPage(1);
    setRange(draft);
  };

  return (
    <Box>
      <MySubTabs tabs={ TABS } value={ current } onChange={ (value) => { setPage(1); onSub(value); } } />
      <Box sx={ { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2.5 } }>
        { PERIODS.map((period) => (
          <ButtonBase key={ period.label } sx={ buttonSx } onClick={ () => setDraft(rangeOf(period)) }>{ period.label }</ButtonBase>
        )) }
        <Box component="input" type="date" aria-label="조회 시작일" value={ draft.from } onChange={ (event) => setDraft({ ...draft, from: event.target.value }) } sx={ { ...dateSx, ml: 1 } } />
        ~
        <Box component="input" type="date" aria-label="조회 종료일" value={ draft.to } onChange={ (event) => setDraft({ ...draft, to: event.target.value }) } sx={ dateSx } />
        <ButtonBase sx={ { ...buttonSx, bgcolor: '#333', color: '#fff', px: 3 } } onClick={ handleSearch }>조회</ButtonBase>
      </Box>
      { error && <Box role="alert" sx={ { color: 'error.main', mb: 1.5 } }>{ error }</Box> }
      <MyTable columns={ COLUMNS } rows={ data.rows } getRowKey={ (row) => row.order_number } />
      <PaginationBar page={ page } total={ data.total } pageSize={ 5 } onChange={ setPage } />
    </Box>
  );
}

export default MyOrders;
