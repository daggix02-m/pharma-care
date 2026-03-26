import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Loader2 } from 'lucide-react';
import { api } from '../../../convex/_generated/api';

function ContactSection() {
  const leftContentRef = useRef(null);
  const formRef = useRef(null);
  const navigate = useNavigate();

  const settings = useQuery(api.admin.siteSettings.getSiteSettings);
  const submitMessage = useMutation(api.public.contact.submitContactMessage);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        leftContentRef.current,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: leftContentRef.current,
            start: 'top 80%',
            once: true,
          },
          immediateRender: true,
        }
      );

      gsap.fromTo(
        formRef.current,
        { opacity: 0, x: 30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top 80%',
            once: true,
          },
          immediateRender: true,
        }
      );
    }, leftContentRef);

    return () => ctx.revert();
  }, []);

  // Rate limit countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 60000); // Update every minute
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || countdown > 0) return;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate message length
    if (formData.message.length < 10) {
      toast.error('Message must be at least 10 characters long');
      return;
    }
    if (formData.message.length > 2000) {
      toast.error('Message must be less than 2000 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitMessage({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        message: formData.message,
      });

      toast.success(result.message);
      navigate('/contact-success');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send message. Please try again.';

      // Check if it's a rate limit error
      if (errorMessage.includes('wait')) {
        const match = errorMessage.match(/(\d+)/);
        if (match) {
          setCountdown(parseInt(match[1]));
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactPhone = settings?.contactPhone || '+251 947471516';
  const contactAddress = settings?.contactAddress || 'Ethiopia, Addis Ababa';
  const phoneHref = `tel:${contactPhone.replace(/\s/g, '')}`;

  return (
    <section id='contact' className='w-full py-12 md:py-24 lg:py-32 bg-transparent'>
      <div className='container grid items-center gap-12 px-4 md:px-6 lg:grid-cols-2'>
        <div ref={leftContentRef} className='space-y-6'>
          <Badge className='bg-muted text-muted-foreground border-border font-display uppercase tracking-widest text-[10px]'>
            Contact
          </Badge>
          <h2 className='text-3xl font-bold tracking-tight md:text-5xl text-foreground font-display'>
            Let's Work Together
          </h2>
          <p className='max-w-[600px] text-muted-foreground md:text-xl font-body leading-relaxed'>
            Ready to modernize your pharmacy? Get in touch with us to discuss how PharmaCare can
            help transform your operations.
          </p>
          <div className='mt-8 space-y-6'>
            <div className='flex items-start gap-4'>
              <div className='rounded-xl bg-muted p-3 border border-border'>
                <MapPin className='h-5 w-5 text-primary' />
              </div>
              <div>
                <h3 className='font-bold text-foreground font-display'>Our Location</h3>
                <p className='text-sm text-muted-foreground font-body'>{contactAddress}</p>
              </div>
            </div>
            <div className='flex items-start gap-4'>
              <a
                href={phoneHref}
                className='rounded-xl bg-muted p-3 border border-border hover:bg-muted/80 transition-colors'
              >
                <Phone className='h-5 w-5 text-primary' />
              </a>
              <div>
                <h3 className='font-bold text-foreground font-display'>Call Us</h3>
                <a
                  href={phoneHref}
                  className='text-sm text-muted-foreground font-body hover:text-primary transition-colors'
                >
                  {contactPhone}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={formRef}
          className='rounded-3xl border border-border bg-white/50 backdrop-blur-md p-8 lg:p-10 shadow-sm'
        >
          <h3 className='text-2xl font-bold mb-2 text-foreground font-display'>
            Send Us a Message
          </h3>
          <p className='text-sm text-muted-foreground mb-8 font-body'>
            Fill out the form below and we'll get back to you shortly.
          </p>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <label
                  htmlFor='first-name'
                  className='text-xs font-bold text-slate-600 uppercase tracking-widest ml-1'
                >
                  First name *
                </label>
                <Input
                  id='first-name'
                  name='firstName'
                  placeholder='Abebe'
                  className='h-12 bg-white/80 border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all rounded-xl'
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting || countdown > 0}
                />
              </div>
              <div className='space-y-2'>
                <label
                  htmlFor='last-name'
                  className='text-xs font-bold text-slate-600 uppercase tracking-widest ml-1'
                >
                  Last name *
                </label>
                <Input
                  id='last-name'
                  name='lastName'
                  placeholder='Kebede'
                  className='h-12 bg-white/80 border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all rounded-xl'
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting || countdown > 0}
                />
              </div>
            </div>
            <div className='space-y-2'>
              <label
                htmlFor='email'
                className='text-xs font-bold text-slate-600 uppercase tracking-widest ml-1'
              >
                Email *
              </label>
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='abebe@example.com'
                className='h-12 bg-white/80 border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all rounded-xl'
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isSubmitting || countdown > 0}
              />
            </div>
            <div className='space-y-2'>
              <label
                htmlFor='message'
                className='text-xs font-bold text-slate-600 uppercase tracking-widest ml-1'
              >
                Message *
              </label>
              <Textarea
                id='message'
                name='message'
                placeholder='How can we help you?'
                className='min-h-[120px] bg-white/80 border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all rounded-xl p-4'
                value={formData.message}
                onChange={handleInputChange}
                required
                disabled={isSubmitting || countdown > 0}
                maxLength={2000}
              />
              <p className='text-xs text-muted-foreground text-right'>
                {formData.message.length}/2000
              </p>
            </div>

            {countdown > 0 && (
              <div className='bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800'>
                Please wait {countdown} minute{countdown !== 1 ? 's' : ''} before sending another
                message.
              </div>
            )}

            <Button
              type='submit'
              className='w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold tracking-wide mt-4 shadow-sm'
              disabled={isSubmitting || countdown > 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                  Sending...
                </>
              ) : countdown > 0 ? (
                `Wait ${countdown} min`
              ) : (
                'Send Message'
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
