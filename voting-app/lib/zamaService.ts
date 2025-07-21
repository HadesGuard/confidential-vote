"use client";

// Zama FHE Service using CDN UMD approach
// This is the most stable approach for Next.js as recommended by Zama docs

export interface ZamaInstance {
  createEncryptedInput: (value: number) => Promise<{ encryptedValue: string; proof: string }>;
  userDecrypt: (encryptedValue: string) => Promise<number>;
  publicDecrypt: (encryptedValue: string) => Promise<number>;
  generateKeypair: () => Promise<any>;
  getPublicKey: () => Promise<string>;
  getPublicParams: () => Promise<any>;
  createEIP712: (data: any) => Promise<any>;
}

export interface ZamaConfig {
  network: any;
  rpcUrl?: string;
  chainId?: number;
  account?: string;
}

// Global state for SDK loading
let sdkLoaded = false;
let sdkLoadPromise: Promise<void> | null = null;

// Load Zama SDK from CDN
const loadZamaSDKFromCDN = async (): Promise<void> => {
  if (typeof window === "undefined") {
    throw new Error("Zama SDK can only be loaded on client side");
  }

  if (sdkLoaded) {
    console.log('Zama SDK already loaded');
    return;
  }

  if (sdkLoadPromise) {
    console.log('Zama SDK loading already in progress, waiting...');
    await sdkLoadPromise;
    return;
  }

  console.log('Starting to load Zama SDK from CDN...');
  
  sdkLoadPromise = new Promise<void>((resolve, reject) => {
    // Check if SDK is already loaded
    if ((window as any).initSDK && (window as any).createInstance) {
      console.log('Zama SDK already available in window');
      sdkLoaded = true;
      resolve();
      return;
    }

    // Try CDN first
    const tryCDN = () => {
      const script = document.createElement('script');
      script.src = 'https://cdn.zama.ai/relayer-sdk-js/0.1.0-9/relayer-sdk-js.umd.cjs';
      script.type = 'text/javascript';
      
      script.onload = () => {
        console.log('Zama SDK script loaded from CDN');
        
        // Wait a bit for the script to initialize
        setTimeout(() => {
          console.log('Checking SDK availability after CDN load...');
          console.log('window.initSDK:', typeof (window as any).initSDK);
          console.log('window.createInstance:', typeof (window as any).createInstance);
          console.log('window.SepoliaConfig:', typeof (window as any).SepoliaConfig);
          
          if ((window as any).initSDK && (window as any).createInstance) {
            console.log('Zama SDK loaded from CDN successfully');
            sdkLoaded = true;
            resolve();
          } else {
            console.log('CDN failed, trying dynamic import...');
            tryDynamicImport();
          }
        }, 2000); // Wait 2 seconds for initialization
      };
      
      script.onerror = () => {
        console.log('CDN failed, trying dynamic import...');
        tryDynamicImport();
      };

      document.head.appendChild(script);
    };

    // Fallback to dynamic import
    const tryDynamicImport = async () => {
      try {
        console.log('Trying dynamic import...');
        const module = await import("@zama-fhe/relayer-sdk/bundle");
        const sdk = (module as any).default || module;
        
        console.log('Dynamic import successful:', Object.keys(sdk));
        
        // Assign to window for consistency
        (window as any).initSDK = sdk.initSDK;
        (window as any).createInstance = sdk.createInstance;
        (window as any).SepoliaConfig = sdk.SepoliaConfig;
        
        if ((window as any).initSDK && (window as any).createInstance) {
          console.log('Zama SDK loaded via dynamic import successfully');
          sdkLoaded = true;
          resolve();
        } else {
          reject(new Error('SDK functions not available after dynamic import'));
        }
      } catch (error) {
        console.error('Dynamic import also failed:', error);
        reject(new Error('Both CDN and dynamic import failed'));
      }
    };

    // Start with CDN
    tryCDN();
    
    // Timeout after 15 seconds
    setTimeout(() => {
      if (!sdkLoaded) {
        console.error('Zama SDK load timeout');
        reject(new Error('Zama SDK load timeout'));
      }
    }, 15000);
  });

  await sdkLoadPromise;
};

// Initialize Zama SDK
const initializeZamaSDK = async (): Promise<void> => {
  await loadZamaSDKFromCDN();
  
  if (!(window as any).initSDK) {
    throw new Error('Zama SDK not available after loading');
  }

  console.log('Initializing Zama SDK...');
  await (window as any).initSDK();
  console.log('Zama SDK initialized successfully');
};

