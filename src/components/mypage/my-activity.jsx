import { useCallback } from 'react';
import Box from '@mui/material/Box';
import MySubTabs from './my-sub-tabs.jsx';
import MyTable from './my-table.jsx';
import PaginationBar from '../ui/pagination-bar.jsx';
import { usePagedList } from '../../hooks/use-paged-list.js';
import { listQna, listReviews, listWishlist } from '../../utils/api.js';
import { assetUrl, formatDate, won } from '../../utils/format.js';

const TABS = [{ value: 'wish', label: '관심상품' }, { value: 'reviews', label: '리뷰' }, { value: 'qna', label: 'Q&A' }];

const VIEWS = {
  wish: {
    fetcher: listWishlist,
    rowKey: (row) => row.product_id,
    columns: [
      { key: 'image', label: '상품 사진', render: (row) => <Box component="img" src={ assetUrl(row.main_image_url) } alt="" sx={ { width: 70, height: 70, objectFit: 'cover', objectPosition: 'center 20%', mx: 'auto' } } /> },
      { key: 'name', label: '상품명' },
      { key: 'price', label: '가격', render: (row) => won(row.sale_price) },
      { key: 'date', label: '담은 날짜', render: (row) => formatDate(row.created_at) },
    ],
  },
  reviews: {
    fetcher: listReviews,
    rowKey: (row) => row.review_id,
    columns: [
      { key: 'name', label: '상품명' },
      { key: 'rating', label: '평점', render: (row) => `${ row.rating }점` },
      { key: 'content', label: '내용' },
      { key: 'date', label: '작성일', render: (row) => formatDate(row.created_at) },
    ],
  },
  qna: {
    fetcher: listQna,
    rowKey: (row) => row.qna_id,
    columns: [
      { key: 'name', label: '상품명', render: (row) => row.name ?? '-' },
      { key: 'title', label: '제목' },
      { key: 'qna_status', label: '상태' },
      { key: 'date', label: '작성일', render: (row) => formatDate(row.created_at) },
    ],
  },
};

/**
 * MyActivity 컴포넌트
 *
 * Props:
 * @param {string} sub - 하위 탭 값 [Required]
 * @param {function} onSub - 하위 탭 변경 시 실행 [Required]
 *
 * Example usage:
 * <MyActivity sub="wish" onSub={ onSub } />
 */
function MyActivity({ sub, onSub }) {
  const current = VIEWS[sub] ? sub : 'wish';
  const view = VIEWS[current];
  const fetcher = useCallback((page) => view.fetcher(page), [view]);
  const { page, setPage, data, error } = usePagedList(fetcher);

  return (
    <Box>
      <MySubTabs tabs={ TABS } value={ current } onChange={ (value) => { setPage(1); onSub(value); } } />
      { error && <Box role="alert" sx={ { color: 'error.main', mb: 1.5 } }>{ error }</Box> }
      <MyTable columns={ view.columns } rows={ data.rows } getRowKey={ view.rowKey } />
      <PaginationBar page={ page } total={ data.total } pageSize={ 5 } onChange={ setPage } />
    </Box>
  );
}

export default MyActivity;
