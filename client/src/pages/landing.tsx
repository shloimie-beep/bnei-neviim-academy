import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import logoImage from "@assets/qt=q_95_1767830887218.webp";
import heroBg from "@assets/generated_images/kids_storytelling_event_hero_background.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoImage} alt="OneTimeOneTime" className="h-10 w-auto" />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="outline" className="bg-white/10 backdrop-blur border-white/30 text-white" data-testid="button-login">
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[#f5e500] text-black border-[#f5e500]" data-testid="button-get-started">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section 
        className="relative min-h-[80vh] flex items-center justify-center"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        <div className="container mx-auto px-4 py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <img src={logoImage} alt="OneTimeOneTime" className="h-24 md:h-32 w-auto mx-auto drop-shadow-lg" />
            <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
              Where Kids Fall in Love With Stories
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Stories, Adventures, and Inspiration for the Whole Family
            </p>
            <p className="text-white/80">
              $9.99/month with a 14-day free trial
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/register">
                <Button size="lg" className="bg-[#f5e500] text-black border-[#f5e500] font-semibold px-8" data-testid="button-start-trial">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur border-white/40 text-white" data-testid="button-learn-more">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} OneTimeOneTime
          </p>
        </div>
      </footer>
    </div>
  );
}
