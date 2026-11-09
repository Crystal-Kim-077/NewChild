import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import FloatingButtons from './floating-buttons.jsx';
import PromoModal from './promo-modal.jsx';
import SiteFooter from './site-footer.jsx';
import SiteHeader from './site-header.jsx';
import TopBanner from './top-banner.jsx';

/** 모든 페이지 공통 틀. 메인에서는 탑 배너와 헤더가 슬라이드 위에 겹쳐진다. */
function SiteLayout() {
  const { pathname } = useLocation();
  const isMain = pathname === '/';
  const [isBannerOpen, setIsBannerOpen] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Box sx={ { width: '100%', minWidth: 1280, minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' } }>
      <Box sx={ { position: isMain ? 'absolute' : 'relative', top: 0, left: 0, right: 0, zIndex: 20 } }>
        { isBannerOpen && <TopBanner onClose={ () => setIsBannerOpen(false) } /> }
        <SiteHeader isMain={ isMain } />
      </Box>
      <Box component="main" sx={ { flexGrow: 1 } }>
        <Outlet />
      </Box>
      <SiteFooter />
      <FloatingButtons />
      { isMain && <PromoModal /> }
    </Box>
  );
}

export default SiteLayout;
