import type { SponsorBanner } from '../types';

export const mockSponsorBanners: SponsorBanner[] = [
  {
    id: 'sponsor-1',
    title: 'Bank Desa Makmur',
    image_url:
      'https://images.pexels.com/photos/50987/money-card-business-credit-card-50987.jpeg?auto=compress&cs=tinysrgb&w=400&h=120&fit=crop',
    link_url: 'https://example.com/bank-desa',
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'sponsor-2',
    title: 'Toko Tani Sejahtera',
    image_url:
      'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=400&h=120&fit=crop',
    link_url: 'https://example.com/toko-tani',
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'sponsor-3',
    title: 'Koperasi Merah Putih',
    image_url:
      'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400&h=120&fit=crop',
    is_active: true,
    sort_order: 3,
  },
];
