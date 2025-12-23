import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onConfirm?: () => void;
}

export default function NotificationModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  onConfirm
}: NotificationModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-20 h-20 text-green-500" />;
      case 'error':
        return <XCircle className="w-20 h-20 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-20 h-20 text-yellow-500" />;
      case 'info':
        return <Info className="w-20 h-20 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'info':
        return 'bg-blue-50';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'from-green-500 to-emerald-600';
      case 'error':
        return 'from-red-500 to-rose-600';
      case 'warning':
        return 'from-yellow-500 to-orange-600';
      case 'info':
        return 'from-blue-500 to-cyan-600';
    }
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] animate-fadeIn"
        onClick={handleConfirm}
      ></div>
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-scaleIn pointer-events-auto border-2 border-gray-100">
          <div className="flex flex-col items-center text-center">
            <div className={`w-24 h-24 ${getBackgroundColor()} rounded-full flex items-center justify-center mb-6 shadow-lg`}>
              {getIcon()}
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {title}
            </h3>
            <p className="text-gray-700 mb-8 leading-relaxed text-lg">
              {message}
            </p>
            <button
              onClick={handleConfirm}
              className={`w-full bg-gradient-to-r ${getButtonColor()} text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105`}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
