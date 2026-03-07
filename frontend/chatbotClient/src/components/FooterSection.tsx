import { MapPin, Phone, Mail, Clock } from "lucide-react";

const FooterSection = () => (
  <footer id="contact" className="bg-foreground text-background py-16">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                +
              </span>
            </div>
            <span className="font-display text-xl font-semibold">
              MediCare<span className="text-primary">Plus</span>
            </span>
          </div>
          <p className="text-sm opacity-70 max-w-xs">
            Providing exceptional healthcare services to our community since
            1985.
          </p>
        </div>

        <div>
          <h4 className="font-display text-lg font-semibold mb-4">Contact</h4>
          <ul className="space-y-3 text-sm opacity-80">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> 123 Medical Drive,
              Health City
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> (555) 123-4567
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> info@medicareplus.com
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-semibold mb-4">Hours</h4>
          <ul className="space-y-3 text-sm opacity-80">
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Mon–Fri: 8:00 AM – 8:00
              PM
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Sat: 9:00 AM – 5:00 PM
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Emergency: 24/7
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-background/10 mt-10 pt-6 text-center text-xs opacity-50">
        © 2026 MediCarePlus. All rights reserved. — Mock Hospital Website
      </div>
    </div>
  </footer>
);

export default FooterSection;
