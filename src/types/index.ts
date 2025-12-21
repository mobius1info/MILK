export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  rating: number;
  reviews: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Profile {
  id: string;
  email: string;
  username: string;
  balance: number;
  created_at: string;
  referral_code: string;
  referred_by: string | null;
  role: string;
  combo_enabled: boolean;
  vip_completions_count: number;
}
