import { Headphones } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

const PodcastEpisodeCard = ({ story }) => {
	if (!story || typeof story === 'string' || !story.content) return null;

	const { content } = story;
	const authorName =
		content.author && typeof content.author === 'object'
			? content.author.content?.name
			: null;
	const timeAgo = formatRelativeTime(content.published_at);

	return (
		<a
			href={`/${story.full_slug}`}
			className="group flex w-40 flex-none flex-col gap-2"
		>
			<div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
				{content.cover?.url ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={content.cover.url}
						alt={content.title}
						className="h-full w-full object-cover"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-blue-surface-3">
						<Headphones className="h-8 w-8 text-primary/60" />
					</div>
				)}

				<span className="absolute left-2 top-2 flex h-6.5 w-6.5 items-center justify-center rounded-full bg-black/55">
					<Headphones className="h-3.5 w-3.5 text-white" />
				</span>

				{content.duration && (
					<span className="absolute bottom-2 right-2 flex h-6 items-center rounded bg-black/70 px-1.5 text-[11px] font-medium text-white">
						{content.duration}
					</span>
				)}
			</div>

			<div className="flex flex-col gap-0.5">
				{content.category && (
					<span className="text-[11px] font-bold uppercase tracking-wide text-blue-surface">
						{content.category}
					</span>
				)}
				<h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
					{content.title}
				</h3>
				{(authorName || timeAgo) && (
					<span className="text-xs text-muted-foreground">
						{authorName}
						{authorName && timeAgo && ' · '}
						{timeAgo}
					</span>
				)}
			</div>
		</a>
	);
};

export default PodcastEpisodeCard;
