-- NewChild 02. server functions. Safe to re-run.
-- Personal data is only reachable through these functions, which verify a test session token.

-- ========== private helpers ==========
create or replace function private.hash_token(p_token text) returns text
language sql immutable set search_path = '' as $$
  select encode(extensions.digest(p_token, 'sha256'), 'hex');
$$;

create or replace function private.optional_user(p_token text) returns bigint
language plpgsql stable set search_path = '' as $$
declare v_user bigint;
begin
  if p_token is null or p_token = '' then return null; end if;
  select user_id into v_user from private.user_sessions
  where token_hash = private.hash_token(p_token) and expires_at > now();
  if v_user is null then raise exception 'AUTH_REQUIRED'; end if;
  return v_user;
end $$;

create or replace function private.require_user(p_token text) returns bigint
language plpgsql stable set search_path = '' as $$
declare v_user bigint := private.optional_user(p_token);
begin
  if v_user is null then raise exception 'AUTH_REQUIRED'; end if;
  return v_user;
end $$;

create or replace function private.device_hash(p_device text) returns text
language plpgsql immutable set search_path = '' as $$
begin
  if p_device is null or length(p_device) < 32 then raise exception '기기 식별값이 올바르지 않습니다.'; end if;
  return private.hash_token(p_device);
end $$;

create or replace function private.check_password(p_password text) returns void
language plpgsql immutable set search_path = '' as $$
begin
  if p_password is null or length(p_password) < 8 then
    raise exception '비밀번호는 8자 이상 입력해 주세요.';
  end if;
end $$;

