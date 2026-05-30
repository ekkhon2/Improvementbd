import { useLanguage } from '@/src/context/LanguageContext';
import { Facebook, Linkedin, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  const { language } = useLanguage();
  return (
    <footer className="border-t bg-slate-900 text-slate-300 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="space-y-6">
            <div className="flex flex-col">
              <h3 className="text-2xl font-black text-white tracking-tighter">IMPROVEMENT BD</h3>
              <a href="/admin" className="w-12 h-1 bg-slate-900 hover:bg-slate-800/20 rounded mt-1 transition-all cursor-default" title="Stealth Portal" />
            </div>
            <p className="text-sm leading-relaxed opacity-70">
              {language === 'bn' 
                ? 'উন্নত সমাজ গঠনে আমাদের ক্ষুদ্র প্রচেষ্টা। আমরা শিক্ষা, স্বাস্থ্য এবং সামাজিক উন্নয়নে কাজ করি।' 
                : 'Our small effort to build a better society. We work in education, health, and social development.'}
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/improvementitinstitute/" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-all">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://bd.linkedin.com/company/improvement-it-institute" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-all">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Quick Links</h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <li><a href="/foundation" className="hover:text-accent transition-colors">Foundation</a></li>
              <li><a href="/blood-bank" className="hover:text-accent transition-colors">Blood Bank</a></li>
              <li><a href="/food-bank" className="hover:text-accent transition-colors">Food Bank</a></li>
              <li><a href="/sporting-club" className="hover:text-accent transition-colors">Sporting Club</a></li>
              <li><a href="/it-education" className="hover:text-accent transition-colors">IT Education</a></li>
              <li><a href="/academic-care" className="hover:text-accent transition-colors">Academic Care</a></li>
              <li><a href="/library" className="hover:text-accent transition-colors">Library</a></li>
              <li><a href="/rehabilitation" className="hover:text-accent transition-colors">Rehab Center</a></li>
              <li><a href="/kidscare" className="hover:text-accent transition-colors">Kids Care</a></li>
              <li><a href="/poor-fund" className="hover:text-accent transition-colors font-bold text-accent">Poor Fund</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Contact Info</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent shrink-0" />
                <a href="https://www.google.com/maps/dir/23.7247731,90.3754028/4+Nilambar+Saha+Rd,+Dhaka+1205/@23.7247503,90.3727435,17z/data=!3m1!4b1!4m9!4m8!1m1!4e1!1m5!1m1!1s0x3755b8d2d10ee525:0x1665f702a6f0e7a3!2m2!1d90.3752291!2d23.7246801!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDQwOC4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">
                  4 Nilambar Saha Road, (beside Hazaribugh girls school), Hazaribugh Dhaka
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent shrink-0" />
                <div className="flex flex-col">
                  <a href="https://wa.me/8801819417935" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">01819417935 (IT)</a>
                  <a href="https://wa.me/8801518975474" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">01518975474 (Academic)</a>
                  <a href="https://wa.me/8801640679394" target="_blank" rel="noreferrer" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors flex items-center gap-1 mt-1">
                    01640679394 (Library WhatsApp)
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent shrink-0" />
                <span>info@improvementbd.org</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Newsletter</h4>
            <p className="text-sm mb-4 opacity-70">Subscribe to get latest updates.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Email" className="bg-white/10 border-none rounded-lg px-4 py-2 w-full text-sm focus:ring-2 focus:ring-accent outline-none" />
              <button className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-accent/90 transition-all">Join</button>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-xs opacity-50">
          © {new Date().getFullYear()} IMPROVEMENT BD. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
