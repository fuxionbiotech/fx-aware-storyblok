const PodcastShowCard = ({ story }) => {
	if (!story || typeof story === 'string' || !story.content) return null;

	const { content } = story;

	return (
		<a
			href={`/${story.full_slug}`}
			className="group flex w-40 flex-none flex-col gap-1"
		>
			<div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
				{content.cover?.url ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={content.cover.url}
						alt={content.name}
						className="h-full w-full object-cover"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-blue-surface-3 text-lg font-bold text-blue-surface">
						{content.name?.slice(0, 1)}
					</div>
				)}
			</div>

			<h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
				{content.name}
			</h3>
			{content.category && (
				<span className="text-[11px] font-bold uppercase tracking-wide text-blue-surface">
					{content.category}
				</span>
			)}
		</a>
	);
};

export default PodcastShowCard;
