import { notFound } from 'next/navigation';
import { StoryblokStory, StoryblokServerComponent } from '@storyblok/react/rsc';
import { getStoryblokApi } from '@/lib/storyblok';

// Carpeta de niveles: son 5 stories separadas (aware/pro1/levels/pro1-1, ...),
// no una story propia. Se agregan acá para poder previsualizar la pantalla
// completa de una sola vez.
const PRO1_LEVELS_SLUG = 'aware/pro1/levels';

// Idiomas del space (ver Settings > Internationalization). Cuando el editor
// de Storyblok previsualiza en un idioma no-default, prefija la URL con el
// código (ej. /en/aware/pro1/intro) — sin esto, ese prefijo se trataria como
// parte del slug de la story y la busqueda en el CDN siempre fallaria.
const LANGUAGE_CODES = ['en'];

async function Pro1LevelsPage({ language }) {
	const storyblokApi = getStoryblokApi();

	const { data } = await storyblokApi.get('cdn/stories', {
		version: 'draft',
		starts_with: `${PRO1_LEVELS_SLUG}/`,
		...(language ? { language } : {}),
	});

	const stories = [...(data.stories || [])].sort(
		(a, b) => (a.content.sort_order || 0) - (b.content.sort_order || 0)
	);

	return (
		<div className="min-h-dvh w-full" style={{background: 'var(--pro1-bg-gradient)'}}>
			<main className="mx-auto flex max-w-200 flex-col items-center px-6 py-8">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src="/images/pro1/hero-levels.png"
					alt=""
					width={320}
					height={284}
					className="h-[80px] w-auto select-none"
					draggable={false}
				/>

				<h1 className="mt-[16px] text-center font-scandia text-[24px] font-bold leading-[32px] text-[var(--text-primary)] max-[660px]:text-[20px] max-[660px]:leading-[26px]">
					Gana más en cada Período FuXion
				</h1>
				<p className="mt-[4px] text-center font-outfit text-[14px] leading-[20px] text-[var(--text-secondary)]">
					Alcanza los 3 niveles y multiplica tus ganancias.
				</p>

				<div className="mt-[24px] flex w-full max-w-[580px] flex-col gap-[12px]">
					{stories.map((story) => (
						<StoryblokServerComponent blok={story.content} key={story.uuid} />
					))}
				</div>
			</main>
		</div>
	);
}

export default async function Page({ params }) {
	const { slug: rawSlug } = await params;
	const segments = rawSlug ?? [];

	const [maybeLanguage, ...rest] = segments;
	const language = LANGUAGE_CODES.includes(maybeLanguage) ? maybeLanguage : undefined;
	const pathSegments = language ? rest : segments;

	let fullSlug = pathSegments.length ? pathSegments.join('/') : 'home';

	if (fullSlug === PRO1_LEVELS_SLUG) {
		return <Pro1LevelsPage language={language} />;
	}

	let sbParams = {
		version: 'draft',
		resolve_relations: [
			'content_carousel.items',
			'content_item.author',
			'content_item.related_content',
		].join(','),
		...(language ? { language } : {}),
	};

	const storyblokApi = getStoryblokApi();

	let data;
	try {
		({ data } = await storyblokApi.get(`cdn/stories/${fullSlug}`, sbParams));
	} catch (error) {
		if (error?.status === 404) notFound();
		throw error;
	}

	return <StoryblokStory story={data.story} />;
}
