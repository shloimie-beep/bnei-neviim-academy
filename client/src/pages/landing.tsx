import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Menu } from "lucide-react";
import logoImage from "@assets/qt=q_95_1767830887218.webp";
import silverSpringImg from "@assets/Silver_Spring_1767899261416.jpg";
import bocaMapImg from "@assets/Boca_Raton_1767898934153.webp";
import norfolkMapImg from "@assets/Norfolk,_Virginia_1767898934152.webp";
import stlouisMapImg from "@assets/St_Louis_1767898934150.webp";
import vegasMapImg from "@assets/Las_Vegas_1767898934148.webp";
import atlantaMapImg from "@assets/Atlanta_1767898934149.webp";
import worldMapImg from "@assets/generated_images/global_connections_world_map.png";
import captivatedCrowdImg from "@assets/generated_images/b&w_captivated_crowd_photo.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#161616]">
      <div className="bg-[#EDE518] py-2 text-center" data-testid="banner-hotline-number">
        <span className="text-black text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2">
          <Phone className="h-4 w-4" />
          Call the Hotline at 613-ONE-TIME (613-663-8463)
        </span>
      </div>
      <div className="bg-[#08779C] py-2 text-center">
        <Link href="/gadlus-haadam">
          <span 
            className="text-white text-sm font-medium hover:underline cursor-pointer"
            data-testid="link-promo-banner"
          >
            Check out our Gadlus Ha'Adam Skills → GROUPS FORMING NOW IN LAKEWOOD
          </span>
        </Link>
      </div>

      <header className="sticky top-0 z-50 bg-[#161616]/95 backdrop-blur border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <a href="#home">
              <img src={logoImage} alt="OneTimeOneTime" className="h-12 w-auto" />
            </a>
            <nav className="hidden lg:flex items-center gap-6">
              <a href="#home" className="text-white font-medium hover:text-[#EDE518] transition-colors text-sm uppercase tracking-wide">Home</a>
              <Link href="/gadlus-haadam"><span className="text-white font-medium hover:text-[#EDE518] transition-colors text-sm uppercase tracking-wide cursor-pointer" data-testid="link-nav-gadlus">Gadlus Ha'Adam</span></Link>
              <a href="#hotline" className="text-white font-medium hover:text-[#EDE518] transition-colors text-sm uppercase tracking-wide">Academy & Hotline</a>
              <a href="#story" className="text-white font-medium hover:text-[#EDE518] transition-colors text-sm uppercase tracking-wide">The Story</a>
              <a href="#contact" className="text-white font-medium hover:text-[#EDE518] transition-colors text-sm uppercase tracking-wide">Contact</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button className="bg-[#EDE518] text-black border-[#EDE518] font-semibold text-sm" data-testid="button-login">
                Member Login
              </Button>
            </Link>
            <Button size="icon" variant="ghost" className="lg:hidden text-white">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <section 
        id="home"
        className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 w-full h-full bg-[#161616]">
          <iframe
            src="https://player.vimeo.com/video/1143589086?autoplay=1&loop=1&autopause=0&muted=1&title=0&byline=0&portrait=0&controls=0&background=1"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78vh] min-w-full h-[56.25vw] min-h-full"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
            title="Background Video"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
        <div className="container mx-auto px-4 py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-normal text-white italic animate-fade-in" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              Where Kids Fall in Love With Torah
            </h1>
            <p className="text-xl md:text-2xl text-white font-bold mt-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              Rabbi Eli Scheller
            </p>
            <p className="text-lg text-white/90 font-medium animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Global Educator & Creator of the OneTime OneTime Experience
            </p>
            <p className="text-lg text-white/80 animate-fade-in-up" style={{animationDelay: '0.25s'}}>
              Inspiring Families Through Stories and Humor
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <Link href="/register">
                <Button size="lg" className="bg-[#EDE518] text-black border-[#EDE518] font-bold px-10 text-base uppercase tracking-wide animate-pulse-glow" data-testid="button-hotline">
                  The Academy & Hotline
                </Button>
              </Link>
              <a href="#story">
                <Button size="lg" variant="outline" className="bg-white text-black border-white font-bold px-10 text-base uppercase tracking-wide" data-testid="button-story">
                  The Story
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <a href="#hotline" className="block bg-[#EDE518] py-3 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex">
          {[...Array(12)].map((_, i) => (
            <span key={i} className="text-black font-bold text-lg mx-8 uppercase tracking-wider">
              The OneTime OneTime Academy & Hotline
            </span>
          ))}
        </div>
      </a>

      <section id="hotline" className="py-20 bg-[#161616]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-white">
            Introducing... The OneTime OneTime Academy & Hotline
          </h2>
          <h3 className="text-xl md:text-2xl text-center mb-10 text-white/80">
            Welcome to Rabbi Eli Scheller's global phone line and video library for kids, teens, and families.
          </h3>
          
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <p className="text-xl font-bold text-[#EDE518]">
              A Family Experience That Keeps You Inspired All Week Long!
            </p>
            <p className="text-lg text-white/80">
              Bring Torah, inspiration, and excitement into your home — in the simple, clear, engaging style kids love and parents trust.
            </p>
            <p className="text-lg text-white/80">
              Join families around the world who are already enjoying the OneTime OneTime experience.
            </p>
            <p className="text-xl font-bold text-white">
              Stories. Parsha. Mishnayos. Gemara. Jokes. Plus exclusive video content!
            </p>
            <p className="text-lg text-white/80">
              Weekly growth for kids, teens, and the whole family — delivered in the OneTime style you love.
            </p>
            <p className="text-lg text-[#EDE518] font-semibold">
              All members get full access to our video library on the website!
            </p>
            
            <div className="pt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-[#EDE518] text-black font-bold px-12 text-base">
                  Join Academy & Hotline →
                </Button>
              </Link>
              <a href="#learn-more">
                <Button size="lg" variant="outline" className="border-white text-white font-bold px-8 text-base">
                  Learn More
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="learn-more" className="py-16 bg-[#0B1D2B]">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-10 text-white">
            What Your Family Gets Each Week
          </h3>
          <div className="max-w-3xl mx-auto">
            <p className="text-center mb-10 text-white/80 text-lg">
              The OneTime OneTime Academy & Hotline brings Torah, inspiration, and meaningful entertainment into your home — created specifically for kids, teens, and families.
            </p>
            <p className="text-center mb-8 text-white font-semibold">Here's what you can expect:</p>
            <ul className="space-y-4 text-white text-lg max-w-2xl mx-auto">
              <li className="flex items-start gap-4">
                <span className="text-[#EDE518] font-bold text-2xl leading-none">•</span>
                <span>OneTime OneTime stories that your kids will talk about all week</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-[#EDE518] font-bold text-2xl leading-none">•</span>
                <span>A Parsha Spark that brings the weekly Torah portion to life</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-[#EDE518] font-bold text-2xl leading-none">•</span>
                <span>Mishnayos (around 4 perakim a week)</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-[#EDE518] font-bold text-2xl leading-none">•</span>
                <span>Gemara taught simply and clearly</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-[#EDE518] font-bold text-2xl leading-none">•</span>
                <span>A weekly joke track (guaranteed to get laughs)</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-[#EDE518] font-bold text-2xl leading-none">•</span>
                <span>Exclusive member-only content throughout the year</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-[#EDE518] font-bold text-2xl leading-none">•</span>
                <span>Full access to our exclusive video library on the website</span>
              </li>
            </ul>
            <p className="text-center mt-10 text-white/80 text-lg">
              Each piece is short, powerful, and memorable — perfect for busy families who want meaningful moments in minutes.
            </p>
            <div className="text-center mt-8">
              <a href="#hotline" className="text-[#EDE518] font-semibold hover:underline">
                Learn More About the Academy & Hotline
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#161616]">
        <div className="container mx-auto px-4">
          <h3 className="text-xl font-bold text-center mb-8 text-white/60 uppercase tracking-wider">
            As Seen Across The Jewish World:
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-80">
            <a href="https://www.torahanytime.com/#/speaker?l=540" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110" data-testid="link-torahanytime">
              <img src="https://img1.wsimg.com/isteam/ip/9232a2e1-8896-45ef-b6c8-3888ab135144/Untitled%20drawing.png/:/rs=h:100,cg:true,m" alt="Torah Anytime" className="h-12 w-auto" />
            </a>
            <a href="https://24six.app/preview/music/artist/654/rabbi-eli-scheller" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110" data-testid="link-24six">
              <img src="https://img1.wsimg.com/isteam/ip/9232a2e1-8896-45ef-b6c8-3888ab135144/logo-vert-yellow.png/:/rs=h:100,cg:true" alt="24Six" className="h-16 w-auto" />
            </a>
            <img src="https://img1.wsimg.com/isteam/ip/9232a2e1-8896-45ef-b6c8-3888ab135144/Loop_Purple_DarkPurple%402x-2.png/:/rs=h:100,cg:true" alt="Loop" className="h-12 w-auto" />
            <img src="https://img1.wsimg.com/isteam/ip/9232a2e1-8896-45ef-b6c8-3888ab135144/mishpachalogo.jpg/:/cr=t:0%25,l:2.1%25,w:95.8%25,h:100%25/rs=h:100,cg:true" alt="Mishpacha" className="h-12 w-auto" />
            <a href="https://nakiradio.com/" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110" data-testid="link-nakiradio">
              <img src="https://img1.wsimg.com/isteam/ip/9232a2e1-8896-45ef-b6c8-3888ab135144/WhatsApp%20Image%202025-11-26%20at%2014.55.32.jpeg/:/rs=h:100,cg:true" alt="Naki Radio" className="h-12 w-auto" />
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#0B1D2B]">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12 text-white">
            Featured Products
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="bg-[#1a2a3a] border-none overflow-hidden group animate-fade-in-up">
              <div className="aspect-[3/4] overflow-hidden">
                <img 
                  src="https://img1.wsimg.com/isteam/ip/9232a2e1-8896-45ef-b6c8-3888ab135144/Black%20White%20Modern%20Grunge%20Typographic%20Brand%20Lo.jpg/:/cr=t:1.79%25,l:32.74%25,w:66.96%25,h:89.28%25/rs=w:365,h:486,cg:true,m" 
                  alt="It's All Good Film" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4">
                <h4 className="font-bold text-white mb-1">IT'S ALL GOOD</h4>
                <p className="text-sm text-white/70 mb-2">Inspirational / Comical Film</p>
                <p className="text-xs text-[#EDE518]">Included in the Academy & Hotline</p>
                <a href="https://eli-schellergenerous.sellfy.store/p/its-all-good/" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full mt-3 bg-[#EDE518] text-black font-semibold text-sm" data-testid="button-product-itsallgood">
                    Stream - $7.99
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2a3a] border-none overflow-hidden group animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <div className="aspect-[3/4] overflow-hidden">
                <img 
                  src="https://img1.wsimg.com/isteam/ip/9232a2e1-8896-45ef-b6c8-3888ab135144/Beige%20Green%20Travel%20To%20The%20World%20Flyer-2.png/:/cr=t:2.87%25,l:0%25,w:100%25,h:94.27%25/rs=w:365,h:486,cg:true" 
                  alt="Experience Eretz Yisrael" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4">
                <h4 className="font-bold text-white mb-1">Experience Eretz Yisrael</h4>
                <p className="text-sm text-white/70 mb-2">Inspirational Film</p>
                <p className="text-xs text-[#EDE518]">Included in the Academy & Hotline</p>
                <a href="https://eli-schellergenerous.sellfy.store/p/experience-eretz-yisrael/" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full mt-3 bg-[#EDE518] text-black font-semibold text-sm" data-testid="button-product-eretzyisrael">
                    Stream - $12.99
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2a3a] border-none overflow-hidden group animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="aspect-[3/4] overflow-hidden">
                <img 
                  src="https://img1.wsimg.com/isteam/ip/9232a2e1-8896-45ef-b6c8-3888ab135144/blob-ad680e5.png/:/cr=t:0%25,l:34.44%25,w:29.3%25,h:100%25/rs=w:365,h:486,cg:true" 
                  alt="Searching for Happiness" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4">
                <h4 className="font-bold text-white mb-1">Searching for Happiness</h4>
                <p className="text-sm text-white/70 mb-2">A Comedy Adventure Film</p>
                <p className="text-xs text-[#EDE518]">Included in the Academy & Hotline</p>
                <a href="https://eli-schellergenerous.sellfy.store/p/chasing-happiness/" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full mt-3 bg-[#EDE518] text-black font-semibold text-sm" data-testid="button-product-happiness">
                    Stream - $12.99
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2a3a] border-none overflow-hidden group animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <div className="aspect-[3/4] overflow-hidden">
                <img 
                  src="https://img1.wsimg.com/isteam/ip/9232a2e1-8896-45ef-b6c8-3888ab135144/brown_mystery_movie_poster_video-e60181e.jpg/:/cr=t:0%25,l:27.22%25,w:42.19%25,h:100%25/rs=w:365,h:486,cg:true" 
                  alt="The Purim Shpiel 2025" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4">
                <h4 className="font-bold text-white mb-1">The Purim Shpiel 2025</h4>
                <p className="text-sm text-white/70 mb-2">Hilarious Comedy Film</p>
                <p className="text-xs text-[#EDE518]">Included in the Academy & Hotline</p>
                <a href="https://eli-schellergenerous.sellfy.store/p/purim-shpiel-2025/" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full mt-3 bg-[#EDE518] text-black font-semibold text-sm" data-testid="button-product-purim">
                    Stream - $12.99
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2a3a] border-none overflow-hidden group animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="aspect-[3/4] overflow-hidden">
                <img 
                  src="https://img1.wsimg.com/isteam/ip/9232a2e1-8896-45ef-b6c8-3888ab135144/Yellow%20and%20Red%20Bold%20Burger%20Food%20Marketing%20Inst.png/:/cr=t:11.49%25,l:4.96%25,w:89.29%25,h:84.17%25/rs=w:365,h:486,cg:true,m" 
                  alt="Joke Book" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4">
                <h4 className="font-bold text-white mb-1">JOKE BOOK</h4>
                <p className="text-sm text-white/70 mb-2">Just Kidding Stories and Jokes</p>
                <p className="text-xs text-[#EDE518]">Free PDF for Members</p>
                <a href="https://www.amazon.com/dp/B0FCMSL21T" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full mt-3 bg-[#EDE518] text-black font-semibold text-sm" data-testid="button-product-jokebook">
                    ORDER on Amazon $19.99
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2a3a] border-none overflow-hidden group animate-fade-in-up" style={{animationDelay: '0.5s'}}>
              <div className="aspect-[3/4] overflow-hidden">
                <img 
                  src="https://img1.wsimg.com/isteam/ip/9232a2e1-8896-45ef-b6c8-3888ab135144/Untitled%20design-16.png/:/cr=t:23.53%25,l:21.31%25,w:48.08%25,h:48.08%25/rs=w:365,h:486,cg:true,m" 
                  alt="Story Book" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4">
                <h4 className="font-bold text-white mb-1">One Time One Time Story Book</h4>
                <p className="text-sm text-white/70 mb-2">39 Thrilling Stories</p>
                <p className="text-xs text-white/50">136 pages. Color images.</p>
                <Link href="/register">
                  <Button className="w-full mt-3 bg-[#EDE518] text-black font-semibold text-sm" data-testid="button-product-storybook">
                    Hard copy - $24.99
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2a3a] border-none overflow-hidden group animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <div className="aspect-[3/4] overflow-hidden">
                <img 
                  src="https://img1.wsimg.com/isteam/ip/9232a2e1-8896-45ef-b6c8-3888ab135144/Blue%20Professional%20Annual%20Report%20Book%20Cover%20(6%20.png/:/cr=t:6.46%25,l:0%25,w:100%25,h:88.87%25/rs=w:365,h:486,cg:true" 
                  alt="Public Speaking Course" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4">
                <h4 className="font-bold text-white mb-1">Public Speaking Mastery</h4>
                <p className="text-sm text-white/70 mb-2">Full Course</p>
                <p className="text-xs text-[#EDE518]">Included in the Academy & Hotline</p>
                <a href="https://onetimeonetime.thinkific.com/courses/publicspeakingmastery" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full mt-3 bg-[#EDE518] text-black font-semibold text-sm" data-testid="button-product-publicspeaking">
                    BUY COURSE - $249
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2a3a] border-none overflow-hidden group animate-fade-in-up" style={{animationDelay: '0.7s'}}>
              <div className="aspect-[3/4] overflow-hidden">
                <img 
                  src="https://img1.wsimg.com/isteam/ip/9232a2e1-8896-45ef-b6c8-3888ab135144/ChatGPT%20Image%20Oct%2026%2C%202025%20at%2004_35_46%20PM.png/:/cr=t:0.59%25,l:0%25,w:100%25,h:88.89%25/rs=w:365,h:486,cg:true" 
                  alt="OneTime Merch" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4">
                <h4 className="font-bold text-white mb-1">One Time One Time Merch</h4>
                <p className="text-sm text-white/70 mb-2">It's more than merch — it's a movement</p>
                <p className="text-xs text-white/50">Wear your inspiration with pride</p>
                <a href="https://onetimeonetime.printful.me/" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full mt-3 bg-[#EDE518] text-black font-semibold text-sm" data-testid="button-product-merch">
                    Browse
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#161616]">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12 text-white">
            Featured Videos
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-xl">
                <iframe
                  src="https://player.vimeo.com/video/1138747998?title=0&byline=0&portrait=0"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="A Birthday Surprise"
                />
              </div>
              <h4 className="font-bold text-white text-lg">A Birthday Surprise</h4>
              <p className="text-white/70">An interesting birthday surprise for my mother</p>
            </div>
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-xl">
                <iframe
                  src="https://player.vimeo.com/video/1050076957?title=0&byline=0&portrait=0"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="The Secret Mission"
                />
              </div>
              <h4 className="font-bold text-white text-lg">The Secret Mission</h4>
              <p className="text-white/70">When an old man gets upset at the kids in the community...</p>
            </div>
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-xl">
                <iframe
                  src="https://player.vimeo.com/video/1138749816?title=0&byline=0&portrait=0"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="Meet The Evil Inclination"
                />
              </div>
              <h4 className="font-bold text-white text-lg">Meet The Evil Inclination</h4>
              <p className="text-white/70">See the battle of the Yetzer tov and Yetzer Hara play out</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#08779C]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl flex-shrink-0" data-testid="img-at-home">
              <img 
                src="https://img1.wsimg.com/isteam/ip/9232a2e1-8896-45ef-b6c8-3888ab135144/PHOTO-2024-08-29-09-15-28.jpg/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:600,h:600" 
                alt="At home" 
                className="w-full h-full object-cover" 
              />
            </div>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">...at home...</h3>
          </div>
        </div>
      </section>

      <section className="relative" data-testid="section-in-camps">
        <div className="h-2 bg-[#08779C]" />
        <div className="relative h-[350px] md:h-[400px]">
          <img 
            src="https://img1.wsimg.com/isteam/ip/9232a2e1-8896-45ef-b6c8-3888ab135144/20240716_115337-2680213.jpg/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:1920" 
            alt="In camps" 
            className="w-full h-full object-cover"
            data-testid="img-in-camps"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">...in camps...</h3>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#08779C]" data-testid="section-at-schools">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">...at schools...</h3>
            <div className="w-72 md:w-96 rounded-lg overflow-hidden shadow-2xl flex-shrink-0" data-testid="img-at-schools">
              <img 
                src="https://img1.wsimg.com/isteam/ip/9232a2e1-8896-45ef-b6c8-3888ab135144/20240805_104841.jpg/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:800" 
                alt="At schools" 
                className="w-full h-auto object-cover" 
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative h-[300px] md:h-[350px]" data-testid="section-all-over-world">
        <img 
          src={worldMapImg} 
          alt="Global OneTime OneTime hotline reach" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white animate-fade-in-up">...all over the world.</h3>
        </div>
      </section>

      <section className="relative h-[400px] md:h-[500px]" data-testid="testimonial-1">
        <img 
          src={captivatedCrowdImg} 
          alt="Captivated crowd at Silver Spring event" 
          className="w-full h-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center max-w-3xl animate-fade-in">
            <div className="text-white/60 text-6xl mb-4">"</div>
            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-6 leading-relaxed">
              We never saw the kids so captivated by your stories! You electrified the crowd with amazing stories and Torah lessons. R' Eli, thank you!
            </p>
            <div className="w-16 h-0.5 bg-white/50 mx-auto mb-4" />
            <p className="text-white/80 font-medium">Rabbi Dweck, Silver Spring</p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white" data-testid="testimonial-2">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-5xl mx-auto">
            <div className="text-center md:text-left max-w-md order-2 md:order-1">
              <div className="text-[#08779C] text-4xl mb-2">"</div>
              <p className="text-lg text-[#08779C] italic mb-4 leading-relaxed">
                That was amazing!!! Way above my expectations. Please come back again.
              </p>
              <div className="w-12 h-0.5 bg-[#08779C]/30 mb-3 mx-auto md:mx-0" />
              <p className="text-[#08779C]/70 font-medium text-sm">Mrs. Haddasah Smolarcik, Boca Raton</p>
            </div>
            <div className="flex-shrink-0 order-1 md:order-2">
              <img 
                src={bocaMapImg} 
                alt="Boca Raton location" 
                className="w-72 md:w-96 h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white" data-testid="testimonial-3">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-5xl mx-auto">
            <div className="flex-shrink-0">
              <img 
                src={norfolkMapImg} 
                alt="Norfolk location" 
                className="w-72 md:w-96 h-auto"
              />
            </div>
            <div className="text-center md:text-left max-w-md">
              <div className="text-[#08779C] text-4xl mb-2">"</div>
              <p className="text-lg text-[#08779C] italic mb-4 leading-relaxed">
                Thank you so much for bringing so much positive and exciting energy to Norfolk! The fact that you brought your mishpacha only enhanced the Shabbos. The Ribono Shel Olam should continue to give you and your family the koach to inspire yidden throughout the world!
              </p>
              <div className="w-12 h-0.5 bg-[#08779C]/30 mb-3 mx-auto md:mx-0" />
              <p className="text-[#08779C]/70 font-medium text-sm">Aharon Lipman, Norfolk, Virginia</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white" data-testid="testimonial-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-5xl mx-auto">
            <div className="text-center md:text-left max-w-md order-2 md:order-1">
              <div className="text-[#08779C] text-4xl mb-2">"</div>
              <p className="text-lg text-[#08779C] italic mb-4 leading-relaxed">
                You brought so much simcha to the community and were able to unite everyone together like never before. Thank you! (It was worth every penny)
              </p>
              <div className="w-12 h-0.5 bg-[#08779C]/30 mb-3 mx-auto md:mx-0" />
              <p className="text-[#08779C]/70 font-medium text-sm">Moshe Glazer, St. Louis, Missouri</p>
            </div>
            <div className="flex-shrink-0 order-1 md:order-2">
              <img 
                src={stlouisMapImg} 
                alt="St. Louis location" 
                className="w-72 md:w-96 h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white" data-testid="testimonial-5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-5xl mx-auto">
            <div className="flex-shrink-0">
              <img 
                src={atlantaMapImg} 
                alt="Atlanta location" 
                className="w-72 md:w-96 h-auto"
              />
            </div>
            <div className="text-center md:text-left max-w-md">
              <div className="text-[#08779C] text-4xl mb-2">"</div>
              <p className="text-lg text-[#08779C] italic mb-4 leading-relaxed">
                Thank you Rabbi Scheller for coming! It was very nice meeting you. Your lecture was very timely, unbelievably helpful, inspirational, and energizing! Any time welcome back to Atlanta!
              </p>
              <div className="w-12 h-0.5 bg-[#08779C]/30 mb-3 mx-auto md:mx-0" />
              <p className="text-[#08779C]/70 font-medium text-sm">V. Birav, Atlanta, Georgia</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white" data-testid="testimonial-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-5xl mx-auto">
            <div className="text-center md:text-left max-w-md order-2 md:order-1">
              <div className="text-[#08779C] text-4xl mb-2">"</div>
              <p className="text-lg text-[#08779C] italic mb-4 leading-relaxed">
                Thank you for coming to visit. It was a real chizuk for all!
              </p>
              <div className="w-12 h-0.5 bg-[#08779C]/30 mb-3 mx-auto md:mx-0" />
              <p className="text-[#08779C]/70 font-medium text-sm">Mendy Levine, Las Vegas, Torah Day School</p>
            </div>
            <div className="flex-shrink-0 order-1 md:order-2">
              <img 
                src={vegasMapImg} 
                alt="Las Vegas location" 
                className="w-72 md:w-96 h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="story" className="py-20 bg-[#161616]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[#EDE518]">
            The Story
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="lg:w-1/3">
                <img 
                  src="https://img1.wsimg.com/isteam/ip/9232a2e1-8896-45ef-b6c8-3888ab135144/Untitled%20(1080%20x%201920%20px).png/:/cr=t:9.5%25,l:0%25,w:100%25,h:75%25/rs=w:400,h:533,cg:true" 
                  alt="Rabbi Eli Scheller" 
                  className="rounded-lg shadow-2xl w-full max-w-sm mx-auto"
                />
              </div>
              <div className="lg:w-2/3 space-y-6 text-center lg:text-left">
                <h3 className="text-2xl font-bold text-white">
                  Rabbi Eli Scheller: Inspiring, educating, and empowering the next generation of Jewish children worldwide.
                </h3>
                <p className="text-white/80 text-lg">
                  Most stories begin with "once upon a time." Mine begins with "One time, one time."
                </p>
                <p className="text-white/80 text-lg">
                  I wasn't supposed to become a storyteller. I wasn't supposed to become a rebbi. I definitely wasn't supposed to become the voice in thousands of kids' rooms every night. I was the kid who struggled in yeshivah, bounced from place to place, and never quite fit the system — until a few "one time" moments changed everything.
                </p>
                <p className="text-white/80 text-lg">
                  Those moments shaped me. After learning under Rav Yitzchak Berkovits in Yerushalayim, life took me from Lakewood to Los Angeles and eventually to a small classroom in Baltimore, where I walked in with a guitar, faced a wild fifth grade, and began, "One time, one time..." That first story froze the room and quietly launched OneTime OneTime.
                </p>
                <p className="text-xl font-bold text-[#EDE518]">
                  Every child is one "one time" moment away from discovering who they can become.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#08779C]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to bring OneTime OneTime into your home?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of families enjoying weekly Torah content.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-[#EDE518] text-black font-bold px-12 text-lg">
              Join the Academy & Hotline Today
            </Button>
          </Link>
        </div>
      </section>

      <section id="contact" className="py-20 bg-[#161616] text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#EDE518]">
            Contact
          </h2>
          <div className="max-w-md mx-auto space-y-6 text-center">
            <div className="flex items-center justify-center gap-4">
              <MapPin className="h-6 w-6 text-[#EDE518]" />
              <span className="text-lg">Lakewood, New Jersey, United States</span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Phone className="h-6 w-6 text-[#EDE518]" />
              <a href="tel:4434538614" className="text-lg hover:text-[#EDE518] transition-colors">(443) 453-8614</a>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Mail className="h-6 w-6 text-[#EDE518]" />
              <a href="mailto:info@onetimeonetime.com" className="text-lg hover:text-[#EDE518] transition-colors">info@onetimeonetime.com</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#0a0a0a] py-10 text-white/60">
        <div className="container mx-auto px-4 text-center">
          <img src={logoImage} alt="OneTimeOneTime" className="h-16 w-auto mx-auto mb-6" />
          <p className="text-sm mb-2">
            OneTimeOneTime is a program of Gadlus HaAdam, LLC.
          </p>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} OneTimeOneTime. All rights reserved.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out both;
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(237, 229, 24, 0.3); }
          50% { box-shadow: 0 0 40px rgba(237, 229, 24, 0.6); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee,
          .animate-fade-in,
          .animate-fade-in-up,
          .animate-pulse-glow,
          .animate-bounce-subtle {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
