import { MobileShell } from "@/components/layout/MobileShell";
import { useHeaderSetup } from "@/components/layout/HeaderContext";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopPageShell } from "@/components/layout/DesktopPageShell";

export function PrivacyTermsView() {
  const isMobile = useIsMobile();

  useHeaderSetup({
    title: "Privacy Policy",
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
                  Privacy Policy
                </h1>
                <p className="text-[13px] text-slate-500 mt-0.5 font-medium">
                  Data safety and privacy terms for advice-tech
                </p>
              </div>
            </div>
          </div>

          {/* Main Layout Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 flex justify-center">
            <div className="w-full max-w-2xl lg:max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden my-4">
              {/* Document Header */}
              <div className="bg-[#0a2e5c] py-8 lg:py-12 px-6 lg:px-10 text-center">
                <h2 className="text-[26px] lg:text-[32px] font-extrabold tracking-tight text-white">
                  Privacy Policy
                </h2>
                <p className="text-[13.5px] lg:text-[15px] text-white/80 mt-2 font-medium">
                  advice-tech Mobile App
                </p>
              </div>

              {/* Document Body */}
              <div className="p-6 md:p-10 lg:p-12 xl:p-16 space-y-8 max-w-3xl mx-auto">
                <p className="text-[13px] text-slate-400 font-bold uppercase tracking-wider">
                  Last updated: June 26, 2026
                </p>

                <p className="text-[14px] lg:text-[15px] text-slate-650 leading-relaxed font-medium">
                  advice-tech is committed to protecting your privacy. This Privacy Policy describes
                  how we collect, use, process, and safeguard your personal information when you use
                  our{" "}
                  <strong className="text-slate-800 font-bold">
                    advice-tech Mobile Application
                  </strong>
                  , which is designed to help patients manage eye care appointments, reward points,
                  and vision health records.
                </p>

                {/* 1. Information We Collect */}
                <div id="info-we-collect" className="space-y-4">
                  <h3 className="text-[18px] lg:text-[20px] font-bold text-[#0a2e5c] border-b border-slate-100 pb-2">
                    1. Information We Collect
                  </h3>
                  <p className="text-[14px] lg:text-[15px] text-slate-600 leading-relaxed font-medium">
                    To provide a personalized eye care experience, we may collect the following
                    types of information:
                  </p>
                  <ul className="list-disc pl-5 space-y-3.5 text-[14px] lg:text-[15px] text-slate-600 leading-relaxed font-medium">
                    <li>
                      <strong className="text-slate-800 font-bold">Personal Identification:</strong>{" "}
                      Name, email address, phone number, date of birth, gender, and mailing address.
                    </li>
                    <li>
                      <strong className="text-slate-800 font-bold">
                        Vision and Health Records:
                      </strong>{" "}
                      Contact lens and eyeglass prescriptions, appointment booking details, check-in
                      information, and insurance card images uploaded to the advice-tech Vault.
                    </li>
                    <li>
                      <strong className="text-slate-800 font-bold">Account details:</strong>{" "}
                      Username, reward tier, transaction history, and points balance details.
                    </li>
                    <li>
                      <strong className="text-slate-800 font-bold">Device Information:</strong>{" "}
                      Device model, operating system version, and generic performance logs to help
                      us maintain a secure and functional application.
                    </li>
                  </ul>
                </div>

                {/* 2. How We Use Your Information */}
                <div id="how-we-use" className="space-y-4">
                  <h3 className="text-[18px] lg:text-[20px] font-bold text-[#0a2e5c] border-b border-slate-100 pb-2">
                    2. How We Use Your Information
                  </h3>
                  <p className="text-[14px] lg:text-[15px] text-slate-600 leading-relaxed font-medium">
                    We use the collected information for the following specific purposes:
                  </p>
                  <ul className="list-disc pl-5 space-y-3.5 text-[14px] lg:text-[15px] text-slate-600 leading-relaxed font-medium">
                    <li>To schedule, manage, and verify your eye doctor appointments.</li>
                    <li>
                      To securely process, track, and notify you about your eyeglass and contact
                      lens orders.
                    </li>
                    <li>
                      To calculate, update, and manage your advice-tech points and coupon
                      redemptions.
                    </li>
                    <li>
                      To securely store and present your vision records (prescriptions and
                      documents) in your personal advice-tech Vault.
                    </li>
                    <li>
                      To send you transactional notifications, reminders, or support updates related
                      to your health records and appointments.
                    </li>
                  </ul>
                </div>

                {/* 3. Data Protection and Storage */}
                <div id="data-protection" className="space-y-4">
                  <h3 className="text-[18px] lg:text-[20px] font-bold text-[#0a2e5c] border-b border-slate-100 pb-2">
                    3. Data Protection and Storage
                  </h3>
                  <p className="text-[14px] lg:text-[15px] text-slate-600 leading-relaxed font-medium">
                    We implement a variety of security measures to maintain the safety of your
                    personal information:
                  </p>
                  <ul className="list-disc pl-5 space-y-3.5 text-[14px] lg:text-[15px] text-slate-600 leading-relaxed font-medium">
                    <li>
                      All vision records, prescriptions, and card uploads are stored securely on our
                      cloud infrastructure (Firebase) using encryption protocols.
                    </li>
                    <li>
                      Data transmission between the App and our servers is secured using SSL/TLS
                      encryption.
                    </li>
                    <li>
                      We strictly control internal access to user data, ensuring it is only
                      accessible to authorized medical and administration staff.
                    </li>
                  </ul>
                </div>

                {/* 4. Data Sharing and Third Parties */}
                <div id="data-sharing" className="space-y-4">
                  <h3 className="text-[18px] lg:text-[20px] font-bold text-[#0a2e5c] border-b border-slate-100 pb-2">
                    4. Data Sharing and Third Parties
                  </h3>
                  <p className="text-[14px] lg:text-[15px] text-slate-600 leading-relaxed font-medium">
                    We do not sell, trade, or transfer your personally identifiable information to
                    outside parties. Your information is shared only with:
                  </p>
                  <ul className="list-disc pl-5 space-y-3.5 text-[14px] lg:text-[15px] text-slate-600 leading-relaxed font-medium">
                    <li>
                      Our authorized clinic practitioners (optometrists and ophthalmologists) to
                      manage your eye examinations and vision prescriptions.
                    </li>
                    <li>
                      Our optical manufacturing laboratories to fulfill eyeglass or contact lens
                      orders placed through the App.
                    </li>
                  </ul>
                </div>

                {/* 5. User Rights and Data Deletion */}
                <div id="user-rights" className="space-y-4">
                  <h3 className="text-[18px] lg:text-[20px] font-bold text-[#0a2e5c] border-b border-slate-100 pb-2">
                    5. User Rights and Data Deletion
                  </h3>
                  <p className="text-[14px] lg:text-[15px] text-slate-600 leading-relaxed font-medium">
                    We respect your rights to control your personal data. At any time, you can:
                  </p>
                  <ul className="list-disc pl-5 space-y-3.5 text-[14px] lg:text-[15px] text-slate-600 leading-relaxed font-medium">
                    <li>
                      Access, modify, or update your profile details in the{" "}
                      <strong className="text-slate-800 font-bold">Account Settings</strong> section
                      of the App.
                    </li>
                    <li>
                      Request deletion of your account and all associated personal data from our
                      active databases.
                    </li>
                  </ul>

                  <div className="border-l-4 border-blue-600 bg-blue-50/50 p-4 rounded-r-xl mt-4">
                    <p className="text-[13.5px] lg:text-[14.5px] text-slate-600 leading-relaxed font-medium">
                      To request full deletion of your account and user records, please contact us
                      directly at{" "}
                      <a
                        href="mailto:privacy@advice-tech.com"
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        privacy@advice-tech.com
                      </a>
                      . We will process and confirm your request within 7 business days.
                    </p>
                  </div>
                </div>

                {/* 6. Policy Updates */}
                <div id="policy-updates" className="space-y-4">
                  <h3 className="text-[18px] lg:text-[20px] font-bold text-[#0a2e5c] border-b border-slate-100 pb-2">
                    6. Policy Updates
                  </h3>
                  <p className="text-[14px] lg:text-[15px] text-slate-600 leading-relaxed font-medium">
                    We may update this Privacy Policy from time to time to reflect changes in our
                    services or security practices. When changes are made, we will update the "Last
                    updated" date at the top of this page. We encourage you to review this policy
                    periodically.
                  </p>
                </div>

                {/* 7. Contact Us */}
                <div id="contact-us" className="space-y-4">
                  <h3 className="text-[18px] lg:text-[20px] font-bold text-[#0a2e5c] border-b border-slate-100 pb-2">
                    7. Contact Us
                  </h3>
                  <p className="text-[14px] lg:text-[15px] text-slate-600 leading-relaxed font-medium">
                    If you have any questions or concerns regarding this Privacy Policy or your
                    data, please contact our support team:
                  </p>
                  <div className="space-y-2 text-[14px] lg:text-[15px] text-slate-600 font-medium">
                    <p>
                      <strong className="text-slate-800 font-bold">Email:</strong>{" "}
                      <a
                        href="mailto:support@advice-tech.com"
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        support@advice-tech.com
                      </a>
                    </p>
                    <p>
                      <strong className="text-slate-800 font-bold">Address:</strong> advice-tech,
                      Main Office, New York, NY
                    </p>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="border-t border-slate-100 pt-6 text-center">
                  <p className="text-[12px] text-slate-400 font-medium">
                    © 2026 advice-tech. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DesktopPageShell>
    );
  }

  // ─── MOBILE LAYOUT ────────────────────────────────────────────────────────
  return (
    <MobileShell>
      <div className="min-h-screen bg-slate-50 pb-24 pt-4 px-4">
        <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Document Header */}
          <div className="bg-[#0a2e5c] py-8 px-5 text-center">
            <h2 className="text-[24px] font-extrabold tracking-tight text-white">Privacy Policy</h2>
            <p className="text-[13px] text-white/80 mt-1 font-medium">advice-tech Mobile App</p>
          </div>

          {/* Document Body */}
          <div className="p-5 md:p-6 space-y-6">
            <p className="text-[12.5px] text-slate-400 font-bold uppercase tracking-wider">
              Last updated: June 26, 2026
            </p>

            <p className="text-[13.5px] text-slate-600 leading-relaxed font-medium">
              advice-tech is committed to protecting your privacy. This Privacy Policy describes how
              we collect, use, process, and safeguard your personal information when you use our{" "}
              <strong className="text-slate-800 font-bold">advice-tech Mobile Application</strong>,
              which is designed to help patients manage eye care appointments, reward points, and
              vision health records.
            </p>

            {/* 1. Information We Collect */}
            <div className="space-y-3">
              <h3 className="text-[16px] font-bold text-[#0a2e5c] border-b border-slate-100 pb-1.5">
                1. Information We Collect
              </h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed font-medium">
                To provide a personalized eye care experience, we may collect the following types of
                information:
              </p>
              <ul className="list-disc pl-5 space-y-3 text-[13.5px] text-slate-600 leading-relaxed font-medium">
                <li>
                  <strong className="text-slate-800 font-bold">Personal Identification:</strong>{" "}
                  Name, email address, phone number, date of birth, gender, and mailing address.
                </li>
                <li>
                  <strong className="text-slate-800 font-bold">Vision and Health Records:</strong>{" "}
                  Contact lens and eyeglass prescriptions, appointment booking details, check-in
                  information, and insurance card images uploaded to the advice-tech Vault.
                </li>
                <li>
                  <strong className="text-slate-800 font-bold">Account details:</strong> Username,
                  reward tier, transaction history, and points balance details.
                </li>
                <li>
                  <strong className="text-slate-800 font-bold">Device Information:</strong> Device
                  model, operating system version, and generic performance logs to help us maintain
                  a secure and functional application.
                </li>
              </ul>
            </div>

            {/* 2. How We Use Your Information */}
            <div className="space-y-3">
              <h3 className="text-[16px] font-bold text-[#0a2e5c] border-b border-slate-100 pb-1.5">
                2. How We Use Your Information
              </h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed font-medium">
                We use the collected information for the following specific purposes:
              </p>
              <ul className="list-disc pl-5 space-y-3 text-[13.5px] text-slate-600 leading-relaxed font-medium">
                <li>To schedule, manage, and verify your eye doctor appointments.</li>
                <li>
                  To securely process, track, and notify you about your eyeglass and contact lens
                  orders.
                </li>
                <li>
                  To calculate, update, and manage your advice-tech points and coupon redemptions.
                </li>
                <li>
                  To securely store and present your vision records (prescriptions and documents) in
                  your personal advice-tech Vault.
                </li>
                <li>
                  To send you transactional notifications, reminders, or support updates related to
                  your health records and appointments.
                </li>
              </ul>
            </div>

            {/* 3. Data Protection and Storage */}
            <div className="space-y-3">
              <h3 className="text-[16px] font-bold text-[#0a2e5c] border-b border-slate-100 pb-1.5">
                3. Data Protection and Storage
              </h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed font-medium">
                We implement a variety of security measures to maintain the safety of your personal
                information:
              </p>
              <ul className="list-disc pl-5 space-y-3 text-[13.5px] text-slate-600 leading-relaxed font-medium">
                <li>
                  All vision records, prescriptions, and card uploads are stored securely on our
                  cloud infrastructure (Firebase) using encryption protocols.
                </li>
                <li>
                  Data transmission between the App and our servers is secured using SSL/TLS
                  encryption.
                </li>
                <li>
                  We strictly control internal access to user data, ensuring it is only accessible
                  to authorized medical and administration staff.
                </li>
              </ul>
            </div>

            {/* 4. Data Sharing and Third Parties */}
            <div className="space-y-3">
              <h3 className="text-[16px] font-bold text-[#0a2e5c] border-b border-slate-100 pb-1.5">
                4. Data Sharing and Third Parties
              </h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed font-medium">
                We do not sell, trade, or transfer your personally identifiable information to
                outside parties. Your information is shared only with:
              </p>
              <ul className="list-disc pl-5 space-y-3 text-[13.5px] text-slate-600 leading-relaxed font-medium">
                <li>
                  Our authorized clinic practitioners (optometrists and ophthalmologists) to manage
                  your eye examinations and vision prescriptions.
                </li>
                <li>
                  Our optical manufacturing laboratories to fulfill eyeglass or contact lens orders
                  placed through the App.
                </li>
              </ul>
            </div>

            {/* 5. User Rights and Data Deletion */}
            <div className="space-y-3">
              <h3 className="text-[16px] font-bold text-[#0a2e5c] border-b border-slate-100 pb-1.5">
                5. User Rights and Data Deletion
              </h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed font-medium">
                We respect your rights to control your personal data. At any time, you can:
              </p>
              <ul className="list-disc pl-5 space-y-3 text-[13.5px] text-slate-600 leading-relaxed font-medium">
                <li>
                  Access, modify, or update your profile details in the{" "}
                  <strong className="text-slate-800 font-bold">Account Settings</strong> section of
                  the App.
                </li>
                <li>
                  Request deletion of your account and all associated personal data from our active
                  databases.
                </li>
              </ul>

              <div className="border-l-4 border-blue-600 bg-blue-50/50 p-4 rounded-r-xl mt-3">
                <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                  To request full deletion of your account and user records, please contact us
                  directly at{" "}
                  <a
                    href="mailto:privacy@advice-tech.com"
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    privacy@advice-tech.com
                  </a>
                  . We will process and confirm your request within 7 business days.
                </p>
              </div>
            </div>

            {/* 6. Policy Updates */}
            <div className="space-y-3">
              <h3 className="text-[16px] font-bold text-[#0a2e5c] border-b border-slate-100 pb-1.5">
                6. Policy Updates
              </h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed font-medium">
                We may update this Privacy Policy from time to time to reflect changes in our
                services or security practices. When changes are made, we will update the "Last
                updated" date at the top of this page. We encourage you to review this policy
                periodically.
              </p>
            </div>

            {/* 7. Contact Us */}
            <div className="space-y-3">
              <h3 className="text-[16px] font-bold text-[#0a2e5c] border-b border-slate-100 pb-1.5">
                7. Contact Us
              </h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed font-medium">
                If you have any questions or concerns regarding this Privacy Policy or your data,
                please contact our support team:
              </p>
              <div className="space-y-2 text-[13.5px] text-slate-600 font-medium">
                <p>
                  <strong className="text-slate-800 font-bold">Email:</strong>{" "}
                  <a
                    href="mailto:support@advice-tech.com"
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    support@advice-tech.com
                  </a>
                </p>
                <p>
                  <strong className="text-slate-800 font-bold">Address:</strong> advice-tech, Main
                  Office, New York, NY
                </p>
              </div>
            </div>

            {/* Footer Section */}
            <div className="border-t border-slate-100 pt-6 text-center">
              <p className="text-[11.5px] text-slate-400 font-medium">
                © 2026 advice-tech. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
