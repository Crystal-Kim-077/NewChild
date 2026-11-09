import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import ProductCard from '../components/common/product-card.jsx';
import TabButtons from '../components/ui/tab-buttons.jsx';
import { fetchCollectionProducts, fetchCollections } from '../utils/api.js';

/** COLLECTION 메뉴와 메인 Collection 더보기의 이동 페이지. */
function CollectionPage() {
  const [params, setParams] = useSearchParams();
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const activeId = Number(params.get('id')) || collections[0]?.collection_id;

  useEffect(() => {
    fetchCollections().then(setCollections).catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeId) return undefined;
    let isActive = true;
    fetchCollectionProducts(activeId).then((rows) => {
      if (isActive) setProducts(rows);
    }).catch(() => {});
    return () => {
      isActive = false;
    };
  }, [activeId]);

  return (
    <Box sx={ { px: '46px', pt: '60px', pb: '100px' } }>
      <Box component="h1" sx={ { m: 0, fontSize: '24pt', fontWeight: 700, mb: '30px' } }>Collection</Box>
      <Box sx={ { mb: 5 } }>
        <TabButtons
          tabs={ collections.map((collection) => ({ value: collection.collection_id, label: collection.name })) }
          value={ activeId }
          onChange={ (value) => setParams({ id: String(value) }) }
        />
      </Box>
      <Box sx={ { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 442px))', justifyContent: 'space-between', columnGap: '54px', rowGap: '76px' } }>
        { products.map((product) => <ProductCard key={ product.product_id } product={ product } />) }
      </Box>
    </Box>
  );
}

export default CollectionPage;
