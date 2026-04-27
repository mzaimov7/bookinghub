import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import CategoryDiscoverySection from "../../components/sections/CategoryDiscoverySection";
import HeroCarousel from "../../components/sections/HeroCarousel";
import PlatformStorySection from "../../components/sections/PlatformStorySection";
import ServiceGrid from "../../components/sections/ServiceGrid";
import { getRecentSearches, getFavoriteIds, addFavorite, removeFavorite } from "../client/api";
import { getCategories, searchServices } from "./api";
import { getRole, isLoggedIn } from "../../lib/authStore";

export default function HomePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    async function load() {
      const [loadedCategories, loadedServices] = await Promise.all([getCategories(), searchServices()]);
      setCategories(loadedCategories);
      setServices(loadedServices);

      if (isLoggedIn() && getRole() === "CLIENT") {
        const [loadedRecentSearches, loadedFavoriteIds] = await Promise.all([
          getRecentSearches().catch(() => []),
          getFavoriteIds().catch(() => []),
        ]);
        setRecentSearches(loadedRecentSearches);
        setFavoriteIds(loadedFavoriteIds);
      }
    }

    load();
  }, []);

  function onSearchSubmit(filters = {}) {
    const params = new URLSearchParams();
    if (filters.query) params.set("query", filters.query);
    if (filters.city) params.set("city", filters.city);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    navigate(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function onCategoryPick(category) {
    navigate(`/search?categoryId=${category.id}`);
  }

  function onRecentSearchPick(item) {
    const params = new URLSearchParams();
    if (item.query) params.set("query", item.query);
    if (item.city) params.set("city", item.city);
    if (item.categoryId != null) params.set("categoryId", String(item.categoryId));
    if (item.minPrice != null) params.set("minPrice", String(item.minPrice));
    if (item.maxPrice != null) params.set("maxPrice", String(item.maxPrice));
    navigate(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  }

  async function onToggleFavorite(serviceId) {
    const isFavorite = favoriteIds.includes(serviceId);

    if (isFavorite) {
      await removeFavorite(serviceId);
      setFavoriteIds((current) => current.filter((item) => item !== serviceId));
      return;
    }

    await addFavorite(serviceId);
    setFavoriteIds((current) => [...current, serviceId]);
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Header
        categories={categories}
        recentSearches={recentSearches}
        onCategoryPick={onCategoryPick}
        onSearchSubmit={onSearchSubmit}
        onRecentSearchPick={onRecentSearchPick}
      />

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 16px 18px" }}>
        <HeroCarousel />
        <CategoryDiscoverySection categories={categories} onPickCategory={onCategoryPick} />
        <ServiceGrid
          services={services.slice(0, 6)}
          favoriteIds={favoriteIds}
          onToggleFavorite={onToggleFavorite}
          title="Most popular right now"
        />
        <PlatformStorySection />
      </div>

      <Footer />
    </div>
  );
}
