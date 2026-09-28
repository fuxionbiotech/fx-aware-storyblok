import Page from '@/components/Page';
import Feature from '@/components/Feature';
import Grid from '@/components/Grid';
import Teaser from '@/components/Teaser';
import Author from '@/components/Author';
import ContentItem from '@/components/ContentItem';
import ContentCarousel from '@/components/ContentCarousel';
import PodcastShow from '@/components/PodcastShow';
import Pro1Intro from '@/components/Pro1Intro';
import Pro1Level from '@/components/Pro1Level';
import { apiPlugin, storyblokInit } from '@storyblok/react/rsc';

export const getStoryblokApi = storyblokInit({
	accessToken: process.env.STORYBLOK_DELIVERY_API_TOKEN,
	use: [apiPlugin],
	components: {
		page: Page,
		feature: Feature,
		grid: Grid,
		teaser: Teaser,
		author: Author,
		content_item: ContentItem,
		content_carousel: ContentCarousel,
		podcast_show: PodcastShow,
		pro1_intro: Pro1Intro,
		pro1_level: Pro1Level,
	},
	apiOptions: {
		/** Set the correct region for your space. Learn more: https://www.storyblok.com/docs/packages/storyblok-js#example-region-parameter */
		region: process.env.STORYBLOK_REGION || 'eu',
		/** The following code is only required when creating a Storyblok space directly via the Blueprints feature. */
		endpoint: process.env.STORYBLOK_API_BASE_URL
			? `${new URL(process.env.STORYBLOK_API_BASE_URL).origin}/v2`
			: undefined,
	},
});
