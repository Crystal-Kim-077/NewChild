import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import LabeledField from '../components/ui/labeled-field.jsx';
import SoftField from '../components/ui/soft-field.jsx';
import TestNotice from '../components/ui/test-notice.jsx';
import { useShop } from '../hooks/use-shop.js';
import { checkLoginId, signUp } from '../utils/api.js';

const EMPTY_FORM = {
  name: '', login_id: '', password: '', passwordConfirm: '', email: '', phone_landline: '', phone_mobile: '', address: '', birth_date: '',
};
const TERMS = [
  { key: 'service', label: '[필수] 이용약관 동의' },
  { key: 'privacy', label: '[필수] 개인정보 수집 및 이용 동의' },
  { key: 'marketing', label: '[선택] 마케팅 정보 수신 동의(SMS, 이메일)' },
];

/** 이메일 회원가입 정보 입력 페이지. */
function SignupFormPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { afterAuth } = useShop();
  const next = params.get('next') ?? '/';
  const [form, setForm] = useState(EMPTY_FORM);
  const [checkedId, setCheckedId] = useState('');
  const [idMessage, setIdMessage] = useState('');
  const [isLifetime, setIsLifetime] = useState(false);
  const [terms, setTerms] = useState({ service: false, privacy: false, marketing: false });
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const isAllTerms = TERMS.every(({ key }) => terms[key]);
  const field = (key) => ({ value: form[key], onChange: (value) => setForm({ ...form, [key]: value }), fontSize: '12pt' });

  const handleCheckId = async () => {
    if (!/^[A-Za-z0-9_]{4,20}$/.test(form.login_id)) {
      setIdMessage('아이디는 영문, 숫자, _ 조합 4~20자로 입력해 주세요.');
      return;
    }
    try {
      const isAvailable = await checkLoginId(form.login_id);
      setCheckedId(isAvailable ? form.login_id : '');
      setIdMessage(isAvailable ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.');
    } catch (requestError) {
      setIdMessage(requestError.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (checkedId !== form.login_id || !checkedId) {
      setError('아이디 중복확인을 해 주세요.');
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    if (!terms.service || !terms.privacy) {
      setError('필수 약관에 동의해 주세요.');
      return;
    }
    setIsBusy(true);
    setError('');
    try {
      /** 비밀번호 확인값은 서버로 보내지 않는다. */
      const payload = { ...form };
      delete payload.passwordConfirm;
      const session = await signUp({
        ...payload,
        lifetime_member_agreed: isLifetime,
        required_terms_agreed: true,
        optional_terms_agreed: terms.marketing,
      });
      await afterAuth(session);
      navigate(`/welcome?next=${ encodeURIComponent(next) }`);
    } catch (requestError) {
      setError(requestError.message);
      setIsBusy(false);
    }
  };

  return (
    <Box sx={ { pt: '70px', pb: '120px', display: 'flex', justifyContent: 'center' } }>
      <Box component="form" onSubmit={ handleSubmit } sx={ { width: 760, fontSize: 15 } }>
        <Box component="h1" sx={ { m: 0, textAlign: 'center', fontSize: '26pt', fontWeight: 700, mb: 3 } }>회원가입</Box>
        <Box sx={ { mb: 3 } }>
          <TestNotice>테스트용 가입입니다. 실제 개인정보를 입력하지 마세요.</TestNotice>
        </Box>
        <LabeledField label="이름" isRequired><SoftField { ...field('name') } autoComplete="name" /></LabeledField>
        <LabeledField label="아이디" isRequired hint={ idMessage }>
          <Box sx={ { display: 'flex', gap: 1 } }>
            <SoftField { ...field('login_id') } autoComplete="username" />
            <Button type="button" variant="outlined" color="inherit" onClick={ handleCheckId } sx={ { flexShrink: 0, width: 110, borderColor: '#333' } }>중복확인</Button>
          </Box>
        </LabeledField>
        <LabeledField label="이메일" isRequired><SoftField { ...field('email') } type="email" autoComplete="email" /></LabeledField>
        <LabeledField label="비밀번호" isRequired hint="영문 대소문자 및 특수문자 포함 8자 이상을 권장합니다."><SoftField { ...field('password') } type="password" autoComplete="new-password" /></LabeledField>
        <LabeledField label="비밀번호 확인" isRequired><SoftField { ...field('passwordConfirm') } type="password" autoComplete="new-password" /></LabeledField>
        <LabeledField label="일반전화"><SoftField { ...field('phone_landline') } /></LabeledField>
        <LabeledField label="휴대전화" isRequired><SoftField { ...field('phone_mobile') } /></LabeledField>
        <LabeledField label="기본 배송지"><SoftField { ...field('address') } /></LabeledField>
        <LabeledField label="생년월일"><SoftField { ...field('birth_date') } type="date" /></LabeledField>
        <LabeledField label="평생 회원">
          <FormControlLabel control={ <Checkbox checked={ isLifetime } onChange={ (event) => setIsLifetime(event.target.checked) } /> } label="평생 회원에 동의합니다" />
        </LabeledField>
        <Box sx={ { mt: 2, p: 2.5, bgcolor: '#f7f7f7' } }>
          <FormControlLabel
            control={ <Checkbox checked={ isAllTerms } onChange={ (event) => setTerms({ service: event.target.checked, privacy: event.target.checked, marketing: event.target.checked }) } /> }
            label={ <Box sx={ { fontWeight: 700 } }>전체 동의</Box> }
          />
          { TERMS.map(({ key, label }) => (
            <Box key={ key }>
              <FormControlLabel control={ <Checkbox checked={ terms[key] } onChange={ (event) => setTerms({ ...terms, [key]: event.target.checked }) } /> } label={ label } />
            </Box>
          )) }
        </Box>
        { error && <Box role="alert" sx={ { color: 'error.main', fontSize: 14, mt: 2 } }>{ error }</Box> }
        <Button type="submit" variant="contained" disableElevation fullWidth disabled={ isBusy } sx={ { height: 56, mt: 3, fontSize: 17, fontWeight: 700 } }>회원가입</Button>
      </Box>
    </Box>
  );
}

export default SignupFormPage;
