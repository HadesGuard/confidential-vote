"use client";

export const loadZamaSDK = async () => {
  if (typeof window === "undefined") {
    throw new Error("Zama FHE SDK must be loaded in browser");
  }

  const module = await import("@zama-fhe/relayer-sdk/bundle");
  
  // Zama SDK exports everything under `default`
  const sdk = (module as any).default || module;
  
  // Debug: check keys
  console.log("[ZAMA SDK] Exported keys:", Object.keys(sdk));
  console.log("[ZAMA SDK] Raw module:", module);

  const { initSDK, createInstance, SepoliaConfig } = sdk;

  if (!initSDK || !createInstance) {
    throw new Error("Zama SDK missing `initSDK` or `createInstance` – possibly incorrect module format");
  }

  return { initSDK, createInstance, SepoliaConfig };
};
