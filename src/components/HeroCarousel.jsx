import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { THEME } from '../constants/theme';
import { useIsMobile } from '../hooks/useIsMobile';
import HeroCard from './HeroCard';

// 2) De HBO-achtige carousel (previews links/rechts + dots)
export default function HeroCarousel({ locations, initialIndex = 0, onOpen, language }) {
  const isMobile = useIsMobile();
  const scrollerRef = useRef(null);
  const itemRefs = useRef([]);
  const rafRef = useRef(0);

  const list = Array.isArray(locations) ? locations : [];
  const count = list.length;

  // ✅ breder middenkaartje (minder preview ruimte)
  const slideBasis = isMobile ? '92%' : '80%';

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const clampInitial = clamp(initialIndex, 0, Math.max(0, count - 1));

  const [activeIndex, setActiveIndex] = useState(clampInitial);

  const wrapStyle = { padding: isMobile ? '10px 0 18px' : '0px 0px 24px' };

  const scrollerStyle = {
    display: 'flex',
    gap: isMobile ? 10 : 12,
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollSnapType: 'x mandatory',
    WebkitOverflowScrolling: 'touch',
    padding: isMobile ? '0 12px' : '0 18px',
    scrollPaddingInline: isMobile ? 12 : 18,
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  };

  const slideStyle = {
    flex: `0 0 ${slideBasis}`,
    scrollSnapAlign: 'center',
    position: 'relative',
    willChange: 'transform',
    transition: 'transform 220ms ease, opacity 220ms ease',
  };

  const dotsWrap = {
    display: count > 1 ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    paddingBottom: 2,
  };

  const dotBtn = (active) => ({
    width: active ? 18 : 7,
    height: 7,
    borderRadius: 999,
    border: 'none',
    cursor: 'pointer',
    background: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.28)',
    transition: 'all 180ms ease',
  });

  const scrollToIndex = useCallback((idx, smooth = true) => {
    const el = itemRefs.current?.[idx];
    if (!el) return;
    el.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      inline: 'center',
      block: 'nearest',
    });
  }, []);
  const getCenteredIndex = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || count <= 0) return 0;

    const rect = scroller.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;

    for (let i = 0; i < count; i++) {
      const node = itemRefs.current?.[i];
      if (!node) continue;
      const r = node.getBoundingClientRect();
      const nodeCenter = r.left + r.width / 2;
      const d = Math.abs(nodeCenter - centerX);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }

    return bestIdx;
  }, [count]);

  // ✅ init: scroll naar start index
  useEffect(() => {
    if (count <= 0) return;

    // laat refs met rust; die worden tijdens render gevuld
    const raf1 = requestAnimationFrame(() => {
      scrollToIndex(clampInitial, false);

      // 2e frame: na layout/snap de echte midden-card bepalen
      const raf2 = requestAnimationFrame(() => {
        const best = getCenteredIndex();
        setActiveIndex(best);
      });

      // cleanup raf2
      rafRef.current = raf2;
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, clampInitial, scrollToIndex, getCenteredIndex]);

  // ✅ detecteer welke slide het meest in het midden staat (finite)
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || count <= 1) return;

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = scroller.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;

        let bestIdx = -1;
        let bestDist = Number.POSITIVE_INFINITY;

        for (let i = 0; i < count; i++) {
          const node = itemRefs.current?.[i];
          if (!node) continue;
          const r = node.getBoundingClientRect();
          const nodeCenter = r.left + r.width / 2;
          const d = Math.abs(nodeCenter - centerX);
          if (d < bestDist) {
            bestDist = d;
            bestIdx = i;
          }
        }

        if (bestIdx >= 0 && bestIdx !== activeIndex) {
          setActiveIndex(bestIdx);
        }
      });
    };

    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [activeIndex, count]);

  // ✅ keyboard links/rechts — stopt bij begin/einde
  useEffect(() => {
    if (count <= 1) return;

    const onKey = (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const next = activeIndex + dir;

      if (next < 0 || next > count - 1) return; // ✅ stop bij einde
      setActiveIndex(next);
      scrollToIndex(next, true);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, count, scrollToIndex]);

  if (count === 0) return null;

  return (
    <section style={wrapStyle}>
      <div ref={scrollerRef} style={scrollerStyle}>
        {list.map((loc, i) => {
          const dist = Math.abs(i - activeIndex);

          // ✅ overlap: previews schuiven “achter” main card
          const overlap = isMobile ? 34 : 52;
          const ml = i === 0 ? 0 : -overlap;

          const scale = dist === 0 ? 1 : dist === 1 ? 0.94 : 0.88;
          const opacity = dist === 0 ? 1 : dist === 1 ? 0.55 : 0.2;
          const translateY = dist === 0 ? 0 : dist === 1 ? 10 : 18;
          const zIndex = 100 - Math.min(dist, 20);

          return (
            <div
              key={loc.id ?? i}
              ref={(el) => (itemRefs.current[i] = el)}
              style={{
                ...slideStyle,
                marginLeft: ml,
                zIndex,
                opacity,
                transform: `translateY(${translateY}px) scale(${scale})`,
              }}
              onClick={() => {
                setActiveIndex(i);
                scrollToIndex(i, true);
              }}
            >
              <HeroCard
                location={loc}
                language={language}
                onOpen={() =>
                  typeof onOpen === 'function' ? onOpen(loc) : null
                }
              />
            </div>
          );
        })}
      </div>

      <div style={dotsWrap}>
        {list.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ga naar uitgelicht ${i + 1}`}
            style={dotBtn(i === activeIndex)}
            onClick={() => {
              setActiveIndex(i);
              scrollToIndex(i, true);
            }}
          />
        ))}
      </div>
    </section>
  );
}