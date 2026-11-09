import { useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useShop } from '../../hooks/use-shop.js';
import { COLORS } from '../../theme.js';
import { assetUrl, iconUrl, won } from '../../utils/format.js';

const arrowSx = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  width: 36,
  height: 36,
  bgcolor: 'rgba(255, 255, 255, .8)',
  borderRadius: '50%',
  zIndex: 2,
};

/**
 * ProductCard 컴포넌트
 *
 * Props:
 * @param {object} product - product_cards 뷰의 상품 데이터 [Required]
 * @param {number} size - 상품 사진 한 변의 길이(px). 없으면 부모 너비에 맞춘다 [Optional]
 * @param {boolean} isZoomOnHover - hover 시 흰 배경, 확대, 아이콘 표시(카테고리 BEST) [Optional, 기본값: false]
 *
 * Example usage:
 * <ProductCard product={ product } size={ 358 } />
 */
function ProductCard({ product, size, isZoomOnHover = false }) {
  const { wishIds, toggleWish, openOptions } = useShop();
  const [imageIndex, setImageIndex] = useState(0);
  const images = product.image_urls?.length ? product.image_urls : [product.main_image_url];
  const isWished = wishIds.includes(product.product_id);
  const isSoldOut = product.status === 'sold_out' || product.stock <= 0;

  const moveImage = (step) => (event) => {
    event.stopPropagation();
    setImageIndex((imageIndex + step + images.length) % images.length);
  };

  const iconButtons = (iconSize) => (
    <>
      <IconButton aria-label={ isWished ? '관심상품 해제' : '관심상품 추가' } onClick={ () => toggleWish(product.product_id) } sx={ { p: 0.5 } }>
        { isWished
          ? <FavoriteIcon sx={ { fontSize: iconSize, color: COLORS.accent } } />
          : <Box component="img" src={ iconUrl('icon_wish.svg') } alt="" sx={ { width: iconSize, height: iconSize, opacity: 0.8 } } /> }
      </IconButton>
      <IconButton aria-label="장바구니 담기" disabled={ isSoldOut } onClick={ () => openOptions(product) } sx={ { p: 0.5 } }>
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
          '&:hover .product-card__arrow': { opacity: 1 },
          '&:hover .product-card__overlay': { opacity: 1 },
          '&:hover .product-card__image': isZoomOnHover ? { transform: 'scale(1.08)' } : {},
        } }
      >
        <Box
          className="product-card__image"
          component="img"
          loading="lazy"
          src={ assetUrl(images[imageIndex]) }
          alt={ product.name }
          sx={ { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', transition: 'transform .35s' } }
        />
        { isSoldOut && (
          <Box sx={ { position: 'absolute', left: 10, top: 10, px: 1, py: 0.25, bgcolor: COLORS.accent, color: '#fff', fontSize: 12, fontWeight: 700 } }>SOLD OUT</Box>
        ) }
        { isZoomOnHover && (
          <Box className="product-card__overlay" sx={ { position: 'absolute', inset: 0, bgcolor: 'rgba(255, 255, 255, .45)', opacity: 0, transition: 'opacity .25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 } }>
            { iconButtons(30) }
          </Box>
        ) }
        { !isZoomOnHover && images.length > 1 && (
          <>
            <ButtonBase className="product-card__arrow" aria-label="이전 사진" onClick={ moveImage(-1) } sx={ { ...arrowSx, left: 8, opacity: 0, '&:focus-visible': { opacity: 1 } } }>
              <Box component="img" src={ iconUrl('angle-left.svg') } alt="" sx={ { width: 16, height: 16 } } />
            </ButtonBase>
            <ButtonBase className="product-card__arrow" aria-label="다음 사진" onClick={ moveImage(1) } sx={ { ...arrowSx, right: 8, opacity: 0, '&:focus-visible': { opacity: 1 } } }>
              <Box component="img" src={ iconUrl('angle-right.svg') } alt="" sx={ { width: 16, height: 16 } } />
            </ButtonBase>
          </>
        ) }
      </Box>
      <Box sx={ { display: 'flex', justifyContent: 'space-between', gap: 1, mt: '10px' } }>
        <Box sx={ { minWidth: 0 } }>
          <Box sx={ { fontSize: '16pt', lineHeight: 1.3, wordBreak: 'keep-all' } }>{ product.name }</Box>
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
