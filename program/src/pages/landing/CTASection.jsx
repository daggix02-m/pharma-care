import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PhoneCall, MoveRight } from 'lucide-react';

function CTASection() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, scale: 0.95 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          once: true,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section className="w-full py-20 lg:py-40 bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 md:px-6">
        <div
          ref={containerRef}
          className="flex flex-col text-center bg-white rounded-2xl shadow-xl p-8 lg:p-14 gap-8 items-center border border-gray-100"
        >
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">Get Started</Badge>
          <div className="flex flex-col gap-2">
            <h3 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-regular text-gray-900">
              Ready to Transform Your Pharmacy?
            </h3>
            <p className="text-lg leading-relaxed tracking-tight text-gray-600 max-w-xl">
              Join thousands of pharmacies worldwide that trust PharmaCare to manage their operations efficiently and securely.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="gap-4 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50" variant="outline" onClick={() => { const el = document.getElementById('contact'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>
              Schedule a Demo <PhoneCall className="w-4 h-4" />
            </Button>
            <Button className="gap-4 bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/auth/signup')}>
              Get Started <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
