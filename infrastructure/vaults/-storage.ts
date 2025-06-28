import { ensureImageContainer } from "@/services/storage"

export async function storeImage(file: File): Promise<string> {
  const container = await ensureImageContainer()
  const blobClient = container.getBlockBlobClient(file.name)

  try {
    if (await blobClient.exists()) {
      console.warn(`[Azure] ⚠️ Blob already exists, deleting before upload: ${file.name}`)
      await blobClient.delete()
    }

    const buffer = await file.arrayBuffer()
    await blobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: file.type || "application/octet-stream",
      },
    })

    const publicUrl = blobClient.url.split("?")[0]
    console.log(`[Azure] ✅ Uploaded image to ${publicUrl}`)
    return publicUrl
  } catch (err) {
    console.error(`[Azure] ❌ Upload failed for image ${file.name}:`, err)
    throw new Error("Failed to upload image to Azure Blob Storage")
  }
}

export async function removeImage(fileName: string): Promise<void> {
  const container = await ensureImageContainer()
  const blobClient = container.getBlockBlobClient(fileName)

  try {
    if (await blobClient.exists()) {
      await blobClient.delete()
      console.log(`[Azure] 🗑️ Deleted image: ${fileName}`)
    } else {
      console.warn(`[Azure] ⚠️ Attempted to delete non-existent blob: ${fileName}`)
    }
  } catch (err) {
    console.error(`[Azure] ❌ Failed to delete image ${fileName}:`, err)
    throw new Error("Failed to delete image from Azure Blob Storage")
  }
}
