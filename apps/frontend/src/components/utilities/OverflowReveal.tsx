import {
  type CSSProperties,
  type MouseEventHandler,
  useEffect,
  useRef,
  useState
} from 'react';
import { createPortal } from 'react-dom';

import './OverflowReveal.css';

const REVEAL_DELAY_MS = 320;
const VIEWPORT_EDGE_PADDING_PX = 8;

type OverflowRevealElement = 'div' | 'h3' | 'span';

type OverflowRevealProps = {
  as?: OverflowRevealElement;
  children: string;
  className?: string;
  testId?: string;
};

type OverlayState = {
  style: CSSProperties;
  text: string;
};

function copyTypography(node: HTMLElement) {
  const computed = window.getComputedStyle(node);
  return {
    color: computed.color,
    fontFamily: computed.fontFamily,
    fontFeatureSettings: computed.fontFeatureSettings as CSSProperties['fontFeatureSettings'],
    fontKerning: computed.fontKerning as CSSProperties['fontKerning'],
    fontOpticalSizing: computed.fontOpticalSizing as CSSProperties['fontOpticalSizing'],
    fontSize: computed.fontSize,
    fontStretch: computed.fontStretch as CSSProperties['fontStretch'],
    fontStyle: computed.fontStyle,
    fontVariant: computed.fontVariant as CSSProperties['fontVariant'],
    fontVariationSettings: computed.fontVariationSettings as CSSProperties['fontVariationSettings'],
    fontWeight: computed.fontWeight,
    letterSpacing: computed.letterSpacing,
    lineHeight: computed.lineHeight,
    textAlign: computed.textAlign as CSSProperties['textAlign'],
    textTransform: computed.textTransform as CSSProperties['textTransform']
  } satisfies CSSProperties;
}

function isPaintedBackground(color: string) {
  return color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)';
}

function resolveBackgroundColor(node: HTMLElement) {
  let current: HTMLElement | null = node;

  while (current) {
    const backgroundColor = window.getComputedStyle(current).backgroundColor;
    if (isPaintedBackground(backgroundColor)) {
      return backgroundColor;
    }
    current = current.parentElement;
  }

  return window.getComputedStyle(document.body).backgroundColor;
}

function isOverflowing(node: HTMLElement) {
  return node.scrollWidth > node.clientWidth || node.scrollHeight > node.clientHeight + 1;
}

function isMultiline(node: HTMLElement) {
  const computed = window.getComputedStyle(node);
  const lineHeight = Number.parseFloat(computed.lineHeight);
  if (Number.isNaN(lineHeight) || lineHeight <= 0) {
    return node.clientHeight > 24;
  }

  return node.clientHeight > lineHeight * 1.5;
}

export function OverflowReveal({
  as,
  children,
  className,
  testId
}: OverflowRevealProps) {
  const textRef = useRef<HTMLElement | null>(null);
  const delayRef = useRef<number | null>(null);
  const [overlay, setOverlay] = useState<OverlayState | null>(null);

  function clearPendingReveal() {
    if (delayRef.current !== null) {
      window.clearTimeout(delayRef.current);
      delayRef.current = null;
    }
  }

  function hideReveal() {
    clearPendingReveal();
    setOverlay(null);
  }

  function showReveal() {
    const node = textRef.current;
    if (!node || !isOverflowing(node)) {
      return;
    }

    const rect = node.getBoundingClientRect();
    const availableWidth = Math.max(
      rect.width,
      window.innerWidth - rect.left - VIEWPORT_EDGE_PADDING_PX
    );
    const multiline = isMultiline(node);
    const backgroundColor = resolveBackgroundColor(node);

    setOverlay({
      text: children,
      style: {
        ...copyTypography(node),
        backgroundColor,
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        ...(multiline ? { width: `${rect.width}px` } : { minWidth: `${rect.width}px` }),
        maxWidth: `${availableWidth}px`
      }
    });
  }

  function scheduleReveal() {
    clearPendingReveal();
    delayRef.current = window.setTimeout(() => {
      delayRef.current = null;
      showReveal();
    }, REVEAL_DELAY_MS);
  }

  useEffect(() => hideReveal, []);

  useEffect(() => {
    if (!overlay) {
      return;
    }

    const dismiss = () => setOverlay(null);
    window.addEventListener('resize', dismiss);
    window.addEventListener('scroll', dismiss, true);
    return () => {
      window.removeEventListener('resize', dismiss);
      window.removeEventListener('scroll', dismiss, true);
    };
  }, [overlay]);

  const handleMouseEnter: MouseEventHandler<
    HTMLDivElement | HTMLHeadingElement | HTMLSpanElement
  > = () => {
    scheduleReveal();
  };

  const handleMouseLeave: MouseEventHandler<
    HTMLDivElement | HTMLHeadingElement | HTMLSpanElement
  > = () => {
    hideReveal();
  };

  return (
    <>
      {as === 'div' ? (
        <div
          ref={(node) => {
            textRef.current = node;
          }}
          className={className}
          data-testid={testId}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {children}
        </div>
      ) : as === 'h3' ? (
        <h3
          ref={(node) => {
            textRef.current = node;
          }}
          className={className}
          data-testid={testId}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {children}
        </h3>
      ) : (
        <span
          ref={(node) => {
            textRef.current = node;
          }}
          className={className}
          data-testid={testId}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {children}
        </span>
      )}
      {overlay
        ? createPortal(
            <div aria-hidden="true" className="overflow-reveal-overlay" style={overlay.style}>
              {overlay.text}
            </div>,
            document.body
          )
        : null}
    </>
  );
}
