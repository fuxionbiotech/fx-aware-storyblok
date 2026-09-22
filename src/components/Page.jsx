import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';

const Page = ({ blok }) => (
	<main
		className="mx-auto flex max-w-200 flex-col gap-7 py-4 max-[1110px]:px-6 max-[770px]:px-4"
		{...storyblokEditable(blok)}
	>
		{blok.body?.map((nestedBlok) => (
			<StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
		))}
	</main>
);

export default Page;
