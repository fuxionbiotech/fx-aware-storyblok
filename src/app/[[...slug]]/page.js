import { notFound } from 'next/navigation';
import { StoryblokStory } from '@storyblok/react/rsc';
import { getStoryblokApi } from '@/lib/storyblok';

export default async function Page({ params }) {
	const { slug } = await params;

	let fullSlug = slug ? slug.join('/') : 'home';

	let sbParams = {
		version: 'draft',
		resolve_relations: [
			'content_carousel.items',
			'content_item.author',
			'content_item.related_content',
		].join(','),
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
