import { Heart, Brain, Baby, Bone, Eye, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  {
    icon: Heart,
    title: "Cardiology",
  },
  {
    icon: Brain,
    title: "Neurology",
  },
  {
    icon: Baby,
    title: "Pediatrics",
  },
  {
    icon: Bone,
    title: "Orthopedics",
  },
  {
    icon: Eye,
    title: "Ophthalmology",
  },
  {
    icon: Stethoscope,
    title: "General Medicine",
  },
];

const ServicesSection = () => (
  <section id="services" className="py-20 bg-secondary/40">
    <div className="container mx-auto px-4">
      <div className="text-center mb-14">
        <span className="text-xs font-medium text-cyan-700 uppercase tracking-widest">
          What We Offer
        </span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
          Our Medical Services
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group p-6 rounded-xl bg-card border border-border hover:border-cyan-700/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center mb-4 group-hover:bg-cyan-700 group-hover:text-cyan-700 transition-colors">
              <s.icon className="h-6 w-6 text-cyan-700 group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              {s.title}
            </h3>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
