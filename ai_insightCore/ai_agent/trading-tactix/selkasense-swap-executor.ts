import { SWAP_ASSISTANT_SKILLS } from "./capabilities"
import { SWAP_ASSISTANT_GUIDE } from "./description"
import { SELKASENSE_SWAP_AGENT_ID } from "./name"
import { SWAP_TOOLKIT } from "./tools"

import type { AssistantProfile } from "@/selkasense/agent"

export const selkasenseSwapExecutor: AssistantProfile = {
  id: SELKASENSE_SWAP_AGENT_ID,
  label: "selkasense-swap-executor",
  extensions: SWAP_TOOLKIT,
  promptBase: SWAP_ASSISTANT_GUIDE,
  features: SWAP_ASSISTANT_SKILLS
}
