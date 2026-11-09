import { createTheme } from '@mui/material/styles';

export const COLORS = {
  primary: '#ffba08',
  sub: '#ebebeb',
  accent: '#e85d04',
  text: '#333',
  muted: '#b6b6b7',
};

const theme = createTheme({
  palette: {
    primary: { main: COLORS.primary, contrastText: COLORS.text },
    secondary: { main: COLORS.sub, contrastText: COLORS.text },
    text: { primary: COLORS.text },
  },
  typography: {
    fontFamily: '"Pretendard Variable", Pretendard, -apple-system, "Malgun Gothic", sans-serif',
    button: { textTransform: 'none' },
  },
  shape: { borderRadius: 0 },
  components: {
    MuiButtonBase: { defaultProps: { disableRipple: true } },
  },
});

export default theme;
