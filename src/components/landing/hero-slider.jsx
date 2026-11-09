import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { assetUrl, iconUrl } from '../../utils/format.js';

const SLIDES = [
  { image: 'main/slide/slide1.webp', title: 'COLORLAMA MOMENT', copy: '스타일리시한 겨울을 보낼 수 있는 경량패딩' },
  { image: 'main/slide/slide2.png', title: 'Energy Knit', copy: '한 장으로 완성되는 포인트 니트' },
  { image: 'main/slide/slide3.png', title: 'USA, In Your Way', copy: '어느 거리에서나 돋보이는 뉴차일드 USA 컬렉션' },
  { image: 'main/slide/slide4.webp', title: '뉴차일드의 컬러로 완성한 윈터 슈즈', copy: '서로 다른 세 가지 감촉 뒤에 뉴차일드의 컬러를 담다' },
];
const COUNT = SLIDES.length;
const INTERVAL_MS = 1000;
const TRANSITION_MS = 600;
const BAR_WIDTH = 480;

/** 메인 슬라이드. 마지막 다음에 첫 장 복제본을 두어 왼쪽으로 끊김 없이 반복한다. */
function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [isAnimated, setIsAnimated] = useState(true);
  const current = index % COUNT;

  const next = useCallback(() => {
    setIsAnimated(true);
    setIndex((value) => (value >= COUNT ? 1 : value + 1));
  }, []);

  const prev = () => {
    if (index > 0) {
      setIsAnimated(true);
      setIndex(index - 1);
      return;
    }
    setIsAnimated(false);
    setIndex(COUNT);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setIsAnimated(true);
      setIndex(COUNT - 1);
    }));
  };

  useEffect(() => {
    const timer = setInterval(next, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [next]);

  const handleTransitionEnd = () => {
    if (index === COUNT) {
      setIsAnimated(false);
      setIndex(0);
    }
  };

  return (
    <Box component="section" aria-label="메인 배너" sx={ { position: 'relative', width: '100%', height: '100vh', minHeight: 640, overflow: 'hidden', bgcolor: '#222' } }>
      <Box
        onTransitionEnd={ handleTransitionEnd }
        sx={ {
          display: 'flex',
          height: '100%',
          width: `${ (COUNT + 1) * 100 }%`,
          transform: `translateX(-${ (index * 100) / (COUNT + 1) }%)`,
          transition: isAnimated ? `transform ${ TRANSITION_MS }ms ease` : 'none',
        } }
      >
        { [...SLIDES, SLIDES[0]].map((slide, slideIndex) => (
          <Box key={ `${ slide.image }-${ slideIndex }` } sx={ { position: 'relative', flex: `0 0 ${ 100 / (COUNT + 1) }%`, height: '100%' } }>
            <Box component="img" src={ assetUrl(slide.image) } alt="" sx={ { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' } } />
            <Box sx={ { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 38%)' } } />
          </Box>
        )) }
      </Box>

      <Box sx={ { position: 'absolute', left: 46, right: 46, bottom: 44, color: '#fff' } }>
        <Box sx={ { fontSize: '32pt', fontWeight: 700, lineHeight: 1.25, maxWidth: '50%', wordBreak: 'keep-all' } }>{ SLIDES[current].title }</Box>
        <Box sx={ { mt: '25px', fontSize: 18 } }>{ SLIDES[current].copy }</Box>
        <Box sx={ { mt: 4, display: 'flex', alignItems: 'center', gap: 3 } }>
          <Box sx={ { position: 'relative', flexGrow: 1, height: 3, bgcolor: 'rgba(255,255,255,.35)' } }>
            <Box
              sx={ {
                position: 'absolute',
                top: 0,
                height: '100%',
                width: BAR_WIDTH,
                bgcolor: 'primary.main',
                left: `calc((100% - ${ BAR_WIDTH }px) * ${ current / (COUNT - 1) })`,
                transition: `left ${ TRANSITION_MS }ms ease`,
              } }
            />
          </Box>
          <IconButton aria-label="이전 슬라이드" onClick={ prev }>
            <Box component="img" src={ iconUrl('arrow-left.svg') } alt="" sx={ { width: 24, height: 24, filter: 'invert(1)' } } />
          </IconButton>
          <IconButton aria-label="다음 슬라이드" onClick={ next }>
            <Box component="img" src={ iconUrl('arrow-right.svg') } alt="" sx={ { width: 24, height: 24, filter: 'invert(1)' } } />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

export default HeroSlider;
