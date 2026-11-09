import { Route, Routes } from 'react-router-dom';
import ShopProvider from './components/common/shop-provider.jsx';
import SiteLayout from './components/common/site-layout.jsx';
import CartPage from './pages/cart-page.jsx';
import CategoryPage from './pages/category-page.jsx';
import CheckoutPage from './pages/checkout-page.jsx';
import CollectionPage from './pages/collection-page.jsx';
import FindAccountPage from './pages/find-account-page.jsx';
import GuestOrderPage from './pages/guest-order-page.jsx';
import LoginPage from './pages/login-page.jsx';
import MainPage from './pages/main-page.jsx';
import MyPage from './pages/my-page.jsx';
import OrderCompletePage from './pages/order-complete-page.jsx';
import SignupFormPage from './pages/signup-form-page.jsx';
import SignupPage from './pages/signup-page.jsx';
import SnsConsentPage from './pages/sns-consent-page.jsx';
import WelcomePage from './pages/welcome-page.jsx';

function App() {
  return (
    <ShopProvider>
      <Routes>
        <Route element={ <SiteLayout /> }>
          <Route index element={ <MainPage /> } />
          <Route path="category/:slug" element={ <CategoryPage /> } />
          <Route path="collection" element={ <CollectionPage /> } />
          <Route path="cart" element={ <CartPage /> } />
          <Route path="checkout" element={ <CheckoutPage /> } />
          <Route path="order-complete" element={ <OrderCompletePage /> } />
          <Route path="login" element={ <LoginPage /> } />
          <Route path="signup" element={ <SignupPage /> } />
          <Route path="signup/form" element={ <SignupFormPage /> } />
          <Route path="sns-consent/:provider" element={ <SnsConsentPage /> } />
          <Route path="welcome" element={ <WelcomePage /> } />
          <Route path="find-account" element={ <FindAccountPage /> } />
          <Route path="guest-order" element={ <GuestOrderPage /> } />
          <Route path="mypage" element={ <MyPage /> } />
          <Route path="*" element={ <MainPage /> } />
        </Route>
      </Routes>
    </ShopProvider>
  );
}

export default App;
