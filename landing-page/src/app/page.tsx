import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import HowItWorks from "./components/HowItWorks";
import ForStorytellers from "./components/ForStorytellers";
import ForGiftGivers from "./components/ForGiftGivers";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content">
        <HeroSection />
        <HowItWorks />
        <ForStorytellers />
        <ForGiftGivers />
      </main>
      <Footer />
    </>
  );
}
