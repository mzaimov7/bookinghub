import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import BookingsPage from "./features/client/BookingsPage";
import FavoritesPage from "./features/client/FavoritesPage";
import ProfilePage from "./features/client/ProfilePage";
import BusinessDashboardPage from "./features/business/dashboard/BusinessDashboardPage";
import BusinessResourcesPage from "./features/business/resources/BusinessResourcesPage";
import BusinessCreateServicePage from "./features/business/services/BusinessCreateServicePage";
import HomePage from "./features/home/HomePage";
import ServiceDetailsPage from "./features/services/ServiceDetailsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/business/resources" element={<BusinessResourcesPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/services/:id" element={<ServiceDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/my-bookings" element={<BookingsPage />} />
        <Route path="/my-profile" element={<ProfilePage />} />
        <Route path="/business" element={<BusinessDashboardPage />} />
        <Route path="/business/services/new" element={<BusinessCreateServicePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
