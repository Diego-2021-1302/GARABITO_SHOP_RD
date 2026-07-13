interface Window {
  gtag: (command: string, id: string, config?: any) => void;
  fbq: (command: string, action: string, params?: any) => void;
}
