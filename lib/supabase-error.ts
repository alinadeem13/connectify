export function getSupabaseErrorMessage(message: string) {
  if (message.includes("schema cache") || message.includes("Could not find the table")) {
    return "Supabase tables are not set up yet. Run supabase/schema.sql in the Supabase SQL editor, then try again.";
  }

  return message;
}
