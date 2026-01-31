const SUPABASE_URL = "https://woysaheokhipqpfhpr.supabase.co";
const SUPABASE_KEY = "sb_publishable_WbweOMELckXb1bfnEA-g9A_YF3NwmSR";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.supabaseClient = supabase;
