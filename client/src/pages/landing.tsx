import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Phone, Mail, MapPin } from "lucide-react";
import logoImage from "@assets/qt=q_95_1767830887218.webp";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#161616]">
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoImage} alt="OneTimeOneTime" className="h-10 w-auto" />
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#home" className="text-white font-medium hover:text-[#EDE518] transition-colors">Home</a>
            <a href="#hotline" className="text-white font-medium hover:text-[#EDE518] transition-colors">The Hotline</a>
            <a href="#story" className="text-white font-medium hover:text-[#EDE518] transition-colors">The Story</a>
            <a href="#contact" className="text-white font-medium hover:text-[#EDE518] transition-colors">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button className="bg-[#EDE518] text-black border-[#EDE518] font-semibold" data-testid="button-login">
                Hotline Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section 
        id="home"
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
        <div className="container mx-auto px-4 py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg italic" style={{ fontFamily: "'Georgia', serif" }}>
              Where Kids Fall in Love With Torah
            </h1>
            <p className="text-xl md:text-2xl text-white font-semibold">
              Rabbi Eli Scheller
            </p>
            <p className="text-lg text-white/90">
              Global Educator & Creator of the OneTime OneTime Experience
            </p>
            <p className="text-lg text-white/80">
              Inspiring Families Through Stories and Humor
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/register">
                <Button size="lg" className="bg-[#EDE518] text-black border-[#EDE518] font-semibold px-8" data-testid="button-hotline">
                  The Hotline
                </Button>
              </Link>
              <a href="#story">
                <Button size="lg" variant="outline" className="bg-white text-black border-white font-semibold px-8" data-testid="button-story">
                  The Story
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-[#EDE518] py-3 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-black font-bold text-lg mx-8">
              The OneTime OneTime Hotline
            </span>
          ))}
        </div>
      </div>

      <section id="hotline" className="py-20 bg-white dark:bg-[#161616]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[#161616] dark:text-white">
            Introducing... The OneTime OneTime Hotline
          </h2>
          <h3 className="text-xl text-center mb-8 text-[#161616]/80 dark:text-white/80">
            Welcome to Rabbi Eli Scheller's global phone line for kids, teens, and families.
          </h3>
          
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <p className="text-lg font-semibold text-[#161616] dark:text-white">
              A Family Experience That Keeps You Inspired All Week Long!
            </p>
            <p className="text-[#161616]/80 dark:text-white/80">
              Bring Torah, inspiration, and excitement into your home - in the simple, clear, engaging style kids love and parents trust.
            </p>
            <p className="text-[#161616]/80 dark:text-white/80">
              Join families around the world who are already enjoying the OneTime OneTime experience.
            </p>
            <p className="text-lg font-semibold text-[#161616] dark:text-white">
              Stories. Parsha. Mishnayos. Gemara. Jokes.
            </p>
            <p className="text-[#161616]/80 dark:text-white/80">
              Weekly growth for kids, teens, and the whole family - delivered in the OneTime style you love.
            </p>
            
            <Card className="bg-[#f5f5f5] dark:bg-[#222] border-none mt-8 max-w-xl mx-auto">
              <CardContent className="p-6">
                <p className="italic text-[#161616]/80 dark:text-white/80">
                  "A gut voch Rabbi! Regards from Panama, my kids and I love your stories."
                </p>
                <p className="mt-2 font-semibold text-[#161616] dark:text-white">- Miki Rubin</p>
              </CardContent>
            </Card>

            <div className="pt-8">
              <Link href="/register">
                <Button size="lg" className="bg-[#EDE518] text-black font-semibold px-10">
                  Join Hotline
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#f5f5f5] dark:bg-[#1a1a1a]">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-10 text-[#161616] dark:text-white">
            What Your Family Gets Each Week
          </h3>
          <div className="max-w-3xl mx-auto">
            <p className="text-center mb-8 text-[#161616]/80 dark:text-white/80">
              The OneTime OneTime Hotline brings Torah, inspiration, and meaningful entertainment into your home - created specifically for kids, teens, and families.
            </p>
            <ul className="space-y-4 text-[#161616] dark:text-white">
              <li className="flex items-start gap-3">
                <span className="text-[#EDE518] font-bold text-xl">*</span>
                <span>OneTime OneTime stories that your kids will talk about all week</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#EDE518] font-bold text-xl">*</span>
                <span>A Parsha Spark that brings the weekly Torah portion to life</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#EDE518] font-bold text-xl">*</span>
                <span>Mishnayos (around 4 perakim a week)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#EDE518] font-bold text-xl">*</span>
                <span>Gemara taught simply and clearly</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#EDE518] font-bold text-xl">*</span>
                <span>A weekly joke track (guaranteed to get laughs)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#EDE518] font-bold text-xl">*</span>
                <span>Exclusive member-only content throughout the year</span>
              </li>
            </ul>
            <p className="text-center mt-8 text-[#161616]/80 dark:text-white/80">
              Each piece is short, powerful, and memorable - perfect for busy families who want meaningful moments in minutes.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-[#161616]">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-10 text-[#161616] dark:text-white">
            Featured Videos
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src="https://player.vimeo.com/video/1138747998?title=0&byline=0&portrait=0"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="A Birthday Surprise"
                />
              </div>
              <h4 className="font-semibold text-[#161616] dark:text-white">A Birthday Surprise</h4>
              <p className="text-sm text-[#161616]/70 dark:text-white/70">An interesting birthday surprise for my mother</p>
            </div>
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src="https://player.vimeo.com/video/1050076957?title=0&byline=0&portrait=0"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="The Secret Mission"
                />
              </div>
              <h4 className="font-semibold text-[#161616] dark:text-white">The Secret Mission</h4>
              <p className="text-sm text-[#161616]/70 dark:text-white/70">When an old man gets upset at the kids in the community, tries to harm them and then something unique happens</p>
            </div>
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src="https://player.vimeo.com/video/1138749816?title=0&byline=0&portrait=0"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="Meet The Evil Inclination"
                />
              </div>
              <h4 className="font-semibold text-[#161616] dark:text-white">Meet The Evil Inclination</h4>
              <p className="text-sm text-[#161616]/70 dark:text-white/70">See the battle of the Yetzer tov and Yetzer Hara play out in real-life</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#f5f5f5] dark:bg-[#1a1a1a]">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-4 text-[#161616] dark:text-white">
            ...at home... in camps... at schools...
          </h3>
          <h2 className="text-3xl font-bold text-center mb-12 text-[#161616] dark:text-white">
            ...all over the world.
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white dark:bg-[#222] border-none">
              <CardContent className="p-6">
                <p className="text-lg italic text-[#161616]/80 dark:text-white/80 mb-4">
                  "We never saw the kids so captivated by your stories! You electrified the crowd with amazing stories and Torah lessons. R' Eli, thank you!"
                </p>
                <p className="font-semibold text-[#161616] dark:text-white">Rabbi Dweck, Brooklyn</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-[#222] border-none">
              <CardContent className="p-6">
                <p className="text-lg italic text-[#161616]/80 dark:text-white/80 mb-4">
                  "That was amazing!!! Way above my expectations. Please come back again."
                </p>
                <p className="font-semibold text-[#161616] dark:text-white">Mrs. Haddasah Smolarcik, Boca Raton</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-[#222] border-none">
              <CardContent className="p-6">
                <p className="text-lg italic text-[#161616]/80 dark:text-white/80 mb-4">
                  "Thank you so much for bringing so much positive and exciting energy to Norfolk! The fact that you brought your mishpacha only enhanced the Shabbos."
                </p>
                <p className="font-semibold text-[#161616] dark:text-white">Aharon Lipman, Norfolk, Virginia</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-[#222] border-none">
              <CardContent className="p-6">
                <p className="text-lg italic text-[#161616]/80 dark:text-white/80 mb-4">
                  "You brought so much simcha to the community and were able to unite everyone together like never before. Thank you!"
                </p>
                <p className="font-semibold text-[#161616] dark:text-white">Moshe Glazer, St Louis, Missouri</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="story" className="py-16 bg-white dark:bg-[#161616]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#EDE518]">
            The Story
          </h2>
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h3 className="text-xl font-semibold text-[#161616] dark:text-white">
              Rabbi Eli Scheller: Inspiring, educating, and empowering the next generation of Jewish children worldwide.
            </h3>
            <p className="text-[#161616]/80 dark:text-white/80">
              Most stories begin with "once upon a time." Mine begins with "One time, one time."
            </p>
            <p className="text-[#161616]/80 dark:text-white/80">
              I wasn't supposed to become a storyteller. I wasn't supposed to become a rebbi. I definitely wasn't supposed to become the voice in thousands of kids' rooms every night. I was the kid who struggled in yeshivah, bounced from place to place, and never quite fit the system - until a few "one time" moments changed everything.
            </p>
            <p className="text-[#161616]/80 dark:text-white/80">
              Those moments shaped me. After learning under Rav Yitzchak Berkovits in Yerushalayim, life took me from Lakewood to Los Angeles and eventually to a small classroom in Baltimore, where I walked in with a guitar, faced a wild fifth grade, and began, "One time, one time..." That first story froze the room and quietly launched OneTime OneTime.
            </p>
            <p className="text-lg font-semibold text-[#161616] dark:text-white">
              Every child is one "one time" moment away from discovering who they can become.
            </p>
          </div>
        </div>
      </section>

      <section id="contact" className="py-16 bg-[#161616] text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#EDE518]">
            Contact
          </h2>
          <div className="max-w-md mx-auto space-y-6 text-center">
            <div className="flex items-center justify-center gap-3">
              <MapPin className="h-5 w-5 text-[#EDE518]" />
              <span>Lakewood, New Jersey, United States</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Phone className="h-5 w-5 text-[#EDE518]" />
              <a href="tel:4434538614" className="hover:text-[#EDE518]">(443) 453-8614</a>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Mail className="h-5 w-5 text-[#EDE518]" />
              <a href="mailto:info@onetimeonetime.com" className="hover:text-[#EDE518]">info@onetimeonetime.com</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#0a0a0a] py-8 text-white/60">
        <div className="container mx-auto px-4 text-center">
          <img src={logoImage} alt="OneTimeOneTime" className="h-12 w-auto mx-auto mb-4" />
          <p className="text-sm">
            OneTimeOneTime is a program of Gadlus HaAdam, LLC.
          </p>
          <p className="text-sm mt-2">
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
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
