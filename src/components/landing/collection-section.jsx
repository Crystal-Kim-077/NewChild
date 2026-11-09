import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import ProductCard from '../common/product-card.jsx';
import TabButtons from '../ui/tab-buttons.jsx';
import { fetchCollectionProducts, fetchCollections } from '../../utils/api.js';
import { assetUrl } from '../../utils/format.js';

/** 메인 Collection. 좌측 연출컷 + 분류별 상품 6개(한 줄 3개). */
function CollectionSection() {
  const [collections, setCollections] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let isActive = true;
    fetchCollections().then((rows) => {
      if (!isActive) return;
      setCollections(rows);
      setActiveId(rows[0]?.collection_id ?? null);
    }).catch(() => {});
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!activeId) return undefined;
    let isActive = true;
    fetchCollectionProducts(activeId, 6).then((rows) => {
      if (isActive) setProducts(rows);
    }).catch(() => {});
    return () => {
      isActive = false;
    };
  }, [activeId]);

  const active = collections.find((collection) => collection.collection_id === activeId);

  return (
    <Box component="section" sx={ { px: '46px', pb: '130px' } }>
      <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '30px' } }>
        <Box component="h2" sx={ { m: 0, fontSize: 32, fontWeight: 700 } }>Collection</Box>
        <Box component={ RouterLink } to="/collection" sx={ { fontSize: 15, '&:hover': { color: 'primary.main' } } }>더보기</Box>
      </Box>
      <Box sx={ { display: 'flex', gap: '43px', alignItems: 'flex-start' } }>
        <Box sx={ { flex: '0 0 716px', height: 947, bgcolor: '#f4f4f4' } }>
          { active && <Box component="img" src={ assetUrl(active.image_url) } alt={ active.name } sx={ { width: '100%', height: '100%', objectFit: 'cover' } } /> }
        </Box>
        <Box sx={ { flexGrow: 1, minWidth: 0 } }>
          <Box sx={ { mb: 3 } }>
            <TabButtons
              tabs={ collections.map((collection) => ({ value: collection.collection_id, label: collection.name })) }
              value={ activeId }
              onChange={ setActiveId }
            />
          </Box>
          <Box sx={ { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', columnGap: '43px', rowGap: '30px' } }>
            { products.map((product) => <ProductCard key={ product.product_id } product={ product } />) }
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default CollectionSection;