-- Guest rows: merged. Rows copied from a member at logout: dropped (that member's own cart still has them).
create or replace function private.merge_device_cart(p_user bigint, p_device_hash text) returns void
language plpgsql set search_path = '' as $$
begin
  if p_device_hash is null then return; end if;
  delete from public.cart_items where device_hash = p_device_hash and origin_user_id is not null;
  insert into public.cart_items (user_id, product_id, size, color, quantity)
  select p_user, product_id, size, color, quantity from public.cart_items where device_hash = p_device_hash
  on conflict (user_id, product_id, size, color) where user_id is not null
  do update set quantity = public.cart_items.quantity + excluded.quantity;
  delete from public.cart_items where device_hash = p_device_hash;
end $$;

create or replace function private.start_session(p_user bigint, p_device text, p_is_new boolean) returns jsonb
language plpgsql set search_path = '' as $$
declare v_token text := encode(extensions.gen_random_bytes(32), 'hex');
begin
  delete from private.user_sessions where expires_at < now();
  insert into private.user_sessions (token_hash, user_id, expires_at)
  values (private.hash_token(v_token), p_user, now() + interval '30 days');
  if p_device is not null then
    perform private.merge_device_cart(p_user, private.device_hash(p_device));
  end if;
  return jsonb_build_object('token', v_token, 'is_new', p_is_new);
end $$;

create or replace function private.issue_signup_coupons(p_user bigint) returns void
language sql set search_path = '' as $$
  insert into public.user_coupons (user_id, coupon_id)
  select p_user, coupon_id from public.coupons where coupon_code in ('WELCOME3000', 'FIRST10')
  on conflict (user_id, coupon_id) do nothing;
$$;

create or replace function private.assert_option(p_product bigint, p_size text, p_color text) returns void
language plpgsql stable set search_path = '' as $$
begin
  if exists (select 1 from public.product_options where product_id = p_product and option_type = 'size')
     and not exists (select 1 from public.product_options where product_id = p_product and option_type = 'size' and option_value = coalesce(p_size, '')) then
    raise exception '사이즈를 선택해 주세요.';
  end if;
  if exists (select 1 from public.product_options where product_id = p_product and option_type = 'color')
     and not exists (select 1 from public.product_options where product_id = p_product and option_type = 'color' and option_value = coalesce(p_color, '')) then
    raise exception '색상을 선택해 주세요.';
  end if;
end $$;

-- Prices always come from the products table; client amounts are never trusted.
create or replace function private.compute_quote(p_user bigint, p_items jsonb, p_user_coupon bigint, p_points integer) returns jsonb
language plpgsql stable set search_path = '' as $$
declare
  v_item jsonb; v_p public.products; v_qty integer;
  v_lines jsonb := '[]'; v_list bigint := 0; v_sale bigint := 0;
  v_coupon_discount bigint := 0; v_ship integer := 0; v_ship_status text;
  v_basis_amount bigint; v_points integer := greatest(coalesce(p_points, 0), 0); v_balance integer := 0;
  v_s public.shop_settings; v_c record;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception '주문할 상품이 없습니다.';
  end if;
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item ->> 'quantity')::integer;
    if v_qty is null or v_qty < 1 then raise exception '수량이 올바르지 않습니다.'; end if;
    select * into v_p from public.products where product_id = (v_item ->> 'product_id')::bigint and status = 'on_sale';
    if not found then raise exception '판매 중이 아닌 상품이 포함되어 있습니다.'; end if;
    if v_p.stock < v_qty then raise exception '[%] 재고가 부족합니다.', v_p.name; end if;
    perform private.assert_option(v_p.product_id, v_item ->> 'size', v_item ->> 'color');
    v_list := v_list + v_p.price::bigint * v_qty;
    v_sale := v_sale + v_p.sale_price::bigint * v_qty;
    v_lines := v_lines || jsonb_build_object(
      'product_id', v_p.product_id, 'product_name', v_p.name, 'image_url', v_p.main_image_url,
      'size', coalesce(v_item ->> 'size', ''), 'color', coalesce(v_item ->> 'color', ''),
      'quantity', v_qty, 'price', v_p.price, 'unit_price', v_p.sale_price);
  end loop;

  if p_user_coupon is not null then
    if p_user is null then raise exception '쿠폰은 회원만 사용할 수 있습니다.'; end if;
    select c.*, uc.expires_at into v_c from public.user_coupons uc join public.coupons c using (coupon_id)
    where uc.user_coupon_id = p_user_coupon and uc.user_id = p_user and uc.coupon_status = 'available';
    if not found or (v_c.expires_at is not null and v_c.expires_at < now()) then raise exception '사용할 수 없는 쿠폰입니다.'; end if;
    if v_sale < v_c.min_purchase_amount then raise exception '쿠폰 최소 구매금액을 충족하지 않습니다.'; end if;
    if v_c.is_first_purchase_only and exists (select 1 from public.orders where user_id = p_user) then
      raise exception '첫 구매에만 사용할 수 있는 쿠폰입니다.';
    end if;
    v_coupon_discount := case when v_c.discount_type = 'fixed' then least(v_c.discount_value::bigint, v_sale)
                              else v_sale * v_c.discount_value / 100 end;
  end if;

  select * into v_s from public.shop_settings where setting_id = 1;
  v_basis_amount := case v_s.free_shipping_basis when 'list_price' then v_list when 'sale_price' then v_sale end;
  if least(v_list, v_sale) >= v_s.free_shipping_threshold or v_basis_amount >= v_s.free_shipping_threshold then
    v_ship_status := 'free';
  elsif v_s.default_shipping_fee is not null and v_basis_amount is not null then
    v_ship_status := 'charged'; v_ship := v_s.default_shipping_fee;
  else
    v_ship_status := 'undetermined';
  end if;

  if v_points > 0 then
    if p_user is null then raise exception '적립금은 회원만 사용할 수 있습니다.'; end if;
    select points into v_balance from public.users where user_id = p_user;
    if v_points > v_balance then raise exception '보유 적립금을 초과했습니다.'; end if;
    if v_points > v_sale - v_coupon_discount + v_ship then raise exception '결제 금액보다 많은 적립금은 사용할 수 없습니다.'; end if;
  end if;

  return jsonb_build_object(
    'lines', v_lines, 'total_product_amount', v_list, 'sale_total', v_sale,
    'discount_amount', v_list - v_sale + v_coupon_discount, 'coupon_discount', v_coupon_discount,
    'shipping_fee', v_ship, 'shipping_fee_status', v_ship_status, 'points_used', v_points,
    'final_amount', v_sale - v_coupon_discount + v_ship - v_points);
end $$;

-- Not exposed to the API. Run from the SQL Editor to advance an order,
-- e.g. select private.set_order_status('20261109-000001', 'shipping');
create or replace function private.set_order_status(p_order_number text, p_status text) returns void
language plpgsql set search_path = '' as $$
begin
  update public.orders set order_status = p_status,
    delivered_at = case when p_status = 'delivered' then now() else null end
  where order_number = p_order_number;
  if not found then raise exception 'order not found'; end if;
end $$;

-- ========== auth ==========
create or replace function public.check_login_id(p_login_id text) returns boolean
language sql stable security definer set search_path = '' as $$
  select not exists (select 1 from public.users where lower(login_id) = lower(p_login_id));
$$;

