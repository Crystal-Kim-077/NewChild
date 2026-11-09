import InputBase from '@mui/material/InputBase';

/**
 * SoftField 컴포넌트 (회색 배경 입력 필드)
 *
 * Props:
 * @param {string} value - 입력값 [Required]
 * @param {function} onChange - 값 변경 시 실행(문자열 전달) [Required]
 * @param {string} placeholder - 플레이스 홀더 [Optional]
 * @param {string} type - input 타입 [Optional, 기본값: text]
 * @param {boolean} isDisabled - 수정 불가 여부 [Optional, 기본값: false]
 * @param {string} fontSize - 글자 크기 [Optional, 기본값: 14pt]
 * @param {string} autoComplete - 자동완성 힌트 [Optional]
 *
 * Example usage:
 * <SoftField value={ id } onChange={ setId } placeholder="ID" />
 */
function SoftField({ value, onChange, placeholder, type = 'text', isDisabled = false, fontSize = '14pt', autoComplete }) {
  return (
    <InputBase
      fullWidth
      value={ value }
      type={ type }
      disabled={ isDisabled }
      placeholder={ placeholder }
      autoComplete={ autoComplete }
      onChange={ (event) => onChange(event.target.value) }
      slotProps={ { input: { 'aria-label': placeholder } } }
      sx={ {
        height: 50,
        px: 1.5,
        bgcolor: isDisabled ? '#e4e4e4' : '#f2f2f2',
        borderRadius: '4px',
        fontSize,
        '& input::placeholder': { color: '#8a8a8a', opacity: 1 },
      } }
    />
  );
}

export default SoftField;
