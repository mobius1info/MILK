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
  console.log('NotificationModal render:', { isOpen, type, title });

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-[#f5b04c]" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-16 h-16 text-yellow-600" />;
      case 'info':
        return <Info className="w-16 h-16 text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-br from-[#f5b04c]/10 to-[#2a5f64]/10';
      case 'error':
        return 'bg-red-100';
      case 'warning':
        return 'bg-yellow-100';
      case 'info':
        return 'bg-blue-100';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'from-[#f5b04c] to-[#2a5f64]';
      case 'error':
        return 'from-red-500 to-rose-600';
      case 'warning':
        return 'from-yellow-500 to-orange-600';
      case 'info':
        return 'from-blue-500 to-cyan-600';
    }
  };

  console.log('Rendering NotificationModal with isOpen=true');

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[9998] animate-fadeIn"
        onClick={() => {
          onClose();
          if (onConfirm) {
            onConfirm();
          }
        }}
      ></div>
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full animate-scaleIn">
          <div className="flex flex-col items-center text-center">
            <div className={`w-20 h-20 ${getBackgroundColor()} rounded-full flex items-center justify-center mb-4`}>
              {getIcon()}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {title}
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {message}
            </p>
            <button
              onClick={() => {
                console.log('>>> NotificationModal OK button clicked');
                console.log('>>> Calling onClose()');
                onClose();
                if (onConfirm) {
                  console.log('>>> Calling onConfirm()');
                  onConfirm();
                } else {
                  console.log('>>> No onConfirm callback');
                }
              }}
              className={`w-full bg-gradient-to-r ${getButtonColor()} text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg`}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
