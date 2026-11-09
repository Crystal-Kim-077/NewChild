import { createContext, useContext } from 'react';

export const ShopContext = createContext(null);

/** 로그인 회원, 장바구니, 관심상품 등 사이트 전역 상태를 사용한다. */
export const useShop = () => useContext(ShopContext);
