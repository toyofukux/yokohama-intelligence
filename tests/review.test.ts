import assert from 'node:assert/strict';
import test from 'node:test';
import { assertPublishable } from '../packages/core/review.ts';

const hash = 'a'.repeat(64);
const article = {
  contentHash: hash,
  claims: [{ id: 'c1', kind: 'fact', text: 'A source-backed statement', citations: ['s1'] }],
};
const review = {
  contentHash: hash,
  reviewer: 'independent-reviewer',
  reviewedAt: '2026-09-05T00:00:00Z',
  findings: [
    {
      claimId: 'c1',
      verdict: 'supported',
      citationIds: ['s1'],
      rationale: 'Exact row and unit verified',
    },
  ],
  humanApproval: null,
};
const known = new Set(['s1']);
test('complete verification of exact content can pass', () => {
  assert.doesNotThrow(() => assertPublishable(article, review, known, hash));
});
test('empty, missing, unknown or contradictory verification cannot pass', () => {
  assert.throws(() => assertPublishable(article, null, known, hash));
  assert.throws(() => assertPublishable(article, { ...review, findings: [] }, known, hash));
  for (const verdict of ['PASS', 'not_found', 'contradiction', 'calculation_error'])
    assert.throws(() =>
      assertPublishable(
        article,
        { ...review, findings: [{ ...review.findings[0], verdict }] },
        known,
        hash,
      ),
    );
});
test('fixing content invalidates old verification', () => {
  assert.throws(() => assertPublishable(article, review, known, 'b'.repeat(64)), /current content/);
});
test('citation presence cannot substitute for an exact claim review', () => {
  assert.throws(() => assertPublishable(article, review, new Set(), hash), /Unknown citation/);
  assert.throws(
    () =>
      assertPublishable(
        article,
        { ...review, findings: [{ ...review.findings[0], claimId: 'c2' }] },
        known,
        hash,
      ),
    /Unverified claim/,
  );
});
test('analysis and policy proposals need a human approval on the same version', () => {
  const proposal = { ...article, claims: [{ ...article.claims[0], kind: 'proposal' }] };
  assert.throws(() => assertPublishable(proposal, review, known, hash), /Human approval/);
  assert.throws(
    () =>
      assertPublishable(
        proposal,
        {
          ...review,
          humanApproval: {
            approver: 'editor',
            contentHash: 'b'.repeat(64),
            approvedAt: review.reviewedAt,
          },
        },
        known,
        hash,
      ),
    /Human approval/,
  );
});
