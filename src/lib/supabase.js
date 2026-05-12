import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ebgowtfbelmhkejjyssl.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZ293dGZiZWxtaGtlamp5c3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNTg4NjgsImV4cCI6MjA5MzYzNDg2OH0.69mF2oWzoQ9ph6tSCT9_LwlG0TRveGeaNlB92OQXJSA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
