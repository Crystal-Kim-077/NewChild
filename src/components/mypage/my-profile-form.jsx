import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import LabeledField from '../ui/labeled-field.jsx';
import SoftField from '../ui/soft-field.jsx';
import { useShop } from '../../hooks/use-shop.js';
import { changePassword, updateProfile } from '../../utils/api.js';

const FIELD_SIZE = '13pt';
const labelSx = { '& .MuiFormControlLabel-label': { fontSize: FIELD_SIZE } };
const noop = () => {};

const optInRow = (isChecked, onChange) => (
  <Box sx={ { display: 'flex', gap: 2 } }>
    <FormControlLabel control={ <Checkbox checked={ isChecked } onChange={ () => onChange(true) } /> } label="수신" sx={ labelSx } />
    <FormControlLabel control={ <Checkbox checked={ !isChecked } onChange={ () => onChange(false) } /> } label="수신안함" sx={ labelSx } />
  </Box>
);

/** 회원정보 수정 폼. 아이디, 이름, 생년월일은 화면과 서버 모두에서 수정할 수 없다. */
function MyProfileForm() {
  const { user, refreshUser, showToast } = useShop();
  const [form, setForm] = useState({
    address: user.address ?? '',
    phone_landline: user.phone_landline ?? '',
    phone_mobile: user.phone_mobile ?? '',
    email: user.email ?? '',
    sms_opt_in: user.sms_opt_in,
    email_opt_in: user.email_opt_in,
  });
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const field = (key) => ({ value: form[key], onChange: (value) => setForm({ ...form, [key]: value }), fontSize: FIELD_SIZE });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== passwordConfirm) {
      setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    try {
      await updateProfile(form);
      if (password) await changePassword(password);
      await refreshUser();
      setError('');
      setPassword('');
      setPasswordConfirm('');
      showToast('회원정보를 수정했습니다.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <Box component="form" onSubmit={ handleSubmit } sx={ { maxWidth: 800, mx: 'auto' } }>
      <LabeledField label="아이디"><SoftField value={ user.login_id } onChange={ noop } isDisabled fontSize={ FIELD_SIZE } /></LabeledField>
      <LabeledField label="비밀번호" hint="영문 대소문자 및 특수문자 포함 8자 이상을 권장합니다. 변경할 때만 입력해 주세요.">
        <SoftField type="password" value={ password } onChange={ setPassword } autoComplete="new-password" fontSize={ FIELD_SIZE } />
      </LabeledField>
      <LabeledField label="비밀번호 확인"><SoftField type="password" value={ passwordConfirm } onChange={ setPasswordConfirm } autoComplete="new-password" fontSize={ FIELD_SIZE } /></LabeledField>
      <LabeledField label="이름"><SoftField value={ user.name } onChange={ noop } isDisabled fontSize={ FIELD_SIZE } /></LabeledField>
      <LabeledField label="주소"><SoftField { ...field('address') } /></LabeledField>
      <LabeledField label="일반전화"><SoftField { ...field('phone_landline') } /></LabeledField>
      <LabeledField label="휴대전화"><SoftField { ...field('phone_mobile') } /></LabeledField>
      <LabeledField label="SMS 수신여부">{ optInRow(form.sms_opt_in, (value) => setForm({ ...form, sms_opt_in: value })) }</LabeledField>
      <LabeledField label="이메일"><SoftField { ...field('email') } type="email" /></LabeledField>
      <LabeledField label="이메일 수신여부">{ optInRow(form.email_opt_in, (value) => setForm({ ...form, email_opt_in: value })) }</LabeledField>
      <LabeledField label="생년월일"><SoftField value={ user.birth_date ?? '' } onChange={ noop } isDisabled fontSize={ FIELD_SIZE } /></LabeledField>
      { error && <Box role="alert" sx={ { color: 'error.main', my: 1 } }>{ error }</Box> }
      <Box sx={ { textAlign: 'center', mt: 3 } }>
        <Button type="submit" variant="contained" disableElevation sx={ { width: 200, height: 50, fontSize: FIELD_SIZE, fontWeight: 700 } }>수정</Button>
      </Box>
    </Box>
  );
}

export default MyProfileForm;
