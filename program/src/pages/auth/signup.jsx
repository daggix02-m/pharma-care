'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import FloatingPaths from '@/components/shared/FloatingPaths';
import ElegantShape from '../landing/ElegantShape';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useSignupStore } from '@/store/useSignupStore';
import { useSignUp } from '@clerk/clerk-react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
  ChevronLeftIcon,
  MailIcon,
  LockIcon,
  BuildingIcon,
  MapPinIcon,
  UserRoundIcon,
  Eye,
  EyeOff,
  InfoIcon,
  Loader2Icon,
  HashIcon,
  CheckCircle2,
  UsersIcon,
  MapIcon
} from 'lucide-react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

// ─── Step 1: Pharmacy Details ───────────────────────────────────────────────────
const Step1PharmacyDetails = () => {
  const { pharmacyDetails, errors, setPharmacyDetails, validateCurrentStep, goToNextStep } = useSignupStore();
  const containerRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;
    let ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current.children, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.08 });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleContinue = () => {
    if (!validateCurrentStep(1)) return;
    goToNextStep();
  };

  return (
    <div ref={containerRef} className='space-y-4 animate-in fade-in slide-in-from-right-4 duration-500'>
      <div className='bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 space-y-2'>
        <div className='flex items-start gap-3'>
          <div className="p-2 bg-blue-100 rounded-lg">
            <BuildingIcon className='size-4 text-blue-600' />
          </div>
          <div>
            <p className='text-sm font-bold text-gray-900'>Pharmacy Setup</p>
            <p className='text-[12px] text-gray-500 leading-relaxed mt-0.5 font-light'>
              Enter your pharmacy&apos;s organization details.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 col-span-2">
            <Label className="text-xs font-semibold text-gray-700 ml-1">Pharmacy Name</Label>
            <div className='relative'>
              <Input
                value={pharmacyDetails.pharmacyName}
                onChange={(e) => setPharmacyDetails('pharmacyName', e.target.value)}
                placeholder='e.g. City Central Pharmacy'
                className={cn(
                  "h-12 ps-11 bg-white border-blue-50 focus:border-blue-400 focus:ring-blue-400/20 transition-all rounded-xl",
                  errors.pharmacyName ? 'border-red-500' : ''
                )}
              />
              <div className='absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400'>
                <BuildingIcon className='size-4' />
              </div>
            </div>
            {errors.pharmacyName && <p className='text-red-500 text-[10px] font-bold ml-1'>{errors.pharmacyName}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700 ml-1">License Code</Label>
            <div className='relative'>
              <Input
                value={pharmacyDetails.licenseCode}
                onChange={(e) => setPharmacyDetails('licenseCode', e.target.value)}
                placeholder='e.g. PH-12345'
                className={cn(
                  "h-12 ps-11 bg-white border-blue-50 focus:border-blue-400 focus:ring-blue-400/20 transition-all rounded-xl",
                  errors.licenseCode ? 'border-red-500' : ''
                )}
              />
              <div className='absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400'>
                <HashIcon className='size-4' />
              </div>
            </div>
            {errors.licenseCode && <p className='text-red-500 text-[10px] font-bold ml-1'>{errors.licenseCode}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700 ml-1">Total Staff Count</Label>
            <div className='relative'>
              <Input
                value={pharmacyDetails.staffCount}
                onChange={(e) => setPharmacyDetails('staffCount', e.target.value)}
                placeholder='e.g. 15'
                type='number'
                min="1"
                className={cn(
                  "h-12 ps-11 bg-white border-blue-50 focus:border-blue-400 focus:ring-blue-400/20 transition-all rounded-xl",
                  errors.staffCount ? 'border-red-500' : ''
                )}
              />
              <div className='absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400'>
                <UsersIcon className='size-4' />
              </div>
            </div>
            {errors.staffCount && <p className='text-red-500 text-[10px] font-bold ml-1'>{errors.staffCount}</p>}
          </div>

          <div className="space-y-1.5 col-span-2">
            <Label className="text-xs font-semibold text-gray-700 ml-1">Number of Branches</Label>
            <div className='relative'>
              <Input
                value={pharmacyDetails.numberOfBranches}
                onChange={(e) => setPharmacyDetails('numberOfBranches', e.target.value)}
                placeholder='e.g. 3'
                type='number'
                min="1"
                className={cn(
                  "h-12 ps-11 bg-white border-blue-50 focus:border-blue-400 focus:ring-blue-400/20 transition-all rounded-xl",
                  errors.numberOfBranches ? 'border-red-500' : ''
                )}
              />
              <div className='absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400'>
                <BuildingIcon className='size-4' />
              </div>
            </div>
            {errors.numberOfBranches && <p className='text-red-500 text-[10px] font-bold ml-1'>{errors.numberOfBranches}</p>}
          </div>

          <div className="space-y-1.5 col-span-2">
            <Label className="text-xs font-semibold text-gray-700 ml-1">Branch Names (Comma separated)</Label>
            <div className='relative'>
              <Input
                value={pharmacyDetails.branchNames}
                onChange={(e) => setPharmacyDetails('branchNames', e.target.value)}
                placeholder='e.g. Main St, Downtown, Westside'
                className={cn(
                  "h-12 ps-11 bg-white border-blue-50 focus:border-blue-400 focus:ring-blue-400/20 transition-all rounded-xl",
                  errors.branchNames ? 'border-red-500' : ''
                )}
              />
              <div className='absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400'>
                <MapIcon className='size-4' />
              </div>
            </div>
            {errors.branchNames && <p className='text-red-500 text-[10px] font-bold ml-1'>{errors.branchNames}</p>}
          </div>

          <div className="space-y-1.5 col-span-2">
            <Label className="text-xs font-semibold text-gray-700 ml-1">Locations (Comma separated)</Label>
            <div className='relative'>
              <Input
                value={pharmacyDetails.locations}
                onChange={(e) => setPharmacyDetails('locations', e.target.value)}
                placeholder='e.g. New York, NY, Brooklyn, NY'
                className={cn(
                  "h-12 ps-11 bg-white border-blue-50 focus:border-blue-400 focus:ring-blue-400/20 transition-all rounded-xl",
                  errors.locations ? 'border-red-500' : ''
                )}
              />
              <div className='absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400'>
                <MapPinIcon className='size-4' />
              </div>
            </div>
            {errors.locations && <p className='text-red-500 text-[10px] font-bold ml-1'>{errors.locations}</p>}
          </div>
        </div>
      </div>

      <div className='flex gap-3 mt-6'>
        <Button 
          type='button' 
          onClick={handleContinue} 
          className='w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]'
        >
          Continue to Manager Info
        </Button>
      </div>
    </div>
  );
};

// ─── Step 2: Manager Info ───────────────────────────────────────────────────────
const Step2ManagerInfo = () => {
  const { managerInfo, errors, setManagerInfo, validateCurrentStep, goToNextStep, goToPreviousStep } = useSignupStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;
    let ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current.children, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.08 });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleContinue = () => {
    if (!validateCurrentStep(2)) return;
    goToNextStep();
  };

  return (
    <div ref={containerRef} className='space-y-4 animate-in fade-in slide-in-from-right-4 duration-500'>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-700 ml-1">Full Name</Label>
          <div className='relative'>
            <Input
              value={managerInfo.fullName}
              onChange={(e) => setManagerInfo('fullName', e.target.value)}
              placeholder='Enter your full name'
              className={cn(
                "h-12 ps-11 bg-white border-blue-50 focus:border-blue-400 focus:ring-blue-400/20 transition-all rounded-xl",
                errors.fullName ? 'border-red-500' : ''
              )}
            />
            <div className='absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400'>
              <UserRoundIcon className='size-4' />
            </div>
          </div>
          {errors.fullName && <p className='text-red-500 text-[10px] font-bold ml-1'>{errors.fullName}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-700 ml-1">Email Address</Label>
          <div className='relative'>
            <Input
              value={managerInfo.email}
              onChange={(e) => setManagerInfo('email', e.target.value)}
              placeholder='name@company.com'
              type='email'
              className={cn(
                "h-12 ps-11 bg-white border-blue-50 focus:border-blue-400 focus:ring-blue-400/20 transition-all rounded-xl",
                errors.email ? 'border-red-500' : ''
              )}
            />
            <div className='absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400'>
              <MailIcon className='size-4' />
            </div>
          </div>
          {errors.email && <p className='text-red-500 text-[10px] font-bold ml-1'>{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-700 ml-1">Password</Label>
          <div className='relative'>
            <Input
              value={managerInfo.password}
              onChange={(e) => setManagerInfo('password', e.target.value)}
              placeholder='Create a strong password'
              type={showPassword ? 'text' : 'password'}
              className={cn(
                "h-12 ps-11 pe-11 bg-white border-blue-50 focus:border-blue-400 focus:ring-blue-400/20 transition-all rounded-xl",
                errors.password ? 'border-red-500' : ''
              )}
            />
            <div className='absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400'>
              <LockIcon className='size-4' />
            </div>
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute inset-y-0 end-0 flex items-center pe-4 text-gray-400 hover:text-blue-600 transition-colors'
            >
              {showPassword ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
            </button>
          </div>
          {errors.password && <p className='text-red-500 text-[10px] font-bold ml-1'>{errors.password}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-700 ml-1">Confirm Password</Label>
          <div className='relative'>
            <Input
              value={managerInfo.confirmPassword}
              onChange={(e) => setManagerInfo('confirmPassword', e.target.value)}
              placeholder='Repeat your password'
              type={showConfirmPassword ? 'text' : 'password'}
              className={cn(
                "h-12 ps-11 pe-11 bg-white border-blue-50 focus:border-blue-400 focus:ring-blue-400/20 transition-all rounded-xl",
                errors.confirmPassword ? 'border-red-500' : ''
              )}
            />
            <div className='absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400'>
              <LockIcon className='size-4' />
            </div>
            <button
              type='button'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className='absolute inset-y-0 end-0 flex items-center pe-4 text-gray-400 hover:text-blue-600 transition-colors'
            >
              {showConfirmPassword ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
            </button>
          </div>
          {errors.confirmPassword && <p className='text-red-500 text-[10px] font-bold ml-1'>{errors.confirmPassword}</p>}
        </div>
      </div>

      <div className='flex gap-3 mt-6'>
        <Button 
          type='button' 
          variant='ghost' 
          onClick={goToPreviousStep} 
          className='flex-1 h-12 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl font-semibold'
        >
          Back
        </Button>
        <Button 
          type='button' 
          onClick={handleContinue} 
          className='flex-2 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]'
        >
          Continue to Subscription
        </Button>
      </div>
    </div>
  );
};

// ─── Step 3: Subscription Tier ──────────────────────────────────────────────────
const Step3Subscription = () => {
    const { subscriptionTier, setSubscriptionTier, validateCurrentStep, goToNextStep, goToPreviousStep } = useSignupStore();
    const containerRef = useRef(null);
  
    useEffect(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion || !containerRef.current) return;
      let ctx = gsap.context(() => {
        gsap.fromTo(containerRef.current.children, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.08 });
      }, containerRef);
      return () => ctx.revert();
    }, []);
  
    const handleContinue = () => {
      if (!validateCurrentStep(3)) return;
      goToNextStep();
    };
  
    return (
      <div ref={containerRef} className='space-y-6 animate-in fade-in slide-in-from-right-4 duration-500'>
          
        <div className='bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 space-y-2'>
            <div className='flex items-start gap-3'>
            <div className="p-2 bg-blue-100 rounded-lg">
                <InfoIcon className='size-4 text-blue-600' />
            </div>
            <div>
                <p className='text-sm font-bold text-gray-900'>Select Subscription</p>
                <p className='text-[12px] text-gray-500 leading-relaxed mt-0.5 font-light'>
                 Choose the tier that best fits your pharmacy&apos;s needs.
                </p>
            </div>
            </div>
        </div>

        <RadioGroup defaultValue={subscriptionTier} onValueChange={setSubscriptionTier} className="grid grid-cols-1 gap-4">
            
            {/* Basic Tier */}
            <div>
                <RadioGroupItem value="basic" id="tier-basic" className="peer sr-only" />
                <Label
                htmlFor="tier-basic"
                className="flex flex-col items-start justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 [&:has([data-state=checked])]:border-blue-600"
                >
                <div className="flex w-full items-center justify-between">
                    <span className="text-lg font-bold">Basic Tier</span>
                    <span className="text-sm text-gray-500 font-medium">Free</span>
                </div>
                <div className="mt-2 text-sm text-gray-500 font-light">
                    Perfect for single-branch pharmacies with limited staff. 1 Admin, up to 5 users.
                </div>
                </Label>
            </div>

            {/* Premium Tier */}
            <div>
                <RadioGroupItem value="premium" id="tier-premium" className="peer sr-only" />
                <Label
                htmlFor="tier-premium"
                className="flex flex-col items-start justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 [&:has([data-state=checked])]:border-blue-600"
                >
                <div className="flex w-full items-center justify-between">
                    <span className="text-lg font-bold">Premium Tier</span>
                    <span className="text-sm text-blue-600 font-bold">$99 / mo</span>
                </div>
                <div className="mt-2 text-sm text-gray-500 font-light">
                    Ideal for multiple branches. Advanced reporting and up to 50 users.
                </div>
                </Label>
            </div>

            {/* Enterprise Tier */}
            <div>
                <RadioGroupItem value="enterprise" id="tier-enterprise" className="peer sr-only" />
                <Label
                htmlFor="tier-enterprise"
                className="flex flex-col items-start justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 [&:has([data-state=checked])]:border-blue-600"
                >
                <div className="flex w-full items-center justify-between">
                    <span className="text-lg font-bold">Enterprise</span>
                    <span className="text-sm text-blue-600 font-bold">Custom</span>
                </div>
                <div className="mt-2 text-sm text-gray-500 font-light">
                    Unlimited branches and staff. Dedicated support and custom integrations.
                </div>
                </Label>
            </div>
        </RadioGroup>
  
        <div className='flex gap-3 mt-6'>
          <Button 
            type='button' 
            variant='ghost' 
            onClick={goToPreviousStep} 
            className='flex-1 h-12 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl font-semibold'
          >
            Back
          </Button>
          <Button 
            type='button' 
            onClick={handleContinue} 
            className='flex-2 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]'
          >
            Review & Submit
          </Button>
        </div>
      </div>
    );
};

// ─── Step 4: Review and Submit (Clerk + Convex) ─────────────────────────────────
const Step4Review = () => {
    const { pharmacyDetails, managerInfo, subscriptionTier, goToPreviousStep } = useSignupStore();
    const { isLoaded, signUp, setActive } = useSignUp();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    
    // Implement the Convex Mutation for the Admin Approval
    const submitApplication = useMutation(api.admin.mutations.submitPharmacyApplication);
  
    const handleSubmit = async () => {
        if (!isLoaded) return;
        setIsLoading(true);
        try {
            // 1. Create User in Clerk with Custom Fields
            await signUp.create({
                emailAddress: managerInfo.email,
                password: managerInfo.password,
                firstName: managerInfo.fullName.split(' ')[0],
                lastName: managerInfo.fullName.split(' ').slice(1).join(' '),
                unsafeMetadata: {
                    role: 'manager',
                    status: 'pending' // Enforcing approval
                }
            });

            // 2. We skip Clerk Email Verification immediately for this registration flow (or add it back if required).
            // For now, we assume the admin reviews the submission.

            // 3. Save pending data to Convex
            await submitApplication({
                pharmacy: {
                    pharmacyName: pharmacyDetails.pharmacyName,
                    licenseCode: pharmacyDetails.licenseCode,
                    staffCount: String(pharmacyDetails.staffCount),
                    numberOfBranches: String(pharmacyDetails.numberOfBranches),
                    branchNames: pharmacyDetails.branchNames,
                    locations: pharmacyDetails.locations,
                },
                manager: {
                    fullName: managerInfo.fullName,
                    email: managerInfo.email,
                },
                subscription: subscriptionTier
            }); 

           toast.success("Registration submitted! Awaiting Admin approval.");
           navigate('/auth/pending-approval');

        } catch (err) {
            console.error("Signup error", err);
            toast.error(err.errors?.[0]?.longMessage || "Failed to submit registration");
        } finally {
            setIsLoading(false);
        }
    };
  
    return (
      <div className='space-y-6 animate-in fade-in slide-in-from-right-4 duration-500'>
        <div className='bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 space-y-2'>
            <p className='text-[12px] text-gray-500 leading-relaxed font-light'>
            Please review your details before submitting. Your application will be sent to the administrator for approval.
            </p>
        </div>

        <div className="space-y-4">
            <div className="rounded-xl border border-gray-100 p-4 space-y-2 bg-white">
                <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Pharmacy Details</h3>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                    <span className="text-gray-500">Name:</span>
                    <span className="font-medium text-right">{pharmacyDetails.pharmacyName}</span>
                    <span className="text-gray-500">License:</span>
                    <span className="font-medium text-right">{pharmacyDetails.licenseCode}</span>
                    <span className="text-gray-500">Staff Count:</span>
                    <span className="font-medium text-right">{pharmacyDetails.staffCount}</span>
                    <span className="text-gray-500">Branches:</span>
                    <span className="font-medium text-right">{pharmacyDetails.numberOfBranches}</span>
                </div>
            </div>

            <div className="rounded-xl border border-gray-100 p-4 space-y-2 bg-white">
                <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Manager Info</h3>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                    <span className="text-gray-500">Name:</span>
                    <span className="font-medium text-right">{managerInfo.fullName}</span>
                    <span className="text-gray-500">Email:</span>
                    <span className="font-medium text-right">{managerInfo.email}</span>
                </div>
            </div>

            <div className="rounded-xl border border-blue-100 p-4 space-y-2 bg-blue-50/30">
                <div className="flex justify-between items-center text-sm font-bold text-gray-900">
                    <span>Subscription Tier:</span>
                    <span className="capitalize text-blue-600">{subscriptionTier}</span>
                </div>
            </div>
        </div>
  
        <div className='flex gap-3 mt-6'>
          <Button 
            type='button' 
            variant='ghost' 
            onClick={goToPreviousStep} 
            className='flex-1 h-12 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl font-semibold'
          >
            Back
          </Button>
          <Button 
            type='button' 
            onClick={handleSubmit} 
            className='flex-2 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]'
            disabled={isLoading}
          >
             {isLoading ? <Loader2Icon className="size-4 animate-spin mr-2" /> : null}
             Submit Application
          </Button>
        </div>
      </div>
    );
};


// ─── Main Signup Page ───────────────────────────────────────────────────────────

export function SignupPage() {
  const { currentStep, resetSignup } = useSignupStore();
  const containerRef = useRef(null);
  const rightPanelRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (rightPanelRef.current) {
        tl.fromTo(rightPanelRef.current.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, 0.3);
      }
    }, containerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    resetSignup();
  }, []);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return <Step1PharmacyDetails />;
      case 2: return <Step2ManagerInfo />;
      case 3: return <Step3Subscription />;
      case 4: return <Step4Review />;
      default: return <Step1PharmacyDetails />;
    }
  };

  const titles = ['Pharmacy Details', 'Manager Account', 'Subscription Plan', 'Review & Submit'];
  const getStepTitle = () => titles[currentStep - 1] || 'Registration';

  return (
    <main ref={containerRef} className="relative min-h-screen w-full flex items-center justify-center overflow-hidden theme-gradient pb-20">
      <div className="theme-overlay" />

      {/* Shapes - matching landing page */}
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

      <div className="relative z-10 w-full max-w-xl px-4 py-12 mt-10">
        <div className="bg-white/80 backdrop-blur-xl border border-blue-100/50 rounded-3xl p-8 shadow-2xl shadow-blue-500/10 mb-8 pt-6">
          <Button variant="ghost" className="mb-6 hover:bg-blue-50 text-blue-600" asChild>
            <Link to="/">
              <ChevronLeftIcon className="size-4 me-2" />
              Home
            </Link>
          </Button>

          <div ref={rightPanelRef} className="space-y-6">
            <div className="flex flex-col space-y-2">
              <Link to="/" className="flex items-center gap-3 mb-2 group transition-transform hover:scale-105">
                <img src="/logo.png" alt="PharmaCare Logo" className="h-10 w-10 rounded-xl" />
                <span className="font-bold text-xl text-gray-900 tracking-tight">PharmaCare</span>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h1>
              <div className="flex flex-col space-y-1">
                <p className="text-gray-500 font-light">
                  Step {currentStep} of 4: <span className="text-blue-600 font-medium">{getStepTitle()}</span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {Array.from({ length: 4 }, (_, i) => i + 1).map((step) => (
                    <div
                      key={step}
                      className={cn(
                        "h-1 rounded-full transition-all duration-300",
                        currentStep === step ? "w-10 bg-blue-600" : currentStep > step ? "w-4 bg-blue-400" : "w-4 bg-blue-100"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              {renderCurrentStep()}
            </div>

            <div className="pt-6 text-center border-t border-blue-50">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/auth/login" className="text-blue-600 font-semibold hover:underline underline-offset-4">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
