import { assetUrl } from '@/lib/asset-url';

/**
 * Badge del nivel. Si el CMS trae `badge_image` es el logo de marca (imagen);
 * si trae `badge_label` es una píldora de texto (el Bono Formador de Pro's no
 * tiene logo). Mismo componente que Pro1LevelBadge.tsx en fx-aware-web-app.
 */
export default function Pro1LevelBadge({ blok }) {
	if (blok.badge_label) {
		return (
			<span className="inline-flex items-center rounded-full bg-[var(--green-text-color)] px-[10px] py-[3px] font-scandia text-[12px] font-bold uppercase leading-[16px] text-white">
				{blok.badge_label}
			</span>
		);
	}

	const badgeImageUrl = assetUrl(blok.badge_image);
	if (!badgeImageUrl) return null;

	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img src={badgeImageUrl} alt="" className="h-[22px] w-auto select-none" draggable={false} />
	);
}
