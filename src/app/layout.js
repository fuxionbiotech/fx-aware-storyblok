import './globals.css';
import StoryblokProvider from '@/components/StoryblokProvider';

export const metadata = {
	title: 'Aware',
	description: 'Aware content screens',
};

export default function RootLayout({ children }) {
	return (
		<StoryblokProvider>
			<html lang="es">
				<body className="min-h-dvh bg-background antialiased">
					{children}
				</body>
			</html>
		</StoryblokProvider>
	);
}
