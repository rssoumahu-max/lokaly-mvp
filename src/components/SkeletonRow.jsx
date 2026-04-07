import React from 'react';
import { SkeletonCard } from './SkeletonBits';

export default function SkeletonRow({ count = 6, minWidth = 280 }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 6,
        paddingTop: 2,
        scrollbarWidth: 'none',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ minWidth }}>
          <SkeletonCard />
        </div>
      ))}
    </div>
  );
}