// Create Zama instance
const createZamaInstance = async (config: ZamaConfig): Promise<ZamaInstance> => {
  await initializeZamaSDK();

  if (!(window as any).createInstance || !(window as any).SepoliaConfig) {
    throw new Error('Zama SDK functions not available');
  }

  console.log('Creating Zama instance with config:', {
    network: config.network,
    rpcUrl: config.rpcUrl,
    chainId: config.chainId,
    account: config.account
  });

  const sdkConfig = { ...(window as any).SepoliaConfig, network: config.network };
  console.log('SDK config:', sdkConfig);

  try {
    const instance = await (window as any).createInstance(sdkConfig);
    console.log('Zama instance created successfully');
    console.log('Instance type:', typeof instance);
    console.log('Instance keys:', Object.keys(instance));
    console.log('Instance methods:', Object.getOwnPropertyNames(instance));
    console.log('Instance prototype:', Object.getOwnPropertyNames(Object.getPrototypeOf(instance)));
    return instance;
  } catch (error: any) {
    console.error('Failed to create Zama instance:', error);
    throw new Error(`Failed to create Zama instance: ${error?.message || 'Unknown error'}`);
  }
};

// Main Zama Service class
class ZamaService {
  private instance: ZamaInstance | null = null;
  private currentConfig: ZamaConfig | null = null;
  private initPromise: Promise<ZamaInstance> | null = null;
  private decryptCache: Map<string, { value: number; timestamp: number }> = new Map();
  private readonly DECRYPT_CACHE_DURATION = 30000; // 30 seconds

  private configChanged(newConfig: ZamaConfig): boolean {
    if (!this.currentConfig) return true;
    
    return (
      this.currentConfig.account !== newConfig.account ||
      this.currentConfig.chainId !== newConfig.chainId ||
      this.currentConfig.rpcUrl !== newConfig.rpcUrl
    );
  }

  async getInstance(config: ZamaConfig): Promise<ZamaInstance> {
    // Check if config changed, if so, reset instance
    if (this.configChanged(config)) {
      console.log('Config changed, creating new Zama instance...');
      this.reset();
    }

    if (this.instance) {
      return this.instance;
    }

    if (this.initPromise) {
      return await this.initPromise;
    }

    this.currentConfig = config;
    this.initPromise = createZamaInstance(config);
    this.instance = await this.initPromise;
    return this.instance;
  }

  async encrypt(value: number, config: ZamaConfig): Promise<{ encryptedValue: string; proof: string }> {
    const instance = await this.getInstance(config);
    console.log(`Encrypting value: ${value}`);
    console.log('Instance in encrypt:', instance);
    console.log('Instance type:', typeof instance);
    console.log('Instance keys:', Object.keys(instance));
    console.log('Instance.createEncryptedInput:', typeof instance.createEncryptedInput);
    
    try {
      const result = await instance.createEncryptedInput(value);
      console.log('Encryption result:', result);
      return result;
    } catch (error: any) {
      console.error('Encryption failed:', error);
      throw new Error(`Encryption failed: ${error?.message || 'Unknown error'}`);
    }
  }

  async decrypt(encryptedValue: string, config: ZamaConfig): Promise<number> {
    const instance = await this.getInstance(config);
    console.log(`Decrypting value: ${encryptedValue}`);
    
    // Check cache first
    const cached = this.decryptCache.get(encryptedValue);
    if (cached && Date.now() - cached.timestamp < this.DECRYPT_CACHE_DURATION) {
      console.log('Returning cached decryption result:', cached.value);
      return cached.value;
    }
    
    try {
      const result = await instance.userDecrypt(encryptedValue);
      console.log('Decryption result:', result);
      
      // Cache the result
      this.decryptCache.set(encryptedValue, {
        value: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error: any) {
      console.error('Decryption failed:', error);
      throw new Error(`Decryption failed: ${error?.message || 'Unknown error'}`);
    }
  }

  async publicDecrypt(encryptedValue: string, config: ZamaConfig): Promise<number> {
    const instance = await this.getInstance(config);
    console.log(`Public decrypting value: ${encryptedValue}`);
    
    try {
      const result = await instance.publicDecrypt(encryptedValue);
      console.log('Public decryption result:', result);
      return result;
    } catch (error: any) {
      console.error('Public decryption failed:', error);
      throw new Error(`Public decryption failed: ${error?.message || 'Unknown error'}`);
    }
  }

  isReady(): boolean {
    return this.instance !== null;
  }

  reset(): void {
    console.log('Resetting Zama service...');
    this.instance = null;
    this.initPromise = null;
    this.clearDecryptCache();
  }

  clearDecryptCache(): void {
    this.decryptCache.clear();
  }

  getStatus(): { ready: boolean; sdkLoaded: boolean } {
    return {
      ready: this.isReady(),
      sdkLoaded
    };
  }
}

// Create singleton instance
const zamaService = new ZamaService();

// Export the service instance
export default zamaService;

// Export utility functions
export const encryptValue = async (value: number, config: ZamaConfig) => {
  return await zamaService.encrypt(value, config);
};

export const decryptValue = async (encryptedValue: string, config: ZamaConfig) => {
  return await zamaService.decrypt(encryptedValue, config);
};

export const publicDecryptValue = async (encryptedValue: string, config: ZamaConfig) => {
  return await zamaService.publicDecrypt(encryptedValue, config);
};

export const getZamaStatus = () => {
  return zamaService.getStatus();
};

export const resetZamaService = () => {
  zamaService.reset();
}; 