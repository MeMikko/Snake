declare module '@base-org/minikit' {
  export interface MiniKitAccountAssociation {}

  export interface MiniKitConfig {
    homeUrl: string;
    iconUrl: string;
    splashImageUrl: string;
    accountAssociation: MiniKitAccountAssociation;
  }

  export interface MiniKitSession {
    username: string;
    avatarUrl?: string;
  }

  export interface MiniKitClient {
    ready: (config: MiniKitConfig) => Promise<void>;
    getSession?: () => Promise<MiniKitSession | null>;
    connectWallet?: () => Promise<MiniKitSession>;
    themePreference?: 'light' | 'dark' | 'system';
  }

  export const MiniKit: MiniKitClient;
  export default MiniKit;
}

declare global {
  interface Window {
    MiniKit?: import('@base-org/minikit').MiniKitClient;
  }
}
