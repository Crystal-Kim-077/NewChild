import { supabase } from '../lib/supabase.js';
import { getDeviceToken, getSessionToken, getSnsSecret } from './storage.js';

const rpc = async (name, args) => {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw new Error(error.message);
  return data;
};

const unwrap = ({ data, error, count }) => {
  if (error) throw new Error(error.message);
  return { data, count };
};

/** ---------- 상품 (공개 데이터) ---------- */
export const CATEGORY_PAGE_SIZE = 36;

const SORTS = {
  new: [['created_at', false]],
  low: [['sale_price', true]],
  high: [['sale_price', false]],
  popular: [['popularity_score', false]],
  rating: [['rating_avg', false]],
};

export const fetchProducts = async ({
  parentSlug, categorySlug, productIds, minPrice, maxPrice, keywords = [], sizes = [], sort = 'new', page = 1, pageSize = CATEGORY_PAGE_SIZE,
}) => {
  let query = supabase.from('product_cards').select('*', { count: 'exact' });
  if (parentSlug) query = query.eq('parent_slug', parentSlug);
  if (categorySlug) query = query.eq('category_slug', categorySlug);
  if (productIds) query = query.in('product_id', productIds);
  if (minPrice !== undefined) query = query.gte('sale_price', minPrice);
  if (maxPrice !== undefined) query = query.lte('sale_price', maxPrice);
  if (keywords.length) query = query.overlaps('keywords', keywords);
  if (sizes.length) query = query.overlaps('sizes', sizes);
  SORTS[sort].forEach(([column, ascending]) => {
    query = query.order(column, { ascending, nullsFirst: false });
  });
  query = query.order('product_id').range((page - 1) * pageSize, page * pageSize - 1);
  const { data, count } = unwrap(await query);
  return { rows: data, total: count ?? 0 };
};

const fetchByIds = async (ids) => {
  if (!ids.length) return [];
  const { data } = unwrap(await supabase.from('product_cards').select('*').in('product_id', ids));
  return ids.map((id) => data.find((product) => product.product_id === id)).filter(Boolean);
};

export const fetchRanking = async (rankingType, parentSlug) => {
  let query = supabase.from('product_rankings').select('product_id, rank, categories!inner(slug)').eq('ranking_type', rankingType);
  if (parentSlug) query = query.eq('categories.slug', parentSlug);
  const { data } = unwrap(await query.order('rank'));
  return fetchByIds(data.map((row) => row.product_id));
};

export const fetchBestIds = async () => {
  const { data } = unwrap(await supabase.from('product_rankings').select('product_id').eq('ranking_type', 'weekly_best').order('rank'));
  return [...new Set(data.map((row) => row.product_id))];
};

export const fetchCollections = async () => {
  const { data } = unwrap(await supabase.from('collections').select('*').order('sort_order'));
  return data;
};

export const fetchCollectionProducts = async (collectionId, limit) => {
  let query = supabase.from('collection_products').select('product_id').eq('collection_id', collectionId).order('sort_order');
  if (limit) query = query.limit(limit);
  const { data } = unwrap(await query);
  return fetchByIds(data.map((row) => row.product_id));
};

export const fetchKeywords = async () => {
  const { data } = unwrap(await supabase.from('keywords').select('name').order('keyword_id'));
  return data.map((row) => row.name);
};

export const fetchGrades = async () => {
  const { data } = unwrap(await supabase.from('membership_grades').select('*').order('sort_order'));
  return data;
};

/** ---------- 회원 ---------- */
const token = () => getSessionToken();
const device = () => getDeviceToken();

export const checkLoginId = (loginId) => rpc('check_login_id', { p_login_id: loginId });
export const signUp = (form) => rpc('sign_up', { p: form, p_device: device() });
export const logIn = (loginId, password) => rpc('log_in', { p_login_id: loginId, p_password: password, p_device: device() });
export const mockSnsLogin = (provider) => rpc('mock_sns_login', { p_provider: provider, p_sns_secret: getSnsSecret(), p_device: device() });
export const logOut = () => rpc('log_out', { p_token: token(), p_device: device() });
export const getMe = () => rpc('get_me', { p_token: token() });
export const updateProfile = (profile) => rpc('update_profile', { p_token: token(), p: profile });
export const changePassword = (password) => rpc('change_password', { p_token: token(), p_new_password: password });
export const listAddresses = () => rpc('list_addresses', { p_token: token() });
export const saveAddress = (addressId, address) => rpc('save_address', { p_token: token(), p_address_id: addressId, p: address });

/** ---------- 장바구니 / 관심상품 ---------- */
const owner = () => ({ p_token: token(), p_device: device() });

export const getCart = () => rpc('get_cart', owner());
export const addToCart = ({ productId, size, color, quantity }) => rpc('add_to_cart', {
  ...owner(), p_product: productId, p_size: size, p_color: color, p_quantity: quantity,
});
export const updateCartItem = ({ cartItemId, size, color, quantity }) => rpc('update_cart_item', {
  ...owner(), p_item: cartItemId, p_size: size, p_color: color, p_quantity: quantity,
});
export const removeCartItems = (ids) => rpc('remove_cart_items', { ...owner(), p_items: ids });
export const toggleWishlist = (productId) => rpc('toggle_wishlist', { p_token: token(), p_product: productId });
export const getWishlistIds = () => rpc('get_wishlist_ids', { p_token: token() });

/** ---------- 주문 ---------- */
export const quoteOrder = ({ items, userCouponId = null, points = 0 }) => rpc('quote_order', {
  p_token: token(), p_items: items, p_user_coupon: userCouponId, p_points: points,
});
export const createOrder = ({ items, cartItemIds, orderer, receiver, payMethod, userCouponId, points, guestPassword, isTermsAgreed }) => rpc('create_order', {
  ...owner(),
  p_items: items,
  p_cart_item_ids: cartItemIds ?? null,
  p_orderer: orderer,
  p_receiver: receiver,
  p_pay_method: payMethod,
  p_user_coupon: userCouponId ?? null,
  p_points: points ?? 0,
  p_guest_password: guestPassword ?? null,
  p_terms_agreed: isTermsAgreed,
});
export const listOrders = ({ isClaimsOnly, from, to, page }) => rpc('list_orders', {
  p_token: token(), p_claims_only: isClaimsOnly, p_from: from ?? null, p_to: to ?? null, p_page: page,
});
export const guestOrderLookup = ({ name, orderNumber, password }) => rpc('guest_order_lookup', {
  p_name: name, p_order_number: orderNumber, p_password: password,
});

/** ---------- 마이페이지 목록 (페이지당 5개) ---------- */
export const listWishlist = (page) => rpc('list_wishlist', { p_token: token(), p_page: page });
export const listReviews = (page) => rpc('list_reviews', { p_token: token(), p_page: page });
export const listQna = (page) => rpc('list_qna', { p_token: token(), p_page: page });
export const listPoints = (page) => rpc('list_points', { p_token: token(), p_page: page });
export const listCoupons = (page) => rpc('list_coupons', { p_token: token(), p_page: page });
export const listUsableCoupons = () => rpc('list_usable_coupons', { p_token: token() });
