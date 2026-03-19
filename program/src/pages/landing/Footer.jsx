import { Sparkles, Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';

function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="container grid gap-8 px-4 py-10 md:px-6 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">PharmaCare</span>
          </div>
          <p className="text-sm text-gray-600">
            Modern healthcare management solutions for pharmacies worldwide.
          </p>
          <div className="flex space-x-3">
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-900">Company</h3>
          <nav className="flex flex-col space-y-2 text-sm">
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              About Us
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              Careers
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              Blog
            </a>
          </nav>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-900">Services</h3>
          <nav className="flex flex-col space-y-2 text-sm">
            <a href="#services" className="text-gray-600 hover:text-blue-600 transition-colors">
              Inventory
            </a>
            <a href="#services" className="text-gray-600 hover:text-blue-600 transition-colors">
              Prescriptions
            </a>
            <a href="#services" className="text-gray-600 hover:text-blue-600 transition-colors">
              Analytics
            </a>
          </nav>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-900">Legal</h3>
          <nav className="flex flex-col space-y-2 text-sm">
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              Terms of Service
            </a>
          </nav>
        </div>
      </div>
      <div className="border-t border-gray-200">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0 px-4 md:px-6">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} PharmaCare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
