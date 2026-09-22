import { storyblokEditable } from '@storyblok/react/rsc';

const Author = ({ blok }) => (
	<div className="author" {...storyblokEditable(blok)}>
		<span>{blok.name}</span>
	</div>
);

export default Author;
