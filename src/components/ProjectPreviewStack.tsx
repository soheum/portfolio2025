import React, { forwardRef, useEffect, useRef, useState } from 'react';
import './ProjectPreviewStack.css';

export type ProjectPreview =
  | { type: 'video'; src: string }
  | { type: 'image'; src: string }
  | { type: 'placeholder' }
  | { type: 'envelope' };

export type ProjectPreviewItem = {
  index: number;
  preview: ProjectPreview;
};

type ProjectPreviewStackProps = {
  items: ProjectPreviewItem[];
  hoveredIndex: number | null;
  onHoverEnd: (relatedTarget: EventTarget | null) => void;
  className?: string;
};

function isGifPreview(preview: ProjectPreview): boolean {
  return preview.type === 'image' && preview.src.endsWith('.gif');
}

const GifPreview: React.FC<{ src: string; isPlaying: boolean }> = ({ src, isPlaying }) => {
  const [poster, setPoster] = useState<string | null>(null);
  const [playSrc, setPlaySrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();

    img.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d')?.drawImage(img, 0, 0);
      setPoster(canvas.toDataURL('image/jpeg', 0.92));
    };

    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    if (isPlaying) {
      setPlaySrc(`${src}?play=${Date.now()}`);
      return;
    }
    setPlaySrc(null);
  }, [isPlaying, src]);

  if (isPlaying && playSrc) {
    return <img src={playSrc} alt="" />;
  }

  if (poster) {
    return <img src={poster} alt="" />;
  }

  return <div className="project-preview-stack__placeholder" />;
};

const VideoPreview: React.FC<{ src: string; isPlaying: boolean }> = ({ src, isPlaying }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      void video.play();
      return;
    }

    video.pause();
    video.currentTime = 0;
  }, [isPlaying]);

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
};

const EnvelopePreview: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => (
  <div className="envelope-preview">
    <img
      className="envelope-preview__back"
      src="/img/Grid/envelop_back.png"
      alt=""
    />
    <img
      className={`envelope-preview__card${isPlaying ? ' envelope-preview__card--up' : ''}`}
      src="/img/Grid/envelop.png"
      alt=""
    />
    <img
      className="envelope-preview__front"
      src="/img/Grid/envelop_front.png"
      alt=""
    />
  </div>
);

const PreviewMedia: React.FC<{ preview: ProjectPreview; isPlaying: boolean }> = ({
  preview,
  isPlaying,
}) => {
  if (preview.type === 'envelope') {
    return <EnvelopePreview isPlaying={isPlaying} />;
  }

  if (preview.type === 'video') {
    return <VideoPreview src={preview.src} isPlaying={isPlaying} />;
  }

  if (preview.type === 'image' && isGifPreview(preview)) {
    return <GifPreview src={preview.src} isPlaying={isPlaying} />;
  }

  if (preview.type === 'image') {
    return <img src={preview.src} alt="" />;
  }

  return <div className="project-preview-stack__placeholder" />;
};

const ProjectPreviewStack = forwardRef<HTMLDivElement, ProjectPreviewStackProps>(({
  items,
  hoveredIndex,
  onHoverEnd,
  className,
}, ref) => {
  const trackOffset = hoveredIndex !== null ? hoveredIndex - 1 : 0;

  return (
    <div
      ref={ref}
      className={`project-preview-stack${hoveredIndex !== null ? ' project-preview-stack--focused' : ''}${className ? ` ${className}` : ''}`}
      onMouseLeave={(e) => onHoverEnd(e.relatedTarget)}
    >
      <div
        className="project-preview-stack__track"
        style={{ '--track-offset': trackOffset } as React.CSSProperties}
      >
        {items.map(({ index, preview }) => {
          const isFocused = hoveredIndex === index;

          return (
            <div
              key={index}
              className={`project-preview-stack__item${isFocused ? ' project-preview-stack__item--focused' : ''}`}
            >
              <PreviewMedia preview={preview} isPlaying={isFocused} />
            </div>
          );
        })}
      </div>
    </div>
  );
});

ProjectPreviewStack.displayName = 'ProjectPreviewStack';

export default ProjectPreviewStack;
