import type { ProductCategoryRecord } from '../types';

export const mockProductCategories: ProductCategoryRecord[] = [
  {
    id: 'cat-1',
    slug: 'makanan-minuman',
    label: 'Makanan & Minuman',
    image_url:
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'cat-2',
    slug: 'hasil-pertanian',
    label: 'Hasil Pertanian',
    image_url:
      'https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'cat-3',
    slug: 'kerajinan',
    label: 'Kerajinan Tangan',
    image_url:
      'https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
    is_active: true,
    sort_order: 3,
  },
  {
    id: 'cat-4',
    slug: 'fashion',
    label: 'Fashion & Kain',
    image_url:
      'https://images.pexels.com/photos/3622608/pexels-photo-3622608.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
    is_active: true,
    sort_order: 4,
  },
  {
    id: 'cat-5',
    slug: 'kebutuhan-harian',
    label: 'Kebutuhan Harian',
    image_url:
      'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
    is_active: true,
    sort_order: 5,
  },
  {
    id: 'cat-6',
    slug: 'oleholeh',
    label: 'Oleh-Oleh Khas',
    image_url:
      'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
    is_active: true,
    sort_order: 6,
  },
];
