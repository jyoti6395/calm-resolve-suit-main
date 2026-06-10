import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { useHeaderSetup } from "@/components/HeaderContext";
import { BottomNav } from "@/components/BottomNav";
import { Building2, ShieldAlert, Clock, Mail, Phone, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/company-info")({
  component: CompanyInformation,
});

function CompanyInformation() {
  useHeaderSetup({
    title: "Company Information",
    subtitle: "Organization details and support account information",
    back: true,
  });

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
