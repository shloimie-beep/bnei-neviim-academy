import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Menu } from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import logoImage from "@assets/qt=q_95_1767830887218.webp";
import silverSpringImg from "@assets/Silver_Spring_1767899261416.jpg";
import bocaMapImg from "@assets/Boca_Raton_1767898934153.webp";
import norfolkMapImg from "@assets/Norfolk,_Virginia_1767898934152.webp";
import stlouisMapImg from "@assets/St_Louis_1767898934150.webp";
import vegasMapImg from "@assets/Las_Vegas_1767898934148.webp";
import atlantaMapImg from "@assets/Atlanta_1767898934149.webp";
import worldMapImg from "@assets/generated_images/global_connections_world_map.png";
import captivatedCrowdImg from "@assets/generated_images/b&w_captivated_crowd_photo.png";

// Scroll-triggered animation wrapper
function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale-in animation for logos/images
function ScaleReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide-in from left animation
function SlideInLeft({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -60 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -60 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide-in from right animation
function SlideInRight({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 60 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// As Seen Section with white background
function AsSeenSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const logos = [
    { href: "https://www.torahanytime.com/#/speaker?l=540", src: "https://img1.wsimg.com/isteam/ip/9232a2e1-8896-45ef-b6c8-3888ab135144/Untitled%20drawing.png/:/rs=h:100,cg:true,m", alt: "Torah Anytime", testId: "link-torahanytime", height: "h-12" },
    { href: "https://24six.app/preview/music/artist/654/rabbi-eli-scheller", src: "https://img1.wsimg.com/isteam/ip/9232a2e1-8896-45ef-b6c8-3888ab135144/logo-vert-yellow.png/:/rs=h:100,cg:true", alt: "24Six", testId: "link-24six", height: "h-16" },
    { src: "https://img1.wsimg.com/isteam/ip/9232a2e1-8896-45ef-b6c8-3888ab135144/Loop_Purple_DarkPurple%402x-2.png/:/rs=h:100,cg:true", alt: "Loop", height: "h-12" },
    { src: "https://img1.wsimg.com/isteam/ip/9232a2e1-8896-45ef-b6c8-3888ab135144/mishpachalogo.jpg/:/cr=t:0%25,l:2.1%25,w:95.8%25,h:100%25/rs=h:100,cg:true", alt: "Mishpacha", height: "h-12" },
    { href: "https://nakiradio.com/", src: "https://img1.wsimg.com/isteam/ip/9232a2e1-8896-45ef-b6c8-3888ab135144/WhatsApp%20Image%202025-11-26%20at%2014.55.32.jpeg/:/rs=h:100,cg:true", alt: "Naki Radio", testId: "link-nakiradio", height: "h-12" },
  ];
  
  return (
    <section className="py-12 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.h3 
          className="text-xl font-bold text-center mb-8 text-gray-500 uppercase tracking-wider"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          As Seen Across The Jewish World:
        </motion.h3>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {logos.map((logo, index) => (
            <motion.div
              key={logo.alt}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {logo.href ? (
                <a href={logo.href} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110" data-testid={logo.testId}>
                  <img src={logo.src} alt={logo.alt} className={`${logo.height} w-auto`} />
                </a>
              ) : (
                <img src={logo.src} alt={logo.alt} className={`${logo.height} w-auto`} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonial data for carousel
const testimonials = [
  {
    quote: "That was amazing!!! Way above my expectations. Please come back again.",
    author: "Mrs. Haddasah Smolarcik, Boca Raton",
    image: bocaMapImg,
    imageAlt: "Boca Raton location",
  },
  {
    quote: "Thank you so much for bringing so much positive and exciting energy to Norfolk! The fact that you brought your mishpacha only enhanced the Shabbos. The Ribono Shel Olam should continue to give you and your family the koach to inspire yidden throughout the world!",
    author: "Aharon Lipman, Norfolk, Virginia",
    image: norfolkMapImg,
    imageAlt: "Norfolk location",
  },
  {
    quote: "You brought so much simcha to the community and were able to unite everyone together like never before. Thank you! (It was worth every penny)",
    author: "Moshe Glazer, St. Louis, Missouri",
    image: stlouisMapImg,
    imageAlt: "St. Louis location",
  },
  {
    quote: "Thank you Rabbi Scheller for coming! It was very nice meeting you. Your lecture was very timely, unbelievably helpful, inspirational, and energizing! Any time welcome back to Atlanta!",
    author: "V. Birav, Atlanta, Georgia",
    image: atlantaMapImg,
    imageAlt: "Atlanta location",
  },
  {
    quote: "Thank you for coming to visit. It was a real chizuk for all!",
    author: "Mendy Levine, Las Vegas, Torah Day School",
    image: vegasMapImg,
    imageAlt: "Las Vegas location",
  },
];

function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  
  const current = testimonials[currentIndex];
  
  return (
    <section className="py-16 bg-white" data-testid="testimonial-carousel">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto min-h-[300px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex flex-col md:flex-row items-center justify-center gap-8"
            >
              <div className="flex-shrink-0 order-1 md:order-2">
                <img 
                  src={current.image} 
                  alt={current.imageAlt} 
                  className="w-72 md:w-80 h-auto"
                  data-testid={`img-testimonial-${currentIndex}`}
                />
              </div>
              <div className="text-center md:text-left max-w-md order-2 md:order-1">
                <div className="text-[#08779C] text-4xl mb-2">"</div>
                <p className="text-lg text-[#08779C] italic mb-4 leading-relaxed" data-testid={`text-testimonial-quote-${currentIndex}`}>
                  {current.quote}
                </p>
                <div className="w-12 h-0.5 bg-[#08779C]/30 mb-3 mx-auto md:mx-0" />
                <p className="text-[#08779C]/70 font-medium text-sm" data-testid={`text-testimonial-author-${currentIndex}`}>{current.author}</p>
              </div>
            </motion.div>
          </AnimatePresence>
          
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                type="button"
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? "bg-[#08779C] scale-110" 
                    : "bg-[#08779C]/30 hover:bg-[#08779C]/50"
                }`}
                data-testid={`button-testimonial-dot-${index}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#161616]">
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
            src="https://player.vimeo.com/video/1158542993?h=daa31d3417&autoplay=1&loop=1&autopause=0&muted=1&title=0&byline=0&portrait=0&controls=0&background=1&quality=auto&dnt=1&playsinline=1"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78vh] min-w-full h-[56.25vw] min-h-full"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
            loading="lazy"
            title="Background Video"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
        <div className="container mx-auto px-4 py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-normal italic animate-fade-in gradient-text-animated" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              Where Kids Fall in Love With Torah
            </h1>
            <p className="text-xl md:text-2xl text-white font-bold mt-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              Rabbi Eli Scheller
            </p>
            <p className="text-lg text-white/90 font-medium animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Global Educator & Creator of the OneTime OneTime Experience
            </p>
            <p className="text-lg text-white/80 animate-fade-in-up" style={{animationDelay: '0.25s'}}>
              Inspiring Families. Building Torah Homes.
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
          <ScrollReveal>
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-white">
              Introducing... The OneTime OneTime Academy & Hotline
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h3 className="text-xl md:text-2xl text-center mb-10 text-white/80">
              Welcome to Rabbi Eli Scheller's global phone line and video library for kids, teens, and families.
            </h3>
          </ScrollReveal>
          
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <ScrollReveal delay={0.15}>
              <p className="text-xl font-bold text-[#EDE518]">
                Add Torah to Your Family — and Watch It Transform.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="text-lg text-white/80">
                There's nothing more powerful than a home filled with Torah. And there's no easier, more enjoyable way to get there than OneTime OneTime — stories, learning, and inspiration your whole family will look forward to every single week.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <p className="text-lg text-white/80">
                Kids absorb Torah when it's exciting. Parents feel it when their children come home quoting a story, singing a niggun, or asking questions about the parsha. That's what OneTime OneTime does — it brings Torah alive in your home.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <p className="text-xl font-bold text-white">
                Stories. Parsha. Mishnayos. Navi. Gemara. Jokes. Plus exclusive video content!
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.35}>
              <p className="text-lg text-white/80">
                Weekly Torah for kids, teens, and the whole family — delivered with the warmth, humor, and energy that makes it impossible to forget.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <p className="text-lg text-[#EDE518] font-semibold">
                Thousands of families around the world are already bringing Torah into their homes through OneTime OneTime. Join them.
              </p>
            </ScrollReveal>
            
            <ScrollReveal delay={0.45}>
              <div className="pt-10 flex justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-[#EDE518] text-black font-bold px-12 text-base">
                    Join Academy & Hotline →
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section id="learn-more" className="py-16 bg-[#0B1D2B]">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-10 text-white">
              What Your Family Gets Each Week
            </h3>
          </ScrollReveal>
          <div className="max-w-3xl mx-auto">
            <ScrollReveal delay={0.1}>
              <p className="text-center mb-10 text-white/80 text-lg">
                The OneTime OneTime Academy & Hotline brings Torah, inspiration, and meaningful entertainment into your home — created specifically for kids, teens, and families.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="text-center mb-8 text-white font-semibold">Here's what you can expect:</p>
            </ScrollReveal>
            <ul className="space-y-4 text-white text-lg max-w-2xl mx-auto">
              <SlideInLeft delay={0.2}>
                <li className="flex items-start gap-4">
                  <span className="text-[#EDE518] font-bold text-2xl leading-none">•</span>
                  <span>OneTime OneTime stories that your kids will talk about all week</span>
                </li>
              </SlideInLeft>
              <SlideInLeft delay={0.25}>
                <li className="flex items-start gap-4">
                  <span className="text-[#EDE518] font-bold text-2xl leading-none">•</span>
                  <span>A Parsha Spark that brings the weekly Torah portion to life</span>
                </li>
              </SlideInLeft>
              <SlideInLeft delay={0.3}>
                <li className="flex items-start gap-4">
                  <span className="text-[#EDE518] font-bold text-2xl leading-none">•</span>
                  <span>Mishnayos (around 4 perakim a week)</span>
                </li>
              </SlideInLeft>
              <SlideInLeft delay={0.35}>
                <li className="flex items-start gap-4">
                  <span className="text-[#EDE518] font-bold text-2xl leading-none">•</span>
                  <span>Gemara taught simply and clearly</span>
                </li>
              </SlideInLeft>
              <SlideInLeft delay={0.4}>
                <li className="flex items-start gap-4">
                  <span className="text-[#EDE518] font-bold text-2xl leading-none">•</span>
                  <span>A weekly joke track (guaranteed to get laughs)</span>
                </li>
              </SlideInLeft>
              <SlideInLeft delay={0.45}>
                <li className="flex items-start gap-4">
                  <span className="text-[#EDE518] font-bold text-2xl leading-none">•</span>
                  <span>Exclusive member-only content throughout the year</span>
                </li>
              </SlideInLeft>
              <SlideInLeft delay={0.5}>
                <li className="flex items-start gap-4">
                  <span className="text-[#EDE518] font-bold text-2xl leading-none">•</span>
                  <span>Full access to our exclusive video library on the website</span>
                </li>
              </SlideInLeft>
            </ul>
            <ScrollReveal delay={0.55}>
              <p className="text-center mt-10 text-white/80 text-lg">
                Each piece is short, powerful, and memorable — perfect for busy families who want meaningful moments in minutes.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <AsSeenSection />

      <section className="py-20 bg-[#0B1D2B]">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-12 text-white">
              Featured Products
            </h3>
          </ScrollReveal>
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

            <Card className="bg-[#1a2a3a] border-none overflow-hidden group animate-fade-in-up" style={{animationDelay: '0.6s'}}>
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

      <section className="py-24 bg-[#0e0e0e]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block text-[#EDE518] text-xs font-bold uppercase tracking-[0.2em] mb-4">Preview</span>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Inside the Academy</h3>
            <p className="text-white/45 text-base max-w-lg mx-auto leading-relaxed">A glimpse of the films, Torah, stories, and interviews waiting for you inside.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 max-w-6xl mx-auto">

            {/* Films */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="text-[#EDE518] font-bold text-[10px] uppercase tracking-[0.22em]">Films</span>
                <div className="h-px flex-1 bg-[#EDE518]/20" />
              </div>
              <div className="rounded-xl overflow-hidden shadow-2xl" style={{ padding: "56.25% 0 0 0", position: "relative" }}>
                <iframe
                  src="https://player.vimeo.com/video/1138747998?h=456811057a&badge=0&autopause=0&player_id=0&app_id=58479"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                  title="A Birthday Surprise"
                />
              </div>
              <div>
                <h5 className="font-semibold text-white text-sm mb-1">A Birthday Surprise</h5>
                <p className="text-white/40 text-xs leading-relaxed">What happens when Rabbi Scheller pulls off the ultimate birthday surprise? A heartwarming, laugh-out-loud moment you won't see coming.</p>
              </div>
            </div>

            {/* Mishnayas */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="text-[#EDE518] font-bold text-[10px] uppercase tracking-[0.22em]">Mishnayas</span>
                <div className="h-px flex-1 bg-[#EDE518]/20" />
              </div>
              <div className="rounded-xl overflow-hidden shadow-2xl" style={{ padding: "56.25% 0 0 0", position: "relative" }}>
                <iframe
                  src="https://player.vimeo.com/video/1178363755?h=282ea2577c&badge=0&autopause=0&player_id=0&app_id=58479"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                  title="Mishnayas Pesachim Chapter Ten"
                />
              </div>
              <div>
                <h5 className="font-semibold text-white text-sm mb-1">Mishnayas Pesachim Chapter Ten</h5>
                <p className="text-white/40 text-xs leading-relaxed">Energy, humor, and razor-sharp clarity that makes learning impossible to forget.</p>
              </div>
            </div>

            {/* Interviews */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="text-[#EDE518] font-bold text-[10px] uppercase tracking-[0.22em]">Interviews</span>
                <div className="h-px flex-1 bg-[#EDE518]/20" />
              </div>
              <div className="rounded-xl overflow-hidden shadow-2xl" style={{ padding: "56.25% 0 0 0", position: "relative" }}>
                <iframe
                  src="https://player.vimeo.com/video/1174681253?h=f1589236ec&badge=0&autopause=0&player_id=0&app_id=58479"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                  title="An Interview with Kids in RBS, Israel"
                />
              </div>
              <div>
                <h5 className="font-semibold text-white text-sm mb-1">An Interview with Kids in RBS, Israel</h5>
                <p className="text-white/40 text-xs leading-relaxed">Hear straight from the kids of Ramat Beit Shemesh — raw, honest answers about life in Israel during wartime.</p>
              </div>
            </div>

            {/* Stories */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="text-[#EDE518] font-bold text-[10px] uppercase tracking-[0.22em]">Stories</span>
                <div className="h-px flex-1 bg-[#EDE518]/20" />
              </div>
              <div className="rounded-xl overflow-hidden shadow-2xl" style={{ padding: "177.78% 0 0 0", position: "relative" }}>
                <iframe
                  src="https://player.vimeo.com/video/1158589767?h=598ba5e5ba&badge=0&autopause=0&player_id=0&app_id=58479"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                  title="The Secret to Hitting Home Runs in Life"
                />
              </div>
              <div>
                <h5 className="font-semibold text-white text-sm mb-1">The Secret to Hitting Home Runs in Life</h5>
                <p className="text-white/40 text-xs leading-relaxed">A captivating story brought to life — the kind that stays with you long after it ends.</p>
              </div>
            </div>

            {/* Navi */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="text-[#EDE518] font-bold text-[10px] uppercase tracking-[0.22em]">Navi</span>
                <div className="h-px flex-1 bg-[#EDE518]/20" />
              </div>
              <div className="rounded-xl overflow-hidden shadow-2xl" style={{ padding: "56.25% 0 0 0", position: "relative" }}>
                <iframe
                  src="https://player.vimeo.com/video/1158803771?h=188d9a4d33&badge=0&autopause=0&player_id=0&app_id=58479"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                  title="Navi Perek Gimel - Shoftim"
                />
              </div>
              <div>
                <h5 className="font-semibold text-white text-sm mb-1">Navi Perek Gimel — Shoftim</h5>
                <p className="text-white/40 text-xs leading-relaxed">Journey through the Prophets with energy and insight that makes every pasuk come alive.</p>
              </div>
            </div>

            {/* Live Zoom — Plus Only */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="text-[#EDE518] font-bold text-[10px] uppercase tracking-[0.22em]">Live with Rabbi Scheller</span>
                <div className="h-px flex-1 bg-[#EDE518]/20" />
              </div>
              <div className="rounded-xl overflow-hidden shadow-2xl relative" style={{ paddingTop: "56.25%" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#0d1b2a] flex flex-col items-center justify-center gap-4 px-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#EDE518]/15 border border-[#EDE518]/30 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-[#EDE518]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.07A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M4 8a2 2 0 012-2h7a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
                    </svg>
                  </div>
                  <div>
                    <span className="inline-block bg-[#EDE518] text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2">Plus Members Only</span>
                    <p className="text-white/70 text-xs leading-relaxed">Join Rabbi Scheller live on Zoom — ask questions, learn together, and connect in real time.</p>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-white text-sm mb-1">Live Zoom Class with Rabbi Scheller</h5>
                <p className="text-white/40 text-xs leading-relaxed">An exclusive live class available only to Plus members. Real-time Torah learning, straight from Rabbi Scheller.</p>
              </div>
            </div>

          </div>

          <div className="text-center mt-14">
            <p className="text-white/40 text-sm mb-4">All this and more — available inside the Academy</p>
            <Link href="/register">
              <Button className="bg-[#EDE518] text-black font-bold px-10 py-5 text-base hover:bg-[#EDE518]/90 rounded-full" data-testid="button-academy-preview-join">
                Join the Academy
              </Button>
            </Link>
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

      <TestimonialCarousel />

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

      <section className="py-20 bg-[#08779C]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 flex flex-wrap items-center justify-center gap-5 leading-tight">
            Bring
            <img
              src={logoImage}
              alt="OneTime OneTime"
              className="h-24 w-auto"
              style={{ filter: "drop-shadow(0 0 24px rgba(237,229,24,0.7)) drop-shadow(0 4px 16px rgba(0,0,0,0.5))" }}
            />
            into your home.
          </h2>
          <p className="text-xl text-white/85 mb-8 max-w-lg mx-auto leading-relaxed">
            Torah, inspiration, and joy — for your kids, your teens, and your whole family. Every week.
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
              <span className="text-lg">Ramat Beit Shemesh, Israel</span>
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
          <p className="text-sm mb-2">
            &copy; {new Date().getFullYear()} OneTimeOneTime. All rights reserved.
          </p>
          <p className="text-xs mt-4">
            Website and Academy built by{" "}
            <a href="https://baltimoreexpert.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              baltimoreexpert.com
            </a>{" "}
            <a href="tel:3473895527" className="hover:text-white transition-colors">(347) 389-5527</a>
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
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .gradient-text-animated {
          background: linear-gradient(90deg, #EDE518, #ffffff, #FFD700, #EDE518, #ffffff, #FFD700, #EDE518);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 4s ease-in-out infinite;
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
