'use server';
import { config } from 'dotenv';
config({ path: '.env' });

import '@/ai/flows/extract-key-concepts.ts';
import '@/ai/flows/identify-knowledge-gaps.ts';
import '@/ai/flows/summarize-publication.ts';
import '@/ai/flows/compare-publications.ts';
