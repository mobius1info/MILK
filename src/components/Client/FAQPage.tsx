export default function FAQPage() {
  return (
    <div className="max-w-4xl mx-auto pb-24 px-4">
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 text-center">
          FAQs
        </h1>
        <p className="text-center text-gray-600 text-lg">
          Frequently Asked Questions
        </p>
      </div>

      <div className="space-y-6">
        {/* Deposits Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
            <h2 className="text-2xl font-bold text-white">Some Questions About Deposits</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="text-gray-700 leading-relaxed">
                <span className="font-semibold">1.</span> Users need to obtain a new payment address each time they make a deposit. Repeated deposits to the same payment address are not allowed. Otherwise, the deposit may not automatically reach the account, recharge may fail, and other problems may occur.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="text-gray-700 leading-relaxed">
                <span className="font-semibold">2.</span> The deposit will automatically arrive in your account within 15 minutes, please wait patiently. If the deposit does not arrive within the time limit, you can send the deposit voucher to contact customer service for verification.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="text-gray-700 leading-relaxed">
                <span className="font-semibold">3.</span> There is no unified arrival time for cryptocurrency transfers. Depending on the region and the cryptocurrency wallet used, there may be different transfer delays, and some wallets may delay more than 72 hours. Please wait patiently for the transfer to be successful, and contact customer service for verification after the TXID is generated.
              </p>
            </div>

            <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
              <p className="text-gray-700 leading-relaxed">
                <span className="font-semibold">4.</span> The only cryptocurrency used in the mall is <span className="font-bold text-red-600">USDT</span>! Other currencies such as TRX, TUSD, and BUSD are not available. Please do not send other cryptocurrencies to avoid recharge failure and loss of funds!
              </p>
            </div>
          </div>
        </div>

        {/* How to Deposit */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4">
            <h2 className="text-2xl font-bold text-white">How to Make a Deposit</h2>
          </div>
          <div className="p-6">
            <ol className="space-y-3">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold mr-3 flex-shrink-0">1</span>
                <span className="text-gray-700 pt-1">Select (Deposit)</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold mr-3 flex-shrink-0">2</span>
                <span className="text-gray-700 pt-1">Select (USDT) and confirm</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold mr-3 flex-shrink-0">3</span>
                <span className="text-gray-700 pt-1">Enter the deposit amount and confirm</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold mr-3 flex-shrink-0">4</span>
                <span className="text-gray-700 pt-1">Payment is successful, upload the payment order picture, submit the payment successfully and contact the online customer service</span>
              </li>
            </ol>
          </div>
        </div>

        {/* How to Bind Payment Address */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4">
            <h2 className="text-2xl font-bold text-white">How to Bind a Payment Address</h2>
          </div>
          <div className="p-6">
            <ol className="space-y-3">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold mr-3 flex-shrink-0">1</span>
                <span className="text-gray-700 pt-1">Select (Withdraw)</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold mr-3 flex-shrink-0">2</span>
                <span className="text-gray-700 pt-1">Bind a withdrawal method and confirm</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold mr-3 flex-shrink-0">3</span>
                <span className="text-gray-700 pt-1">Enter a withdrawal password</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold mr-3 flex-shrink-0">4</span>
                <span className="text-gray-700 pt-1">Enter your name and select USDT-TRC-20. Enter your payment address, enter your withdrawal password, and submit the binding successfully</span>
              </li>
            </ol>
          </div>
        </div>

        {/* How to Withdraw */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4">
            <h2 className="text-2xl font-bold text-white">How to Withdraw Funds</h2>
          </div>
          <div className="p-6">
            <ol className="space-y-3">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-semibold mr-3 flex-shrink-0">1</span>
                <span className="text-gray-700 pt-1">Select (Withdrawal)</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-semibold mr-3 flex-shrink-0">2</span>
                <span className="text-gray-700 pt-1">Enter the withdrawal amount and withdrawal password, submit and complete</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Withdrawal Questions */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4">
            <h2 className="text-2xl font-bold text-white">Some Questions About Withdrawals</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="border-l-4 border-teal-500 pl-4 py-2">
              <p className="text-gray-700 leading-relaxed">
                <span className="font-semibold">1.</span> Withdrawals will arrive at the user's bound wallet address within 24 hours. According to statistics, the average withdrawal time for mall users is 30 minutes. The specific time depends on the current number of working users and the delay of cryptocurrency transfer.
              </p>
            </div>

            <div className="border-l-4 border-teal-500 pl-4 py-2">
              <p className="text-gray-700 leading-relaxed">
                <span className="font-semibold">2.</span> In order to ensure the safety of users' funds, the mall recommends that new users bind the correct withdrawal information as soon as possible according to the prompts after joining the mall. (If the user does not know how to bind the correct information, the mall adopts membership invitation system, and you can contact the superior user who invited you to join for guidance)
              </p>
            </div>

            <div className="border-l-4 border-teal-500 pl-4 py-2">
              <p className="text-gray-700 leading-relaxed">
                <span className="font-semibold">3.</span> In order to avoid possible security issues, such as account theft, criminals use the user's account to change the withdrawal information. The mall stipulates that the correct withdrawal information cannot be easily changed, so it is recommended that users confirm the wallet they need to use when they have multiple wallets and do not change it easily.
              </p>
            </div>
          </div>
        </div>

        {/* Common Problems with Orders */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-4">
            <h2 className="text-2xl font-bold text-white">Common Problems with Orders</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="border-l-4 border-rose-500 pl-4 py-2">
              <p className="text-gray-700 leading-relaxed">
                <span className="font-semibold">1.</span> Depending on the account funds, users can enter different work order channels. The commissions for different channels are different. Users can decide according to their own financial ability.
              </p>
              <p className="text-gray-600 text-sm mt-2 italic">
                As shown in the figure, the purchase price of Alibaba is 500USDT, and the purchase price of Alibaba-VIP2 is 500USDT. The same thing, the cost exceeds 899USDT, Shopee-VIP3 can be purchased!
              </p>
            </div>

            <div className="border-l-4 border-rose-500 pl-4 py-2">
              <p className="text-gray-700 leading-relaxed">
                <span className="font-semibold">2.</span> This prompt means that the user has an unfinished work order, so a new task order cannot be obtained.
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Users can find their unfinished work orders in the order record. After completing the order, they can return to the order grabbing page to obtain a new task order!
              </p>
            </div>
          </div>
        </div>

        {/* How to Apply for Second Task */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-4">
            <h2 className="text-2xl font-bold text-white">How to Apply to Start a Second Task Order</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed">
              The tasks that staff apply for are VIP2 and VIP3 rooms. When the first task is completed, they can continue to apply for the second task to obtain higher commissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
