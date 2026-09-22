'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

const VideoPlayer = ({ src, poster, alt }) => {
	const [isPlaying, setIsPlaying] = useState(false);

	if (isPlaying) {
		return (
			// eslint-disable-next-line jsx-a11y/media-has-caption
			<video
				src={src}
				poster={poster}
				controls
				autoPlay
				className="h-full w-full object-cover"
			/>
		);
	}

	return (
		<button
			type="button"
			onClick={() => setIsPlaying(true)}
			className="relative block h-full w-full"
			aria-label="Reproducir video"
		>
			{poster ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img src={poster} alt={alt} className="h-full w-full object-cover" />
			) : (
				<div className="h-full w-full bg-blue-surface-3" />
			)}
			<span className="absolute inset-0 flex items-center justify-center bg-black/10">
				<span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90">
					<Play className="h-6 w-6 fill-primary text-primary" />
				</span>
			</span>
		</button>
	);
};

export default VideoPlayer;
