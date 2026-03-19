import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Mail, Phone } from 'lucide-react';

function ContactSection() {
  const leftContentRef = useRef(null);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Animate left content
    gsap.fromTo(
      leftContentRef.current,
      { opacity: 0, x: -50 },
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
      }
    );

    // Animate form
    gsap.fromTo(
      formRef.current,
      { opacity: 0, x: 50 },
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
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add form submission logic here
    alert('Thank you for your message! We will get back to you shortly.');
    setFormData({ firstName: '', lastName: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-white">
      <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2">
        <div ref={leftContentRef} className="space-y-4">
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">Contact</Badge>
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-gray-900">
            Let&apos;s Work Together
          </h2>
          <p className="max-w-[600px] text-gray-600 md:text-xl/relaxed">
            Ready to modernize your pharmacy? Get in touch with us to discuss how PharmaCare can help transform your operations.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-50 p-2">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Our Location</h3>
                <p className="text-sm text-gray-600">123 Healthcare Ave, Medical District, 10001</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-50 p-2">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Email Us</h3>
                <p className="text-sm text-gray-600">support@pharmacare.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-50 p-2">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Call Us</h3>
                <p className="text-sm text-gray-600">+1 (555) PHARMA-CARE</p>
              </div>
            </div>
          </div>
        </div>

        <div ref={formRef} className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-2 text-gray-900">Send Us a Message</h3>
          <p className="text-sm text-gray-600 mb-6">Fill out the form below and we&apos;ll get back to you shortly.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="first-name" className="text-sm font-medium text-gray-900">
                  First name
                </label>
                <Input
                  id="first-name"
                  name="firstName"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="last-name" className="text-sm font-medium text-gray-900">
                  Last name
                </label>
                <Input
                  id="last-name"
                  name="lastName"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-900">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-gray-900">
                Message
              </label>
              <Textarea
                id="message"
                name="message"
                placeholder="Enter your message"
                className="min-h-[120px]"
                value={formData.message}
                onChange={handleInputChange}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
