import { motion } from "framer-motion";

const doctors = [
  { name: "Dr. Sarah Mitchell", specialty: "Cardiology", initials: "SM" },
  { name: "Dr. James Park", specialty: "Neurology", initials: "JP" },
  { name: "Dr. Maria Santos", specialty: "Pediatrics", initials: "MS" },
  { name: "Dr. Robert Chen", specialty: "Orthopedics", initials: "RC" },
];

const DoctorsSection = () => (
  <section id="doctors" className="py-20">
    <div className="container mx-auto px-4">
      <div className="text-center mb-14">
        <span className="text-xs font-medium text-cyan-700 uppercase tracking-widest">
          Our Team
        </span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
          Meet Our Doctors
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {doctors.map((d, i) => (
          <motion.div
            key={d.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow"
          >
            <div className="w-20 h-20 rounded-full bg-cyan-100 mx-auto mb-4 flex items-center justify-center">
              <span className="text-xl font-bold text-cyan-700">
                {d.initials}
              </span>
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              {d.name}
            </h3>
            <p className="text-sm text-cyan-700 font-medium mt-1">
              {d.specialty}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default DoctorsSection;
