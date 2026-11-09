-- NewChild 03. sample data (test only). Safe to re-run.
insert into public.membership_grades values
  ('bronze', '브론즈', 0, 5, 1), ('silver', '실버', 500000, 7, 2), ('gold', '골드', 800000, 8, 3),
  ('platinum', '플래티넘', 1000000, 10, 4), ('black', '블랙', 2000000, 15, 5)
on conflict (grade_code) do nothing;

insert into public.shop_settings (setting_id) values (1) on conflict (setting_id) do nothing;

insert into public.categories (category_id, parent_id, name, slug, sort_order) values
  (1, null, '아우터', 'outer', 1), (2, null, '상의', 'top', 2), (3, null, '하의', 'bottom', 3),
  (4, null, '원피스', 'dress', 4), (5, null, '액세서리', 'acc', 5),
  (11, 1, '패딩/다운', 'outer-padding', 1), (12, 1, '플리스/덤블', 'outer-fleece', 2), (13, 1, '재킷/점퍼', 'outer-jacket', 3),
  (14, 1, '코트', 'outer-coat', 4), (15, 1, '가디건', 'outer-cardigan', 5), (16, 1, '베스트', 'outer-vest', 6), (17, 1, '후드집업', 'outer-hoodzip', 7),
  (21, 2, '후디/맨투맨', 'top-hoodie', 1), (22, 2, '니트/스웨터', 'top-knit', 2), (23, 2, '셔츠/블라우스', 'top-shirt', 3),
  (24, 2, '긴팔 티셔츠', 'top-longtee', 4), (25, 2, '반팔 티셔츠', 'top-shorttee', 5), (26, 2, '슬리브리스', 'top-sleeveless', 6),
  (31, 3, '스커트', 'bottom-skirt', 1), (32, 3, '데님 팬츠', 'bottom-denim', 2), (33, 3, '스웨트 팬츠', 'bottom-sweat', 3),
  (34, 3, '롱팬츠', 'bottom-long', 4), (35, 3, '숏팬츠', 'bottom-short', 5),
  (41, 4, '롱원피스', 'dress-long', 1), (42, 4, '미디원피스', 'dress-midi', 2), (43, 4, '숏원피스', 'dress-short', 3),
  (51, 5, '가방', 'acc-bag', 1), (52, 5, '모자', 'acc-hat', 2), (53, 5, '양말', 'acc-socks', 3), (54, 5, '패션잡화', 'acc-goods', 4)
on conflict (category_id) do nothing;

insert into public.keywords (keyword_id, name) values
  (1, '워싱'), (2, '그래픽'), (3, '냉감'), (4, '스웻'), (5, '데님'), (6, '생활방수'),
  (7, '스트라이프'), (8, '셔츠'), (9, '스트레치'), (10, '보온성'), (11, '경량'), (12, '코튼')
on conflict (keyword_id) do nothing;

