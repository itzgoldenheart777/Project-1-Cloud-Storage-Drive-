
const SUPABASE_URL = "https://woysaehokhipqpfhpr.supabase.co";
const SUPABASE_KEY = "sb_publishable_WbweOMELckXb1bfnEA-g9A_YF3NwmSR";

const { createClient } = supabase;
window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
