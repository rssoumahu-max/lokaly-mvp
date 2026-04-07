import React from 'react';

export default function LocationModalReviewsTab({
  language,
  user,
  THEME,
  RenderStars,
  SkeletonBox,

  reviewMsg,
  loadingMyReview,
  myExistingReview,
  reviewEditMode,
  setReviewEditMode,
  myRating,
  setMyRating,
  myComment,
  setMyComment,
  savingReview,
  deletingReview,
  submitMyReview,
  deleteMyReview,

  ratingStats,
  loading,
  errorMsg,
  loadReviews,
  reviews,
  highlightReviewId,

  reviewCardShellStyle,
  myReviewBadgeStyle,
  reviewErrorStyle,
  getReviewInitials,
  formatReviewDate,
  secondaryActionStyle,
}) {
  const otherReviews = (Array.isArray(reviews) ? reviews : []).filter(
    (r) => r?.id && r.id !== myExistingReview?.id
  );

  return (
    <div
      style={{
        marginTop: 18,
        paddingLeft: 16,
        paddingRight: 16,
        boxSizing: 'border-box',
      }}
    >
      {/* Trustpilot-style summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(108px, 156px) minmax(0, 1fr)',
          gap: 12,
          alignItems: 'stretch',
        }}
      >
        <div
          style={{
            ...reviewCardShellStyle,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            minHeight: 98,
          }}
        >
          <div
            style={{
              fontFamily: THEME.fontDisplay,
              fontSize: 30,
              fontWeight: 700,
              lineHeight: 1,
              color: 'rgba(235,240,255,0.96)',
            }}
          >
            {ratingStats.total ? Number(ratingStats.avg).toFixed(1) : '–'}
          </div>

          <div style={{ marginTop: 8 }}>
            <RenderStars
              value={ratingStats.total ? ratingStats.avg : 0}
              size={15}
              gap={3}
            />
          </div>

          <div
            style={{
              marginTop: 10,
              fontFamily: THEME.font,
              fontSize: 12,
              fontWeight: 500,
              color: 'rgba(235,240,255,0.56)',
            }}
          >
            {language === 'nl'
              ? `${ratingStats.total} review${
                  ratingStats.total === 1 ? '' : 's'
                }`
              : `${ratingStats.total} review${
                  ratingStats.total === 1 ? '' : 's'
                }`}
          </div>
        </div>

        <div style={reviewCardShellStyle}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingStats.counts?.[star] || 0;
            const pct = ratingStats.total
              ? (count / ratingStats.total) * 100
              : 0;

            return (
              <div
                key={star}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px minmax(0, 1fr) 28px',
                  gap: 8,
                  alignItems: 'center',
                  marginBottom: star === 1 ? 0 : 7,
                }}
              >
                <div
                  style={{
                    fontFamily: THEME.font,
                    fontSize: 12,
                    fontWeight: 620,
                    color: 'rgba(235,240,255,0.82)',
                  }}
                >
                  {star}★
                </div>

                <div
                  style={{
                    height: 7,
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.08)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      borderRadius: 999,
                      background: 'rgba(255,107,61,0.96)',
                    }}
                  />
                </div>

                <div
                  style={{
                    textAlign: 'right',
                    fontFamily: THEME.font,
                    fontSize: 11.5,
                    fontWeight: 540,
                    color: 'rgba(235,240,255,0.58)',
                  }}
                >
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!!reviewMsg && (
        <div
          style={{
            marginTop: 14,
            padding: '10px 12px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(235,240,255,0.82)',
            fontFamily: THEME.font,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {reviewMsg}
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        {loadingMyReview ? (
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={reviewCardShellStyle}>
              <SkeletonBox width={120} height={14} radius={8} />
              <div style={{ marginTop: 8 }}>
                <SkeletonBox width={96} height={14} radius={8} />
              </div>
              <div style={{ marginTop: 12 }}>
                <SkeletonBox width="100%" height={86} radius={12} />
              </div>
            </div>
          </div>
        ) : myExistingReview && !reviewEditMode ? (
          <div
            style={{
              ...reviewCardShellStyle,
              border: '1px solid rgba(255,107,61,0.28)',
              background: 'rgba(255,107,61,0.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={myReviewBadgeStyle}>
                  {language === 'nl' ? 'Jouw review' : 'Your review'}
                </div>

                <div style={{ marginTop: 2 }}>
                  <RenderStars
                    value={Number(myExistingReview.rating) || 0}
                    size={14}
                    gap={3}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setReviewEditMode(true)}
                  style={{
                    ...secondaryActionStyle,
                    minHeight: 36,
                    padding: '0 12px',
                    fontSize: 12.5,
                  }}
                >
                  {language === 'nl' ? 'Bewerk' : 'Edit'}
                </button>

                <button
                  type="button"
                  onClick={deleteMyReview}
                  disabled={deletingReview}
                  style={{
                    ...secondaryActionStyle,
                    minHeight: 36,
                    padding: '0 12px',
                    fontSize: 12.5,
                    opacity: deletingReview ? 0.65 : 1,
                  }}
                >
                  {deletingReview
                    ? language === 'nl'
                      ? 'Bezig...'
                      : 'Deleting...'
                    : language === 'nl'
                    ? 'Verwijder'
                    : 'Delete'}
                </button>
              </div>
            </div>

            {!!myExistingReview.comment && (
              <div
                style={{
                  marginTop: 10,
                  fontFamily: THEME.font,
                  fontSize: 13.5,
                  fontWeight: 420,
                  lineHeight: 1.45,
                  color: 'rgba(235,240,255,0.82)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {myExistingReview.comment}
              </div>
            )}
          </div>
        ) : (
          <div style={reviewCardShellStyle}>
            <div style={myReviewBadgeStyle}>
              {language === 'nl' ? 'Jouw review' : 'Your review'}
            </div>

            {!user ? (
              <>
                <div
                  style={{
                    marginTop: 10,
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1px solid rgba(255,107,61,0.22)',
                    background: 'rgba(255,107,61,0.08)',
                    color: 'rgba(235,240,255,0.86)',
                    fontFamily: THEME.font,
                    fontSize: 13,
                    fontWeight: 500,
                    lineHeight: 1.45,
                  }}
                >
                  {language === 'nl'
                    ? 'Je moet eerst inloggen om een review te plaatsen.'
                    : 'You need to log in first to post a review.'}
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    type="button"
                    onClick={submitMyReview}
                    disabled={savingReview}
                    style={{
                      ...secondaryActionStyle,
                      minHeight: 38,
                      padding: '0 14px',
                      fontSize: 13,
                      opacity: savingReview ? 0.65 : 1,
                    }}
                  >
                    {savingReview
                      ? language === 'nl'
                        ? 'Opslaan...'
                        : 'Saving...'
                      : language === 'nl'
                      ? 'Log in om te reviewen'
                      : 'Log in to review'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    marginTop: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= (Number(myRating) || 0);

                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setMyRating(star)}
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        style={{
                          appearance: 'none',
                          border: 'none',
                          background: 'transparent',
                          padding: 0,
                          margin: 0,
                          cursor: 'pointer',
                          lineHeight: 1,
                          fontSize: 24,
                          color: active
                            ? 'rgba(255,107,61,0.98)'
                            : 'rgba(255,255,255,0.28)',
                          transition:
                            'transform 120ms ease, opacity 120ms ease',
                          opacity: active ? 1 : 0.9,
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>

                <textarea
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                  placeholder={
                    language === 'nl'
                      ? 'Schrijf hier je ervaring...'
                      : 'Write your experience here...'
                  }
                  style={{
                    width: '100%',
                    minHeight: 110,
                    marginTop: 12,
                    resize: 'vertical',
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.10)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'rgba(235,240,255,0.92)',
                    padding: '12px 14px',
                    outline: 'none',
                    fontFamily: THEME.font,
                    fontSize: 13.5,
                    lineHeight: 1.45,
                    boxSizing: 'border-box',
                  }}
                />

                <div
                  style={{
                    marginTop: 12,
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    type="button"
                    onClick={submitMyReview}
                    disabled={savingReview}
                    style={{
                      ...secondaryActionStyle,
                      minHeight: 38,
                      padding: '0 14px',
                      fontSize: 13,
                      opacity: savingReview ? 0.65 : 1,
                    }}
                  >
                    {savingReview
                      ? language === 'nl'
                        ? 'Opslaan...'
                        : 'Saving...'
                      : myExistingReview
                      ? language === 'nl'
                        ? 'Update review'
                        : 'Update review'
                      : language === 'nl'
                      ? 'Plaats review'
                      : 'Post review'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ✅ Andere reviews lijst (zonder jouw review) */}
      <div style={{ marginTop: 14 }}>
        {loading ? (
          <div style={{ display: 'grid', gap: 10 }}>
            {[1, 2, 3].map((n) => (
              <div key={n} style={reviewCardShellStyle}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <SkeletonBox width={110} height={14} radius={8} />
                  <SkeletonBox width={74} height={14} radius={8} />
                </div>

                <div style={{ marginTop: 10 }}>
                  <SkeletonBox width="92%" height={12} radius={8} />
                </div>
                <div style={{ marginTop: 8 }}>
                  <SkeletonBox width="78%" height={12} radius={8} />
                </div>
              </div>
            ))}
          </div>
        ) : errorMsg ? (
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={reviewErrorStyle}>
              {language === 'nl'
                ? `Reviews konden niet worden geladen. ${errorMsg || ''}`
                : `Could not load reviews. ${errorMsg || ''}`}
            </div>

            <div>
              <button
                type="button"
                onClick={loadReviews}
                style={{
                  ...secondaryActionStyle,
                  minHeight: 38,
                  padding: '0 14px',
                  fontSize: 13,
                }}
              >
                {language === 'nl' ? 'Opnieuw proberen' : 'Retry'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {otherReviews.map((r) => {
              const isHighlighted = String(highlightReviewId) === String(r.id);

              const username =
                r?.profile?.username ||
                r?.profile?.first_name ||
                (language === 'nl' ? 'Gebruiker' : 'User');

              const avatarUrl = r?.profile?.avatar_url || '';
              const initials = getReviewInitials(
                r?.profile,
                username,
                language
              );
              const reviewDate = formatReviewDate(r?.created_at, language);

              return (
                <div
                  key={r.id}
                  id={`review-${r.id}`}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 14,
                    border: isHighlighted
                      ? '1px solid rgba(255,107,61,0.55)'
                      : '1px solid rgba(255,255,255,0.10)',
                    background: isHighlighted
                      ? 'rgba(255,107,61,0.10)'
                      : 'rgba(255,255,255,0.03)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={username}
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            flexShrink: 0,
                            border: '1px solid rgba(255,255,255,0.10)',
                            background: 'rgba(255,255,255,0.06)',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(255,255,255,0.10)',
                            background: isHighlighted
                              ? 'rgba(255,107,61,0.16)'
                              : 'rgba(255,255,255,0.06)',
                            color: isHighlighted
                              ? 'rgba(255,107,61,0.98)'
                              : 'rgba(235,240,255,0.84)',
                            fontFamily: THEME.font,
                            fontSize: 12,
                            fontWeight: 800,
                            letterSpacing: 0.2,
                          }}
                        >
                          {initials}
                        </div>
                      )}

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: THEME.font,
                            fontSize: 13,
                            fontWeight: 650,
                            color: 'rgba(235,240,255,0.88)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {username}
                        </div>

                        {!!reviewDate && (
                          <div
                            style={{
                              marginTop: 3,
                              fontFamily: THEME.font,
                              fontSize: 11.5,
                              fontWeight: 500,
                              color: 'rgba(235,240,255,0.48)',
                            }}
                          >
                            {reviewDate}
                          </div>
                        )}
                      </div>
                    </div>

                    <RenderStars
                      value={Number(r.rating) || 0}
                      size={14}
                      gap={3}
                    />
                  </div>

                  {r.comment ? (
                    <div
                      style={{
                        marginTop: 8,
                        fontFamily: THEME.font,
                        fontSize: 13.5,
                        fontWeight: 420,
                        lineHeight: 1.45,
                        color: 'rgba(235,240,255,0.78)',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {r.comment}
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: 8,
                        fontFamily: THEME.font,
                        fontSize: 13,
                        fontWeight: 420,
                        color: 'rgba(235,240,255,0.46)',
                        fontStyle: 'italic',
                      }}
                    >
                      {language === 'nl'
                        ? 'Geen toelichting gegeven.'
                        : 'No comment provided.'}
                    </div>
                  )}
                </div>
              );
            })}

            {otherReviews.length === 0 && (
              <div
                style={{
                  ...reviewCardShellStyle,
                  color: 'rgba(235,240,255,0.62)',
                  fontFamily: THEME.font,
                  fontSize: 13.5,
                  fontWeight: 450,
                }}
              >
                {language === 'nl'
                  ? 'Nog geen reviews van andere gebruikers.'
                  : 'No reviews from other users yet.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
