import { BlobServiceClient } from "@azure/storage-blob"

const baseUrl = process.env.NEXT_PUBLIC_STORAGE_URL?.trim()
const sasToken = process.env.NEXT_PUBLIC_STORAGE_SAS?.trim()

if (!baseUrl || !sasToken) {
  throw new Error("❌ Azure Blob Storage configuration is incomplete: missing URL or SAS token")
}

// Construct the full connection URL safely
const connectionUrl = `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}${sasToken.startsWith("sv=") ? sasToken : `sv=${sasToken}`}`

let azureBlobClient: BlobServiceClient

try {
  azureBlobClient = new BlobServiceClient(connectionUrl)
  console.log("[Azure] ✅ BlobServiceClient initialized successfully")
} catch (error) {
  console.error("[Azure] ❌ Failed to initialize BlobServiceClient", error)
  throw new Error("Azure Blob client initialization failed")
}

export default azureBlobClient
