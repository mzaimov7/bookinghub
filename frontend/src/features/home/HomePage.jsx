import React, { useEffect, useState } from "react";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import HeroCarousel from "../../components/sections/HeroCarousel";
import ServiceGrid from "../../components/sections/ServiceGrid";
import { getRecentSearches, getFavoriteIds, addFavorite, removeFavorite, saveRecentSearch } from "../client/api";
import { getCategories, searchServices } from "./api";
import { getRole, isLoggedIn } from "../../lib/authStore";

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [hasActiveSearch, setHasActiveSearch] = useState(false);

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

  async function onSearchSubmit(filters = {}) {
    const data = await searchServices(filters);
    setServices(data);
    setHasActiveSearch(Boolean(filters.query || filters.city || filters.categoryId || filters.minPrice || filters.maxPrice));

    if (isLoggedIn() && getRole() === "CLIENT") {
      await saveRecentSearch({
        query: filters.query || null,
        city: filters.city || null,
        categoryId: filters.categoryId ? Number(filters.categoryId) : null,
        minPrice: filters.minPrice ? Number(filters.minPrice) : null,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : null,
      }).catch(() => {});
      setRecentSearches(await getRecentSearches().catch(() => []));
    }
  }

  async function onCategoryPick(category) {
    const data = await searchServices({ categoryId: String(category.id) });
    setServices(data);
    setHasActiveSearch(true);

    if (isLoggedIn() && getRole() === "CLIENT") {
      await saveRecentSearch({
        query: null,
        city: null,
        categoryId: category.id,
      }).catch(() => {});
      setRecentSearches(await getRecentSearches().catch(() => []));
    }
  }

  async function onRecentSearchPick(item) {
    await onSearchSubmit({
      query: item.query || null,
      city: item.city || null,
      categoryId: item.categoryId ? String(item.categoryId) : null,
      minPrice: item.minPrice != null ? String(item.minPrice) : null,
      maxPrice: item.maxPrice != null ? String(item.maxPrice) : null,
    });
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
        <ServiceGrid
          services={hasActiveSearch ? services : services.slice(0, 6)}
          favoriteIds={favoriteIds}
          onToggleFavorite={onToggleFavorite}
          title={hasActiveSearch ? "Search results" : "Most popular right now"}
        />
      </div>

      <Footer />
    </div>
  );
}
