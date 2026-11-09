import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import CategoryBest from '../components/category/category-best.jsx';
import CategoryToolbar from '../components/category/category-toolbar.jsx';
import FilterDrawer from '../components/category/filter-drawer.jsx';
import ProductCard from '../components/common/product-card.jsx';
import PaginationBar from '../components/ui/pagination-bar.jsx';
import { CATEGORY_PAGE_SIZE, fetchBestIds, fetchProducts } from '../utils/api.js';
import { EMPTY_FILTER } from '../utils/filter-data.js';
import { GNB_MENUS } from '../utils/menu-data.js';

/** 상품 카테고리 페이지. NEW, BEST, 상위/하위 카테고리 목록을 함께 처리한다. */
function CategoryPage() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const [savedFilter, setSavedFilter] = useState({ slug, filter: EMPTY_FILTER });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [result, setResult] = useState({ rows: [], total: 0, isLoaded: false, error: '' });

  const sub = params.get('sub') ?? '';
  const sort = params.get('sort') ?? 'new';
  const page = Number(params.get('page') ?? 1);
  const menu = GNB_MENUS.find((item) => item.slug === slug || item.to === `/category/${ slug }`);
  const isMainCategory = Boolean(menu?.slug);
  /** 필터는 저장된 카테고리에서만 유효하다. 메뉴를 옮기면 자동으로 초기화된다. */
  const filter = savedFilter.slug === slug ? savedFilter.filter : EMPTY_FILTER;

  useEffect(() => {
    let isActive = true;
    (async () => {
      try {
        const query = {
          sort,
          page,
          keywords: filter.keywords,
          sizes: filter.sizes,
          minPrice: filter.price[0],
          maxPrice: filter.price[1],
        };
        if (slug === 'best') query.productIds = await fetchBestIds();
        else if (isMainCategory && sub) query.categorySlug = sub;
        else if (isMainCategory) query.parentSlug = slug;
        const data = await fetchProducts(query);
        if (isActive) setResult({ ...data, isLoaded: true, error: '' });
      } catch (error) {
        if (isActive) setResult({ rows: [], total: 0, isLoaded: true, error: error.message });
      }
    })();
    return () => {
      isActive = false;
    };
  }, [slug, sub, sort, page, filter, isMainCategory]);

  const update = (changes) => {
    const nextParams = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) nextParams.set(key, value);
      else nextParams.delete(key);
    });
    setParams(nextParams);
  };

  const handlePage = (nextPage) => {
    update({ page: nextPage > 1 ? String(nextPage) : '' });
    window.scrollTo(0, 0);
  };

  const handleSearch = (nextFilter) => {
    setSavedFilter({ slug, filter: nextFilter });
    update({ page: '' });
    setIsFilterOpen(false);
  };

  return (
    <Box>
      { isMainCategory && <CategoryBest key={ slug } parentSlug={ slug } title={ menu.label } /> }
      <Box sx={ { px: '46px', pt: '60px', pb: '100px' } }>
        <CategoryToolbar
          menu={ menu }
          sub={ sub }
          sort={ sort }
          total={ result.total }
          onSub={ (value) => update({ sub: value, page: '' }) }
          onSort={ (value) => update({ sort: value === 'new' ? '' : value, page: '' }) }
          onOpenFilter={ () => setIsFilterOpen(true) }
        />
        { result.error && <Box role="alert" sx={ { color: 'error.main', py: 4 } }>{ result.error }</Box> }
        { result.isLoaded && !result.error && result.rows.length === 0 && (
          <Box sx={ { py: 12, textAlign: 'center', color: '#777', fontSize: 16 } }>조건에 맞는 상품이 없습니다.</Box>
        ) }
        <Box sx={ { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 442px))', justifyContent: 'space-between', columnGap: '54px', rowGap: '76px' } }>
          { result.rows.map((product) => <ProductCard key={ product.product_id } product={ product } />) }
        </Box>
        <PaginationBar page={ page } total={ result.total } pageSize={ CATEGORY_PAGE_SIZE } onChange={ handlePage } />
      </Box>
      <FilterDrawer key={ slug } isOpen={ isFilterOpen } filter={ filter } onClose={ () => setIsFilterOpen(false) } onSearch={ handleSearch } />
    </Box>
  );
}

export default CategoryPage;
