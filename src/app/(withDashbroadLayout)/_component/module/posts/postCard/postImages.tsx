'use client';

import { FC, useMemo } from 'react';
import LightGallery from 'lightgallery/react';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import Image from 'next/image';
import { TMediaLayout, TPost } from '@/src/types';

type TPostImagesProps = { post: TPost; className?: string };

type TResolvedLayout = 'SINGLE' | 'SPLIT' | 'FEATURE' | 'GRID' | 'MOSAIC';

/**
 * Pick the concrete grid for a post. An author-selected layout wins when it
 * is compatible with the image count; otherwise the count decides (AUTO):
 * 1 → SINGLE, 2 → SPLIT, 3 → FEATURE, 4 → GRID, 5+ → MOSAIC.
 */
const resolveLayout = (
  requested: TMediaLayout | undefined,
  count: number,
): TResolvedLayout => {
  const fromCount: TResolvedLayout =
    count <= 1
      ? 'SINGLE'
      : count === 2
        ? 'SPLIT'
        : count === 3
          ? 'FEATURE'
          : count === 4
            ? 'GRID'
            : 'MOSAIC';

  if (!requested || requested === 'AUTO') return fromCount;

  const compatible =
    (requested === 'SINGLE' && count === 1) ||
    (requested === 'SPLIT' && count === 2) ||
    (requested === 'FEATURE' && count >= 3 && count <= 6) ||
    (requested === 'GRID' && count >= 3 && count <= 4) ||
    (requested === 'MOSAIC' && count >= 5);

  return compatible ? requested : fromCount;
};

/**
 * Multi-image grid renderer with the five cluster layouts + LightGallery
 * lightbox over every image (no image is ever hidden behind a "+N" cap).
 */
const PostImages: FC<TPostImagesProps> = ({ post, className = '' }) => {
  const images = post?.images ?? [];
  const validImages = useMemo(
    () => images.filter((image): image is string => Boolean(image)),
    [images],
  );

  const layout = resolveLayout(post?.mediaLayout, validImages.length);

  const gridShell = useMemo(() => {
    switch (layout) {
      case 'SINGLE':
        return { grid: 'grid grid-cols-1', cell: 'h-[300px] md:h-[380px]' };
      case 'SPLIT':
        return { grid: 'grid grid-cols-2', cell: 'h-[220px] md:h-[300px]' };
      case 'FEATURE':
        // Container is plain; the flex cluster below owns the geometry.
        return { grid: 'block', cell: '' };
      case 'GRID':
        return {
          grid: `grid gap-2 ${validImages.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`,
          cell: 'h-[160px] md:h-[210px]',
        };
      case 'MOSAIC':
      default:
        return { grid: 'grid grid-cols-6 gap-2', cell: '' };
    }
  }, [layout, validImages.length]);

  if (validImages.length === 0) return null;

  const renderImage = (image: string, index: number, cellClass: string) => (
    <a
      key={`${image}-${index}`}
      href={image}
      className={`relative block overflow-hidden rounded-lg ${cellClass}`}
      data-lg-size="1600-1200"
    >
      <Image
        alt={`${post?.title ?? 'Post'} image ${index + 1}`}
        className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-[1.02]"
        fill
        sizes="(max-width: 768px) 100vw, 640px"
        src={image}
      />
    </a>
  );

  const children = (() => {
    switch (layout) {
      case 'SINGLE':
      case 'SPLIT':
      case 'GRID':
        return validImages.map((image, index) =>
          renderImage(image, index, gridShell.cell),
        );

      case 'FEATURE': {
        // 1 large tile + a vertical stack of the rest (any count ≥ 3).
        const [main, ...rest] = validImages;
        return [
          <div key="feature-cluster" className="flex h-[320px] gap-2 md:h-[420px]">
            <a
              href={main}
              className="relative block flex-[2] overflow-hidden rounded-lg"
              data-lg-size="1600-1200"
            >
              <Image
                alt={`${post?.title ?? 'Post'} cover`}
                className="h-full w-full object-cover object-center"
                fill
                sizes="(max-width: 768px) 66vw, 420px"
                src={main}
              />
            </a>
            <div className="flex flex-1 flex-col gap-2">
              {rest.map((image, index) => (
                <a
                  key={`feature-${index + 1}`}
                  href={image}
                  className="relative block flex-1 overflow-hidden rounded-lg"
                  data-lg-size="1600-1200"
                >
                  <Image
                    alt={`${post?.title ?? 'Post'} image ${index + 2}`}
                    className="h-full w-full object-cover object-center"
                    fill
                    sizes="200px"
                    src={image}
                  />
                </a>
              ))}
            </div>
          </div>,
        ];
      }

      case 'MOSAIC':
      default: {
        // Top row: two large tiles (3 cols each). Below: the rest in thirds.
        const top = validImages.slice(0, 2);
        const bottom = validImages.slice(2);
        return [
          ...top.map((image, index) => (
            <a
              key={`mosaic-top-${index}`}
              href={image}
              className="relative col-span-3 block h-[180px] overflow-hidden rounded-lg md:h-[240px]"
              data-lg-size="1600-1200"
            >
              <Image
                alt={`${post?.title ?? 'Post'} image ${index + 1}`}
                className="h-full w-full object-cover object-center"
                fill
                sizes="(max-width: 768px) 50vw, 320px"
                src={image}
              />
            </a>
          )),
          ...bottom.map((image, index) => (
            <a
              key={`mosaic-bottom-${index}`}
              href={image}
              className="relative col-span-2 block h-[120px] overflow-hidden rounded-lg md:h-[160px]"
              data-lg-size="1600-1200"
            >
              <Image
                alt={`${post?.title ?? 'Post'} image ${index + 3}`}
                className="h-full w-full object-cover object-center"
                fill
                sizes="(max-width: 768px) 33vw, 210px"
                src={image}
              />
            </a>
          )),
        ];
      }
    }
  })();

  return (
    <div className={`relative mt-2 ${className}`}>
      <LightGallery
        elementClassNames={gridShell.grid}
        plugins={[lgThumbnail, lgZoom]}
        speed={500}
      >
        {children}
      </LightGallery>

      {/* Owner-selected layout badge (subtle provenance for the feed) */}
      {post?.mediaLayout && post.mediaLayout !== 'AUTO' && (
        <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
          {post.mediaLayout.toLowerCase()}
        </span>
      )}
    </div>
  );
};

export default PostImages;
