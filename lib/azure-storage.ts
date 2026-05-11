import { BlobServiceClient } from "@azure/storage-blob";
import { randomUUID } from "crypto";

const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
const publicBaseUrl = process.env.AZURE_STORAGE_PUBLIC_BASE_URL;
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

function getStorageContainerClient() {
  if (!connectionString || !containerName || !publicBaseUrl) {
    throw new Error("Azure Storage environment variables are missing.");
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  return blobServiceClient.getContainerClient(containerName);
}

function getSafeBlobName(fileName: string) {
  const cleanedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${Date.now()}-${randomUUID()}-${cleanedName}`;
}

export async function uploadImageToAzure(file: File) {
  const containerClient = getStorageContainerClient();
  const blobName = getSafeBlobName(file.name || "upload");
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: file.type || "application/octet-stream",
    },
  });

  return {
    storagePath: blobName,
    imageUrl: `${publicBaseUrl}/${blobName}`,
  };
}
