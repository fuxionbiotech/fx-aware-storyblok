'use client';

import { cn } from '@/lib/utils';

/**
 * Control segmentado "Elige tu forma de lograrlo" (Opción A / Opción B).
 * Mismo componente que Pro1OptionSwitch.tsx en fx-aware-web-app.
 */
export default function Pro1OptionSwitch({ options, selectedKey, onSelect, label }) {
	return (
		<div
			role="radiogroup"
			aria-label={label}
			className="flex w-full rounded-full bg-[var(--bg-accent-subte)] p-[3px]"
		>
			{options.map((option) => {
				const isSelected = option.option_key === selectedKey;

				return (
					<button
						key={option._uid}
						type="button"
						role="radio"
						aria-checked={isSelected}
						onClick={() => onSelect(option.option_key)}
						className={cn(
							'flex-1 cursor-pointer rounded-full px-[12px] py-[7px] font-outfit text-[14px] leading-[20px] transition-colors',
							isSelected
								? 'bg-[var(--bg--surface-light)] font-medium text-[var(--text-primary)] shadow-[1px_1px_4px_0_var(--shadow-blue-soft-4)]'
								: 'text-[var(--text-muted2)] hover:text-[var(--text-primary)]'
						)}
					>
						{option.label}
					</button>
				);
			})}
		</div>
	);
}
