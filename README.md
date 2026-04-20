# Connectify

Beginner-friendly Next.js social photo app using Supabase only.

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
```

The app uses Supabase tables for users, sessions, posts, comments, and ratings. Image uploads use a public Supabase Storage bucket named `images`.

Run `supabase/schema.sql` in the Supabase SQL editor to create the tables, indexes, bucket, and simple public image upload/read policies.

If signup says `Could not find the table 'public.users' in the schema cache`, the SQL has not been run in the Supabase project connected by your `.env.local` values, or the REST schema cache has not refreshed yet. Run the full schema file again.
