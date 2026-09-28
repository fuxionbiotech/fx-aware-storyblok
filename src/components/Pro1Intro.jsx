import { storyblokEditable } from '@storyblok/react/rsc';
import { assetUrl } from '@/lib/asset-url';
import { ChevronRight, CircleCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const CARD_SHADOW =
	'shadow-[1px_1px_9px_0_var(--shadow-blue-neutral),-1px_14px_22px_0_var(--shadow-blue-soft-5),4px_3px_17px_0_var(--shadow-gray-3)]';

// Solo estos dos targets navegan a algo real; cualquier otro valor (incluido
// "none") deja la tarjeta sin link, como en Pro1IntroShowcase.tsx del
// proyecto web. 'saleslink' no tiene pantalla propia en este preview (no hay
// catalogo de venta acá), asi que queda inerte — 'levels' si resuelve a la
// vista apilada de este mismo repo.
const HREF_BY_TARGET = {
	levels: '/aware/pro1/levels',
};

const resolveHref = (target) => HREF_BY_TARGET[target] ?? null;

const NavCardContent = ({ card }) => (
	<>
		{assetUrl(card.icon) && (
			// eslint-disable-next-line @next/next/no-img-element
			<img src={assetUrl(card.icon)} alt="" className="h-7 w-7 shrink-0 object-contain" />
		)}
		<span className="flex-1 font-outfit text-[15px] leading-[20px] text-[var(--text-primary)]">
			{card.label}
		</span>
		<span className="flex size-[32px] shrink-0 items-center justify-center rounded-full bg-[var(--bg--surface-light)] shadow-[1px_1px_3px_0_#E5E8E9,0_5px_10px_0_rgba(169,191,203,0.30)]">
			<ChevronRight size={20} aria-hidden className="text-[var(--blue-surface)]" />
		</span>
	</>
);

const Pro1NavCard = ({ blok }) => {
	const baseClassName = `flex w-full items-center gap-[12px] rounded-[12px] border border-[var(--border-color-neutral)] bg-[var(--bg--surface-light)] px-[16px] py-[14px] ${CARD_SHADOW}`;
	const href = resolveHref(blok.target);

	if (!href) {
		return (
			<div
				{...storyblokEditable(blok)}
				className={cn(baseClassName, 'opacity-60')}
				aria-disabled
			>
				<NavCardContent card={blok} />
			</div>
		);
	}

	return (
		<a
			{...storyblokEditable(blok)}
			href={href}
			className={cn(baseClassName, 'transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]')}
		>
			<NavCardContent card={blok} />
		</a>
	);
};

/**
 * P1 — "Gana tus primeros US$XXX". Mismo look que Pro1IntroShowcase.tsx en
 * fx-aware-web-app — mismas clases, mismos tokens de color/sombra, mismo
 * hero.
 */
const Pro1Intro = ({ blok }) => {
	const goals = (blok.goals || '')
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);
	const navCards = blok.nav_cards || [];

	return (
		<div className="min-h-dvh w-full" style={{background: 'var(--pro1-bg-gradient)'}}>
			<div
				{...storyblokEditable(blok)}
				className="mx-auto flex max-w-140 flex-col items-center py-8"
			>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src="/images/pro1/hero-pro1.png"
					alt=""
					width={400}
					height={289}
					className="h-[112px] w-auto select-none"
					draggable={false}
				/>

				<h1 className="mt-[12px] text-center font-scandia text-[24px] font-bold leading-[32px] text-[var(--text-primary)] max-[660px]:text-[20px] max-[660px]:leading-[26px]">
					{blok.title}
				</h1>

				<section
					className={`mt-[24px] w-full max-w-[580px] rounded-[12px] border border-[var(--border-color-neutral)] bg-[var(--bg--surface-light)] px-[24px] py-[16px] ${CARD_SHADOW}`}
				>
					<h2 className="text-center font-scandia text-[15px] font-medium leading-[20px] text-[var(--text-primary)]">
						{blok.goals_title}
					</h2>

					<ul className="mt-[8px] flex flex-col">
						{goals.map((goal, index) => (
							<li
								key={index}
								className="flex items-start gap-[10px] border-b border-[var(--border-separator)] py-[12px] last:border-b-0 last:pb-0"
							>
								<CircleCheck
									size={18}
									aria-hidden
									className="mt-[1px] shrink-0 text-[var(--blue-surface)]"
								/>
								<span className="font-outfit text-[14px] leading-[20px] text-[var(--text-secondary)]">
									{goal}
								</span>
							</li>
						))}
					</ul>
				</section>

				<div className="mt-[16px] flex w-full max-w-[580px] flex-col gap-[12px]">
					{navCards.map((card) => (
						<Pro1NavCard key={card._uid} blok={card} />
					))}
				</div>
			</div>
		</div>
	);
};

export default Pro1Intro;
