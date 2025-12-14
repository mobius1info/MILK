import { Product, Category } from '../types';

export const categories: Category[] = [
  { id: 'electronics', name: 'Electronics', icon: 'Smartphone' },
  { id: 'fashion', name: 'Fashion', icon: 'Shirt' },
  { id: 'home', name: 'Home & Living', icon: 'Home' },
  { id: 'beauty', name: 'Beauty', icon: 'Sparkles' },
  { id: 'sports', name: 'Sports', icon: 'Dumbbell' },
  { id: 'books', name: 'Books', icon: 'Book' },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones Pro',
    price: 149.99,
    image: 'https://images.pexels.com/photos/3825517/pexels-photo-3825517.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'electronics',
    description: 'Premium wireless headphones with noise cancellation',
    rating: 4.8,
    reviews: 1253
  },
  {
    id: '2',
    name: 'Smart Watch Elite',
    price: 299.99,
    image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'electronics',
    description: 'Advanced fitness tracking and smart notifications',
    rating: 4.6,
    reviews: 892
  },
  {
    id: '3',
    name: 'Designer Handbag',
    price: 189.99,
    image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'fashion',
    description: 'Luxury leather handbag with elegant design',
    rating: 4.9,
    reviews: 567
  },
  {
    id: '4',
    name: 'Premium Sunglasses',
    price: 129.99,
    image: 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'fashion',
    description: 'UV protection with polarized lenses',
    rating: 4.7,
    reviews: 423
  },
  {
    id: '5',
    name: 'Modern Table Lamp',
    price: 79.99,
    image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'home',
    description: 'Minimalist design with adjustable brightness',
    rating: 4.5,
    reviews: 312
  },
  {
    id: '6',
    name: 'Ceramic Vase Set',
    price: 49.99,
    image: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'home',
    description: 'Handcrafted ceramic vases in various sizes',
    rating: 4.4,
    reviews: 198
  },
  {
    id: '7',
    name: 'Skincare Gift Set',
    price: 89.99,
    image: 'https://images.pexels.com/photos/3018845/pexels-photo-3018845.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'beauty',
    description: 'Complete skincare routine with natural ingredients',
    rating: 4.8,
    reviews: 756
  },
  {
    id: '8',
    name: 'Luxury Perfume',
    price: 119.99,
    image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'beauty',
    description: 'Elegant fragrance with long-lasting scent',
    rating: 4.6,
    reviews: 634
  },
  {
    id: '9',
    name: 'Yoga Mat Premium',
    price: 59.99,
    image: 'https://images.pexels.com/photos/3775566/pexels-photo-3775566.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'sports',
    description: 'Non-slip yoga mat with carrying strap',
    rating: 4.7,
    reviews: 445
  },
  {
    id: '10',
    name: 'Running Shoes Pro',
    price: 139.99,
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'sports',
    description: 'Lightweight running shoes with cushioned sole',
    rating: 4.9,
    reviews: 1124
  },
  {
    id: '11',
    name: 'Bestseller Novel Collection',
    price: 34.99,
    image: 'https://images.pexels.com/photos/1030979/pexels-photo-1030979.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'books',
    description: 'Set of 3 award-winning novels',
    rating: 4.8,
    reviews: 892
  },
  {
    id: '12',
    name: 'Professional Camera',
    price: 899.99,
    image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'electronics',
    description: 'DSLR camera with 24MP sensor',
    rating: 4.9,
    reviews: 456
  },
];