with src (id, slug, name, price, rate, img, sizes, colors, kw, pop, ago) as (values
  (1, 'top-sleeveless', '깅엄 스모크 캐미솔 탑', 39000, 0, 'product/pho1.jpg', 'S,M,L', 'BLACK,NAVY', '코튼', 90, 40),
  (2, 'top-knit', '코발트 크루넥 니트 스웨터', 69000, 10, 'product/pho2.jpg', 'S,M,L,XL', 'BLUE,IVORY', '보온성', 88, 39),
  (3, 'top-shirt', '체크 반소매 셔츠', 49000, 0, 'product/pho3.jpg', 'S,M,L', 'NAVY', '셔츠,코튼', 86, 38),
  (4, 'dress-midi', '코듀로이 멜빵 원피스', 79000, 15, 'product/pho4.jpg', 'S,M,L', 'BLACK', '스트레치', 84, 37),
  (5, 'top-shirt', '볼륨 슬리브 블라우스', 59000, 0, 'product/pho5.jpg', 'S,M,L', 'BLACK', '셔츠', 82, 36),
  (6, 'dress-short', '도트 티어드 미니 원피스', 69000, 10, 'product/pho6.png', 'S,M,L', 'BLACK', '경량', 80, 35),
  (7, 'dress-short', '티어드 슬립 원피스', 59000, 0, 'product/pho7.jpg', 'S,M', 'BLACK', '경량,냉감', 78, 34),
  (8, 'dress-long', '화이트 코튼 롱 원피스', 89000, 20, 'product/pho8.jpg', 'S,M,L', 'WHITE', '코튼', 76, 33),
  (9, 'top-shirt', '오프숄더 셔링 블라우스', 45000, 0, 'product/pho9.png', 'S,M', 'BLACK', '경량', 74, 32),
  (10, 'top-shirt', '깅엄 체크 슬림 셔츠', 55000, 5, 'product/pho10.png', 'S,M,L', 'NAVY', '셔츠,스트레치', 72, 31),
  (11, 'top-knit', '버건디 카라 니트', 75000, 0, 'product/pho11.jpg', 'S,M,L', 'BURGUNDY', '보온성', 70, 30),
  (12, 'outer-cardigan', '멜란지 버튼 가디건', 69000, 10, 'product/pho12.jpg', 'S,M,L', 'CHARCOAL', '보온성', 68, 29),
  (13, 'outer-hoodzip', '빈티지 로고 후드집업 아이보리', 79000, 0, 'product/pho13.png', 'S,M,L,XL', 'IVORY', '그래픽,스웻', 66, 28),
  (14, 'top-knit', '네이비 하프집업 니트', 85000, 5, 'product/pho14.jpg', 'S,M,L', 'NAVY', '보온성', 64, 27),
  (15, 'outer-hoodzip', '빈티지 로고 후드집업 올리브', 79000, 0, 'product/pho15.png', 'S,M,L,XL', 'OLIVE', '그래픽,스웻', 62, 26),
  (16, 'top-longtee', '유넥 긴팔 티셔츠 블루', 29000, 0, 'product/pho16.jpg', 'S,M,L', 'BLUE', '코튼,스트레치', 60, 25),
  (17, 'top-longtee', '유넥 긴팔 티셔츠 그레이', 29000, 0, 'product/pho17.jpg', 'S,M,L', 'GREY', '코튼,스트레치', 58, 24),
  (18, 'top-knit', '세일러 카라 하프집업 니트', 89000, 10, 'product/pho18.jpg', 'S,M,L', 'BEIGE', '보온성', 56, 23),
  (19, 'bottom-short', '스트링 스웨트 숏팬츠 블루', 25900, 0, 'product/pho19.jpg', 'S,M,L', 'BLUE', '스웻,코튼', 54, 22),
  (20, 'top-longtee', '헨리넥 골지 긴팔 티셔츠', 35000, 0, 'product/pho20.jpg', 'S,M,L', 'NAVY', '스트레치,코튼', 52, 21),
  (21, 'top-sleeveless', '베이직 탱크탑 화이트', 19000, 0, 'product/pho21.jpg', 'S,M,L', 'WHITE', '코튼,냉감', 50, 20),
  (22, 'top-shorttee', '빈티지 그래픽 반팔 티셔츠', 32000, 10, 'product/pho22.jpg', 'S,M,L', 'IVORY', '그래픽,코튼', 48, 19),
  (23, 'top-shirt', '오버핏 체크 셔츠', 59000, 0, 'product/pho23.jpg', 'M,L,XL', 'GREY', '셔츠,워싱', 46, 18),
  (24, 'top-shorttee', '레이어드 반팔 티셔츠 스카이블루', 35000, 0, 'product/pho24.jpg', 'S,M,L', 'SKYBLUE', '코튼', 44, 17),
  (25, 'top-shirt', '오버핏 코튼 셔츠 화이트', 49000, 5, 'product/pho25.jpg', 'S,M,L,XL', 'WHITE', '셔츠,코튼', 42, 16),
  (26, 'top-sleeveless', '컨트라스트 캐미솔 스카이', 22000, 0, 'product/pho26.jpg', 'S,M', 'SKYBLUE', '냉감', 40, 15),
  (28, 'bottom-skirt', '플리츠 미니 스커트 차콜', 45000, 0, 'product/pho28.jpg', 'S,M,L', 'CHARCOAL', '스트레치', 36, 14),
  (29, 'bottom-sweat', '코튼 스웨트 팬츠 아이보리', 45000, 0, 'product/pho29.jpg', 'S,M,L,XL', 'IVORY', '스웻,코튼', 34, 13),
  (30, 'bottom-sweat', '와이드 스웨트 팬츠 그레이', 49000, 10, 'product/pho30.png', 'S,M,L,XL', 'GREY', '스웻,코튼', 32, 12),
  (31, 'bottom-denim', '스트레이트 데님 팬츠 딥블루', 69000, 0, 'product/pho31.jpg', 'S,M,L', 'DEEPBLUE', '데님,워싱', 30, 11),
  (32, 'bottom-skirt', '스트링 롱 스커트 블랙', 49000, 0, 'product/pho32.jpg', 'S,M,L', 'BLACK', '스웻', 28, 10),
  (33, 'bottom-sweat', '사이드 라인 트랙 팬츠', 55000, 5, 'product/pho33.jpg', 'S,M,L', 'BLACK', '스트라이프,경량', 26, 9),
  (34, 'bottom-sweat', '조거 스웨트 팬츠 네이비', 49000, 0, 'product/pho34.jpg', 'S,M,L', 'NAVY', '스웻,코튼', 24, 8),
  (35, 'bottom-denim', '와이드 데님 팬츠 블랙', 72000, 0, 'product/pho35.jpg', 'S,M,L,XL', 'BLACK', '데님', 22, 7),
  (36, 'outer-fleece', '하프집업 플리스 버건디', 99000, 15, 'catebest/pho1.jpg', 'S,M,L,XL', 'BURGUNDY', '보온성', 100, 6),
  (37, 'top-shirt', '윈드체크 오버 셔츠 레드', 69000, 0, 'catebest/pho2.jpg', 'S,M,L,XL', 'RED', '셔츠,코튼', 98, 6),
  (38, 'outer-padding', '시어링 카라 다운 재킷 아이보리', 199000, 10, 'catebest/pho3.jpg', 'S,M,L', 'IVORY', '보온성,경량', 96, 6),
  (39, 'outer-jacket', '퍼 후드 봄버 재킷 카키', 189000, 5, 'catebest/pho4.jpg', 'S,M,L', 'KHAKI', '보온성', 94, 6),
  (40, 'outer-cardigan', '라운드 버튼 가디건 아이보리', 79000, 0, 'catebest/pho5.jpg', 'S,M,L', 'IVORY', '코튼', 92, 6),
  (41, 'bottom-long', '와플 와이드 팬츠 아이보리', 65000, 0, 'catebest/pho6.jpg', 'S,M,L', 'IVORY', '스웻', 91, 6),
  (42, 'outer-vest', '시어링 카라 다운 베스트', 129000, 10, 'catebest/pho7.jpg', 'S,M,L', 'IVORY', '보온성,경량', 89, 6),
  (43, 'top-hoodie', '코튼 라글란 맨투맨', 59000, 0, 'catebest/pho8.jpg', 'S,M,L,XL', 'IVORY', '스웻,코튼', 87, 6),
  (44, 'top-longtee', '멀티 스트라이프 긴팔 티셔츠', 39000, 0, 'main/NewIn/pro1.jpg', 'S,M,L', 'NAVY', '스트라이프,코튼', 20, 0),
  (45, 'bottom-long', '나일론 카고 팬츠 베이지', 69000, 0, 'main/NewIn/pro2.jpg', 'S,M,L', 'BEIGE', '경량,생활방수', 18, 1),
  (46, 'bottom-long', '코튼 플레어 팬츠 아이보리', 59000, 10, 'main/NewIn/pro3.jpg', 'S,M,L', 'IVORY', '스트레치,코튼', 16, 2),
  (47, 'outer-jacket', '컬러블록 코듀로이 패딩 셔켓', 199000, 0, 'main/NewIn/pro4.jpg', 'S,M,L,XL', 'BEIGE', '보온성', 14, 3)
), ins as (
  insert into public.products (product_id, category_id, name, price, discount_rate, main_image_url, description, stock, popularity_score, created_at)
  select s.id, c.category_id, s.name, s.price, s.rate, s.img, s.name || ' 샘플 상품입니다.', 30, s.pop, now() - make_interval(days => s.ago)
  from src s join public.categories c on c.slug = s.slug
  on conflict (product_id) do nothing returning product_id
), img as (
  insert into public.product_images (product_id, image_url, sort_order) select id, img, 0 from src
  on conflict (product_id, image_url) do nothing returning 1
), sizes as (
  insert into public.product_options (product_id, option_type, option_value, sort_order)
  select s.id, 'size', v, o from src s, unnest(string_to_array(s.sizes, ',')) with ordinality u (v, o)
  on conflict (product_id, option_type, option_value) do nothing returning 1
), colors as (
  insert into public.product_options (product_id, option_type, option_value, sort_order)
  select s.id, 'color', v, o from src s, unnest(string_to_array(s.colors, ',')) with ordinality u (v, o)
  on conflict (product_id, option_type, option_value) do nothing returning 1
)
insert into public.product_keywords (product_id, keyword_id)
select s.id, k.keyword_id from src s, unnest(string_to_array(s.kw, ',')) u (v) join public.keywords k on k.name = u.v
on conflict (product_id, keyword_id) do nothing;

