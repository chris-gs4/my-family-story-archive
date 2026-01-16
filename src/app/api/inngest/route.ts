// Inngest API Route
// This endpoint serves Inngest functions
import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { functions } from '@/lib/inngest/functions';

// Serve Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
