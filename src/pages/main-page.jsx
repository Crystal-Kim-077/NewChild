import Box from '@mui/material/Box';
import CollectionSection from '../components/landing/collection-section.jsx';
import HeroSlider from '../components/landing/hero-slider.jsx';
import InstagramSection from '../components/landing/instagram-section.jsx';
import KeywordButtons from '../components/landing/keyword-buttons.jsx';
import NewInSection from '../components/landing/new-in-section.jsx';
import StoreBanner from '../components/landing/store-banner.jsx';
import WeeklyBestSection from '../components/landing/weekly-best-section.jsx';

function MainPage() {
  return (
    <Box>
      <HeroSlider />
      <KeywordButtons />
      <WeeklyBestSection />
      <CollectionSection />
      <StoreBanner />
      <NewInSection />
      <InstagramSection />
    </Box>
  );
}

export default MainPage;
