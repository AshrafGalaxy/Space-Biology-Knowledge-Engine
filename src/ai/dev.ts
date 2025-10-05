import { config } from 'dotenv';
config();

import '@/ai/flows/extract-key-concepts.ts';
import '@/ai/flows/identify-knowledge-gaps.ts';
import '@/ai/flows/summarize-publication.ts';