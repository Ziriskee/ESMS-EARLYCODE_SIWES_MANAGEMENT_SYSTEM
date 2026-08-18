import Navbar from "@components/Navbar";
import Hero from "@components/Hero";
import Steps from "@components/Steps";
import Requirements from "@components/Requirements";
import FAQs from "@components/FAQs";
import CTA from "@components/CTA";
import Contact from "@components/Contact";
import Footer from "@components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ec-dark text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <Steps />
      <Requirements />
      <CTA />
      <FAQs />
      <Contact />
      <Footer />
    </div>
  );
}
