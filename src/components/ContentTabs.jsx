'use client';

import * as Tabs from '@radix-ui/react-tabs';

const ContentTabs = ({ descriptionHtml, transcriptHtml }) => {
	return (
		<Tabs.Root defaultValue="description">
			<Tabs.List className="flex gap-6 border-b border-border">
				<Tabs.Trigger
					value="description"
					className="cursor-pointer border-b-2 border-transparent pb-2 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary"
				>
					Descripción
				</Tabs.Trigger>
				<Tabs.Trigger
					value="transcript"
					className="cursor-pointer border-b-2 border-transparent pb-2 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary"
				>
					Transcripción
				</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content
				value="description"
				className="pt-4 text-sm leading-relaxed text-paragraph [&_p]:mb-3 [&_p:last-child]:mb-0"
			>
				<div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
			</Tabs.Content>
			<Tabs.Content
				value="transcript"
				className="pt-4 text-sm leading-relaxed text-paragraph [&_p]:mb-3 [&_p:last-child]:mb-0"
			>
				<div dangerouslySetInnerHTML={{ __html: transcriptHtml }} />
			</Tabs.Content>
		</Tabs.Root>
	);
};

export default ContentTabs;
