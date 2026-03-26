import { Logo } from '@/components/shared/Logo';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import HeroSection from './HeroSection';
import ServicesSection from './ServicesSection';
import FeaturesSection from './FeaturesSection';
import TestimonialsSection from './TestimonialsSection';
import CTASection from './CTASection';
import ContactSection from './ContactSection';
import Footer from './Footer';
import { LabBackground } from '@/components/shared/LabBackground';

function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef(null);
  const progressBarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Header slide-down animation
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { y: -60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
        );
      }

      // Scroll progress bar
      if (progressBarRef.current && containerRef.current) {
        gsap.to(progressBarRef.current, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3,
          },
        });
      }
    }, containerRef);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      ctx.revert();
    };
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleSmoothScroll = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <div ref={containerRef} className='flex min-h-screen flex-col bg-background relative'>
      <LabBackground className='fixed inset-0 z-0' />

      {/* Scroll Progress Bar */}
      <div
        ref={progressBarRef}
        className='fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-[100]'
        style={{ transform: 'scaleX(0)' }}
      />

      {/* Header */}
      <header
        ref={headerRef}
        className={cn(
          'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-border transition-shadow duration-300',
          scrollY > 50 ? 'shadow-md' : ''
        )}
      >
        <div className='w-full px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between'>
          <div
            className='flex items-center gap-3 cursor-pointer'
            onClick={() => handleNavigation('/')}
          >
            <Logo className='[&>span]:hidden md:[&>span]:block' />
          </div>
          <nav className='hidden md:flex gap-8'>
            <a
              href='#services'
              onClick={(e) => handleSmoothScroll(e, 'services')}
              className='text-sm font-medium transition-colors hover:text-primary text-muted-foreground'
            >
              Services
            </a>
            <a
              href='/about'
              onClick={() => handleNavigation('/about')}
              className='text-sm font-medium transition-colors hover:text-primary text-muted-foreground'
            >
              About
            </a>
            <a
              href='#testimonials'
              onClick={(e) => handleSmoothScroll(e, 'testimonials')}
              className='text-sm font-medium transition-colors hover:text-primary text-muted-foreground'
            >
              Testimonials
            </a>
            <a
              href='#contact'
              onClick={(e) => handleSmoothScroll(e, 'contact')}
              className='text-sm font-medium transition-colors hover:text-primary text-muted-foreground'
            >
              Contact
            </a>
          </nav>
          <div className='hidden md:flex items-center gap-3'>
            <ThemeToggle />
            <Button
              variant='ghost'
              size='sm'
              className='text-foreground hover:bg-secondary rounded-xl px-6 font-bold'
              onClick={() => handleNavigation('/auth/login')}
            >
              Log In
            </Button>
            <Button
              size='sm'
              className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 font-bold'
              onClick={() => handleNavigation('/auth/signup')}
            >
              Get Started
            </Button>
          </div>
          <button
            className='flex md:hidden'
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label='Toggle menu'
          >
            {isMenuOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className='fixed inset-0 z-[60] bg-background md:hidden'>
          <div className='container flex h-16 items-center justify-between px-4'>
            <div className='flex items-center gap-3'>
              <Logo className='[&>span]:hidden md:[&>span]:block' />
            </div>
            <button onClick={() => setIsMenuOpen(false)} aria-label='Close menu'>
              <X className='h-6 w-6' />
            </button>
          </div>
          <nav className='container grid gap-4 pb-8 pt-6 px-4'>
            <a
              href='#services'
              onClick={(e) => handleSmoothScroll(e, 'services')}
              className='flex items-center justify-between rounded-lg px-4 py-2 text-lg font-medium hover:bg-accent'
            >
              Services
              <ChevronRight className='h-4 w-4' />
            </a>
            <a
              href='/about'
              onClick={() => handleNavigation('/about')}
              className='flex items-center justify-between rounded-lg px-4 py-2 text-lg font-medium hover:bg-accent'
            >
              About
              <ChevronRight className='h-4 w-4' />
            </a>
            <a
              href='#testimonials'
              onClick={(e) => handleSmoothScroll(e, 'testimonials')}
              className='flex items-center justify-between rounded-lg px-4 py-2 text-lg font-medium hover:bg-accent'
            >
              Testimonials
              <ChevronRight className='h-4 w-4' />
            </a>
            <a
              href='#contact'
              onClick={(e) => handleSmoothScroll(e, 'contact')}
              className='flex items-center justify-between rounded-lg px-4 py-2 text-lg font-medium hover:bg-accent'
            >
              Contact
              <ChevronRight className='h-4 w-4' />
            </a>
            <div className='flex flex-col gap-3 pt-4'>
              <div className='flex items-center justify-between px-4 py-2'>
                <span className='text-sm text-muted-foreground'>Theme</span>
                <ThemeToggle />
              </div>
              <Button
                variant='outline'
                className='w-full border-border text-foreground hover:bg-accent rounded-xl font-bold'
                onClick={() => handleNavigation('/auth/login')}
              >
                Log In
              </Button>
              <Button
                className='w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold'
                onClick={() => handleNavigation('/auth/signup')}
              >
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className='flex-1 relative z-10'>
        <HeroSection />
        <ServicesSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
        <ContactSection />
      </main>

      {/* Footer */}
      <div className='relative z-10'>
        <Footer />
      </div>
    </div>
  );
}

export default LandingPage;
