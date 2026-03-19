import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';
import {
  KeyRound,
  ShieldCheck,
  Loader2,
  Mail,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Lock,
  UserCog,
  Save,
  BadgeCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ─── Section Card ───────────────────────────────────────────────────────────
const SectionCard = ({ icon: Icon, title, description, children, delay = 0 }) => (
  <div className="admin-section-card animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
    <div className="p-5 pb-4 border-b border-border/50">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/8 dark:bg-primary/10">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-[15px] font-semibold tracking-tight text-foreground">{title}</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ─── Password Strength Indicator ────────────────────────────────────────────
const PasswordStrength = ({ password }) => {
  const checks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special char', met: /[^A-Za-z0-9]/.test(password) },
  ];
  const strength = checks.filter((c) => c.met).length;
  const colors = [
    'bg-red-400 dark:bg-red-500',
    'bg-red-400 dark:bg-red-500',
    'bg-amber-400 dark:bg-amber-500',
    'bg-teal-400 dark:bg-teal-500',
    'bg-emerald-400 dark:bg-emerald-500'
  ];
  const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];

  if (!password) return null;

  return (
    <div className="space-y-2 mt-3">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < strength ? colors[strength - 1] : 'bg-muted dark:bg-slate-700/50'
            }`}
          />
        ))}
      </div>
      <p className="text-[11px] font-medium text-muted-foreground">
        {labels[strength - 1] || 'Too short'}
      </p>
      {/* Checklist */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-1.5">
            {check.met ? (
              <Check className="h-3 w-3 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
            ) : (
              <div className="h-3 w-3 rounded-full border border-muted-foreground/30 flex-shrink-0" />
            )}
            <span className={`text-[10px] ${check.met ? 'text-foreground' : 'text-muted-foreground'}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
export function AdminSettings() {
  const { user: clerkUser } = useUser();

  // ─── Convex Hooks ───────────────────────────────────────────────────────
  const profile = useQuery(api.users.queries.getCurrentUser) || {};
  const updateProfileMutation = useMutation(api.users.mutations.updateProfile);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Sync profile form when data loads
  React.useEffect(() => {
    if (profile?.full_name) {
      setProfileForm({
        full_name: profile.full_name,
        email: profile.email || '',
      });
    }
  }, [profile]);

  const userRole = profile.role || 'Administrator';

  // ─── Profile Update ─────────────────────────────────────────────────────
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.full_name.trim()) {
      toast.error('Name is required');
      return;
    }
    setProfileLoading(true);
    try {
      await updateProfileMutation({
        full_name: profileForm.full_name,
      });
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordInfo = () => {
    toast.info('Password management is handled by Clerk. Please use the "Forgot Password" flow or Clerk account settings.');
  };

  // Role label
  const roleMap = { 1: 'System Administrator', 2: 'Manager', 3: 'Pharmacist', 4: 'Cashier' };
  const roleName = roleMap[profile.role_id] || profile.role || 'Administrator';

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Manage your account profile and security
        </p>
      </div>

      <div className="space-y-5">
            {/* Account Overview */}
            <div
                className="admin-section-card overflow-hidden animate-fade-up"
                style={{ animationDelay: '80ms' }}
            >
                <div className="relative">
                <div className="h-20 bg-gradient-to-br from-primary to-primary/80 dark:from-primary/90 dark:to-primary/70" />
                <div className="absolute top-0 right-0 w-full h-full opacity-10">
                    <div className="admin-grid-pattern w-full h-full" />
                </div>
                </div>
                <div className="px-6 pb-6 -mt-8 relative">
                <div className="flex items-end gap-4">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-card border-4 border-card shadow-lg text-lg font-bold text-foreground">
                    {(profile.full_name || 'A')[0].toUpperCase()}
                    </div>
                    <div className="pb-1">
                    <h2 className="font-display text-lg font-semibold text-foreground">{profile.full_name || 'Administrator'}</h2>
                    <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {profile.email || 'admin@pharmacare.com'}
                        </span>
                        <Badge variant="medical-active" className="text-[10px] px-2 py-0.5">
                        <BadgeCheck className="h-3 w-3 mr-1" />
                        {userRole}
                        </Badge>
                    </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-border/50">
                    <div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        User ID
                    </span>
                    <p className="text-sm font-medium mt-0.5 text-foreground">#{profile.id || profile.user_id || '1'}</p>
                    </div>
                    <div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Role
                    </span>
                    <p className="text-sm font-medium mt-0.5 text-foreground capitalize">{profile.role || 'admin'}</p>
                    </div>
                    <div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Pharmacy
                    </span>
                    <p className="text-sm font-medium mt-0.5 text-foreground">
                        {profile.branch_id ? `Pharmacy #${profile.branch_id}` : 'All Pharmacies'}
                    </p>
                    </div>
                    <div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Account
                    </span>
                    <p className="text-sm font-medium mt-0.5 text-emerald-500 dark:text-emerald-400">Active</p>
                    </div>
                </div>
                </div>
            </div>

            <SectionCard
                icon={UserCog}
                title="Profile Information"
                description="Update your personal details"
                delay={160}
            >
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="full_name" className="text-[13px] font-medium">
                    Full Name
                    </Label>
                    <Input
                    id="full_name"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, full_name: e.target.value }))}
                    className="mt-1.5 rounded-xl"
                    placeholder="Your full name"
                    />
                </div>
                <div>
                    <Label htmlFor="email" className="text-[13px] font-medium">
                    Email Address
                    </Label>
                    <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="mt-1.5 rounded-xl bg-muted/30 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                    Email cannot be changed. Contact system support if needed.
                    </p>
                </div>
                <div className="flex justify-end pt-2">
                    <Button variant="medical" type="submit" disabled={profileLoading} className="rounded-xl h-9 text-[13px] gap-1.5">
                    {profileLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Save className="h-3.5 w-3.5" />
                    )}
                    Save Profile
                    </Button>
                </div>
                </form>
            </SectionCard>

            <SectionCard
                icon={Lock}
                title="Security"
                description="Your security is managed by Clerk"
                delay={240}
            >
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">External Security Provider</p>
                      <p className="text-[12px] text-muted-foreground mt-1">
                        We use Clerk for industry-standard authentication and security. 
                        Password changes and two-factor authentication can be managed through 
                        your account settings or the sign-in assistance flow.
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full rounded-xl h-10 text-[13px] gap-2"
                    onClick={handlePasswordInfo}
                  >
                    <KeyRound className="w-4 h-4" />
                    Request Password Reset
                  </Button>
                </div>
            </SectionCard>
      </div>

      {/* Security Info */}
      <div
        className="admin-section-card p-5 animate-fade-up"
        style={{ animationDelay: '320ms' }}
      >
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/8 dark:bg-primary/10 flex-shrink-0 mt-0.5">
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-foreground">Security Recommendations</h4>
            <ul className="text-[12px] text-muted-foreground mt-2 space-y-1.5">
              <li className="flex items-start gap-1.5">
                <Check className="h-3 w-3 text-emerald-500 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                Use a unique password that you don&apos;t use on other websites
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="h-3 w-3 text-emerald-500 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                Change your password regularly (every 90 days recommended)
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="h-3 w-3 text-emerald-500 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                Never share your admin credentials with anyone
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="h-3 w-3 text-emerald-500 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                Log out when using shared or public devices
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
