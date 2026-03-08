import "./App.css";
import DoctorsSection from "./components/DoctorSection";
import FooterSection from "./components/FooterSection";
import HeroSection from "./components/HeroSection";
import HospitalNav from "./components/HospitalNav";
import ServicesSection from "./components/ServicesSection";

function App() {
  return (
    <div className="min-h-screen">
      <HospitalNav />
      <HeroSection />
      <ServicesSection />
      <DoctorsSection />
      <FooterSection />
    </div>
  );
}

export default App;
