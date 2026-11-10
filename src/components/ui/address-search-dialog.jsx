import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const POSTCODE_SCRIPT = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

let scriptPromise = null;

/** 카카오(다음) 우편번호 서비스 스크립트를 한 번만 불러온다. */
const loadPostcodeScript = () => {
  if (window.daum?.Postcode) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = POSTCODE_SCRIPT;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error('주소 검색 서비스를 불러오지 못했습니다.'));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
};

/**
 * AddressSearchDialog 컴포넌트 (우편번호·주소 검색 레이어 팝업)
 *
 * Props:
 * @param {boolean} isOpen - 팝업 노출 여부 [Required]
 * @param {function} onClose - 팝업 닫기 시 실행 [Required]
 * @param {function} onSelect - 주소 선택 시 실행({ zipcode, address } 전달) [Required]
 *
 * Example usage:
 * <AddressSearchDialog isOpen={ isOpen } onClose={ close } onSelect={ handleSelect } />
 */
function AddressSearchDialog({ isOpen, onClose, onSelect }) {
  const [error, setError] = useState('');

  const embedRef = useCallback((node) => {
    if (!node) return;
    setError('');
    loadPostcodeScript()
      .then(() => {
        new window.daum.Postcode({
          width: '100%',
          height: '100%',
          oncomplete: (data) => {
            const extras = [data.bname, data.buildingName].filter(Boolean).join(', ');
            const base = data.userSelectedType === 'J' ? data.jibunAddress : data.roadAddress;
            onSelect({
              zipcode: data.zonecode,
              address: data.userSelectedType === 'R' && extras ? `${ base } (${ extras })` : base,
            });
          },
        }).embed(node);
      })
      .catch((loadError) => setError(`${ loadError.message } 우편번호와 주소를 직접 입력해 주세요.`));
  }, [onSelect]);

  return (
    <Dialog open={ isOpen } onClose={ onClose } maxWidth={ false } aria-label="주소 검색">
      <Box sx={ { width: 500, maxWidth: '100%' } }>
        <Box sx={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: '1px solid #eee' } }>
          <Box component="h2" sx={ { m: 0, fontSize: 17, fontWeight: 700 } }>주소 검색</Box>
          <IconButton aria-label="닫기" onClick={ onClose } size="small"><CloseIcon /></IconButton>
        </Box>
        { error
          ? <Box role="alert" sx={ { p: 3, fontSize: 14, color: 'error.main' } }>{ error }</Box>
          : <Box ref={ embedRef } sx={ { height: 470 } } /> }
      </Box>
    </Dialog>
  );
}

export default AddressSearchDialog;
