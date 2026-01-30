
const SUPABASE_URL = "https://thqbgvosalffvyptzxws.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
