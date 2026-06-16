import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./features/auth/LoginPage";
import ForgotPasswordPage from "./features/auth/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/ResetPasswordPage";
import RegisterPage from "./features/auth/RegisterPage";
import AdminServicesPage from "./features/admin/AdminServicesPage";
import BookingsPage from "./features/client/BookingsPage";
import FavoritesPage from "./features/client/FavoritesPage";
import ProfilePage from "./features/client/ProfilePage";
import BusinessBookingsPage from "./features/business/bookings/BusinessBookingsPage";
import BusinessDashboardPage from "./features/business/dashboard/BusinessDashboardPage";
import BusinessProfilePage from "./features/business/profile/BusinessProfilePage";
import BusinessResourcesPage from "./features/business/resources/BusinessResourcesPage";
import BusinessCreateServicePage from "./features/business/services/BusinessCreateServicePage";
import BusinessServicesPage from "./features/business/services/BusinessServicesPage";
import HomePage from "./features/home/HomePage";
import SearchResultsPage from "./features/search/SearchResultsPage";
import ServiceDetailsPage from "./features/services/ServiceDetailsPage";
import { getLastSessionActivity, isLoggedIn, logoutLocal, markSessionActivity } from "./lib/authStore";

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const ACTIVITY_EVENTS = ["click", "mousemove", "keydown", "scroll", "touchstart"];

export default function App() {
  return (
    <BrowserRouter>
      <SessionTimeoutGuard />
      <Routes>
        <Route path="/business/resources" element={<BusinessResourcesPage />} />
        <Route path="/business/bookings" element={<BusinessBookingsPage />} />
        <Route path="/business/services" element={<BusinessServicesPage />} />
        <Route path="/business/profile" element={<BusinessProfilePage />} />
        <Route path="/admin" element={<AdminServicesPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/services/:id" element={<ServiceDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/my-bookings" element={<BookingsPage />} />
        <Route path="/my-profile" element={<ProfilePage />} />
        <Route path="/business" element={<BusinessDashboardPage />} />
        <Route path="/business/services/new" element={<BusinessCreateServicePage />} />
        <Route path="/business/services/:id/edit" element={<BusinessCreateServicePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function SessionTimeoutGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    function expireSession() {
      logoutLocal();
      navigate("/login", { replace: true });
      window.alert("Сесията изтече поради бездействие. Моля, влез отново.");
    }

    function checkSession() {
      if (!isLoggedIn()) return;

      const lastActivity = getLastSessionActivity();
      if (!lastActivity) {
        markSessionActivity();
        return;
      }

      if (Date.now() - lastActivity >= SESSION_TIMEOUT_MS) {
        expireSession();
      }
    }

    function resetSessionTimer() {
      if (isLoggedIn()) {
        markSessionActivity();
      }
    }

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, resetSessionTimer, { passive: true });
    });

    const intervalId = window.setInterval(checkSession, 30 * 1000);
    checkSession();

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, resetSessionTimer);
      });
      window.clearInterval(intervalId);
    };
  }, [navigate]);

  return null;
}
