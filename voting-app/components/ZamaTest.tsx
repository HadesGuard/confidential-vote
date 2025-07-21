"use client";

import { useEffect, useState } from "react";

export default function ZamaTest() {
  const [status, setStatus] = useState<string>("Loading...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testZamaSDK = async () => {
      try {
        setStatus("Testing Zama SDK...");
        
        // Check if SDK is already loaded
        if ((window as any).initSDK && (window as any).createInstance) {
          setStatus("Zama SDK already available!");
          return;
        }

        setStatus("Loading Zama SDK from CDN...");
        
        // Load SDK manually
        const script = document.createElement('script');
        script.src = 'https://cdn.zama.ai/relayer-sdk-js/0.1.0-9/relayer-sdk-js.umd.cjs';
        script.type = 'text/javascript';
        
        script.onload = () => {
          console.log('Zama SDK script loaded');
          
          // Wait for initialization
          setTimeout(() => {
            console.log('Checking SDK after load...');
            console.log('window.initSDK:', typeof (window as any).initSDK);
            console.log('window.createInstance:', typeof (window as any).createInstance);
            console.log('window.SepoliaConfig:', typeof (window as any).SepoliaConfig);
            
            if ((window as any).initSDK && (window as any).createInstance) {
              setStatus("Zama SDK loaded successfully!");
              
              // Try to initialize
              (window as any).initSDK().then(() => {
                setStatus("Zama SDK initialized successfully!");
              }).catch((err: any) => {
                setError(`Init failed: ${err.message}`);
              });
            } else {
              setError("SDK functions not available after load");
            }
          }, 2000);
        };
        
        script.onerror = () => {
          setError("Failed to load SDK script from CDN");
        };

        document.head.appendChild(script);
        
      } catch (err: any) {
        setError(`Test failed: ${err.message}`);
      }
    };

    testZamaSDK();
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold mb-2">Zama SDK Test</h3>
      <p className="text-sm mb-2">Status: {status}</p>
      {error && (
        <p className="text-sm text-red-600">Error: {error}</p>
      )}
      <div className="text-xs text-gray-600 mt-2">
        <p>window.initSDK: {typeof (window as any).initSDK}</p>
        <p>window.createInstance: {typeof (window as any).createInstance}</p>
        <p>window.SepoliaConfig: {typeof (window as any).SepoliaConfig}</p>
      </div>
    </div>
  );
} 