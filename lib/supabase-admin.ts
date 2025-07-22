import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!; // <-- SIN NEXT_PUBLIC
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // <-- secreta

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
