import { BlobServiceClient } from "@azure/storage-blob"

const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL?.trim()
const sasToken = process.env.NEXT_PUBLIC_STORAGE_SAS?.trim()

if (!storageUrl || !sasToken) {
  throw new Error(
    "❌ Azure Blob Storage configuration incomplete: both NEXT_PUBLIC_STORAGE_URL and NEXT_PUBLIC_STORAGE_SAS must be set"
  )
}

// Build a URL object from the base and append all SAS params
const url = new URL(storageUrl)
const sas = sasToken.replace(/^\?/, "") // strip leading '?' if present
new URLSearchParams(sas).forEach((value, key) => {
  url.searchParams.set(key, value)
})

let azureBlobClient: BlobServiceClient

try {
  azureBlobClient = new BlobServiceClient(url.toString())
  console.info("[Azure] ✅ BlobServiceClient initialized")
} catch (err) {
  console.error("[Azure] ❌ Failed to initialize BlobServiceClient:", err)
  throw new Error("Azure BlobServiceClient initialization failed")
}

export default azureBlobClient
