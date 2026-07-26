import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import KulinerPage from './pages/KulinerPage';
import KulinerDetailPage from './pages/KulinerDetailPage';
import SellerRoute from './components/SellerRoute';
import AdminRoute from './components/AdminRoute';
import AdminDashboardPage from './pages/AdminDashboardPage';
import InfoDesaPage from './pages/InfoDesaPage';
import InfoDesaDetailPage from './pages/InfoDesaDetailPage';
import JasaPage from './pages/JasaPage';
import JasaDetailPage from './pages/JasaDetailPage';
import EventPage from './pages/EventPage';
import EventDetailPage from './pages/EventDetailPage';
import ChannelVideoDetailPage from './pages/ChannelVideoDetailPage';
import WisataPage from './pages/WisataPage';
import WisataDetailPage from './pages/WisataDetailPage';
import LowonganPage from './pages/LowonganPage';
import LowonganDetailPage from './pages/LowonganDetailPage';
import SearchPage from './pages/SearchPage';
import StaticPage from './pages/StaticPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="produk" element={<ProductsPage />} />
          <Route path="produk/:id" element={<ProductDetailPage />} />
          <Route path="keranjang" element={<CartPage />} />
          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="pesanan"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profil"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="seller"
            element={
              <ProtectedRoute>
                <SellerRoute>
                  <SellerDashboardPage />
                </SellerRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route path="kuliner" element={<KulinerPage />} />
          <Route path="kuliner/:id" element={<KulinerDetailPage />} />
          <Route path="jasa" element={<JasaPage />} />
          <Route path="jasa/:id" element={<JasaDetailPage />} />
          <Route path="event" element={<EventPage />} />
          <Route path="event/video/:id" element={<ChannelVideoDetailPage />} />
          <Route path="event/:id" element={<EventDetailPage />} />
          <Route path="wisata" element={<WisataPage />} />
          <Route path="wisata/:id" element={<WisataDetailPage />} />
          <Route path="lowongan" element={<LowonganPage />} />
          <Route path="lowongan/:id" element={<LowonganDetailPage />} />
          <Route path="cari" element={<SearchPage />} />
          <Route path="info-desa" element={<InfoDesaPage />} />
          <Route path="info-desa/:id" element={<InfoDesaDetailPage />} />
          <Route path="halaman/:slug" element={<StaticPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