-- Sub thumbnails
insert into public.product_images (product_id, image_url, sort_order) values
  (3, 'product/pho10.png', 1), (10, 'product/pho3.jpg', 1), (13, 'product/pho15.png', 1), (15, 'product/pho13.png', 1),
  (16, 'product/pho17.jpg', 1), (17, 'product/pho16.jpg', 1), (19, 'product/pho21.jpg', 1), (21, 'product/pho19.jpg', 1),
  (24, 'product/pho27.jpg', 1), (32, 'product/pho27.jpg', 1)
on conflict (product_id, image_url) do nothing;

-- Sample rankings entered by hand (no sales formula)
insert into public.product_rankings (ranking_type, category_id, rank, product_id)
select 'weekly_best', c, r, p from (values
  (1, array[38,39,36,13,15,40,47,42,12]::bigint[]), (2, array[1,2,3,5,9,10,14,11,18,16]::bigint[]),
  (3, array[31,30,29,32,33,34,35,28,19,41]::bigint[]), (4, array[4,6,7,8]::bigint[])
) d (c, ids), unnest(ids) with ordinality u (p, r)
on conflict (ranking_type, category_id, rank) do nothing;

insert into public.product_rankings (ranking_type, category_id, rank, product_id)
select 'category_best', c, r, p from (values
  (1, array[36,38,39,40,42,47,13,15]::bigint[]), (2, array[37,43,2,18,22,44,25,23]::bigint[]),
  (3, array[41,45,46,31,30,29,32,35]::bigint[]), (4, array[4,6,7,8]::bigint[])
) d (c, ids), unnest(ids) with ordinality u (p, r)
on conflict (ranking_type, category_id, rank) do nothing;

