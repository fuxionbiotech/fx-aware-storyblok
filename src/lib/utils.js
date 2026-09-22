import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

// Espejo de formatRelativeTime en fx-aware-web-app (src/shared/utils/formatters.ts),
// hardcodeado en español ya que este proyecto no tiene i18n.
export function formatRelativeTime(dateString) {
	if (!dateString) return '';

	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return '';

	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays <= 0) return 'Hoy';
	if (diffDays === 1) return 'Ayer';
	if (diffDays < 7) return `Hace ${diffDays} días`;

	const diffWeeks = Math.floor(diffDays / 7);
	if (diffWeeks < 5) return `Hace ${diffWeeks} semana${diffWeeks === 1 ? '' : 's'}`;

	const diffMonths = Math.floor(diffDays / 30);
	if (diffMonths < 12) return `Hace ${diffMonths} mes${diffMonths === 1 ? '' : 'es'}`;

	const diffYears = Math.floor(diffDays / 365);
	return `Hace ${diffYears} año${diffYears === 1 ? '' : 's'}`;
}
