import { useState } from 'react';

/**
 * 카드형 슬라이드의 현재 위치를 관리한다.
 *
 * @param {number} count - 전체 아이템 수
 * @param {number} visible - 한 화면에 보이는 아이템 수
 */
export const useCarousel = (count, visible) => {
  const [index, setIndex] = useState(0);
  const maxIndex = Math.max(count - visible, 0);
  const current = Math.min(index, maxIndex);

  return {
    index: current,
    maxIndex,
    canPrev: current > 0,
    canNext: current < maxIndex,
    prev: () => setIndex(Math.max(current - 1, 0)),
    next: () => setIndex(Math.min(current + 1, maxIndex)),
    reset: () => setIndex(0),
  };
};
