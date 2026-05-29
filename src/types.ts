/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ArticleSection {
  heading: string;
  content: string;
}

export interface SeoCheckItem {
  id: string;
  checkAr: string;
  checkEn: string;
  passed: boolean;
  impact: 'high' | 'medium' | 'low';
}

export interface Article {
  id: string;
  topic: string;
  category: string; // The category name
  language: 'ar' | 'en';
  keywords: string[];
  tone: string;
  title: string;
  metaDescription: string;
  excerpt: string;
  sections: ArticleSection[];
  contentMarkdown: string;
  seoScore: number;
  wordCount: number;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: string | null; // ISO Date String
  publishedAt: string | null; // ISO Date String
  wordpressPostId: number | null;
  wordpressUrl: string | null;
  createdAt: string;
  featuredImageUrl?: string;
  audioUrl?: string | null;
  podcastScript?: string | null;
  publishedSites?: {
    siteId: string;
    siteUrl: string;
    siteName: string;
    postId: number;
    url: string;
    publishedAt: string;
  }[];
  scheduledSiteIds?: string[]; // The list of site IDs targeted for scheduled publishing
}

export interface WordPressSite {
  id: string;
  name: string;
  siteUrl: string;
  username: string;
  applicationPassword?: string;
  isConnected: boolean;
}

export interface WordPressConfig {
  siteUrl: string;
  username: string;
  applicationPassword?: string;
  isConnected: boolean;
}

export interface GenerateRequest {
  topic: string;
  category?: string;
  keywords: string[];
  language: 'ar' | 'en';
  tone: string;
  targetLength: 'short' | 'medium' | 'long';
  subheadingsCount: number;
}
