interface Window {
  MiniKit?: {
    user?: {
      username?: string;
      avatarUrl?: string;
    };
    theme?: 'light' | 'dark';
    ready?: () => void;
  };
}
