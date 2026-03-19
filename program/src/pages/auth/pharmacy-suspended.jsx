import ElegantShape from '../landing/ElegantShape';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldAlert, Mail, Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PharmacySuspendedPage = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303]">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.05] via-transparent to-orange-500/[0.05] blur-3xl" />

      {/* Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-red-500/[0.15]"
          className="left-[-10%] top-[15%]"
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-orange-500/[0.15]"
          className="right-[-5%] top-[70%]"
        />
      </div>

      <div className="relative z-10 w-full max-w-lg px-6">
        <div className="bg-white/90 backdrop-blur-2xl border border-red-100/50 rounded-3xl p-8 shadow-2xl shadow-red-500/10">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative p-6 bg-red-50 rounded-full">
                <ShieldAlert className="size-16 text-red-600" />
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-sm border border-red-100 animate-pulse">
                  <div className="size-3 rounded-full bg-red-600" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Access Suspended</h1>
              <p className="text-gray-500 font-light">
                Your pharmacy has been <span className="text-red-600 font-medium">{user?.pharmacy_status === 'deleted' ? 'removed' : 'deactivated'}</span> by the administrator.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 text-left">
              <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100 space-y-2">
                <h3 className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Impact</h3>
                <ul className="text-xs text-red-800 space-y-1.5 font-medium">
                  <li className="flex items-center gap-2">
                    <div className="size-1 rounded-full bg-red-400" />
                    Account access revoked
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="size-1 rounded-full bg-red-400" />
                    All staff members affected
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="size-1 rounded-full bg-red-400" />
                    Data preserved but inaccessible
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                  <Mail className="size-3" />
                  Resolution
                </h3>
                <p className="text-xs text-blue-800 leading-relaxed">
                  To reactivate your pharmacy, please contact our support team.
                </p>
                <div className="flex flex-wrap gap-4 pt-1">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-700">
                    <Mail className="size-3" />
                    support@pharmacare.com
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-700">
                    <Phone className="size-3" />
                    +251-XXX-XXXX
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              className="w-full h-12 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold shadow-lg shadow-gray-900/20 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="size-4" />
              Return to Login
            </Button>

            <p className="text-[11px] text-gray-400">
              PharmaCare Management System • Access Log: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};
