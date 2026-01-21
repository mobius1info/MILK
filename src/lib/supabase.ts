import { createClient } from '@supabase/supabase-js';
import { DATABASE_CONFIG } from '../config/database';

const supabaseUrl = DATABASE_CONFIG.SUPABASE_URL;
const supabaseAnonKey = DATABASE_CONFIG.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: 'admin' | 'client';
  balance: number;
  referral_code: string;
  referred_by: string | null;
  total_spent: number;
  total_orders: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  rating: number;
  reviews: number;
  vip_level: number;
  commission_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string;
  payment_method_id: string | null;
  payment_proof_url: string | null;
  transaction_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'crypto' | 'bank' | 'other';
  wallet_address: string;
  network: string | null;
  qr_code_url: string | null;
  min_amount: number;
  max_amount: number | null;
  instructions: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_method: 'balance' | 'card' | 'cash';
  shipping_address: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  bonus_amount: number;
  status: 'pending' | 'paid';
  created_at: string;
}

export interface CategoryAccess {
  id: string;
  user_id: string;
  category: string;
  is_enabled: boolean;
  product_limit: number;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  title: string;
  image_url: string;
  order_position: number;
  is_active: boolean;
  created_at: string;
}
