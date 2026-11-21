import SpatialHero3D from "./components/home/SpatialHero3D";
import FeaturedEquipmentSection from "./components/home/FeaturedEquipmentSection";
import EquipmentCategoriesSection from "./components/home/EquipmentCategoriesSection";
import HowItWorksSection from "./components/home/HowItWorksSection";
import TrustedOwnersSection from "./components/home/TrustedOwnersSection";
import CustomerReviewsSection from "./components/home/CustomerReviewsSection";

export default function Home() {
  return (
    <main className="flex-1">
      <SpatialHero3D />
      <FeaturedEquipmentSection />
      <EquipmentCategoriesSection />
      <HowItWorksSection />
      <TrustedOwnersSection />
      <CustomerReviewsSection />
    </main>
  );
}
