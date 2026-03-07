import { Heart, Brain, Baby, Bone, Eye, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  {
    icon: Heart,
    title: "Cardiology",
    desc: "Comprehensive heart care with advanced diagnostics and treatments.",
  },
  {
    icon: Brain,
    title: "Neurology",
    desc: "Expert neurological care for brain and nervous system disorders.",
  },
  {
    icon: Baby,
    title: "Pediatrics",
    desc: "Compassionate healthcare for infants, children, and adolescents.",
  },
  {
    icon: Bone,
    title: "Orthopedics",
    desc: "Bone, joint, and muscle care with minimally invasive techniques.",
  },
  {
    icon: Eye,
    title: "Ophthalmology",
    desc: "Complete eye care from routine exams to advanced surgeries.",
  },
  {
    icon: Stethoscope,
    title: "General Medicine",
    desc: "Primary care services for your everyday health needs.",
  },
];

const ServicesSection = () => (
  <section id="services" className="py-20 bg-secondary/40">
    <div className="container mx-auto px-4">
      <div className="text-center mb-14">
        <span className="text-xs font-medium text-primary uppercase tracking-widest">
          What We Offer
        </span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
          Our Medical Services
        </h2>
        <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
          We provide a wide range of medical services to meet your healthcare
          needs.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <s.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              {s.title}
            </h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
