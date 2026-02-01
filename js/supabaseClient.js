
const SUPABASE_URL = "https://woysaoheokhipqpfphpr.supabase.co";
const SUPABASE_KEY = "sb_publishable_WbweOMELckXb1bfnEA-g9A_YF3NwmSR";
//const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndveXNhb2hlb2toaXBxcGZwaHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDg0NDcsImV4cCI6MjA4NTMyNDQ0N30.IuWML5hwlXmo6yONo5JaYfzsypkajyxZ29sfyjaRqcA";

const { createClient } = supabase;
window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
