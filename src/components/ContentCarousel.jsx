import { storyblokEditable } from '@storyblok/react/rsc';
import ContentCard from './ContentCard';
import PodcastShowCard from './PodcastShowCard';
import PodcastEpisodeCard from './PodcastEpisodeCard';

const ContentCarousel = ({ blok }) => {
	const items = blok.items || [];
	const isHeroRow = blok.layout === 'hero';
	const isPodcastEpisodeRow = blok.layout === 'podcast_episode';

	const renderCard = (item) => {
		const key = item?.uuid || item?.id || item;
		if (item?.content?.component === 'podcast_show') {
			return <PodcastShowCard key={key} story={item} />;
		}
		if (isPodcastEpisodeRow) {
			return <PodcastEpisodeCard key={key} story={item} />;
		}
		return <ContentCard key={key} story={item} size={isHeroRow ? 'large' : 'default'} />;
	};

	return (
		<section {...storyblokEditable(blok)}>
			<div className="mb-3 flex items-center justify-between">
				<h2 className="text-base font-bold text-foreground">{blok.title}</h2>
				{blok.see_all_link?.url && (
					<a
						href={blok.see_all_link.cached_url || blok.see_all_link.url}
						className="text-sm font-medium text-primary"
					>
						Ver todo
					</a>
				)}
			</div>

			{/* El padding horizontal vive en el <main> (Page.jsx), no acá: el
			    padding en un contenedor con overflow-x no se respeta de forma
			    confiable cuando el contenido no necesita scroll. */}
			{isHeroRow ? (
				// Un solo item, ancho completo: nunca necesita scroll, así que se
				// renderiza sin overflow-x-auto — eso evita que se recorten cosas
				// como el box-shadow de la card (overflow-x distinto de "visible"
				// hace que el navegador también recorte el eje Y).
				items.map(renderCard)
			) : (
				<div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
					{items.map(renderCard)}
				</div>
			)}
		</section>
	);
};

export default ContentCarousel;
