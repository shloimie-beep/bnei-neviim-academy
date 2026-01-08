import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Menu } from "lucide-react";
import logoImage from "@assets/qt=q_95_1767830887218.webp";
import gadlusLogo from "@assets/rs=w_1280,h_685_1767849000436.webp";
import singingGroupsImage from "@assets/rs=w_1280,h_1707_1767849000437.webp";
import actingGroupsImage from "@assets/rs=w_1280,h_1707_(1)_1767849000437.webp";

export default function GadlusHaAdamPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#08779C] py-2 text-center">
        <Link href="/gadlus-haadam">
          <span className="text-white text-sm font-medium hover:underline cursor-pointer" data-testid="link-promo-banner-gadlus">
            Check out our Gadlus Ha'Adam Skills → GROUPS FORMING NOW IN LAKEWOOD
          </span>
        </Link>
      </div>

      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/">
              <img src={logoImage} alt="OneTimeOneTime" className="h-12 w-auto cursor-pointer" />
            </Link>
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/">
                <span className="text-[#161616] font-medium hover:text-[#08779C] transition-colors text-sm uppercase tracking-wide cursor-pointer" data-testid="link-nav-home">Home</span>
              </Link>
              <Link href="/gadlus-haadam">
                <span className="text-[#08779C] font-bold hover:text-[#08779C] transition-colors text-sm uppercase tracking-wide cursor-pointer" data-testid="link-nav-gadlus">Gadlus Ha'Adam</span>
              </Link>
              <Link href="/register">
                <span className="text-[#161616] font-medium hover:text-[#08779C] transition-colors text-sm uppercase tracking-wide cursor-pointer" data-testid="link-nav-hotline">Hotline</span>
              </Link>
              <a href="/#story" className="text-[#161616] font-medium hover:text-[#08779C] transition-colors text-sm uppercase tracking-wide" data-testid="link-nav-story">The Story</a>
              <a href="/#contact" className="text-[#161616] font-medium hover:text-[#08779C] transition-colors text-sm uppercase tracking-wide" data-testid="link-nav-contact">Contact</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button className="bg-[#EDE518] text-black border-[#EDE518] font-semibold text-sm" data-testid="button-login">
                Hotline Login
              </Button>
            </Link>
            <Button size="icon" variant="ghost" className="lg:hidden text-[#161616]">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-bold text-center text-[#08779C] mb-12" style={{ fontFamily: "'Georgia', serif" }}>
            Singing & Acting Skills for Boys Ages 6 -12
          </h1>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <a 
              href="https://www.cognitoforms.com/GadlusHaadam1/January2026GadlusHaAdamGroups" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block hover:opacity-90 transition-opacity"
              data-testid="link-register-singing"
            >
              <img 
                src={singingGroupsImage} 
                alt="Singing Groups - Final Groups" 
                className="w-full rounded-lg shadow-lg"
                data-testid="img-singing-groups"
              />
            </a>
            <a 
              href="https://www.cognitoforms.com/GadlusHaadam1/January2026GadlusHaAdamGroups" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block hover:opacity-90 transition-opacity"
              data-testid="link-register-acting"
            >
              <img 
                src={actingGroupsImage} 
                alt="Acting Groups - Final Groups" 
                className="w-full rounded-lg shadow-lg"
                data-testid="img-acting-groups"
              />
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#f5f5f5]">
        <div className="container mx-auto px-4 text-center">
          <img 
            src={gadlusLogo} 
            alt="Gadlus HaAdam" 
            className="h-32 w-auto mx-auto mb-8"
          />
          <h2 className="text-2xl md:text-3xl font-bold text-[#161616] mb-4">
            LEARN A SKILL
          </h2>
          <p className="text-xl text-[#08779C] font-semibold mb-8">
            SINGING. ACTING. ART. DANCE. GUITAR.
          </p>
          <a 
            href="https://www.cognitoforms.com/GadlusHaadam1/January2026GadlusHaAdamGroups" 
            target="_blank" 
            rel="noopener noreferrer"
            data-testid="link-register-cta"
          >
            <Button size="lg" className="bg-[#08779C] text-white font-bold px-12 text-lg" data-testid="button-register">
              REGISTER
            </Button>
          </a>
        </div>
      </section>

      <footer className="bg-[#161616] py-10 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-6">
              <Link href="/gadlus-haadam">
                <span className="text-white/80 hover:text-white cursor-pointer">Gadlus Ha'Adam</span>
              </Link>
              <a href="#" className="text-white/80 hover:text-white">Privacy Policy</a>
            </div>
            <div className="text-center md:text-right space-y-2">
              <p><a href="mailto:info@onetimeonetime.com" className="text-white/80 hover:text-white">info@onetimeonetime.com</a></p>
              <p><a href="tel:4434538614" className="text-white/80 hover:text-white">443-453-8614</a></p>
            </div>
          </div>
          <div className="text-center mt-8 pt-8 border-t border-white/20">
            <p className="text-white/60 text-sm">
              OneTimeOneTime is a program of Gadlus HaAdam, LLC.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
