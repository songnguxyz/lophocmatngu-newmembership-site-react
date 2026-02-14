// src/App.jsx
import React, { useEffect } from "react";
import { FirebaseProvider, useFirebase } from "./context/FirebaseContext";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Login from "./components/Login";
import Admin from "./components/Admin/Admin";
import AdminRoute from "./components/Admin/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import Header from "./components/HeaderFooter/Header";
import Footer from "./components/HeaderFooter/Footer";
import Comics from "./components/Comics/Comics";
import ComicInfoPage from "./components/Comics/ComicInfoPage";
import ReadStandaloneChapter from "./components/Comics/ReadStandaloneChapter";
import Item from "./components/Item/Item";
import ItemDetail from "./components/Item/ItemDetail";
import PortalPage from "./components/Portal/PortalPage";
import MemberProfile from "./components/members/memberProfile";
import Shop from "./components/Shop/Shop";
import Checkout from "./components/Shop/Checkout";
import ThankYou from "./components/Shop/ThankYou";
import Cancel from "./components/Shop/Cancel";
import DanhSach from "./components/Nhanvat/DanhSach";
import NhanVatDetails from "./components/Nhanvat/NhanVatDetails";
import { DemoPage } from "./components/Shared/DemoPage";
import DieuKhoan from "./components/ChinhSach/DieuKhoan";
import GachaTest from "./components/Card/Gacha";
import MyCard from "./components/Card/MyCard";
import AllCardTemplate from "./components/Card/AllCardTemplate";
import HomeGame from "./components/Mutilplaygame/HomeGame";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function InnerAppRoutes() {
  const location = useLocation();
  const shouldHideLayout = location.pathname.startsWith("/game");

  // Auto fullscreen khi vào /game
  useEffect(() => {
    if (
      shouldHideLayout &&
      document.fullscreenEnabled &&
      !document.fullscreenElement
    ) {
      const el = document.documentElement;
      el.requestFullscreen().catch((err) => {
        console.warn("Không thể vào fullscreen tự động:", err);
      });
    }
  }, [shouldHideLayout]);

  return (
    <>
      {!shouldHideLayout && <Header />}
      <Routes>
        <Route path="/" element={<Navigate to="/portal" replace />} />
        <Route path="/portal" element={<PortalPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/dieukhoan" element={<DieuKhoan />} />
        <Route path="/gacha" element={<GachaTest />} />
        <Route path="/game/" element={<HomeGame />} />
        <Route path="/allcardtemplate" element={<AllCardTemplate />} />
        <Route path="/comics" element={<Comics />} />
        <Route path="/comic-info/:slug" element={<ComicInfoPage />} />
        <Route path="/read-chapter/:slug" element={<ReadStandaloneChapter />} />
        <Route path="/articles" element={<Item type="articles" />} />
        <Route
          path="/articles/:itemId"
          element={<ItemDetail type="articles" />}
        />
        <Route path="/boardgame" element={<Item type="boardgame" />} />
        <Route
          path="/boardgame/:itemId"
          element={<ItemDetail type="boardgame" />}
        />
        <Route path="/sanpham" element={<Item type="sanpham" />} />
        <Route
          path="/sanpham/:itemId"
          element={<ItemDetail type="sanpham" />}
        />
        <Route path="/nhanvat" element={<DanhSach />} />
        <Route path="/nhanvat/:slug" element={<NhanVatDetails />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/thankyou" element={<ThankYou />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <MemberProfile />
            </ProtectedRoute>
          }
        >
          <Route path="cards" element={<MyCard />} />
        </Route>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!shouldHideLayout && <Footer />}
    </>
  );
}

function AppContent() {
  const { initializing } = useFirebase();

  if (initializing) {
    return <div>Đang khởi tạo Firebase...</div>;
  }

  return (
    <BrowserRouter>
      <InnerAppRoutes />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <AppContent />
    </FirebaseProvider>
  );
}
