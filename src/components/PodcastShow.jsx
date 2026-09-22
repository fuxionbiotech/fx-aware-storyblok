import { storyblokEditable } from '@storyblok/react/rsc';

const PodcastShow = ({ blok }) => (
	<div className="podcast-show" {...storyblokEditable(blok)}>
		{blok.cover?.url && <img src={blok.cover.url} alt={blok.name} />}
		<h1>{blok.name}</h1>
		{blok.category && <span>{blok.category}</span>}
	</div>
);

export default PodcastShow;
