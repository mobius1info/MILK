import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b">
          <FileText className="w-8 h-8 text-[#f5b04c]" />
          <h1 className="text-2xl font-bold text-gray-800">Platform Rules</h1>
        </div>

        <section className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h2 className="text-lg font-bold text-blue-900 mb-2">About Recharge</h2>
            <p className="text-sm text-blue-800 leading-relaxed">
              [The platform will change the recharge method from time to time] Each user should click the recharge interface to check the latest recharge method before recharging, so as to avoid recharge failure on the old account due to recharge. If your recharge request has not been completed, please contact the recharge customer service for consultation in time.
            </p>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <h2 className="text-lg font-bold text-green-900 mb-2">About Withdrawal</h2>
            <p className="text-sm text-green-800 leading-relaxed">
              The minimum withdrawal amount of MALL is 20USDT, and the minimum deposit amount is 10USDT. When you request a withdrawal, we will process it immediately and arrive within 24 hours. Due to the large number of users on the platform, in order to ensure that each user has a good experience and normal withdrawal, please wait patiently for the withdrawal process to complete. Please understand that, If you do not receive the money on the withdrawal slip within 24 hours, please contact customer service in time! Withdraw of funds is available after each party of tasks is completed.
            </p>
          </div>

          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
            <h2 className="text-lg font-bold text-orange-900 mb-2">About Freezing the Order</h2>
            <p className="text-sm text-orange-800 leading-relaxed">
              If the order is not delivered within 10 minutes after the user places the order, or the user returns to the page after receiving the order, the order will be frozen. Just click [Home] - [Order] to send immediately.
            </p>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <h2 className="text-lg font-bold text-red-900 mb-2">About Multiple Accounts</h2>
            <p className="text-sm text-red-800 leading-relaxed">
              Only one account with the correct mobile number is allowed to register with MALL per identical username. If the system monitors you to register multiple accounts and IPs, you will be suspected of illegal money laundering, which will affect normal withdrawals and cause the account to be frozen.
            </p>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
            <h2 className="text-lg font-bold text-purple-900 mb-2">About Withdrawal Information</h2>
            <p className="text-sm text-purple-800 leading-relaxed">
              In order to avoid possible security issues, such as account theft, criminals use the user's account to change the withdrawal information. The mall stipulates that the correct withdrawal information cannot be easily changed, so it is recommended that users confirm the wallet they need to use when they have multiple wallets and do not change it easily.
            </p>
          </div>
        </section>

        <div className="bg-gray-100 rounded-lg p-4 mt-6">
          <p className="text-xs text-gray-600 text-center">
            Please read and understand all the rules carefully. By using the platform, you agree to abide by these rules.
          </p>
        </div>
      </div>
    </div>
  );
}
