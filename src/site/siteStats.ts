/**
 * Home-page counters. Fixed numbers and wording — update on request only.
 * (The knowledge base holds more files than `documents`; the count covers the
 * substantive documents, not every README.)
 */
export const SITE_STATS: {
  participants: number;
  documents: number;
  documentsSummary: string;
  documentsNote: string;
  githubUrl: string;
} = {
  participants: 1,
  documents: 3,
  documentsSummary:
    "Two architectural diagrams and one plain English commentary by a trust company CEO.",
  documentsNote:
    "The first pattern comes from a Canadian trust company where it is in live, Board-governed use for estate-file review, quarterly trust reporting and parts of AML.",
  /** GitHub button target. Points at the public content repository. */
  githubUrl: "https://github.com/trust-company-ai/community",
};
