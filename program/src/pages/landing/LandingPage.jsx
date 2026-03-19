import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import HeroSection from './HeroSection';
import ServicesSection from './ServicesSection';
import CTASection from './CTASection';
import ContactSection from './ContactSection';
import Footer from './Footer';

function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const headerRef = useRef(null);
  const progressBarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Header slide-down animation
    gsap.fromTo(
      headerRef.current,
      { y: -100 },
      { y: 0, duration: 0.5, ease: 'power2.out' }
    );

    // Scroll progress bar
    gsap.to(progressBarRef.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
    });

    // Scroll handler for header shadow
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Scroll Progress Bar */}
      <div
        ref={progressBarRef}
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 origin-left z-[100]"
        style={{ transform: 'scaleX(0)' }}
      />

      {/* Header */}
      <header
        ref={headerRef}
        className={cn(
          'sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-gray-200 transition-shadow duration-300',
          scrollY > 50 ? 'shadow-md' : ''
        )}
      >
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigation('/')}>
            <img src="/logo.png" alt="PharmaCare Logo" className="h-8 w-8 rounded-lg" />
            <span className="font-bold text-xl text-gray-900">PharmaCare</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a
              href="#services"
              onClick={(e) => handleSmoothScroll(e, 'services')}
              className="text-sm font-medium transition-colors hover:text-blue-600 text-gray-700"
            >
              Services
            </a>
            <a
              href="#about"
              onClick={(e) => handleSmoothScroll(e, 'services')}
              className="text-sm font-medium transition-colors hover:text-blue-600 text-gray-700"
            >
              About
            </a>
            <a
              href="#contact"
              onClick={(e) => handleSmoothScroll(e, 'contact')}
              className="text-sm font-medium transition-colors hover:text-blue-600 text-gray-700"
            >
              Contact
            </a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-900 hover:bg-gray-50"
              onClick={() => handleNavigation('/auth/login')}
            >
              Log In
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => handleNavigation('/auth/signup')}
            >
              Get Started
            </Button>
          </div>
          <button
            className="flex md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="PharmaCare Logo" className="h-8 w-8 rounded-lg" />
              <span className="font-bold text-xl text-gray-900">PharmaCare</span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="container grid gap-4 pb-8 pt-6 px-4">
            <a
              href="#services"
              onClick={(e) => handleSmoothScroll(e, 'services')}
              className="flex items-center justify-between rounded-lg px-4 py-2 text-lg font-medium hover:bg-gray-100"
            >
              Services
              <ChevronRight className="h-4 w-4" />
            </a>
            <a
              href="#about"
              onClick={(e) => handleSmoothScroll(e, 'services')}
              className="flex items-center justify-between rounded-lg px-4 py-2 text-lg font-medium hover:bg-gray-100"
            >
              About
              <ChevronRight className="h-4 w-4" />
            </a>
            <a
              href="#contact"
              onClick={(e) => handleSmoothScroll(e, 'contact')}
              className="flex items-center justify-between rounded-lg px-4 py-2 text-lg font-medium hover:bg-gray-100"
            >
              Contact
              <ChevronRight className="h-4 w-4" />
            </a>
            <div className="flex flex-col gap-3 pt-4">
              <Button
                variant="outline"
                className="w-full border-gray-300 text-gray-900 hover:bg-gray-50"
                onClick={() => handleNavigation('/auth/login')}
              >
                Log In
              </Button>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => handleNavigation('/auth/signup')}
              >
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <HeroSection />
        <ServicesSection />
        <CTASection />
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default LandingPage;
