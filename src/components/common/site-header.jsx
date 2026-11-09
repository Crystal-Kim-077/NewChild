import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import { useShop } from '../../hooks/use-shop.js';
import { assetUrl, iconUrl } from '../../utils/format.js';
import { GNB_MENUS, subLink } from '../../utils/menu-data.js';

const SIDE_PADDING = 46;
const LOGO_WIDTH = 120;
const NAV_OFFSET = 60;
const COLUMN_WIDTH = 124;
const OVERLAY = 'rgba(255, 255, 255, 0.6)';

/**
 * SiteHeader 컴포넌트
 *
 * Props:
 * @param {boolean} isMain - 메인 페이지 여부. 슬라이드 위에 투명하게 표시한다 [Required]
 *
 * Example usage:
 * <SiteHeader isMain={ true } />
 */
function SiteHeader({ isMain }) {
  const navigate = useNavigate();
  const { user, cartCount, logout } = useShop();
  const [isHover, setIsHover] = useState(false);
  const [isGnbOpen, setIsGnbOpen] = useState(false);
  const [isMyOpen, setIsMyOpen] = useState(false);

  const isLight = isMain && !isHover;
  const textColor = isLight ? '#fff' : '#333';
  const iconFilter = isLight ? 'none' : 'brightness(0.2)';

  const handleLeave = () => {
    setIsHover(false);
    setIsGnbOpen(false);
    setIsMyOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const myLinkSx = { display: 'block', py: 1, fontSize: 14, color: '#333', textAlign: 'center', width: '100%', '&:hover': { color: 'primary.main' } };

  return (
    <Box
      component="header"
      onMouseEnter={ () => setIsHover(true) }
      onMouseLeave={ handleLeave }
      sx={ { position: 'relative', bgcolor: isHover ? OVERLAY : 'transparent', transition: 'background-color .2s' } }
    >
      <Box sx={ { height: 90, px: `${ SIDE_PADDING }px`, display: 'flex', alignItems: 'center' } }>
        <RouterLink to="/" aria-label="NewChild 메인으로 이동">
          <Box component="img" src={ assetUrl('logo.png') } alt="NewChild" sx={ { width: LOGO_WIDTH, height: 80, objectFit: 'contain' } } />
        </RouterLink>

        <Box component="nav" onMouseEnter={ () => setIsGnbOpen(true) } sx={ { display: 'flex', ml: `${ NAV_OFFSET }px`, height: '100%', alignItems: 'center' } }>
          { GNB_MENUS.map((menu) => (
            <Box
              key={ menu.label }
              component={ RouterLink }
              to={ menu.to }
              sx={ { width: COLUMN_WIDTH, textAlign: 'center', fontSize: 16, fontWeight: 700, color: textColor, transition: 'color .2s', '&:hover': { color: 'primary.main' } } }
            >
              { menu.label }
            </Box>
          )) }
        </Box>

        <Box sx={ { ml: 'auto', display: 'flex', alignItems: 'center', gap: 2.5, height: '100%' } } onMouseEnter={ () => setIsGnbOpen(false) }>
          <ButtonBase aria-label="검색">
            <Box component="img" src={ iconUrl('icon_search.png') } alt="" sx={ { width: 28, height: 28, filter: iconFilter } } />
          </ButtonBase>
          <ButtonBase aria-label="장바구니" onClick={ () => navigate('/cart') }>
            <Badge
              badgeContent={ cartCount }
              sx={ { '& .MuiBadge-badge': { bgcolor: 'primary.main', color: '#333', fontWeight: 700, fontSize: 11 } } }
            >
              <Box component="img" src={ iconUrl('icon_cart.png') } alt="" sx={ { width: 28, height: 28, filter: iconFilter } } />
            </Badge>
          </ButtonBase>
          <Box
            onMouseEnter={ () => setIsMyOpen(true) }
            onMouseLeave={ () => setIsMyOpen(false) }
            sx={ { position: 'relative', height: '100%', display: 'flex', alignItems: 'center' } }
          >
            <ButtonBase aria-label="마이페이지" onClick={ () => navigate(user ? '/mypage' : '/login') }>
              <Box component="img" src={ iconUrl('icon_mypage.png') } alt="" sx={ { width: 28, height: 28, filter: iconFilter } } />
            </ButtonBase>
            <Box sx={ { position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 110, zIndex: 3 } }>
              <Collapse in={ isMyOpen }>
                <Box sx={ { bgcolor: OVERLAY, backdropFilter: 'blur(6px)', py: 0.5, textAlign: 'center' } }>
                  { user
                    ? <ButtonBase sx={ myLinkSx } onClick={ handleLogout }>로그아웃</ButtonBase>
                    : <Box component={ RouterLink } to="/login" sx={ myLinkSx }>로그인</Box> }
                  <Box component={ RouterLink } to="/signup" sx={ myLinkSx }>회원가입</Box>
                </Box>
              </Collapse>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={ { position: 'absolute', top: 90, left: 0, right: 0, zIndex: 2 } }>
        <Collapse in={ isGnbOpen }>
          <Box sx={ { bgcolor: OVERLAY, backdropFilter: 'blur(6px)', py: 2.5, pl: `${ SIDE_PADDING + LOGO_WIDTH + NAV_OFFSET }px`, display: 'flex' } }>
            { GNB_MENUS.map((menu) => (
              <Box key={ menu.label } sx={ { width: COLUMN_WIDTH, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.25 } }>
                { menu.subs.map((sub) => (
                  <Box
                    key={ sub.label }
                    component={ RouterLink }
                    to={ subLink(menu, sub) }
                    onClick={ handleLeave }
                    sx={ { fontSize: 14, color: '#333', borderBottom: '1px solid transparent', '&:hover': { color: 'primary.main', borderBottomColor: 'primary.main' } } }
                  >
                    { sub.label }
                  </Box>
                )) }
              </Box>
            )) }
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}

export default SiteHeader;
