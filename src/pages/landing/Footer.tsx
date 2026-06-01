import { Instagram, Twitter, Linkedin, Facebook } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background/80 backdrop-blur-md">
      <div className="container grid gap-12 px-4 py-16 md:px-6 lg:grid-cols-4">
        <div className="space-y-6">
          <Logo />
          <p className="text-sm text-muted-foreground font-body leading-relaxed">
            High-performance healthcare management solutions for contemporary
            pharmacies worldwide.
          </p>
          <div className="flex space-x-4">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-foreground font-display">
            Company
          </h3>
          <nav className="flex flex-col space-y-3 text-sm font-body">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              About Us
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Careers
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Blog
            </a>
          </nav>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-foreground font-display">
            Services
          </h3>
          <nav className="flex flex-col space-y-3 text-sm font-body">
            <a
              href="#services"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Inventory
            </a>
            <a
              href="#services"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Prescriptions
            </a>
            <a
              href="#services"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Analytics
            </a>
          </nav>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-foreground font-display">
            Legal
          </h3>
          <nav className="flex flex-col space-y-3 text-sm font-body">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </a>
          </nav>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-6 py-10 md:flex-row md:py-8 px-4 md:px-6">
          <p className="text-base font-display font-semibold tracking-tight text-foreground">
            © {new Date().getFullYear()} PharmaCare System. All rights reserved.
          </p>
          <a
            href="https://frm.et"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 transition-all hover:opacity-80"
          >
            <span className="text-base font-display font-semibold tracking-tight text-foreground">
              Built by
            </span>
            <img
              src="/frm-logo.png"
              alt="FRM"
              className="h-20 w-auto object-contain block dark:hidden"
            />
            <img
              src="/frm-logo-light.png"
              alt="FRM"
              className="h-20 w-auto object-contain hidden dark:block"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
