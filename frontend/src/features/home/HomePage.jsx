import React, { useEffect, useState } from "react";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import HeroCarousel from "../../components/sections/HeroCarousel";
import ServiceGrid from "../../components/sections/ServiceGrid";
import { getCategories, searchServices } from "./api";

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function load() {
      const [loadedCategories, loadedServices] = await Promise.all([getCategories(), searchServices()]);
      setCategories(loadedCategories);
      setServices(loadedServices);
    }

    load();
  }, []);

  async function onSearchSubmit(filters = {}) {
    const data = await searchServices(filters);
    setServices(data);
  }

  async function onCategoryPick(category) {
    const data = await searchServices({ categoryId: String(category.id) });
    setServices(data);
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Header categories={categories} onCategoryPick={onCategoryPick} onSearchSubmit={onSearchSubmit} />

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 16px 18px" }}>
        <HeroCarousel />
        <ServiceGrid services={services} />
      </div>

      <Footer />
    </div>
  );
}
