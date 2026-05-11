# Connectify

Beginner-friendly Next.js social photo app using Azure SQL Database and Azure Blob Storage.

Required environment variables:

```env
AZURE_STORAGE_CONNECTION_STRING=""
AZURE_STORAGE_CONTAINER_NAME="images"
AZURE_STORAGE_PUBLIC_BASE_URL=""

AZURE_SQL_SERVER=""
AZURE_SQL_DATABASE=""
AZURE_SQL_USER=""
AZURE_SQL_PASSWORD=""
```

The app uses Azure SQL Database tables for users, sessions, posts, comments, and ratings. Image uploads use an Azure Blob Storage container named `images`.

Run `azure/schema.sql` in the Azure SQL Query Editor to create the tables and indexes.

The storage account should allow blob anonymous access, and the `images` container should use blob-level public read access. Uploads are still server-side only through the Next.js API route, using `AZURE_STORAGE_CONNECTION_STRING`.
