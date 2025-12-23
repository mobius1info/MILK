export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto pb-24 px-4">
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 text-center">
          About Us
        </h1>
        <p className="text-center text-gray-600 text-lg">
          Learn more about MG SOUK and our mission
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4">
            <h2 className="text-2xl font-bold text-white">Platform Profile</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              MG SOUK is an intelligent cloud global order matching center with a sense of mission, which plays an important role in major ecommerce platforms around the world. Currently, MG SOUK maintains close strategic partnership with Amazon, Alibaba, shopee, AliExpress, souq, jumia, maxfashion and Daraz.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cooperation, Blocking traffic through online vacuuming, updating layered product information through digital product reconstruction, enabling scenarios and enhancing competitiveness. MG SOUK uses an intelligent cloud algorithm engine to accurately match buyers and users with established merchants and automatically match transactions, allowing many established merchants to stand out in the fierce business competition.
            </p>
            <p className="text-gray-700 leading-relaxed">
              MG SOUK is not a single cloud shopping platform. Its greatest value lies in allowing consumers to earn commissions through free sharing while shopping normally. Merchants will have a promoter at the same time they pick up the order. With its leading 5G intelligent cloud matching technology, MG SOUK has helped countless merchants and consumers.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4">
            <h2 className="text-2xl font-bold text-white">Win-Win Cooperation</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              At MG SOUK, we carry out win-win cooperation for all users around the world, increase the interaction between users and merchants, help users make money, and help merchants make profits. We retain company results. We abide by the rules and are committed to building a well-known cooperative e-commerce company.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Through its own technology to guide the development of e-commerce industry, we are committed to becoming the creator of industry standards. This is our constant pursuit and corporate vision.
            </p>
            <p className="text-gray-700 leading-relaxed font-semibold text-gray-800">
              We also thank all MG SOUK partners and users for their support and valuable time. Let us work hard to achieve win-win cooperation and gain huge benefits!
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-md p-6 border-2 border-green-200">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Our Mission</h3>
            <p className="text-gray-700 leading-relaxed">
              Connecting merchants and consumers worldwide through intelligent technology, creating opportunities for everyone to succeed in the digital economy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
