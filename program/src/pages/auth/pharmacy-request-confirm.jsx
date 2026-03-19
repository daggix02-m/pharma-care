'use client';

import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FloatingPaths from '@/components/shared/FloatingPaths';
import {
  CheckCircleIcon,
  ClockIcon,
  MailIcon,
  BuildingIcon,
  MapPinIcon,
  UserRoundIcon,
} from 'lucide-react';
import gsap from 'gsap';

import ElegantShape from '../landing/ElegantShape';
import { cn } from '@/lib/utils';

export function PharmacyRequestConfirmPage() {
  const containerRef = useRef(null);
  const rightPanelRef = useRef(null);

  const request = JSON.parse(localStorage.getItem('pharmacyRequest') || '{}');
  const pharmacyName = request.pharmacyName || 'Your Pharmacy';
  const branchName = request.branchName || '';
  const location = request.location || '';
  const managerName = request.managerName || '';
  const managerEmail = request.managerEmail || '';

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    let ctx = gsap.context(() => {
      if (rightPanelRef.current) {
        gsap.fromTo(
          rightPanelRef.current.children,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
        );
      }
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="relative min-h-screen w-full flex items-center justify-center overflow-hidden theme-gradient">
      <div className="theme-overlay" />

      {/* Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-blue-500/[0.12]"
          className="left-[-10%] top-[15%]"
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-cyan-500/[0.12]"
          className="right-[-5%] top-[70%]"
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl px-6 py-12">
        <div className="bg-white/80 backdrop-blur-xl border border-blue-100/50 rounded-3xl p-8 shadow-2xl shadow-blue-500/10 text-center">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-3 group transition-transform hover:scale-105">
              <img src="/logo.png" alt="PharmaCare Logo" className="h-12 w-12 rounded-xl shadow-lg shadow-blue-500/20" />
              <span className="font-bold text-2xl text-gray-900 tracking-tight">PharmaCare</span>
            </Link>
          </div>

          <div className="flex justify-center mb-6">
            <div className="bg-green-50 text-green-600 p-6 rounded-full">
              <CheckCircleIcon className="size-16" />
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Request Submitted</h1>
            <p className="text-blue-600 font-semibold text-lg">{pharmacyName}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
            <div className="p-4 bg-white/50 rounded-2xl border border-blue-50 space-y-3">
              <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Submitted Details</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <UserRoundIcon className="size-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{managerName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MailIcon className="size-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{managerEmail}</span>
                </div>
                <div className="flex items-center gap-3">
                  <BuildingIcon className="size-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{pharmacyName}{branchName ? ` - ${branchName}` : ''}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-600 rounded-2xl text-white space-y-3 shadow-lg shadow-blue-600/20">
              <h3 className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Next Step</h3>
              <div className="flex items-start gap-3">
                <div className="bg-white/20 rounded-full p-1 mt-0.5">
                  <ClockIcon className="size-4" />
                </div>
                <p className="text-sm font-medium leading-snug">
                  The system administrator will review your application. Check your email for the Branch ID.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50/50 rounded-2xl p-6 text-left space-y-4 mb-8 border border-gray-100">
            <h2 className="font-bold text-gray-900">Process Overview</h2>
            <div className="space-y-4">
              {[
                { title: 'Admin Verification', desc: 'Your pharmacy request is being verified against our standards.' },
                { title: 'Branch ID Issuance', desc: `A secure Branch ID will be sent to ${managerEmail || 'your email'}.` },
                { title: 'Complete Setup', desc: 'Use the ID on the signup page to activate your manager account.' }
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <span className="flex-shrink-0 flex items-center justify-center size-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                    <p className="text-xs text-gray-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all" asChild>
              <Link to="/auth/login">Back to Login</Link>
            </Button>
            <p className="text-[11px] text-gray-400">
              Return to the <Link to="/auth/signup" className="text-blue-600 hover:underline">signup page</Link> once you have your Branch ID.
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
    </main>
  );
}
