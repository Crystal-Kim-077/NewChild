/** 브라우저 저장소 접근 모음. 저장소가 막힌 환경에서도 화면이 깨지지 않도록 예외를 삼킨다. */
const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key, value) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /** 저장 실패 시 현재 탭에서만 동작한다. */
  }
};

const randomToken = () => Array.from(crypto.getRandomValues(new Uint8Array(32)))
  .map((value) => value.toString(16).padStart(2, '0'))
  .join('');

const persistentToken = (key) => {
  const saved = read(key);
  if (saved) return saved;
  const created = randomToken();
  write(key, created);
  return created;
};

export const getSessionToken = () => read('nc_session');
export const setSessionToken = (token) => write('nc_session', token);
export const getDeviceToken = () => persistentToken('nc_device');
export const getSnsSecret = () => persistentToken('nc_sns_secret');
export const getSavedLoginId = () => read('nc_saved_id') ?? '';
export const setSavedLoginId = (loginId) => write('nc_saved_id', loginId);
export const getPromoHiddenDate = () => read('nc_promo_hidden');
export const setPromoHiddenDate = (date) => write('nc_promo_hidden', date);

export const getRecentProducts = () => {
  try {
    return JSON.parse(read('nc_recent') ?? '[]');
  } catch {
    return [];
  }
};

export const addRecentProduct = (product) => {
  const item = {
    product_id: product.product_id,
    name: product.name,
    sale_price: product.sale_price,
    main_image_url: product.main_image_url,
    sizes: product.sizes,
    colors: product.colors,
    stock: product.stock,
  };
  const others = getRecentProducts().filter((saved) => saved.product_id !== item.product_id);
  write('nc_recent', JSON.stringify([item, ...others].slice(0, 10)));
};

export const getCheckoutDraft = () => {
  try {
    return JSON.parse(sessionStorage.getItem('nc_checkout') ?? 'null');
  } catch {
    return null;
  }
};

export const setCheckoutDraft = (draft) => {
  try {
    if (draft) sessionStorage.setItem('nc_checkout', JSON.stringify(draft));
    else sessionStorage.removeItem('nc_checkout');
  } catch {
    /** 저장 실패 시 주문서가 비어 있는 상태로 안내된다. */
  }
};
