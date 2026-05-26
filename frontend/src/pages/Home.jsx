import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import LiveDemo from "../components/LiveDemo";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-beige-100">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <LiveDemo />
      <Footer />
    </div>
  );
};

export default Home;