import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import OptionDialog from './option-dialog.jsx';
import { ShopContext } from '../../hooks/use-shop.js';
import * as api from '../../utils/api.js';
import { addRecentProduct, getSessionToken, setCheckoutDraft, setSessionToken } from '../../utils/storage.js';

/**
 * ShopProvider 컴포넌트
 *
 * Props:
 * @param {node} children - 하위 화면 [Required]
 *
 * Example usage:
 * <ShopProvider><Routes /></ShopProvider>
 */
function ShopProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [wishIds, setWishIds] = useState([]);
  const [optionProduct, setOptionProduct] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = useCallback((message) => setToast(message), []);

  const refreshCart = useCallback(async () => {
    try {
      setCartItems(await api.getCart());
    } catch (error) {
      if (error.message === 'AUTH_REQUIRED') {
        setSessionToken(null);
        setUser(null);
        setCartItems(await api.getCart());
      } else {
        showToast(error.message);
      }
    }
  }, [showToast]);

  const refreshUser = useCallback(async () => {
    if (!getSessionToken()) {
      setUser(null);
      setWishIds([]);
      return null;
    }
    try {
      const [me, ids] = await Promise.all([api.getMe(), api.getWishlistIds()]);
      setUser(me);
      setWishIds(ids);
      return me;
    } catch {
      setSessionToken(null);
      setUser(null);
      setWishIds([]);
      return null;
    }
  }, []);

  useEffect(() => {
    let isActive = true;
    (async () => {
      await refreshUser();
      await refreshCart();
      if (isActive) setIsAuthReady(true);
    })();
    return () => {
      isActive = false;
    };
  }, [refreshCart, refreshUser]);

  const afterAuth = useCallback(async ({ token }) => {
    setSessionToken(token);
    await refreshUser();
    await refreshCart();
  }, [refreshCart, refreshUser]);

  const logout = useCallback(async () => {
    try {
      await api.logOut();
    } catch {
      /** 세션이 이미 만료된 경우에도 화면에서는 로그아웃 처리한다. */
    }
    setSessionToken(null);
    setUser(null);
    setWishIds([]);
    await refreshCart();
  }, [refreshCart]);

  const openOptions = useCallback((product) => {
    addRecentProduct(product);
    setOptionProduct(product);
  }, []);

  const toggleWish = useCallback(async (productId) => {
    if (!getSessionToken()) {
      showToast('로그인 후 관심상품을 저장할 수 있습니다.');
      navigate('/login');
      return;
    }
    try {
      const isAdded = await api.toggleWishlist(productId);
      setWishIds((ids) => (isAdded ? [...ids, productId] : ids.filter((id) => id !== productId)));
    } catch (error) {
      showToast(error.message);
    }
  }, [navigate, showToast]);

  const startCheckout = useCallback((draft, nextPath) => {
    setCheckoutDraft(draft);
    if (getSessionToken()) navigate('/checkout');
    else navigate(`/login?order=1&next=${ encodeURIComponent(nextPath) }`);
  }, [navigate]);

  const value = useMemo(() => ({
    user,
    isAuthReady,
    cartItems,
    cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    wishIds,
    afterAuth,
    logout,
    refreshUser,
    refreshCart,
    openOptions,
    toggleWish,
    startCheckout,
    showToast,
  }), [user, isAuthReady, cartItems, wishIds, afterAuth, logout, refreshUser, refreshCart, openOptions, toggleWish, startCheckout, showToast]);

  return (
    <ShopContext.Provider value={ value }>
      { children }
      { optionProduct && <OptionDialog product={ optionProduct } onClose={ () => setOptionProduct(null) } /> }
      <Snackbar
        open={ Boolean(toast) }
        autoHideDuration={ 2500 }
        message={ toast }
        onClose={ () => setToast('') }
        anchorOrigin={ { vertical: 'bottom', horizontal: 'center' } }
      />
    </ShopContext.Provider>
  );
}

export default ShopProvider;
