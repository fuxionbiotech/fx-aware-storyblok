'use client';

import { useState } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { storyblokEditable } from '@storyblok/react/rsc';
import { ChevronDown, Gem } from 'lucide-react';
import Pro1LevelBadge from './Pro1LevelBadge';
import Pro1OptionSwitch from './Pro1OptionSwitch';

const parseLines = (text) =>
	(text || '')
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);

const RequirementList = ({ requirements }) => (
	<ul className="flex flex-col gap-[6px]">
		{requirements.map((requirement, index) => (
			<li
				key={index}
				className="flex gap-[8px] font-outfit text-[14px] leading-[20px] text-[var(--text-secondary)]"
			>
				<span aria-hidden className="text-[var(--text-muted)]">
					&middot;
				</span>
				<span>{requirement}</span>
			</li>
		))}
	</ul>
);

/**
 * Un nivel del plan (P2). Mismo look que Pro1LevelAccordionItem.tsx en
 * fx-aware-web-app — mismas clases, mismos tokens de color/sombra, mismo
 * Accordion de Radix.
 *
 * Arranca EXPANDIDO (a diferencia de la web, que arranca cerrado): quien
 * está editando el contenido en Storyblok necesita ver los campos que está
 * tocando, no una card colapsada.
 *
 * Trae su propio `Accordion.Root` (en vez de depender de uno compartido) para
 * funcionar igual tanto si se previsualiza una sola story (`aware/pro1/levels/pro1-1`)
 * como apilado en `aware/pro1/levels` — Radix exige que `Accordion.Item` viva
 * dentro de un `Root`, y acá no hay forma de garantizar cuál de los dos casos
 * está pasando.
 */
export default function Pro1Level({ blok }) {
	const [selectedOptionKey, setSelectedOptionKey] = useState(blok.options?.[0]?.option_key);

	const selectedOption = (blok.options || []).find(
		(option) => option.option_key === selectedOptionKey
	);
	const requirements = selectedOption
		? parseLines(selectedOption.requirements)
		: parseLines(blok.requirements);
	const hasOptions = (blok.options || []).length > 0;

	return (
		<Accordion.Root type="single" collapsible defaultValue="item">
			<Accordion.Item
				value="item"
				{...storyblokEditable(blok)}
				className="rounded-[12px] border border-[var(--border-color-neutral)] bg-[var(--bg--surface-light)] shadow-[1px_1px_9px_0_var(--shadow-blue-neutral),-1px_14px_22px_0_var(--shadow-blue-soft-5),4px_3px_17px_0_var(--shadow-gray-3)]"
			>
				<Accordion.Header>
					<Accordion.Trigger className="group flex w-full cursor-pointer items-start justify-between gap-[12px] px-[20px] py-[16px] text-left">
						<span className="flex flex-col items-start gap-[6px]">
							<Pro1LevelBadge blok={blok} />
							<span className="font-scandia text-[16px] font-medium leading-[20px] text-[var(--text-primary)] max-[480px]:text-[15px]">
								{blok.earnings}
							</span>
						</span>
						<ChevronDown
							size={24}
							aria-hidden
							className="mt-[2px] shrink-0 text-[var(--text-secondary)] transition-transform group-data-[state=open]:rotate-180"
						/>
					</Accordion.Trigger>
				</Accordion.Header>

				<Accordion.Content className="accordion-content border-t border-[var(--border-color-neutral)]">
					<div className="accordion-body flex flex-col gap-[12px] px-[20px] py-[16px]">
						<p className="font-scandia text-[14px] font-medium leading-[20px] text-[var(--text-primary)]">
							{blok.requirements_title}
						</p>

						{hasOptions && (
							<Pro1OptionSwitch
								options={blok.options}
								selectedKey={selectedOptionKey}
								onSelect={setSelectedOptionKey}
								label={blok.requirements_title}
							/>
						)}

						<RequirementList requirements={requirements} />

						{blok.bonus && (
							<div className="flex items-start gap-[8px] border-t border-[var(--border-separator)] pt-[12px]">
								<Gem size={18} aria-hidden className="mt-[1px] shrink-0 text-[#f0b429]" />
								<p className="font-outfit text-[14px] leading-[20px] text-[var(--text-secondary)]">
									{blok.bonus}
								</p>
							</div>
						)}
					</div>
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	);
}
