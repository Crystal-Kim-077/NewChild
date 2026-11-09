import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import MyTable from './my-table.jsx';
import LabeledField from '../ui/labeled-field.jsx';
import SoftField from '../ui/soft-field.jsx';
import { useShop } from '../../hooks/use-shop.js';
import { listAddresses, saveAddress } from '../../utils/api.js';

const FIELD_SIZE = '13pt';
const EMPTY_ADDRESS = { address_name: '', receiver_name: '', phone_landline: '', phone_mobile: '', address: '' };

/** 배송 주소록 목록과 등록/수정 폼. */
function MyAddressBook() {
  const { showToast } = useShop();
  const [addresses, setAddresses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;
    listAddresses()
      .then((rows) => {
        if (isActive) setAddresses(rows);
      })
      .catch((requestError) => {
        if (isActive) setError(requestError.message);
      });
    return () => {
      isActive = false;
    };
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      const { address_id: addressId = null, ...values } = editing;
      await saveAddress(addressId, values);
      setAddresses(await listAddresses());
      setEditing(null);
      setError('');
      showToast('배송지를 저장했습니다.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  if (editing) {
    const field = (key) => ({ value: editing[key] ?? '', onChange: (value) => setEditing({ ...editing, [key]: value }), fontSize: FIELD_SIZE });
    return (
      <Box component="form" onSubmit={ handleSave } sx={ { maxWidth: 800, mx: 'auto' } }>
        <LabeledField label="배송지명" isRequired><SoftField { ...field('address_name') } /></LabeledField>
        <LabeledField label="수령인" isRequired><SoftField { ...field('receiver_name') } /></LabeledField>
        <LabeledField label="일반전화"><SoftField { ...field('phone_landline') } /></LabeledField>
        <LabeledField label="휴대전화" isRequired><SoftField { ...field('phone_mobile') } /></LabeledField>
        <LabeledField label="주소" isRequired><SoftField { ...field('address') } /></LabeledField>
        { error && <Box role="alert" sx={ { color: 'error.main', my: 1 } }>{ error }</Box> }
        <Box sx={ { display: 'flex', justifyContent: 'center', gap: 1, mt: 3 } }>
          <Button type="button" variant="outlined" color="inherit" onClick={ () => setEditing(null) } sx={ { width: 160, height: 50, borderColor: '#333', fontSize: FIELD_SIZE } }>취소</Button>
          <Button type="submit" variant="contained" disableElevation sx={ { width: 160, height: 50, fontWeight: 700, fontSize: FIELD_SIZE } }>{ editing.address_id ? '수정' : '등록' }</Button>
        </Box>
      </Box>
    );
  }

  const columns = [
    {
      key: 'address_name',
      label: '배송지명',
      render: (row) => <ButtonBase onClick={ () => setEditing(row) } sx={ { fontSize: FIELD_SIZE, textDecoration: 'underline' } }>{ row.address_name }</ButtonBase>,
    },
    { key: 'receiver_name', label: '수령인' },
    { key: 'phone_landline', label: '일반전화', render: (row) => row.phone_landline ?? '-' },
    { key: 'phone_mobile', label: '휴대전화' },
    { key: 'address', label: '주소' },
  ];

  return (
    <Box>
      { error && <Box role="alert" sx={ { color: 'error.main', mb: 1.5 } }>{ error }</Box> }
      <MyTable columns={ columns } rows={ addresses } getRowKey={ (row) => row.address_id } emptyText="등록된 배송지가 없습니다." />
      <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 } }>
        <Box sx={ { color: '#777' } }>배송지는 최대 3개까지 등록할 수 있습니다.</Box>
        <Button variant="contained" disableElevation disabled={ addresses.length >= 3 } onClick={ () => setEditing(EMPTY_ADDRESS) } sx={ { fontSize: FIELD_SIZE, fontWeight: 700 } }>배송지 등록</Button>
      </Box>
    </Box>
  );
}

export default MyAddressBook;
