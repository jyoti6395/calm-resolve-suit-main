import { MobileShell } from "@/components/layout/MobileShell";
import { useHeaderSetup } from "@/components/layout/HeaderContext";
import { BottomNav } from "@/components/layout/BottomNav";
import { Building2, ShieldCheck, Mail, Phone, Clock, ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopPageShell } from "@/components/layout/DesktopPageShell";
import { Link } from "@tanstack/react-router";

export function CompanyInfoView() {
  const isMobile = useIsMobile();

  useHeaderSetup({
    title: "Company Information",
    subtitle: "Organization details and support account information",
    back: true,
  });

  // ─── DESKTOP & TABLET LAYOUT ──────────────────────────────────────────────
  if (!isMobile) {
    return (
      <DesktopPageShell noPadding>
        <div className="flex flex-col h-full w-full bg-slate-50 min-h-screen">
          {/* Top Breadcrumb Header */}
          <div className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-[18px] font-bold text-slate-800 tracking-tight">
                  Company Information
                </h1>
                <p className="text-[13px] text-slate-500 mt-0.5 font-medium">
                  Organization details and support account information
                </p>
              </div>
            </div>
          </div>

          {/* Main Layout Area */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-5 animate-fade-in">
            {/* Hero Card */}
            <div className="p-5 xl:p-6 rounded-2xl bg-gradient-hero text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary-glow/40 blur-3xl pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />

              <div className="relative flex items-center gap-5">
                <div className="h-14 w-14 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shadow-soft shrink-0">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-success/20 text-green-300 border border-success/30 backdrop-blur-sm mb-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    Active Organization
                  </span>
                  <h2 className="text-[20px] font-bold leading-tight tracking-tight">
                    Hans Organization
                  </h2>
                  <p className="text-[12px] text-white/60 mt-1 font-medium">ID: ORG-2026-001</p>
                </div>
              </div>

              <div className="relative grid grid-cols-2 gap-x-6 gap-y-1 text-white border-l border-white/15 pl-6 md:pl-10">
                <div>
                  <p className="text-white/50 text-[10px] tracking-wider font-semibold uppercase">
                    Subscription Tier
                  </p>
                  <p className="text-white mt-1 flex items-center gap-1.5 text-[15px] font-bold">
                    <ShieldCheck className="h-4.5 w-4.5 text-primary-glow" /> Enterprise SaaS
                  </p>
                </div>
                <div>
                  <p className="text-white/50 text-[10px] tracking-wider font-semibold uppercase">
                    Member Since
                  </p>
                  <p className="text-white mt-1 text-[15px] font-bold">January 15, 2021</p>
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm max-w-4xl animate-fade-in">
              <h3 className="text-[15px] font-bold text-slate-800 mb-1.5">Support Information</h3>
              <p className="text-[13px] text-slate-500 font-medium mb-4">
                Contact our support team for technical assistance and service requests.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-slate-100 pt-5">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                      Email Address
                    </p>
                    <a
                      href="mailto:support@hansorg.com"
                      className="font-bold text-slate-700 hover:text-blue-600 transition-colors text-[13px] break-all block mt-1.5"
                    >
                      support@hansorg.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                      Standard Support
                    </p>
                    <a
                      href="tel:+18005550199"
                      className="font-bold text-slate-700 hover:text-blue-600 transition-colors text-[13px] block mt-1.5"
                    >
                      +1 (800) 555-0199
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                      Business Hours
                    </p>
                    <p className="font-bold text-slate-700 text-[13px] mt-1.5 leading-snug">
                      Mon - Fri, 8:00 AM - 6:00 PM EST
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DesktopPageShell>
    );
  }

  // ─── MOBILE LAYOUT (completely unchanged) ─────────────────────────────────
  return (
    <MobileShell>
      <div className="min-h-screen bg-background pb-32 pt-4">
        {/* Hero Card */}
        <div className="mx-5 rounded-[20px] bg-gradient-hero text-white p-5 shadow-elevated relative overflow-hidden animate-slide-up">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary-glow/40 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-mesh opacity-30" />

          <div className="relative">
            {/* Header info */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-[20px] bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shadow-soft">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success/20 text-green-300 border border-success/30 backdrop-blur-sm mb-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  Active Organization
                </span>
                <h2 className="text-xl  tracking-tight truncate">Hans Organization</h2>
                <p className="text-[11px] text-white/60">ID: ORG-2026-001</p>
              </div>
            </div>

            <hr className="border-white/10 my-4" />

            {/* Account meta */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[12px]">
              <div>
                <p className="text-white/50 text-[10px] tracking-wider">Subscription Tier</p>
                <p className="text-white mt-0.5 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary-glow" /> Enterprise SaaS
                </p>
              </div>
              <div>
                <p className="text-white/50 text-[10px] tracking-wider">Member Since</p>
                <p className=" text-white mt-0.5">January 15, 2021</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 mt-6 space-y-6">
          {/* Support Information */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
              Support Information
            </p>
            <div className="mt-2.5 rounded-[20px] bg-card border border-border p-4 shadow-soft space-y-4">
              <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                Contact our support team for technical assistance and service requests.
              </p>

              <div className="space-y-2.5 border-t border-border pt-3">
                <div className="flex items-center gap-3 text-[13px]">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground  font-bold tracking-wider leading-none">
                      email address
                    </p>
                    <a
                      href="mailto:support@hansorg.com"
                      className="font-semibold text-foreground hover:underline truncate block mt-0.5"
                    >
                      support@hansorg.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[13px]">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground  font-bold tracking-wider leading-none">
                      standard support
                    </p>
                    <a
                      href="tel:+18005550199"
                      className="font-semibold text-foreground hover:underline block mt-0.5"
                    >
                      +1 (800) 555-0199
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[13px]">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground  font-bold tracking-wider leading-none">
                      business hours
                    </p>
                    <p className="font-semibold text-foreground mt-0.5">
                      Mon - Fri, 8:00 AM - 6:00 PM EST
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </MobileShell>
  );
}