insert into public.collections (collection_id, name, image_url, sort_order) values
  (1, 'Snow Teddy', 'main/collection/photo1.jpg', 1), (2, '플리스 시리즈', 'main/collection/photo2.jpg', 2),
  (3, '산리오 X NewChild', 'main/collection/photo1.jpg', 3), (4, 'YourColor Project', 'main/collection/photo2.jpg', 4)
on conflict (collection_id) do nothing;

insert into public.collection_products (collection_id, product_id, sort_order)
select c, p, o from (values
  (1, array[38,42,40,36,39,47]::bigint[]), (2, array[36,13,15,43,14,18]::bigint[]),
  (3, array[22,13,16,24,26,44]::bigint[]), (4, array[2,16,11,19,26,18]::bigint[])
) d (c, ids), unnest(ids) with ordinality u (p, o)
on conflict (collection_id, product_id) do nothing;

insert into public.coupons (coupon_id, coupon_code, name, min_purchase_amount, discount_type, discount_value, is_first_purchase_only) values
  (1, 'WELCOME3000', '신규회원 3,000원 할인쿠폰', 0, 'fixed', 3000, false),
  (2, 'FIRST10', '첫 구매 10% 할인쿠폰', 0, 'percent', 10, true),
  (3, 'TEST_A', '[테스트] 5% 할인쿠폰 A', 30000, 'percent', 5, false),
  (4, 'TEST_B', '[테스트] 5% 할인쿠폰 B', 30000, 'percent', 5, false),
  (5, 'TEST_C', '[테스트] 2,000원 할인쿠폰 C', 20000, 'fixed', 2000, false),
  (6, 'TEST_D', '[테스트] 2,000원 할인쿠폰 D', 20000, 'fixed', 2000, false)
on conflict (coupon_id) do nothing;

select setval(pg_get_serial_sequence('public.categories', 'category_id'), 100, true);
select setval(pg_get_serial_sequence('public.products', 'product_id'), 1000, true);
select setval(pg_get_serial_sequence('public.keywords', 'keyword_id'), 100, true);
select setval(pg_get_serial_sequence('public.collections', 'collection_id'), 100, true);
select setval(pg_get_serial_sequence('public.coupons', 'coupon_id'), 100, true);

