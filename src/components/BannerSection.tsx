import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Banner {
  id: string;
  image_url: string;
  title: string;
  order_position: number;
}

export default function BannerSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('order_position', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (loading) {
    return (
      <div className="relative w-full overflow-hidden rounded-xl shadow-lg mb-6 bg-gray-200 animate-pulse">
        <div className="h-48 sm:h-64 md:h-80" />
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="relative w-full overflow-hidden rounded-xl shadow-lg mb-6 bg-gradient-to-r from-[#f5b04c] to-[#2a5f64]">
        <div className="h-48 sm:h-64 md:h-80 flex items-center justify-center">
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-black text-white drop-shadow-2xl tracking-wider">
            SHOP
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl shadow-lg mb-6">
      <div className="relative h-48 sm:h-64 md:h-80">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative w-full h-full">
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-4">
                  <h1 className="text-6xl sm:text-8xl md:text-9xl font-black text-white drop-shadow-2xl tracking-wider mb-2">
                    SHOP
                  </h1>
                  <p className="text-lg sm:text-2xl md:text-3xl font-bold text-white/90 drop-shadow-lg">
                    {banner.title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
