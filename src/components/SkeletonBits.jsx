import React from 'react';

export function SkeletonBox({ h = 16, w = '100%', radius = 14, style }) {
  return (
    <div
      className="skel"
      style={{
        height: h,
        width: w,
        borderRadius: radius,
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ tall = false }) {
  return (
    <div
      className="skel"
      style={{
        borderRadius: 18,
        padding: 12,
        height: tall ? 210 : 170,
      }}
    >
      <SkeletonBox h={92} radius={14} style={{ marginBottom: 12 }} />
      <SkeletonBox h={14} w="70%" style={{ marginBottom: 8 }} />
      <SkeletonBox h={12} w="45%" style={{ marginBottom: 10 }} />
      <div
        style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}
      >
        <SkeletonBox h={22} w={90} radius={999} />
        <SkeletonBox h={22} w={110} radius={999} />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6, minWidth = 280 }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, ${minWidth}px)`,
        justifyContent: 'flex-start',
        gap: 12,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}