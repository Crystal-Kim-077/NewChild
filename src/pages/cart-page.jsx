import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import CartOptionDialog from '../components/cart/cart-option-dialog.jsx';
import CartRow from '../components/cart/cart-row.jsx';
import CartSummary from '../components/cart/cart-summary.jsx';
import { useShop } from '../hooks/use-shop.js';
import { removeCartItems, updateCartItem } from '../utils/api.js';

const textButtonSx = { fontSize: '14pt', fontWeight: 700, color: '#333', textDecoration: 'underline' };

/** 장바구니 페이지. 변경 내용은 즉시 서버에 저장한다. */
function CartPage() {
  const { cartItems, refreshCart, showToast, startCheckout } = useShop();
  const [selectedIds, setSelectedIds] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  /** 사용자가 선택을 바꾸기 전까지(null)는 전체 선택 상태다. */
  const allIds = cartItems.map((item) => item.cart_item_id);
  const selected = selectedIds === null ? allIds : selectedIds.filter((id) => allIds.includes(id));
  const selectedItems = cartItems.filter((item) => selected.includes(item.cart_item_id));
  const isAllSelected = cartItems.length > 0 && selected.length === cartItems.length;

  const run = async (action) => {
    try {
      await action();
    } catch (error) {
      showToast(error.message);
    }
    await refreshCart();
  };

  const toggleItem = (id) => setSelectedIds(selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id]);
  const toggleAll = () => setSelectedIds(isAllSelected ? [] : allIds);

  const handleQuantity = (item, quantity) => run(() => updateCartItem({ cartItemId: item.cart_item_id, size: item.size, color: item.color, quantity }));

  const handleOptionSave = (size, color) => {
    const target = editingItem;
    setEditingItem(null);
    run(() => updateCartItem({ cartItemId: target.cart_item_id, size, color, quantity: target.quantity }));
  };

  const handleOrder = (items) => {
    if (!items.length) {
      showToast('주문할 상품을 선택해 주세요.');
      return;
    }
    startCheckout({
      items: items.map(({ product_id: productId, size, color, quantity }) => ({ product_id: productId, size, color, quantity })),
      cartItemIds: items.map((item) => item.cart_item_id),
    }, '/cart');
  };

  return (
    <Box sx={ { px: '100px', pt: '60px', pb: '120px', maxWidth: 1720, mx: 'auto' } }>
      <Box component="h1" sx={ { m: 0, fontSize: '32pt', fontWeight: 700, color: '#333', textAlign: 'center', mb: '60px' } }>장바구니</Box>
      { cartItems.length === 0 ? (
        <Box sx={ { py: 12, textAlign: 'center', fontSize: 16, color: '#777' } }>
          장바구니에 담긴 상품이 없습니다.
          <Box component={ RouterLink } to="/" sx={ { display: 'block', mt: 2, textDecoration: 'underline', color: '#333' } }>쇼핑하러 가기</Box>
        </Box>
      ) : (
        <>
          <ButtonBase onClick={ toggleAll } sx={ { ...textButtonSx, mb: 2 } }>전체 선택</ButtonBase>
          <Box sx={ { borderBottom: '1px solid', borderColor: 'secondary.main' } }>
            { cartItems.map((item) => (
              <CartRow
                key={ item.cart_item_id }
                item={ item }
                isSelected={ selected.includes(item.cart_item_id) }
                onToggle={ () => toggleItem(item.cart_item_id) }
                onQuantity={ (quantity) => handleQuantity(item, quantity) }
                onEditOption={ () => setEditingItem(item) }
              />
            )) }
          </Box>
          <Box sx={ { display: 'flex', gap: '15px', mt: 2 } }>
            <ButtonBase sx={ textButtonSx } onClick={ () => run(() => removeCartItems(selected)) }>선택한 상품 삭제</ButtonBase>
            <ButtonBase sx={ textButtonSx } onClick={ () => run(() => removeCartItems(null)) }>장바구니 비우기</ButtonBase>
          </Box>
          <CartSummary
            selectedItems={ selectedItems }
            onOrderSelected={ () => handleOrder(selectedItems) }
            onOrderAll={ () => handleOrder(cartItems) }
          />
        </>
      ) }
      { editingItem && <CartOptionDialog item={ editingItem } onClose={ () => setEditingItem(null) } onSave={ handleOptionSave } /> }
    </Box>
  );
}

export default CartPage;
