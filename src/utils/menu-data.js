/** GNB 메뉴 구조. slug는 DB categories.slug와 일치한다. */
export const GNB_MENUS = [
  { label: 'NEW', to: '/category/new', subs: [] },
  { label: 'BEST', to: '/category/best', subs: [] },
  {
    label: '아우터',
    slug: 'outer',
    to: '/category/outer',
    subs: [
      { label: '전체' },
      { label: '패딩/다운', slug: 'outer-padding' },
      { label: '플리스/덤블', slug: 'outer-fleece' },
      { label: '재킷/점퍼', slug: 'outer-jacket' },
      { label: '코트', slug: 'outer-coat' },
      { label: '가디건', slug: 'outer-cardigan' },
      { label: '베스트', slug: 'outer-vest' },
      { label: '후드집업', slug: 'outer-hoodzip' },
    ],
  },
  {
    label: '상의',
    slug: 'top',
    to: '/category/top',
    subs: [
      { label: '전체' },
      { label: '후디/맨투맨', slug: 'top-hoodie' },
      { label: '니트/스웨터', slug: 'top-knit' },
      { label: '셔츠/블라우스', slug: 'top-shirt' },
      { label: '긴팔 티셔츠', slug: 'top-longtee' },
      { label: '반팔 티셔츠', slug: 'top-shorttee' },
      { label: '슬리브리스', slug: 'top-sleeveless' },
    ],
  },
  {
    label: '하의',
    slug: 'bottom',
    to: '/category/bottom',
    subs: [
      { label: '전체' },
      { label: '스커트', slug: 'bottom-skirt' },
      { label: '데님 팬츠', slug: 'bottom-denim' },
      { label: '스웨트 팬츠', slug: 'bottom-sweat' },
      { label: '롱팬츠', slug: 'bottom-long' },
      { label: '숏팬츠', slug: 'bottom-short' },
    ],
  },
  {
    label: '원피스',
    slug: 'dress',
    to: '/category/dress',
    subs: [
      { label: '전체' },
      { label: '롱원피스', slug: 'dress-long' },
      { label: '미디원피스', slug: 'dress-midi' },
      { label: '숏원피스', slug: 'dress-short' },
    ],
  },
  {
    label: '액세서리',
    slug: 'acc',
    to: '/category/acc',
    subs: [
      { label: '전체' },
      { label: '가방', slug: 'acc-bag' },
      { label: '모자', slug: 'acc-hat' },
      { label: '양말', slug: 'acc-socks' },
      { label: '패션잡화', slug: 'acc-goods' },
    ],
  },
  { label: 'COLLECTION', to: '/collection', subs: [] },
];

export const MAIN_CATEGORIES = GNB_MENUS.filter((menu) => menu.slug);

export const subLink = (menu, sub) => (sub.slug ? `${ menu.to }?sub=${ sub.slug }` : menu.to);
