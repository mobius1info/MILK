import { TrendingUp, TrendingDown, UserPlus, MessageCircle, FileText, Info, HelpCircle, Briefcase } from 'lucide-react';

interface ActionButtonsProps {
  onDeposit: () => void;
  onWithdrawal: () => void;
}

export default function ActionButtons({ onDeposit, onWithdrawal }: ActionButtonsProps) {
  const buttons = [
    { icon: TrendingUp, label: 'Deposit', color: 'from-green-500 to-green-600', onClick: onDeposit },
    { icon: TrendingDown, label: 'Withdrawal', color: 'from-red-500 to-red-600', onClick: onWithdrawal },
    { icon: UserPlus, label: 'Invitation', color: 'from-blue-500 to-blue-600', onClick: () => alert('Invitation feature coming soon') },
    { icon: MessageCircle, label: 'Customer Service', color: 'from-purple-500 to-purple-600', onClick: () => alert('Customer Service: support@mkmall.com') },
    { icon: FileText, label: 'Terms', color: 'from-gray-600 to-gray-700', onClick: () => alert('Terms & Conditions') },
    { icon: Info, label: 'About US', color: 'from-[#2a5f64] to-[#1a4044]', onClick: () => alert('About MK MALL') },
    { icon: HelpCircle, label: 'FAQ', color: 'from-orange-500 to-orange-600', onClick: () => alert('Frequently Asked Questions') },
    { icon: Briefcase, label: 'WFP', color: 'from-[#f5b04c] to-[#e09f3a]', onClick: () => alert('Work From Platform') },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-6">
      {buttons.map((button) => {
        const Icon = button.icon;
        return (
          <button
            key={button.label}
            onClick={button.onClick}
            className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group"
          >
            <div className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-gradient-to-br ${button.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight">
              {button.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