create or replace function public.sign_up(p jsonb, p_device text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_user bigint; v_login text := trim(p ->> 'login_id');
begin
  if v_login !~ '^[A-Za-z0-9_]{4,20}$' then raise exception '아이디는 영문, 숫자, _ 조합 4~20자로 입력해 주세요.'; end if;
  perform private.check_password(p ->> 'password');
  if coalesce(trim(p ->> 'name'), '') = '' then raise exception '이름을 입력해 주세요.'; end if;
  if coalesce(p ->> 'email', '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception '이메일 형식을 확인해 주세요.'; end if;
  if coalesce(trim(p ->> 'phone_mobile'), '') = '' then raise exception '휴대전화를 입력해 주세요.'; end if;
  if coalesce((p ->> 'required_terms_agreed')::boolean, false) is not true then raise exception '필수 약관에 동의해 주세요.'; end if;
  if not public.check_login_id(v_login) then raise exception '이미 사용 중인 아이디입니다.'; end if;
  insert into public.users (login_id, name, phone_landline, phone_mobile, email, address, birth_date,
    lifetime_member_agreed, required_terms_agreed_at, optional_terms_agreed, sms_opt_in, email_opt_in)
  values (v_login, trim(p ->> 'name'), nullif(p ->> 'phone_landline', ''), p ->> 'phone_mobile', p ->> 'email',
    nullif(p ->> 'address', ''), nullif(p ->> 'birth_date', '')::date,
    coalesce((p ->> 'lifetime_member_agreed')::boolean, false), now(),
    coalesce((p ->> 'optional_terms_agreed')::boolean, false),
    coalesce((p ->> 'optional_terms_agreed')::boolean, false), coalesce((p ->> 'optional_terms_agreed')::boolean, false))
  returning user_id into v_user;
  insert into private.user_credentials (user_id, password_hash)
  values (v_user, extensions.crypt(p ->> 'password', extensions.gen_salt('bf', 10)));
  perform private.issue_signup_coupons(v_user);
  return private.start_session(v_user, p_device, true);
end $$;

create or replace function public.log_in(p_login_id text, p_password text, p_device text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_user bigint; v_hash text;
begin
  select u.user_id, c.password_hash into v_user, v_hash
  from public.users u join private.user_credentials c using (user_id)
  where lower(u.login_id) = lower(trim(p_login_id));
  if v_user is null or extensions.crypt(p_password, v_hash) <> v_hash then
    raise exception '아이디 또는 비밀번호가 일치하지 않습니다.';
  end if;
  return private.start_session(v_user, p_device, false);
end $$;

-- Mock only: no Kakao/Naver call. One mock member per provider per browser secret.
create or replace function public.mock_sns_login(p_provider text, p_sns_secret text, p_device text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_user bigint; v_hash text := private.device_hash(p_sns_secret); v_is_new boolean := false;
begin
  if p_provider not in ('kakao', 'naver') then raise exception '지원하지 않는 로그인입니다.'; end if;
  select user_id into v_user from private.mock_sns_identities where provider = p_provider and device_hash = v_hash;
  if v_user is null then
    insert into public.users (login_id, name, sns_provider, required_terms_agreed_at)
    values (p_provider || '_test_' || substr(v_hash, 1, 10),
      case p_provider when 'kakao' then '카카오 테스트회원' else '네이버 테스트회원' end, p_provider, now())
    returning user_id into v_user;
    insert into private.mock_sns_identities (provider, device_hash, user_id) values (p_provider, v_hash, v_user);
    perform private.issue_signup_coupons(v_user);
    v_is_new := true;
  end if;
  return private.start_session(v_user, p_device, v_is_new);
end $$;

-- The member's cart stays stored; a copy stays viewable on this browser after logout.
create or replace function public.log_out(p_token text, p_device text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare v_user bigint := private.optional_user(p_token); v_dev text;
begin
  if p_device is not null then
    v_dev := private.device_hash(p_device);
    delete from public.cart_items where device_hash = v_dev;
    insert into public.cart_items (device_hash, origin_user_id, product_id, size, color, quantity)
    select v_dev, v_user, product_id, size, color, quantity from public.cart_items where user_id = v_user;
  end if;
  delete from private.user_sessions where token_hash = private.hash_token(p_token);
end $$;

create or replace function public.get_me(p_token text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_user bigint := private.require_user(p_token); v_u public.users; v_total bigint; v_next public.membership_grades;
begin
  select * into v_u from public.users where user_id = v_user;
  select coalesce(sum(pay.final_amount), 0) into v_total from public.payments pay join public.orders o using (order_id)
  where o.user_id = v_user and pay.pay_status = 'paid' and not pay.is_mock;
  select * into v_next from public.membership_grades where min_purchase_amount > v_total order by min_purchase_amount limit 1;
  return jsonb_build_object(
    'user_id', v_u.user_id, 'login_id', v_u.login_id, 'name', v_u.name,
    'phone_landline', v_u.phone_landline, 'phone_mobile', v_u.phone_mobile, 'email', v_u.email,
    'address', v_u.address, 'birth_date', v_u.birth_date, 'points', v_u.points,
    'sms_opt_in', v_u.sms_opt_in, 'email_opt_in', v_u.email_opt_in, 'sns_provider', v_u.sns_provider,
    'grade_name', (select grade_name from public.membership_grades where grade_code = v_u.grade_code),
    'next_grade_name', v_next.grade_name,
    'next_grade_remaining', case when v_next.grade_code is null then null else v_next.min_purchase_amount - v_total end,
    'recent_3m_amount', (select coalesce(sum(pay.final_amount), 0) from public.payments pay join public.orders o using (order_id)
      where o.user_id = v_user and pay.pay_status = 'paid' and not pay.is_mock and pay.paid_at >= now() - interval '3 months'),
    'recent_3m_mock_amount', (select coalesce(sum(pay.final_amount), 0) from public.payments pay join public.orders o using (order_id)
      where o.user_id = v_user and pay.pay_status = 'mock_paid' and pay.paid_at >= now() - interval '3 months'),
    'coupon_count', (select count(*) from public.user_coupons where user_id = v_user and coupon_status = 'available' and (expires_at is null or expires_at > now())),
    'status_counts', (select jsonb_build_object(
      'pending_payment', count(*) filter (where order_status = 'pending_payment'),
      'preparing', count(*) filter (where order_status = 'preparing'),
      'shipping', count(*) filter (where order_status = 'shipping'),
      'delivered', count(*) filter (where order_status = 'delivered'))
      from public.orders where user_id = v_user));
end $$;

-- login_id, name and birth_date are deliberately not updatable.
create or replace function public.update_profile(p_token text, p jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare v_user bigint := private.require_user(p_token);
begin
  if coalesce(p ->> 'email', '') <> '' and p ->> 'email' !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception '이메일 형식을 확인해 주세요.'; end if;
  update public.users set
    address = nullif(p ->> 'address', ''), phone_landline = nullif(p ->> 'phone_landline', ''),
    phone_mobile = nullif(p ->> 'phone_mobile', ''), email = nullif(p ->> 'email', ''),
    sms_opt_in = coalesce((p ->> 'sms_opt_in')::boolean, false),
    email_opt_in = coalesce((p ->> 'email_opt_in')::boolean, false)
  where user_id = v_user;
end $$;

create or replace function public.change_password(p_token text, p_new_password text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_user bigint := private.require_user(p_token);
begin
  perform private.check_password(p_new_password);
  insert into private.user_credentials (user_id, password_hash)
  values (v_user, extensions.crypt(p_new_password, extensions.gen_salt('bf', 10)))
  on conflict (user_id) do update set password_hash = excluded.password_hash, updated_at = now();
end $$;

create or replace function public.list_addresses(p_token text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(to_jsonb(a) - 'user_id' order by a.address_id), '[]')
  from public.user_addresses a where a.user_id = private.require_user(p_token);
$$;

create or replace function public.save_address(p_token text, p_address_id bigint, p jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare v_user bigint := private.require_user(p_token);
begin
  if coalesce(trim(p ->> 'address_name'), '') = '' or coalesce(trim(p ->> 'receiver_name'), '') = ''
     or coalesce(trim(p ->> 'phone_mobile'), '') = '' or coalesce(trim(p ->> 'address'), '') = '' then
    raise exception '배송지명, 수령인, 휴대전화, 주소를 입력해 주세요.';
  end if;
  if p_address_id is null then
    insert into public.user_addresses (user_id, address_name, receiver_name, phone_landline, phone_mobile, address)
    values (v_user, p ->> 'address_name', p ->> 'receiver_name', nullif(p ->> 'phone_landline', ''), p ->> 'phone_mobile', p ->> 'address');
  else
    update public.user_addresses set address_name = p ->> 'address_name', receiver_name = p ->> 'receiver_name',
      phone_landline = nullif(p ->> 'phone_landline', ''), phone_mobile = p ->> 'phone_mobile', address = p ->> 'address'
    where address_id = p_address_id and user_id = v_user;
    if not found then raise exception '배송지를 찾을 수 없습니다.'; end if;
  end if;
end $$;

-- ========== cart ==========
create or replace function public.get_cart(p_token text, p_device text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_user bigint := private.optional_user(p_token); v_dev text;
begin
  if v_user is null then v_dev := private.device_hash(p_device); end if;
  return (select coalesce(jsonb_agg(jsonb_build_object(
      'cart_item_id', ci.cart_item_id, 'product_id', ci.product_id, 'size', ci.size, 'color', ci.color,
      'quantity', ci.quantity, 'name', p.name, 'price', p.price, 'sale_price', p.sale_price,
      'discount_rate', p.discount_rate, 'main_image_url', p.main_image_url, 'stock', p.stock, 'status', p.status,
      'sizes', array(select o.option_value from public.product_options o where o.product_id = p.product_id and o.option_type = 'size' order by o.sort_order),
      'colors', array(select o.option_value from public.product_options o where o.product_id = p.product_id and o.option_type = 'color' order by o.sort_order)
    ) order by ci.cart_item_id), '[]')
    from public.cart_items ci join public.products p using (product_id)
    where (v_user is not null and ci.user_id = v_user) or (v_user is null and ci.device_hash = v_dev));
end $$;

create or replace function public.add_to_cart(p_token text, p_device text, p_product bigint, p_size text, p_color text, p_quantity integer) returns void
language plpgsql security definer set search_path = '' as $$
declare v_user bigint := private.optional_user(p_token); v_dev text; v_id bigint; v_qty integer := 0; v_stock integer;
begin
  if v_user is null then v_dev := private.device_hash(p_device); end if;
  if p_quantity is null or p_quantity < 1 then raise exception '수량이 올바르지 않습니다.'; end if;
  select stock into v_stock from public.products where product_id = p_product and status = 'on_sale';
  if not found then raise exception '판매 중이 아닌 상품입니다.'; end if;
  perform private.assert_option(p_product, p_size, p_color);
  select cart_item_id, quantity into v_id, v_qty from public.cart_items
  where product_id = p_product and size = coalesce(p_size, '') and color = coalesce(p_color, '')
    and ((v_user is not null and user_id = v_user) or (v_user is null and device_hash = v_dev));
  if coalesce(v_qty, 0) + p_quantity > v_stock then raise exception '재고가 부족합니다.'; end if;
  if v_id is null then
    insert into public.cart_items (user_id, device_hash, product_id, size, color, quantity)
    values (v_user, v_dev, p_product, coalesce(p_size, ''), coalesce(p_color, ''), p_quantity);
  else
    update public.cart_items set quantity = quantity + p_quantity where cart_item_id = v_id;
  end if;
end $$;

create or replace function public.update_cart_item(p_token text, p_device text, p_item bigint, p_size text, p_color text, p_quantity integer) returns void
language plpgsql security definer set search_path = '' as $$
declare v_user bigint := private.optional_user(p_token); v_dev text; v_row public.cart_items; v_other public.cart_items; v_stock integer;
begin
  if v_user is null then v_dev := private.device_hash(p_device); end if;
  select * into v_row from public.cart_items where cart_item_id = p_item
    and ((v_user is not null and user_id = v_user) or (v_user is null and device_hash = v_dev));
  if not found then raise exception '장바구니 상품을 찾을 수 없습니다.'; end if;
  if p_quantity is null or p_quantity < 1 then raise exception '수량이 올바르지 않습니다.'; end if;
  perform private.assert_option(v_row.product_id, p_size, p_color);
  select stock into v_stock from public.products where product_id = v_row.product_id;
  select * into v_other from public.cart_items where cart_item_id <> p_item and product_id = v_row.product_id
    and size = coalesce(p_size, '') and color = coalesce(p_color, '')
    and ((v_user is not null and user_id = v_user) or (v_user is null and device_hash = v_dev));
  if p_quantity + coalesce(v_other.quantity, 0) > v_stock then raise exception '재고가 부족합니다.'; end if;
  if v_other.cart_item_id is not null then
    delete from public.cart_items where cart_item_id = p_item;
    update public.cart_items set quantity = quantity + p_quantity where cart_item_id = v_other.cart_item_id;
  else
    update public.cart_items set size = coalesce(p_size, ''), color = coalesce(p_color, ''), quantity = p_quantity where cart_item_id = p_item;
  end if;
end $$;

-- p_items NULL clears the whole cart.
create or replace function public.remove_cart_items(p_token text, p_device text, p_items bigint[]) returns void
language plpgsql security definer set search_path = '' as $$
declare v_user bigint := private.optional_user(p_token); v_dev text;
begin
  if v_user is null then v_dev := private.device_hash(p_device); end if;
  delete from public.cart_items
  where (p_items is null or cart_item_id = any (p_items))
    and ((v_user is not null and user_id = v_user) or (v_user is null and device_hash = v_dev));
end $$;

-- ========== wishlist ==========
create or replace function public.toggle_wishlist(p_token text, p_product bigint) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_user bigint := private.require_user(p_token);
begin
  delete from public.wishlist_items where user_id = v_user and product_id = p_product;
  if found then return false; end if;
  insert into public.wishlist_items (user_id, product_id) values (v_user, p_product);
  return true;
end $$;

create or replace function public.get_wishlist_ids(p_token text) returns bigint[]
language sql stable security definer set search_path = '' as $$
  select coalesce(array_agg(product_id), '{}') from public.wishlist_items where user_id = private.require_user(p_token);
$$;

-- ========== orders ==========
create or replace function public.quote_order(p_token text, p_items jsonb, p_user_coupon bigint default null, p_points integer default 0) returns jsonb
language sql stable security definer set search_path = '' as $$
  select private.compute_quote(private.optional_user(p_token), p_items, p_user_coupon, p_points);
$$;

create or replace function public.create_order(
  p_token text, p_device text, p_items jsonb, p_cart_item_ids bigint[], p_orderer jsonb, p_receiver jsonb,
  p_pay_method text, p_user_coupon bigint, p_points integer, p_guest_password text, p_terms_agreed boolean
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_user bigint := private.optional_user(p_token); v_dev text; v_q jsonb; v_line jsonb; v_order bigint; v_number text;
  v_is_transfer boolean := p_pay_method = 'bank_transfer'; v_now timestamptz := now();
begin
  if p_terms_agreed is not true then raise exception '약관에 동의해 주세요.'; end if;
  if p_pay_method not in ('card', 'bank_transfer', 'kakao_pay', 'naver_pay') then raise exception '결제 수단을 선택해 주세요.'; end if;
  if coalesce(trim(p_orderer ->> 'name'), '') = '' or coalesce(trim(p_orderer ->> 'phone'), '') = '' then raise exception '주문자 정보를 입력해 주세요.'; end if;
  if coalesce(trim(p_receiver ->> 'name'), '') = '' or coalesce(trim(p_receiver ->> 'phone'), '') = '' or coalesce(trim(p_receiver ->> 'address'), '') = '' then
    raise exception '배송지 정보를 입력해 주세요.';
  end if;
  if v_user is null then
    v_dev := private.device_hash(p_device);
    if coalesce(p_orderer ->> 'email', '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception '이메일 형식을 확인해 주세요.'; end if;
    if p_guest_password is null or length(p_guest_password) < 4 then raise exception '비회원 주문조회 비밀번호를 4자 이상 입력해 주세요.'; end if;
  end if;

  -- Lock in a fixed order so concurrent orders cannot oversell or deadlock.
  perform 1 from public.products where product_id in (
    select (e ->> 'product_id')::bigint from jsonb_array_elements(p_items) e
  ) order by product_id for update;
  if v_user is not null then perform 1 from public.users where user_id = v_user for update; end if;

  v_q := private.compute_quote(v_user, p_items, p_user_coupon, p_points);
  v_number := to_char(v_now at time zone 'Asia/Seoul', 'YYYYMMDD') || '-' || lpad(nextval('public.order_number_seq')::text, 6, '0');

  insert into public.orders (order_number, user_id, orderer_name, orderer_email, orderer_phone, receiver_name, receiver_phone,
    receiver_address, delivery_message, order_status, terms_agreed_at, ordered_at)
  values (v_number, v_user, trim(p_orderer ->> 'name'), p_orderer ->> 'email', p_orderer ->> 'phone', p_receiver ->> 'name', p_receiver ->> 'phone',
    p_receiver ->> 'address', nullif(p_receiver ->> 'message', ''), case when v_is_transfer then 'pending_payment' else 'preparing' end, v_now, v_now)
  returning order_id into v_order;

  for v_line in select * from jsonb_array_elements(v_q -> 'lines') loop
    insert into public.order_items (order_id, product_id, product_name, image_url, size, color, quantity, unit_price)
    values (v_order, (v_line ->> 'product_id')::bigint, v_line ->> 'product_name', v_line ->> 'image_url', v_line ->> 'size', v_line ->> 'color',
      (v_line ->> 'quantity')::integer, (v_line ->> 'unit_price')::integer);
    update public.products set stock = stock - (v_line ->> 'quantity')::integer
    where product_id = (v_line ->> 'product_id')::bigint and stock >= (v_line ->> 'quantity')::integer;
    if not found then raise exception '[%] 재고가 부족합니다.', v_line ->> 'product_name'; end if;
  end loop;

  -- No payment gateway is connected, so every payment record is a mock.
  insert into public.payments (payment_number, order_id, pay_method, pay_status, is_mock, paid_at, total_product_amount,
    discount_amount, shipping_fee, shipping_fee_status, points_used, final_amount, earned_points)
  values ('MOCK-' || lpad(nextval('public.payment_number_seq')::text, 8, '0'), v_order, p_pay_method,
    case when v_is_transfer then 'pending' else 'mock_paid' end, true, case when v_is_transfer then null else v_now end,
    (v_q ->> 'total_product_amount')::integer, (v_q ->> 'discount_amount')::integer, (v_q ->> 'shipping_fee')::integer,
    v_q ->> 'shipping_fee_status', (v_q ->> 'points_used')::integer, (v_q ->> 'final_amount')::integer, 0);

  if p_user_coupon is not null then
    update public.user_coupons set coupon_status = 'used', used_order_id = v_order where user_coupon_id = p_user_coupon and user_id = v_user;
  end if;
  if (v_q ->> 'points_used')::integer > 0 then
    update public.users set points = points - (v_q ->> 'points_used')::integer where user_id = v_user;
    insert into public.point_transactions (user_id, order_id, amount, point_status, description)
    values (v_user, v_order, -(v_q ->> 'points_used')::integer, 'used', '주문 시 적립금 사용');
  end if;
  if v_user is null then
    insert into private.guest_order_credentials (order_id, password_hash)
    values (v_order, extensions.crypt(p_guest_password, extensions.gen_salt('bf', 10)));
  end if;
  if p_cart_item_ids is not null then
    delete from public.cart_items where cart_item_id = any (p_cart_item_ids)
      and ((v_user is not null and user_id = v_user) or (v_user is null and device_hash = v_dev));
  end if;
  return jsonb_build_object('order_number', v_number, 'final_amount', (v_q ->> 'final_amount')::integer,
    'order_status', case when v_is_transfer then 'pending_payment' else 'preparing' end, 'is_guest', v_user is null,
    'shipping_fee_status', v_q ->> 'shipping_fee_status');
end $$;

create or replace function public.list_orders(p_token text, p_claims_only boolean, p_from date, p_to date, p_page integer) returns jsonb
language sql stable security definer set search_path = '' as $$
  with filtered as (
    select o.* from public.orders o
    where o.user_id = private.require_user(p_token)
      and (p_from is null or o.ordered_at >= (p_from::timestamp at time zone 'Asia/Seoul'))
      and (p_to is null or o.ordered_at < ((p_to + 1)::timestamp at time zone 'Asia/Seoul'))
      and (not p_claims_only or exists (select 1 from public.order_claims c where c.order_id = o.order_id))
  ), paged as (
    select * from filtered order by ordered_at desc, order_id desc limit 5 offset greatest(p_page - 1, 0) * 5
  )
  select jsonb_build_object('total', (select count(*) from filtered), 'rows', coalesce(jsonb_agg(jsonb_build_object(
    'order_number', p.order_number, 'ordered_at', p.ordered_at, 'order_status', p.order_status,
    'is_mock', (select pay.is_mock from public.payments pay where pay.order_id = p.order_id),
    'final_amount', (select pay.final_amount from public.payments pay where pay.order_id = p.order_id),
    'items', (select jsonb_agg(jsonb_build_object('product_name', i.product_name, 'size', i.size, 'color', i.color, 'quantity', i.quantity) order by i.order_item_id) from public.order_items i where i.order_id = p.order_id),
    'claims', (select coalesce(jsonb_agg(jsonb_build_object('claim_type', c.claim_type, 'claim_status', c.claim_status)), '[]') from public.order_claims c where c.order_id = p.order_id)
  ) order by p.ordered_at desc, p.order_id desc), '[]'))
  from paged p;
$$;

-- All three values must match. One generic error avoids revealing which one failed.
create or replace function public.guest_order_lookup(p_name text, p_order_number text, p_password text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_o public.orders; v_hash text;
begin
  select o.*  into v_o from public.orders o
  where o.order_number = trim(p_order_number) and o.user_id is null and o.orderer_name = trim(p_name);
  if found then select password_hash into v_hash from private.guest_order_credentials where order_id = v_o.order_id; end if;
  if v_hash is null or extensions.crypt(p_password, v_hash) <> v_hash then
    raise exception '입력하신 정보와 일치하는 주문이 없습니다.';
  end if;
  return jsonb_build_object('order_number', v_o.order_number, 'orderer_name', v_o.orderer_name, 'order_status', v_o.order_status,
    'ordered_at', v_o.ordered_at, 'delivered_at', v_o.delivered_at, 'receiver_name', v_o.receiver_name,
    'receiver_phone', v_o.receiver_phone, 'receiver_address', v_o.receiver_address, 'delivery_message', v_o.delivery_message,
    'items', (select jsonb_agg(jsonb_build_object('product_name', i.product_name, 'image_url', i.image_url, 'size', i.size, 'color', i.color, 'quantity', i.quantity, 'unit_price', i.unit_price) order by i.order_item_id) from public.order_items i where i.order_id = v_o.order_id),
    'payment', (select jsonb_build_object('pay_method', pay.pay_method, 'pay_status', pay.pay_status, 'is_mock', pay.is_mock, 'final_amount', pay.final_amount, 'shipping_fee_status', pay.shipping_fee_status) from public.payments pay where pay.order_id = v_o.order_id));
end $$;

-- ========== activity / benefits (5 per page) ==========
create or replace function public.list_wishlist(p_token text, p_page integer) returns jsonb
language sql stable security definer set search_path = '' as $$
  with f as (select * from public.wishlist_items where user_id = private.require_user(p_token)),
  paged as (select * from f order by created_at desc, product_id limit 5 offset greatest(p_page - 1, 0) * 5)
  select jsonb_build_object('total', (select count(*) from f), 'rows', coalesce(jsonb_agg(jsonb_build_object(
    'product_id', pr.product_id, 'name', pr.name, 'price', pr.price, 'sale_price', pr.sale_price, 'discount_rate', pr.discount_rate,
    'main_image_url', pr.main_image_url, 'created_at', p.created_at) order by p.created_at desc, p.product_id), '[]'))
  from paged p join public.products pr using (product_id);
$$;

create or replace function public.list_reviews(p_token text, p_page integer) returns jsonb
language sql stable security definer set search_path = '' as $$
  with f as (select * from public.reviews where user_id = private.require_user(p_token)),
  paged as (select * from f order by created_at desc, review_id desc limit 5 offset greatest(p_page - 1, 0) * 5)
  select jsonb_build_object('total', (select count(*) from f), 'rows', coalesce(jsonb_agg(jsonb_build_object(
    'review_id', p.review_id, 'name', pr.name, 'rating', p.rating, 'content', p.content, 'created_at', p.created_at) order by p.created_at desc, p.review_id desc), '[]'))
  from paged p join public.products pr using (product_id);
$$;

create or replace function public.list_qna(p_token text, p_page integer) returns jsonb
language sql stable security definer set search_path = '' as $$
  with f as (select * from public.qna_posts where user_id = private.require_user(p_token)),
  paged as (select * from f order by created_at desc, qna_id desc limit 5 offset greatest(p_page - 1, 0) * 5)
  select jsonb_build_object('total', (select count(*) from f), 'rows', coalesce(jsonb_agg(jsonb_build_object(
    'qna_id', p.qna_id, 'name', pr.name, 'title', p.title, 'qna_status', p.qna_status, 'created_at', p.created_at) order by p.created_at desc, p.qna_id desc), '[]'))
  from paged p left join public.products pr using (product_id);
$$;

create or replace function public.list_points(p_token text, p_page integer) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_user bigint := private.require_user(p_token);
begin
  return (
    with f as (select * from public.point_transactions where user_id = v_user),
    paged as (select * from f order by created_at desc, point_transaction_id desc limit 5 offset greatest(p_page - 1, 0) * 5)
    select jsonb_build_object(
      'available', (select points from public.users where user_id = v_user),
      'total_earned', (select coalesce(sum(amount), 0) from f where amount > 0 and point_status = 'available'),
      'used', (select coalesce(-sum(amount), 0) from f where point_status = 'used'),
      'unavailable', (select coalesce(sum(amount), 0) from f where point_status = 'unavailable'),
      'refund_pending', (select coalesce(sum(amount), 0) from f where point_status = 'refund_pending'),
      'total', (select count(*) from f),
      'rows', coalesce(jsonb_agg(jsonb_build_object('id', p.point_transaction_id, 'created_at', p.created_at, 'amount', p.amount,
        'order_number', o.order_number, 'description', p.description) order by p.created_at desc, p.point_transaction_id desc), '[]'))
    from paged p left join public.orders o on o.order_id = p.order_id);
end $$;

create or replace function public.list_coupons(p_token text, p_page integer) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_user bigint := private.require_user(p_token);
begin
  return (
    with f as (select uc.*, c.name, c.applicable_products, c.min_purchase_amount, c.allowed_pay_method, c.discount_type, c.discount_value, c.is_first_purchase_only
      from public.user_coupons uc join public.coupons c using (coupon_id) where uc.user_id = v_user),
    paged as (select * from f order by issued_at desc, user_coupon_id desc limit 5 offset greatest(p_page - 1, 0) * 5)
    select jsonb_build_object(
      'available_count', (select count(*) from f where coupon_status = 'available' and (expires_at is null or expires_at > now())),
      'total', (select count(*) from f),
      'rows', coalesce(jsonb_agg(to_jsonb(p) - 'user_id' - 'used_order_id' order by p.issued_at desc, p.user_coupon_id desc), '[]'))
    from paged p);
end $$;

create or replace function public.list_usable_coupons(p_token text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('user_coupon_id', uc.user_coupon_id, 'name', c.name, 'discount_type', c.discount_type,
    'discount_value', c.discount_value, 'min_purchase_amount', c.min_purchase_amount) order by uc.user_coupon_id), '[]')
  from public.user_coupons uc join public.coupons c using (coupon_id)
  where uc.user_id = private.require_user(p_token) and uc.coupon_status = 'available' and (uc.expires_at is null or uc.expires_at > now())
    and not (c.is_first_purchase_only and exists (select 1 from public.orders o where o.user_id = uc.user_id));
$$;

-- ========== grants ==========
do $$
declare r record;
begin
  for r in select p.oid::regprocedure sig from pg_proc p where p.pronamespace = 'public'::regnamespace and p.prosecdef loop
    execute format('revoke all on function %s from public, anon, authenticated', r.sig);
    execute format('grant execute on function %s to anon, authenticated', r.sig);
  end loop;
end $$;
