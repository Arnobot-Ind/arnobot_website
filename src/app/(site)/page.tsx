import HeroSection from '@/components/sections/home/HeroSection';
import AboutSection from '@/components/sections/home/AboutSection';
import ProductsSection from '@/components/sections/home/ProductsSection';
import EnvironmentSection from '@/components/sections/home/EnvironmentSection';
import RecognitionSection from '@/components/sections/home/RecognitionSection';
import IndustriesSection from '@/components/sections/home/IndustriesSection';
import Cta from '@/components/sections/Cta';

/** Port of index.php */
export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <AboutSection />

      <ProductsSection />

      {/* The field shot stands on its own now that the Engineering Excellence
          strip is out. It was wrapped in .field-band so the pair filled one
          screen; alone in that band the ratio-locked image left the rest of the
          viewport empty, so the wrapper goes with it. */}
      <EnvironmentSection />
      <RecognitionSection />
      <IndustriesSection />
      <Cta />
      <nav >
  <div >My Website</div>

  <div >
    <a href="#">Home</a>
    <a href="#">About</a>
    <a href="#">Services</a>
    <a href="#">Contact</a>
  </div>
</nav>
    </main>
  );
}
