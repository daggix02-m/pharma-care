import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, FileText, ShoppingCart, Users, BarChart3, UserCircle, Check } from 'lucide-react';

// Icon mapping for dynamic icons
const iconMap: Record<string, React.ReactNode> = {
  Package: <Package className='h-10 w-10 text-primary' />,
  FileText: <FileText className='h-10 w-10 text-primary' />,
  ShoppingCart: <ShoppingCart className='h-10 w-10 text-primary' />,
  Users: <Users className='h-10 w-10 text-primary' />,
  BarChart3: <BarChart3 className='h-10 w-10 text-primary' />,
  UserCircle: <UserCircle className='h-10 w-10 text-primary' />,
};

// Default services with actual system features
interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  features: string[];
}

const defaultServices: Service[] = [
  {
    id: 'inventory',
    icon: 'Package',
    title: 'Multi-Branch Inventory',
    description:
      'Real-time stock tracking across all branches with automated low-stock alerts, expiry management, and batch tracking.',
    features: ['Stock alerts', 'Expiry tracking', 'Batch management', 'Cross-branch transfers'],
  },
  {
    id: 'prescriptions',
    icon: 'FileText',
    title: 'Prescription Management',
    description:
      'Digital prescription tracking with patient history, refill management, and automated validation checks.',
    features: [
      'Digital prescriptions',
      'Patient history',
      'Refill alerts',
      'Drug interaction checks',
    ],
  },
  {
    id: 'sales',
    icon: 'ShoppingCart',
    title: 'Sales & Billing',
    description:
      'Complete point of sale system with multiple payment methods, receipt generation, and detailed sales analytics.',
    features: ['POS system', 'Multiple payments', 'Receipt generation', 'Sales reports'],
  },
  {
    id: 'staff',
    icon: 'Users',
    title: 'Staff Management',
    description:
      'Role-based access control for managers, pharmacists, and cashiers with comprehensive audit logs.',
    features: ['Role permissions', 'Activity logs', 'Performance tracking', 'Shift management'],
  },
  {
    id: 'analytics',
    icon: 'BarChart3',
    title: 'AI-Powered Analytics',
    description:
      'Sales forecasting, inventory optimization, and performance insights with automated reporting.',
    features: ['Sales forecasting', 'Stock optimization', 'Performance metrics', 'Auto reports'],
  },
  {
    id: 'patients',
    icon: 'UserCircle',
    title: 'Patient Records',
    description:
      'Comprehensive patient profiles with medication history, allergy tracking, and prescription management.',
    features: ['Patient profiles', 'Med history', 'Allergy alerts', 'Prescription tracking'],
  },
];

function ServicesSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const content = useQuery(api.public.landingPage.getLandingPageSection, {
    sectionKey: 'services',
  });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (!headerRef.current) return;

      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 80%',
            once: true,
          },
          immediateRender: true,
        }
      );

      const validCards = cardsRef.current.filter(Boolean);
      if (validCards.length === 0) return;

      gsap.fromTo(
        validCards,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: validCards[0],
            start: 'top 80%',
            once: true,
          },
          immediateRender: true,
        }
      );
    }, headerRef);

    return () => ctx.revert();
  }, []);

  const handleCardHover = (index: number, isHovering: boolean) => {
    if (cardsRef.current[index]) {
      gsap.to(cardsRef.current[index], {
        y: isHovering ? -10 : 0,
        scale: isHovering ? 1.02 : 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  const services: Service[] = content?.services || defaultServices;
  const title = content?.servicesTitle || 'Everything You Need to Run Your Pharmacy';
  const subtitle =
    content?.servicesSubtitle ||
    'From inventory management to patient records, our comprehensive suite of tools covers every aspect of modern pharmacy operations.';

  if (!content) {
    return (
      <section id='services' className='w-full py-12 md:py-24 lg:py-32 bg-transparent'>
        <div className='container px-4 md:px-6'>
          <div className='text-center mb-12'>
            <Skeleton className='h-6 w-24 mx-auto mb-4' />
            <Skeleton className='h-12 w-96 mx-auto mb-4' />
            <Skeleton className='h-6 w-64 mx-auto' />
          </div>
          <div className='mx-auto grid max-w-5xl items-center gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className='h-72 rounded-2xl' />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id='services' className='w-full py-12 md:py-24 lg:py-32 bg-transparent'>
      <div className='container px-4 md:px-6'>
        <div
          ref={headerRef}
          className='flex flex-col items-center justify-center space-y-4 text-center mb-12'
        >
          <Badge className='bg-muted text-muted-foreground border-border font-display uppercase tracking-widest text-[10px]'>
            Services
          </Badge>
          <h2 className='text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-foreground font-display'>
            {title}
          </h2>
          <p className='mx-auto max-w-[900px] text-muted-foreground md:text-xl font-body leading-relaxed'>
            {subtitle}
          </p>
        </div>

        <div className='mx-auto grid max-w-5xl items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {services.map((service, index) => (
            <div
              key={service.id || index}
              ref={(el: HTMLDivElement | null) => {
                cardsRef.current[index] = el;
                return;
              }}
              className='group relative overflow-hidden rounded-2xl border border-border p-8 transition-all hover:bg-white/50 backdrop-blur-[2px] bg-white/30 cursor-pointer shadow-sm flex flex-col'
              onMouseEnter={() => handleCardHover(index, true)}
              onMouseLeave={() => handleCardHover(index, false)}
            >
              <div className='space-y-4 flex-1'>
                <div className='mb-4 p-3 bg-muted rounded-xl inline-block'>
                  {iconMap[service.icon] || iconMap.Package}
                </div>
                <h3 className='text-xl font-bold text-foreground font-display'>{service.title}</h3>
                <p className='text-muted-foreground font-body leading-relaxed text-sm'>
                  {service.description}
                </p>
                {service.features && service.features.length > 0 && (
                  <ul className='space-y-2 pt-2'>
                    {service.features.map((feature: string, idx: number) => (
                      <li
                        key={idx}
                        className='flex items-center gap-2 text-sm text-muted-foreground'
                      >
                        <Check className='h-4 w-4 text-primary flex-shrink-0' />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
