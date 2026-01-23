// Centralized localStorage keys for quota tracking and settings
// Chat data is now stored in IndexedDB via session-storage.ts

export const STORAGE_KEYS = {
    // Quota tracking
    requestCount: "diagram-ai-request-count",
    requestDate: "diagram-ai-request-date",
    tokenCount: "diagram-ai-token-count",
    tokenDate: "diagram-ai-token-date",
    tpmCount: "diagram-ai-tpm-count",
    tpmMinute: "diagram-ai-tpm-minute",

    // Settings
    accessCode: "diagram-ai-access-code",
    accessCodeRequired: "diagram-ai-access-code-required",
    aiProvider: "diagram-ai-ai-provider",
    aiBaseUrl: "diagram-ai-ai-base-url",
    aiApiKey: "diagram-ai-ai-api-key",
    aiModel: "diagram-ai-ai-model",

    // Multi-model configuration
    modelConfigs: "diagram-ai-model-configs",
    selectedModelId: "diagram-ai-selected-model-id",

    // Chat input preferences
    sendShortcut: "diagram-ai-send-shortcut",

    // Diagram validation
    vlmValidationEnabled: "diagram-ai-vlm-validation-enabled",
} as const
