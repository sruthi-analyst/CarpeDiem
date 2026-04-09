import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jbfeddgfxeeargjzsaoi.supabase.co'; // Replace with yours if different!
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiZmVkZGdmeGVlYXJnanpzYW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NjUzNDcsImV4cCI6MjA5MTI0MTM0N30.Ep6iIooljo8AHRikveUAv0TCvXnqnyVxNxjzqybWTpI'; // Replace with your actual anon key!

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
