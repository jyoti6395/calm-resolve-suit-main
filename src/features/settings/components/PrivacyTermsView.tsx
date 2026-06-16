import { useState } from "react";
import { MobileShell } from "@/components/layout/MobileShell";
import { useHeaderSetup } from "@/components/layout/HeaderContext";
import {
  Lock,
  Shield,
  User,
  Info,
  AlertOctagon,
  Layers,
  Globe,
  Check,
  ChevronDown,
} from "lucide-react";

export function PrivacyTermsView() {
  const [privacyExpanded, setPrivacyExpanded] = useState(true);
  const [termsExpanded, setTermsExpanded] = useState(false);

  useHeaderSetup({
    title: "Privacy & Terms",
    subtitle: "Data safety & platform rules",
    back: true,
  });

  return (
    <MobileShell>
      <div className="min-h-screen bg-background pb-20 pt-4">
        {/* Introduction Section */}
        <div className="px-5 pt-3 pb-5">
          <h2 className="text-[20px] font-extrabold tracking-tight text-foreground leading-snug">
            Legal Agreements
          </h2>
          <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
            Understand how we protect your data and the terms of using our platform.
          </p>
        </div>

        {/* Expandable Privacy Policy Card */}
        <div className="px-5 mb-4">
          <div className="rounded-[20px] bg-card border border-border shadow-soft overflow-hidden transition-all duration-300">
            <button
              onClick={() => setPrivacyExpanded(!privacyExpanded)}
              className="w-full flex items-center justify-between p-5 text-left font-bold text-[15px] text-foreground hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Shield className="h-4.5 w-4.5" />
                </div>
                <span>Privacy Policy</span>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
                  privacyExpanded ? "rotate-180 text-primary" : ""
                }`}
              />
            </button>

            {privacyExpanded && (
              <div className="px-5 pb-5 pt-2 border-t border-border/50 animate-slide-up space-y-5">
                {/* Data We Collect */}
                <div>
                  <h4 className="text-[12px] font-extrabold text-primary  tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Data We Collect
                  </h4>
                  <ul className="space-y-2 text-[13px] text-muted-foreground">
                    {[
                      "Name & personal identifiers",
                      "Email Address",
                      "Support Ticket Information",
                      "Uploaded Documents & Attachments",
                      "Device & Browser Information",
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* How We Use Your Data */}
                <div>
                  <h4 className="text-[12px] font-extrabold text-primary  tracking-wider mb-2 flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5" /> How We Use Your Data
                  </h4>
                  <ul className="space-y-2 text-[13px] text-muted-foreground">
                    {[
                      "Provide support services",
                      "Manage support tickets",
                      "Improve user experience",
                      "Send notifications and updates",
                      "Generate analytics and reports",
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Data Protection */}
                <div>
                  <h4 className="text-[12px] font-extrabold text-primary  tracking-wider mb-2 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> Data Protection
                  </h4>
                  <ul className="space-y-2 text-[13px] text-muted-foreground">
                    {[
                      "Data is encrypted during transmission",
                      "Secure authentication and access control",
                      "Regular security monitoring",
                      "Role-based access permissions",
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Terms of Service Card */}
        <div className="px-5 mb-5">
          <div className="rounded-[20px] bg-card border border-border shadow-soft overflow-hidden transition-all duration-300">
            <button
              onClick={() => setTermsExpanded(!termsExpanded)}
              className="w-full flex items-center justify-between p-5 text-left font-bold text-[15px] text-foreground hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Layers className="h-4.5 w-4.5" />
                </div>
                <span>Terms of Service</span>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
                  termsExpanded ? "rotate-180 text-primary" : ""
                }`}
              />
            </button>

            {termsExpanded && (
              <div className="px-5 pb-5 pt-2 border-t border-border/50 animate-slide-up space-y-5">
                {/* User Responsibilities */}
                <div>
                  <h4 className="text-[12px] font-extrabold text-primary  tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> User Responsibilities
                  </h4>
                  <ul className="space-y-2 text-[13px] text-muted-foreground">
                    {[
                      "Provide accurate information",
                      "Use the platform lawfully",
                      "Maintain account security",
                      "Respect other users and support staff",
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Prohibited Activities */}
                <div>
                  <h4 className="text-[12px] font-extrabold text-primary  tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertOctagon className="h-3.5 w-3.5" /> Prohibited Activities
                  </h4>
                  <ul className="space-y-2 text-[13px] text-muted-foreground">
                    {[
                      "Unauthorized access attempts",
                      "Uploading harmful content",
                      "Sharing false information",
                      "Misusing support resources",
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Service Availability */}
                <div>
                  <h4 className="text-[12px] font-extrabold text-primary  tracking-wider mb-2 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" /> Service Availability
                  </h4>
                  <ul className="space-y-2 text-[13px] text-muted-foreground">
                    {[
                      "Services may be updated periodically",
                      "Scheduled maintenance may occur",
                      "Downtime notifications will be communicated when possible",
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ticket & Support Terms Card */}
        <div className="px-5 mb-4">
          <div className="rounded-[20px] bg-card border border-border p-5 shadow-soft">
            <h3 className="text-[14px] font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Ticket & Support Terms
            </h3>
            <ul className="space-y-2.5 text-[13px] text-muted-foreground">
              {[
                "Ticket responses are handled based on priority",
                "Resolution times may vary by issue type",
                "Support communication may be recorded for quality purposes",
                "Attachments must comply with company policies",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Data Retention Policy Card */}
        <div className="px-5 mb-4">
          <div className="rounded-[20px] bg-card border border-border p-5 shadow-soft">
            <h3 className="text-[14px] font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Data Retention Policy
            </h3>
            <ul className="space-y-2.5 text-[13px] text-muted-foreground">
              {[
                "Open tickets are retained for operational purposes",
                "Closed tickets are archived securely",
                "Users may request account deactivation",
                "Historical records may be retained for compliance and auditing",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Version Information (Footer) */}
        <div className="px-6 py-6 text-center border-t border-border/40 mt-8 text-[11px] text-muted-foreground/75 space-y-1">
          <p className="font-semibold text-muted-foreground/90 mt-1">Last Updated: June 2026</p>
        </div>
      </div>
    </MobileShell>
  );
}
