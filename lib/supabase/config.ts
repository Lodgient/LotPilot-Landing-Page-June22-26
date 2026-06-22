// Public Supabase config. The anon key is designed to be exposed to the browser;
// row-level security (RLS) is what actually protects the data. Override via env
// in any environment that wants its own project.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://slbkykjgghtvlyujqcuy.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsYmt5a2pnZ2h0dmx5dWpxY3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3OTY2NTAsImV4cCI6MjA5NzM3MjY1MH0.FEysNNRzYET3Fh8hxR7J9_PFKfmC0ltO23KxxgOn2t0";
