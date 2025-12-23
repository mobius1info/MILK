import { useEffect } from 'react';

export default function LoadingScreen() {
  useEffect(() => {
    document.title = 'MG SOUK - Loading...';
  }, []);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-transparent border-t-[#f5b04c] rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-transparent border-t-[#2a5f64] rounded-full animate-spin-slow"></div>
      </div>
    </div>
  );
}
