// utils/supabase/service.ts
import { createClient } from '@supabase/supabase-js';

export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,   // 🚨 server-only
    {
      auth: {
        persistSession: false,   // no cookies needed
      },
    }
  );
}
