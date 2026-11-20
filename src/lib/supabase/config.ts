// Public Supabase settings. The publishable key is designed to be public:
// access to data is controlled by Row Level Security in the database.
// Environment variables override these defaults if set in Vercel.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://nkuafhchtdortmsvhkty.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_A0tYouCHFnpPXwdlfRB_dA_i0Mp0Zxv";
