import { MapPin, Phone, Mail, Clock } from "lucide-react";

const FooterSection = () => (
  <footer id="contact" className="bg-cyan-700 text-background py-16">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-3 gap-10">
        <div>
          <h4 className="font-display text-lg font-semibold mb-4">Contact</h4>
          <ul className="space-y-3 text-sm opacity-80">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Eganita 99999
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> (2310) 000000
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> info@caremedik.com
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
