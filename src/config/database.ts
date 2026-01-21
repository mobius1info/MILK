export const DATABASE_CONFIG = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://qstiybtwufspvrvnrkbp.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzdGl5YnR3dWZzcHZydm5ya2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNDIwNjAsImV4cCI6MjA4MzgxODA2MH0.XU_y1gKPza4r_84aWtUVaKc5lP3fobXKuoNWIod1nuo',
} as const;
