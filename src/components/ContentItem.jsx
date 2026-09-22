import { renderRichText, storyblokEditable } from '@storyblok/react/rsc';
import { ArrowLeft, Download, Play, Share2, Bookmark } from 'lucide-react';
import ContentCard from './ContentCard';
import ContentTabs from './ContentTabs';
import VideoPlayer from './VideoPlayer';
import { formatRelativeTime } from '@/lib/utils';

const actionButtonClass =
	'flex h-7.5 shrink-0 cursor-pointer items-center gap-1 rounded-full border border-border px-2 text-xs text-muted-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 md:h-9 md:gap-1.5 md:px-3 md:text-[13px]';
const actionIconClass = 'h-3.5 w-3.5 md:h-4 md:w-4';

const ContentItem = ({ blok }) => {
	const descriptionHtml = blok.description ? renderRichText(blok.description) : '';
	const transcriptHtml = blok.transcript
		? renderRichText(blok.transcript)
		: '<p>Transcripción no disponible.</p>';
	const author =
		blok.author && typeof blok.author === 'object' ? blok.author.content : null;
	const authorAvatarUrl = author?.avatar?.filename || null;
	const timeAgo = formatRelativeTime(blok.published_at);
	const related = Array.isArray(blok.related_content) ? blok.related_content : [];
	const media = blok.media_url && typeof blok.media_url === 'object' ? blok.media_url : null;
	const isPlayableVideo = media?.url && media.contentType?.startsWith('video/');
	const isPlayableAudio = media?.url && media.contentType?.startsWith('audio/');

	return (
		<article
			className="mx-auto max-w-200 pb-8 max-[1110px]:px-6 max-[770px]:px-4"
			{...storyblokEditable(blok)}
		>
			<div>
				<a
					href="/aprende/tab-contenidos"
					className="hidden items-center gap-1.5 pt-4 text-sm text-muted-foreground hover:text-foreground md:flex"
				>
					<ArrowLeft className="h-5 w-5" />
					Regresar
				</a>

				<div className="relative mt-4 aspect-video overflow-hidden rounded-xl bg-muted">
					<a
						href="/aprende/tab-contenidos"
						aria-label="Regresar"
						className="absolute left-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-sm md:hidden"
					>
						<ArrowLeft className="h-4.5 w-4.5 text-foreground" />
					</a>

					{isPlayableVideo ? (
						<VideoPlayer src={media.url} poster={blok.cover?.url} alt={blok.title} />
					) : blok.cover?.url ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={blok.cover.url}
							alt={blok.title}
							className="h-full w-full object-cover"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center bg-blue-surface-3">
							<span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
								<Play className="h-5 w-5 fill-primary text-primary" />
							</span>
						</div>
					)}

					{!isPlayableVideo && blok.is_live && (
						<span className="absolute left-3 top-3 flex h-6 items-center gap-1 rounded bg-destructive px-2 text-xs font-bold text-destructive-foreground">
							<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
							En vivo
						</span>
					)}
					{!isPlayableVideo && blok.duration && (
						<span className="absolute bottom-3 right-3 flex h-6 items-center rounded bg-black/70 px-2 text-xs font-medium text-white">
							{blok.duration}
						</span>
					)}
				</div>

				{isPlayableAudio && (
					<div className="mt-4">
						{/* eslint-disable-next-line jsx-a11y/media-has-caption */}
						<audio src={media.url} controls className="w-full" />
					</div>
				)}

				<div className="mb-2 mt-4 flex flex-col gap-1">
					{blok.category && (
						<span className="text-xs font-bold uppercase tracking-wide text-blue-surface">
							{blok.category}
						</span>
					)}
					<h1 className="text-xl font-bold leading-6 text-foreground md:text-[28px] md:leading-normal">
						{blok.title}
					</h1>
					{(author?.name || timeAgo) && (
						<div className="mt-1 flex items-center gap-2">
							{authorAvatarUrl && (
								// eslint-disable-next-line @next/next/no-img-element
								<img
									src={authorAvatarUrl}
									alt={author.name}
									className="h-7 w-7 shrink-0 rounded-full object-cover"
								/>
							)}
							<p className="text-sm text-muted-foreground">
								{author?.name}
								{author?.name && timeAgo && ' · '}
								{timeAgo}
							</p>
						</div>
					)}

					<div className="mt-3 flex items-center gap-1.5 md:gap-2">
						<button type="button" className={actionButtonClass}>
							<Share2 className={actionIconClass} />
							Compartir
						</button>
						<button type="button" className={actionButtonClass}>
							<Bookmark className={actionIconClass} />
							Guardar
						</button>
						{media?.url && (
							<button type="button" className={actionButtonClass}>
								<Download className={actionIconClass} />
								Descargar
							</button>
						)}
					</div>
				</div>
			</div>

			<section className="mt-2">
				<ContentTabs
					descriptionHtml={descriptionHtml}
					transcriptHtml={transcriptHtml}
				/>
			</section>

			{related.length > 0 && (
				<section className="mt-8">
					<h2 className="mb-3 text-lg font-medium text-foreground">
						Otros Contenidos imperdibles
					</h2>
					<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
						{related.map((item) => (
							<ContentCard
								key={item?.uuid || item?.id || item}
								story={item}
								size="full"
							/>
						))}
					</div>
				</section>
			)}
		</article>
	);
};

export default ContentItem;
