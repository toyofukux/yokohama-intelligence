import { z } from 'zod';

const claimSchema = z
  .object({
    id: z.string().min(1),
    kind: z.enum(['fact', 'analysis', 'proposal']),
    text: z.string().min(1),
    citations: z.array(z.string().min(1)).min(1),
  })
  .strict();
export const articleSchema = z
  .object({ contentHash: z.string().regex(/^[a-f0-9]{64}$/), claims: z.array(claimSchema).min(1) })
  .strict();
export const reviewSchema = z
  .object({
    contentHash: z.string().regex(/^[a-f0-9]{64}$/),
    reviewer: z.string().min(1),
    reviewedAt: z.iso.datetime(),
    findings: z
      .array(
        z
          .object({
            claimId: z.string(),
            verdict: z.enum(['supported', 'contradiction', 'not_found', 'calculation_error']),
            citationIds: z.array(z.string()).min(1),
            rationale: z.string().min(1),
          })
          .strict(),
      )
      .min(1),
    humanApproval: z
      .object({
        approver: z.string().min(1),
        contentHash: z.string(),
        approvedAt: z.iso.datetime(),
      })
      .strict()
      .nullable(),
  })
  .strict();
// The caller computes the article hash over its canonical bytes, never accepts a model-supplied hash.
export function assertPublishable(
  articleInput: unknown,
  reviewInput: unknown,
  knownCitationIds: Set<string>,
  actualContentHash: string,
) {
  const article = articleSchema.parse(articleInput);
  const review = reviewSchema.parse(reviewInput);
  if (article.contentHash !== actualContentHash || review.contentHash !== actualContentHash)
    throw new Error('Review does not match current content');
  const claims = new Set(article.claims.map((c) => c.id));
  const findings = new Set(review.findings.map((f) => f.claimId));
  if (
    claims.size !== article.claims.length ||
    findings.size !== review.findings.length ||
    claims.size !== findings.size
  )
    throw new Error('Incomplete or duplicate verification');
  for (const c of article.claims) {
    if (c.citations.some((id) => !knownCitationIds.has(id))) throw new Error('Unknown citation');
    const finding = review.findings.find((f) => f.claimId === c.id);
    if (
      finding?.verdict !== 'supported' ||
      finding.citationIds.some((id) => !c.citations.includes(id))
    )
      throw new Error('Unverified claim');
  }
  if (
    article.claims.some((c) => c.kind !== 'fact') &&
    (!review.humanApproval || review.humanApproval.contentHash !== actualContentHash)
  )
    throw new Error('Human approval required');
  return { article, review };
}