-- Demo member for checking My Page. Every payment below is a mock.
do $$
declare v_user bigint; v_order bigint; v_fee integer; r record;
begin
  if exists (select 1 from public.users where login_id = 'testuser01') then return; end if;
  insert into public.users (login_id, name, phone_landline, phone_mobile, email, address, birth_date, points, sms_opt_in, email_opt_in, lifetime_member_agreed, required_terms_agreed_at)
  values ('testuser01', '홍길동', '02-000-0000', '010-0000-0000', 'testuser01@example.com', '서울특별시 테스트구 샘플로 1', '2000-01-01', 16336, true, false, true, now())
  returning user_id into v_user;
  insert into private.user_credentials (user_id, password_hash) values (v_user, extensions.crypt('Test1234!', extensions.gen_salt('bf', 10)));
  insert into public.user_coupons (user_id, coupon_id, expires_at)
  select v_user, c, now() + interval '30 days' from unnest(array[1,2,3,4,5,6]) c;
  insert into public.user_addresses (user_id, address_name, receiver_name, phone_landline, phone_mobile, address) values
    (v_user, '집', '홍길동', '02-000-0000', '010-0000-0000', '서울특별시 테스트구 샘플로 1'),
    (v_user, '회사', '홍길동', null, '010-0000-0000', '서울특별시 테스트구 예시대로 2');
  insert into public.wishlist_items (user_id, product_id) select v_user, p from unnest(array[1,2,8,13,31,36,38]::bigint[]) p;
  insert into public.reviews (user_id, product_id, rating, content, created_at)
  select v_user, p, 3 + (p % 3)::int, '[테스트] 샘플 리뷰입니다.', now() - make_interval(days => p::int)
  from unnest(array[2,8,13,31,36,38,4]::bigint[]) p;
  insert into public.qna_posts (user_id, product_id, title, created_at)
  select v_user, p, '[테스트] 사이즈 문의드립니다.', now() - make_interval(days => p::int)
  from unnest(array[1,5,9,14,22,30]::bigint[]) p;

  for r in select * from (values
    (1, 38, 'preparing', 1, 179100), (2, 2, 'preparing', 5, 62100), (3, 31, 'shipping', 10, 69000), (4, 8, 'shipping', 20, 71200),
    (5, 13, 'delivered', 40, 79000), (6, 36, 'delivered', 70, 84150), (7, 21, 'pending_payment', 0, 19000)
  ) d (n, product, st, ago, amount) loop
    insert into public.orders (order_number, user_id, orderer_name, orderer_email, orderer_phone, receiver_name, receiver_phone, receiver_address, order_status, terms_agreed_at, ordered_at, delivered_at)
    values ('20260101-90000' || r.n, v_user, '홍길동', 'testuser01@example.com', '010-0000-0000', '홍길동', '010-0000-0000', '서울특별시 테스트구 샘플로 1',
      r.st, now(), now() - make_interval(days => r.ago), case when r.st = 'delivered' then now() - make_interval(days => r.ago - 3) end)
    returning order_id into v_order;
    insert into public.order_items (order_id, product_id, product_name, image_url, size, color, quantity, unit_price)
    select v_order, p.product_id, p.name, p.main_image_url, 'M', (select option_value from public.product_options o where o.product_id = p.product_id and o.option_type = 'color' limit 1), 1, p.sale_price
    from public.products p where p.product_id = r.product;
    v_fee := case when r.amount >= 30000 then 0 else 2500 end;
    insert into public.payments (payment_number, order_id, pay_method, pay_status, is_mock, paid_at, total_product_amount, discount_amount, shipping_fee, shipping_fee_status, final_amount, earned_points)
    values ('MOCK-DEMO-' || r.n, v_order, case when r.st = 'pending_payment' then 'bank_transfer' else 'card' end,
      case when r.st = 'pending_payment' then 'pending' else 'mock_paid' end, true,
      case when r.st <> 'pending_payment' then now() - make_interval(days => r.ago) end, r.amount, 0, v_fee,
      case when v_fee = 0 then 'free' else 'charged' end, r.amount + v_fee, (r.amount + v_fee) * 3 / 100);
    if r.n in (5, 6) then
      insert into public.order_claims (order_id, claim_type, claim_status) values (v_order, case r.n when 5 then 'exchange' else 'return' end, '[테스트] 접수');
    end if;
    insert into public.point_transactions (user_id, order_id, amount, point_status, description, created_at)
    values (v_user, v_order, (r.amount + v_fee) * 3 / 100, case when r.st = 'pending_payment' then 'unavailable' else 'available' end, '[테스트] 샘플 적립 내역', now() - make_interval(days => r.ago));
  end loop;
end $$;
