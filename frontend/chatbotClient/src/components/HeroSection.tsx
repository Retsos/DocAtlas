import { ArrowRight, Shield, Clock, Heart } from "lucide-react";
import { motion } from "framer-motion";
import heroImg from "../assets/hospital-image.jpeg";
import { Button } from "./ui/button";

const stats = [
  { icon: Shield, label: "Board Certified", value: "50+" },
  { icon: Clock, label: "24/7 Emergency", value: "Always" },
  { icon: Heart, label: "Patients Served", value: "100K+" },
];

const HeroSection = () => (
  <section id="home" className="relative pt-16 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-accent/60 via-background to-hospital-warm" />
    <div className="container mx-auto relative z-10 px-4 py-20 lg:py-28">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-block px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-xs font-medium mb-4">
            Thessaloniki's Healthcare Since 1985
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Your Health, <span className="text-cyan-700">Our Priority</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mb-8">
            Experience world-class healthcare with compassionate doctors,
            cutting-edge technology, and personalized treatment plans.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="bg-cyan-700">
              Book Appointment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-cyan-700 hover:text-cyan-700"
            >
              Our Services
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={heroImg}
              alt="MediCare Plus Hospital"
              className="w-full h-[350px] lg:h-[420px] object-cover"
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="grid grid-cols-3 gap-4 mt-16 max-w-2xl mx-auto"
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center text-center p-4 rounded-xl bg-card shadow-sm border border-border"
          >
            <s.icon className="h-6 w-6 text-cyan-700 mb-2" />
            <span className="text-2xl font-bold text-foreground">
              {s.value}
            </span>
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
