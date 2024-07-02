import React from 'react';
import { ThemeProvider } from 'styled-components';

const theme = {
	colors: {
		brand: '#6ACA5F',
		brandDark: '#59C36A',
		brandLight: '#97DE3D',
		dark: '#27252F',
		light: '#FFFFFF',
		text: {
			brand: '#79CF51',
			// dark: '#383645',
			dark: '#4C4A5D',
			light: '#FFFFFF',
		},
	},
};

interface ThemeProps {
	children?: React.ReactNode;
}
const Theme: React.FC<ThemeProps> = ({ children }) => (
	<ThemeProvider theme={theme}>{children}</ThemeProvider>
);

export default Theme;
