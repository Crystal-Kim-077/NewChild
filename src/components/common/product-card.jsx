import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useShop } from '../../hooks/use-shop.js';
import { COLORS } from '../../theme.js';
import { addToCart } from '../../utils/api.js';
import { addRecentProduct } from '../../utils/storage.js';
import { assetUrl, iconUrl, won } from '../../utils/format.js';

const imageSx = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center 20%',
  transition: 'transform .35s, opacity .35s',
};

/**
 * ProductCard 컴포넌트
 *
 * Props:
 * @param {object} product - product_cards 뷰의 상품 데이터 [Required]
 * @param {number} size - 상품 사진 한 변의 길이(px). 없으면 부모 너비에 맞춘다 [Optional]
 * @param {boolean} isZoomOnHover - hover 시 흰 배경, 확대, 아이콘 표시(카테고리 BEST) [Optional, 기본값: false]
 * @param {boolean} isDirectCart - 장바구니 아이콘 클릭 시 옵션 팝업 없이 담고 장바구니로 이동 [Optional, 기본값: false]
 *
 * Example usage:
 * <ProductCard product={ product } size={ 358 } />
 */
function ProductCard({ product, size, isZoomOnHover = false, isDirectCart = false }) {
  const navigate = useNavigate();
  const { wishIds, toggleWish, openOptions, refreshCart, showToast } = useShop();
  const [isBusy, setIsBusy] = useState(false);
  const images = product.image_urls?.length ? product.image_urls : [product.main_image_url];
  /** hover 시 두 번째 사진으로 전환한다. 사진이 한 장이면 전환하지 않는다. */
  const hoverImage = !isZoomOnHover && images.length > 1 ? images[1] : null;
  const isWished = wishIds.includes(product.product_id);
  const isSoldOut = product.status === 'sold_out' || product.stock <= 0;

  /** 첫 번째 옵션으로 바로 담는다. 옵션은 장바구니의 옵션 변경에서 바꿀 수 있다. */
  const handleDirectCart = async () => {
    setIsBusy(true);
    try {
      addRecentProduct(product);
      await addToCart({ productId: product.product_id, size: product.sizes?.[0] ?? '', color: product.colors?.[0] ?? '', quantity: 1 });
      await refreshCart();
      navigate('/cart');
    } catch (error) {
      showToast(error.message);
      setIsBusy(false);
    }
  };

  const iconButtons = (iconSize) => (
    <>
      <IconButton aria-label={ isWished ? '관심상품 해제' : '관심상품 추가' } onClick={ () => toggleWish(product.product_id) } sx={ { p: 0.5 } }>
        { isWished
          ? <FavoriteIcon sx={ { fontSize: iconSize, color: COLORS.accent } } />
          : <Box component="img" src={ iconUrl('icon_wish.svg') } alt="" sx={ { width: iconSize, height: iconSize, opacity: 0.8 } } /> }
      </IconButton>
      <IconButton aria-label="장바구니 담기" disabled={ isSoldOut || isBusy } onClick={ isDirectCart ? handleDirectCart : () => openOptions(product) } sx={ { p: 0.5 } }>
        <Box component="img" src={ iconUrl('icon_cart.png') } alt="" sx={ { width: iconSize, height: iconSize, filter: 'brightness(0.2)' } } />
      </IconButton>
    </>
  );

  return (
    <Box sx={ { width: size ?? '100%', minWidth: 0 } }>
      <Box
        sx={ {
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          overflow: 'hidden',
          bgcolor: '#f4f4f4',
          '&:hover .product-card__hover-image': { opacity: 1 },
          '&:hover .product-card__overlay': { opacity: 1 },
          '&:hover .product-card__image': isZoomOnHover ? { transform: 'scale(1.08)' } : {},
        } }
      >
        <Box
          className="product-card__image"
          component="img"
          loading="lazy"
          src={ assetUrl(images[0]) }
          alt={ product.name }
          sx={ imageSx }
        />
        { hoverImage && (
          <Box className="product-card__hover-image" component="img" loading="lazy" src={ assetUrl(hoverImage) } alt="" sx={ { ...imageSx, opacity: 0 } } />
        ) }
        { isSoldOut && (
          <Box sx={ { position: 'absolute', left: 10, top: 10, px: 1, py: 0.25, bgcolor: COLORS.accent, color: '#fff', fontSize: 12, fontWeight: 700 } }>SOLD OUT</Box>
        ) }
        { isZoomOnHover && (
          <Box className="product-card__overlay" sx={ { position: 'absolute', inset: 0, bgcolor: 'rgba(255, 255, 255, .45)', opacity: 0, transition: 'opacity .25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 } }>
            { iconButtons(30) }
          </Box>
        ) }
      </Box>
      <Box sx={ { display: 'flex', justifyContent: 'space-between', gap: 1, mt: '10px' } }>
        <Box sx={ { minWidth: 0 } }>
          <Box sx={ { fontSize: 18, lineHeight: 1.3, wordBreak: 'keep-all' } }>{ product.name }</Box>
          <Box sx={ { mt: '8px', fontSize: '14pt', display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 1 } }>
            { product.discount_rate > 0 && (
              <Box component="span" sx={ { color: COLORS.muted, textDecoration: 'line-through', fontSize: '11pt' } }>{ won(product.price) }</Box>
            ) }
            <Box component="span" sx={ { fontWeight: 700, color: product.discount_rate > 0 ? COLORS.accent : 'text.primary' } }>{ won(product.sale_price) }</Box>
            { product.discount_rate > 0 && (
              <Box component="span" sx={ { color: COLORS.accent, fontSize: '11pt' } }>{ product.discount_rate }%</Box>
            ) }
          </Box>
        </Box>
        <Box sx={ { display: 'flex', flexDirection: 'column', flexShrink: 0 } }>{ iconButtons(22) }</Box>
      </Box>
    </Box>
  );
}

export default ProductCard;
