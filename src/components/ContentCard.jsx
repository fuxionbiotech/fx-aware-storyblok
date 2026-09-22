import { Play } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';

const ContentCard = ({ story, size = 'default' }) => {
	if (!story || typeof story === 'string' || !story.content) return null;

	const { content } = story;
	const isHero = size === 'large';
	const isFullWidth = isHero || size === 'full';
	const authorName =
		content.author && typeof content.author === 'object'
			? content.author.content?.name
			: null;
	const timeAgo = formatRelativeTime(content.published_at);

	return (
		<a
			href={`/${story.full_slug}`}
			className={cn(
				'group relative flex flex-col cursor-pointer',
				isFullWidth ? 'w-full' : 'w-72.5 flex-none',
				isHero &&
					'md:flex-row md:items-start md:rounded-[14px] md:bg-card md:shadow-sm'
			)}
		>
			<div
				className={cn(
					'relative aspect-video overflow-hidden rounded-xl bg-muted',
					isHero && 'w-full md:w-1/2'
				)}
			>
				{content.cover?.url ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={content.cover.url}
						alt={content.title}
						className="h-full w-full object-cover"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-blue-surface-3">
						<Play className="h-8 w-8 text-primary/60" />
					</div>
				)}

				{content.is_live && (
					<span className="absolute left-2 top-2 flex h-6 items-center gap-1 rounded bg-destructive px-2 text-[11px] font-bold text-destructive-foreground">
						<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
						En vivo
					</span>
				)}
				{content.duration && (
					<span className="absolute bottom-2 right-2 flex h-5.5 items-center rounded bg-black/70 px-1.5 text-[11px] font-medium text-white">
						{content.duration}
					</span>
				)}
			</div>

			<div
				className={cn(
					'flex flex-col gap-0.5',
					isHero
						? 'w-full pt-2 md:w-1/2 md:px-4 md:py-3 md:pt-3'
						: 'w-full pt-2'
				)}
			>
				{content.category && (
					<span
						className={cn(
							'font-bold uppercase tracking-wide text-blue-surface',
							isHero ? 'text-xs' : 'text-[11px]'
						)}
					>
						{content.category}
					</span>
				)}
				<h3
					className={cn(
						'line-clamp-2 font-semibold text-foreground group-hover:text-primary',
						isHero ? 'text-xl leading-snug' : 'text-sm leading-snug'
					)}
				>
					{content.title}
				</h3>
				{(authorName || timeAgo) && (
					<span
						className={cn(
							'text-muted-foreground',
							isHero ? 'mt-1 text-sm' : 'text-xs'
						)}
					>
						{authorName}
						{authorName && timeAgo && ' · '}
						{timeAgo}
					</span>
				)}
			</div>
		</a>
	);
};

export default ContentCard;
