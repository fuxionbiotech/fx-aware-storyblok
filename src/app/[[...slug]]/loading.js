const SkeletonCard = ({ wide = false }) => (
	<div
		className={`flex flex-none animate-pulse flex-col gap-2 ${wide ? 'w-64' : 'w-40'}`}
	>
		<div className="aspect-video w-full rounded-xl bg-muted" />
		<div className="h-3 w-16 rounded bg-muted" />
		<div className="h-4 w-full rounded bg-muted" />
		<div className="h-3 w-24 rounded bg-muted" />
	</div>
);

const SkeletonRow = ({ wide = false }) => (
	<section className="flex flex-col gap-3">
		<div className="h-5 w-40 animate-pulse rounded bg-muted" />
		<div className="flex gap-3 overflow-hidden">
			<SkeletonCard wide={wide} />
			<SkeletonCard wide={wide} />
			<SkeletonCard wide={wide} />
		</div>
	</section>
);

export default function Loading() {
	return (
		<main className="mx-auto flex max-w-200 flex-col gap-7 py-4 max-[1110px]:px-6 max-[770px]:px-4">
			<SkeletonRow wide />
			<SkeletonRow />
			<SkeletonRow />
		</main>
	);
}
