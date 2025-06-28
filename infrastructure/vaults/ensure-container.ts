import azureBlobClient from "./blob-client"

export async function ensureImageContainer() {
  const containerName = "images"
  const containerClient = azureBlobClient.getContainerClient(containerName)

  try {
    const { succeeded } = await containerClient.createIfNotExists({ access: "blob" })
    console.log(
      succeeded
        ? `[Azure] ✅ Container '${containerName}' created successfully`
        : `[Azure] ℹ️ Container '${containerName}' already exists`
    )
  } catch (error) {
    console.error(`[Azure] ❌ Failed to ensure container '${containerName}':`, error)
    throw new Error("Azure container initialization failed")
  }

  return containerClient
}
