import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Palette, Code, Sparkles, Zap, LineChart, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function ServicesSection() {
  const headerRef = useRef(null);
  const cardsRef = useRef([]);

  const services = [
    {
      icon: <Palette className="h-10 w-10 text-blue-600" />,
      title: 'Inventory Management',
      description: 'Track medications, supplies, and equipment in real-time with automated alerts for low stock levels.',
    },
    {
      icon: <Code className="h-10 w-10 text-blue-600" />,
      title: 'Prescription Tracking',
      description: 'Manage prescriptions efficiently with digital records and automated refill reminders for patients.',
    },
    {
      icon: <Sparkles className="h-10 w-10 text-blue-600" />,
      title: 'Patient Records',
      description: 'Secure digital patient profiles with complete medication history and allergy information.',
    },
    {
      icon: <Zap className="h-10 w-10 text-blue-600" />,
      title: 'Analytics & Reports',
      description: 'Generate comprehensive reports on sales, inventory turnover, and business performance metrics.',
    },
    {
      icon: <LineChart className="h-10 w-10 text-blue-600" />,
      title: 'Supplier Management',
      description: 'Streamline supplier relationships with order tracking and automated purchase requisitions.',
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-blue-600" />,
      title: '24/7 Support',
      description: 'Access expert support anytime with our dedicated customer service team and knowledge base.',
    },
  ];

  useEffect(() => {
    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Animate header
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
      }
    );

    // Animate service cards with stagger
    gsap.fromTo(
      cardsRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: cardsRef.current[0],
          start: 'top 80%',
          once: true,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const handleCardHover = (index, isHovering) => {
    if (cardsRef.current[index]) {
      gsap.to(cardsRef.current[index], {
        y: isHovering ? -10 : 0,
        scale: isHovering ? 1.02 : 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  return (
    <section id="services" className="w-full py-12 md:py-24 lg:py-32 bg-white">
      <div className="container px-4 md:px-6">
        <div ref={headerRef} className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">Services</Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
            What We Offer
          </h2>
          <p className="mx-auto max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Comprehensive solutions to help your pharmacy thrive in the digital age
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl items-center gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <div
              key={index}
              ref={(el) => (cardsRef.current[index] = el)}
              className="group relative overflow-hidden rounded-lg border border-gray-200 p-6 shadow-sm transition-all hover:shadow-xl bg-white cursor-pointer"
              onMouseEnter={() => handleCardHover(index, true)}
              onMouseLeave={() => handleCardHover(index, false)}
            >
              <div className="space-y-3">
                <div className="mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
