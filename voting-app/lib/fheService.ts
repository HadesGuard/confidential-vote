import { ethers } from 'ethers';
import zamaService, { ZamaConfig } from './zamaService';

// Types for FHE operations
export interface FHEInstance {
  encrypt: (value: number) => Promise<{ encryptedValue: string; proof: string }>;
  decrypt: (encryptedValue: string) => Promise<number>;
  publicDecrypt: (encryptedValue: string) => Promise<number>;
}

export interface FHEConfig {
  network: any;
  rpcUrl?: string;
  chainId?: number;
  account?: string;
}

export interface EncryptedVote {
  encryptedValue: string; // externalEuint8 as bytes32
  proof: string; // bytes
}

// Vote options
export const VOTE_OPTIONS = {
  YES: 0,
  NO: 1,
} as const;

// Real FHE service using Zama SDK via CDN
class RealFHEService {
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.isInitialized) return;
    
    // If initialization is already in progress, wait for it
    if (this.initPromise) {
      await this.initPromise;
      return;
    }
    
    this.initPromise = this.performInit();
    await this.initPromise;
  }

  private async performInit(): Promise<void> {
    console.log('Initializing FHE service with Zama SDK...');
    
    try {
      // Just check if Zama SDK is available, don't create instance yet
      // The actual instance will be created with proper config when needed
      this.isInitialized = true;
      console.log('FHE service initialized successfully');
    } catch (error: any) {
      console.error('Failed to initialize FHE service:', error);
      throw new Error('FHE initialization failed: ' + (error?.message || 'Unknown error'));
    }
  }

  async createInstance(config: FHEConfig): Promise<FHEInstance> {
    await this.init();
    
    // Convert FHEConfig to ZamaConfig
    const zamaConfig: ZamaConfig = {
      network: config.network,
      rpcUrl: config.rpcUrl,
      chainId: config.chainId,
      account: config.account
    };
    
    // Get Zama instance
    const zamaInstance = await zamaService.getInstance(zamaConfig);
    
    return {
      encrypt: async (value: number): Promise<{ encryptedValue: string; proof: string }> => {
        return await zamaService.encrypt(value, zamaConfig);
      },
      
      decrypt: async (encryptedValue: string): Promise<number> => {
        return await zamaService.decrypt(encryptedValue, zamaConfig);
      },
      
      publicDecrypt: async (encryptedValue: string): Promise<number> => {
        return await zamaService.publicDecrypt(encryptedValue, zamaConfig);
      }
    };
  }

  isSDKAvailable(): boolean {
    return this.isInitialized && zamaService.isReady();
  }

  getSDKStatus(): { initialized: boolean; sdkInstance: any; cdnAvailable: boolean } {
    const zamaStatus = zamaService.getStatus();
    return {
      initialized: this.isInitialized,
      sdkInstance: zamaStatus.ready ? 'Zama CDN Instance' : null,
      cdnAvailable: zamaStatus.sdkLoaded
    };
  }

  reset(): void {
    console.log('Resetting FHE service...');
    this.isInitialized = false;
    this.initPromise = null;
    zamaService.reset();
  }

  clearDecryptCache(): void {
    zamaService.clearDecryptCache();
  }
}

// Create singleton instance
const fheService = new RealFHEService();

// Export the service instance
export default fheService;

// Export utility functions
export const encryptVote = async (voteValue: number, config: FHEConfig): Promise<EncryptedVote> => {
  const instance = await fheService.createInstance(config);
  const result = await instance.encrypt(voteValue);
  return {
    encryptedValue: result.encryptedValue,
    proof: result.proof
  };
};

export const decryptVote = async (encryptedValue: string, config: FHEConfig): Promise<number> => {
  const instance = await fheService.createInstance(config);
  return await instance.decrypt(encryptedValue);
};

export const generateVoteProof = async (encryptedVote: EncryptedVote, config: FHEConfig): Promise<string> => {
  // For now, return the proof from the encrypted vote
  // In a real implementation, this might generate additional proofs
  return encryptedVote.proof;
};

export const validateVoteValue = (value: number): boolean => {
  return value === VOTE_OPTIONS.YES || value === VOTE_OPTIONS.NO;
};

export const getVoteOptionLabel = (value: number): string => {
  switch (value) {
    case VOTE_OPTIONS.YES:
      return 'Yes';
    case VOTE_OPTIONS.NO:
      return 'No';
    default:
      return 'Unknown';
  }
};

export const prepareVoteForContract = async (voteValue: number, config: FHEConfig): Promise<{
  encryptedVote: string;
  proof: string;
}> => {
  if (!validateVoteValue(voteValue)) {
    throw new Error(`Invalid vote value: ${voteValue}`);
  }

  const encryptedVote = await encryptVote(voteValue, config);
  
  return {
    encryptedVote: encryptedVote.encryptedValue,
    proof: encryptedVote.proof
  };
};

export const getFHEStatus = () => {
  return {
    isInitialized: fheService.isSDKAvailable(),
    sdkStatus: fheService.getSDKStatus(),
    zamaStatus: zamaService.getStatus()
  };
};

export const handleFHEError = (error: any): string => {
  if (error?.message?.includes('getCoprocessorSigners')) {
    return 'Network does not support FHE. Please connect to Sepolia testnet.';
  }
  
  if (error?.message?.includes('Zama SDK can only be loaded on client side')) {
    return 'FHE SDK is not available on server side. Please try again.';
  }
  
  if (error?.message?.includes('Failed to load Zama SDK from CDN')) {
    return 'Failed to load FHE SDK from CDN. Please check your internet connection.';
  }
  
  return error?.message || 'Unknown FHE error occurred';
}; 