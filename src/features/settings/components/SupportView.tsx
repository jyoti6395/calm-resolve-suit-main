import { useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { MobileShell } from "@/components/layout/MobileShell";
import { useHeaderSetup } from "@/components/layout/HeaderContext";
import {
  Search,
  Ticket,
  ClipboardList,
  Headset,
  ChevronDown,
  Mail,
  Phone,
  Clock,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  BookOpen,
  X,
  Plus,
  CheckCircle2,
} from "lucide-react";

const FAQS = [
  {
    q: "How do I create a support ticket?",
    a: "You can create a ticket by clicking on 'Create Support Ticket' at the bottom of this page or tapping the '+' Raise button on your Dashboard. You will need to select a category, priority level, and write a description of the issue.",
  },
  {
    q: "How can I track my ticket status?",
    a: "Go to 'My Support Tickets' from this page or select the Tickets tab in the bottom navigation. Here you can see your list of tickets, their live statuses, and remaining SLA completion times.",
  },
  {
    q: "How do I reopen a resolved ticket?",
    a: "If a resolved ticket requires further attention, open the specific ticket from your list and send a chat message. The ticket will automatically transition back to 'Open' status and alert your technician.",
  },
  {
    q: "What do ticket priorities mean?",
    a: "Priorities determine response times under our Service Level Agreement (SLA): Critical (1 hour resolution), High (3 hours), Medium (8 hours), and Low (24 hours).",
  },
  {
    q: "How do I update my profile information?",
    a: "Navigate to the Profile page from the bottom navigation, tap the edit pencil icon at the top right, and update your personal details such as Full Name or Company Name.",
  },
];

const ARTICLES = [
  {
    title: "Password Reset Guide",
    category: "Access & Security",
    content:
      "If you have lost access to your profile, click 'Forgot Password?' on the login screen. You will receive an OTP email. Enter this code to securely create a new strong password. Make sure it has at least 8 characters, one number, and one symbol.",
  },
  {
    title: "Email Setup Instructions",
    category: "Software",
    content:
      "To set up your AdviseTech email on Outlook or Apple Mail, select 'Exchange Account' type, enter your work credentials, and authorize using the Okta Multi-Factor Authentication prompt. Server configuration settings will be assigned automatically.",
  },
  {
    title: "Network Connectivity Issues",
    category: "Infrastructure",
    content:
      "If the Cisco VPN drops frequently on Mac or Windows, ensure your software is updated to the latest client version. Go to Settings, turn on 'Auto-reconnect', and check if DNS is set to auto-assign in your native network adapter settings.",
  },
  {
    title: "Software Installation Guide",
    category: "Software",
    content:
      "All authorized apps are hosted in the AdviseTech Company Portal. Search for the app in your system launcher, click install, and licensing will automatically activate. For unlisted software, raise a Request ticket.",
  },
];

const STATUS_GUIDE = [
  {
    status: "New",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    desc: "Awaiting initial review and assignment by triage engineers.",
  },
  {
    status: "Assigned",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    desc: "Assigned to a designated support technician.",
  },
  {
    status: "In Progress",
    color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    desc: "The technician is actively working on resolving the issue.",
  },
  {
    status: "Pending User Response",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    desc: "The engineer needs logs or clarification from your end.",
  },
  {
    status: "Resolved",
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    desc: "A solution has been verified and applied. Awaiting confirmation.",
  },
  {
    status: "Closed",
    color: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    desc: "Archived. The case has been marked complete.",
  },
];

export function SupportView() {
  const navigate = useNavigate({ from: "/support" });
  const [searchQuery, setSearchQuery] = useState("");

  useHeaderSetup({
    title: "Help & Support",
    subtitle: "Find answers & reach out",
    back: true,
  });
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [activeArticle, setActiveArticle] = useState<(typeof ARTICLES)[0] | null>(null);
  const [feedbackState, setFeedbackState] = useState<"none" | "submitted">("none");
  const contactCardRef = useRef<HTMLDivElement>(null);

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredArticles = ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const scrollToContact = () => {
    contactCardRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFeedback = (type: "yes" | "no") => {
    console.log("Feedback type recorded:", type);
    setFeedbackState("submitted");
  };

  return (
    <MobileShell>
      <div className="min-h-screen bg-background pb-32 pt-4">
        {/* Page Header Introduction */}
        <div className="px-5 pt-3 pb-5">
          <h2 className="text-[20px] font-extrabold tracking-tight text-foreground leading-snug">
            How can we help?
          </h2>
          <p className="text-[13px] text-muted-foreground mt-1">
            Find answers, create support requests, and contact our team.
          </p>
        </div>

        {/* Search Bar Section */}
        <div className="px-5 mb-6">
          <div className="flex items-center gap-3 h-12 px-4 rounded-2xl bg-secondary border border-transparent focus-within:border-primary focus-within:bg-card focus-within:shadow-soft transition-all">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles, FAQs..."
              className="flex-1 bg-transparent outline-none text-[14px] text-foreground placeholder:text-muted-foreground/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Actions (Horizontal Grid) */}
        <div className="px-5 mb-8">
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => navigate({ to: "/tickets/new" })}
              className="flex flex-col items-center justify-between text-center p-3 rounded-2xl bg-card border border-border hover:shadow-soft transition-all h-[120px] active:scale-[0.98]"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Ticket className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold block leading-tight">Create Ticket</span>
                <span className="text-[9px] text-muted-foreground block mt-0.5 leading-none">
                  Report issues
                </span>
              </div>
            </button>

            <button
              onClick={() => navigate({ to: "/tickets", search: { status: "all" } })}
              className="flex flex-col items-center justify-between text-center p-3 rounded-2xl bg-card border border-border hover:shadow-soft transition-all h-[120px] active:scale-[0.98]"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold block leading-tight">My Tickets</span>
                <span className="text-[9px] text-muted-foreground block mt-0.5 leading-none">
                  Track status
                </span>
              </div>
            </button>

            <button
              onClick={scrollToContact}
              className="flex flex-col items-center justify-between text-center p-3 rounded-2xl bg-card border border-border hover:shadow-soft transition-all h-[120px] active:scale-[0.98]"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Headset className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold block leading-tight">Contact Support</span>
                <span className="text-[9px] text-muted-foreground block mt-0.5 leading-none">
                  Reach team
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Knowledge Base Section */}
        <div className="px-5 mb-8">
          <h3 className="text-[14px] font-bold  tracking-wider text-muted-foreground px-1 mb-3">
            Popular Guides
          </h3>
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredArticles.map((art, index) => (
                <button
                  key={index}
                  onClick={() => setActiveArticle(art)}
                  className="p-4 rounded-2xl bg-card border border-border hover:border-primary/50 text-left transition-all hover:shadow-soft active:scale-[0.98] flex flex-col justify-between h-[110px]"
                >
                  <span className="text-[10px] font-semibold text-primary  tracking-wider block">
                    {art.category}
                  </span>
                  <span className="text-[13px] font-bold text-foreground leading-snug line-clamp-2 block mt-1.5">
                    {art.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-auto">
                    Read guide <ArrowRight className="h-3 w-3" />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center rounded-2xl bg-secondary text-muted-foreground text-[12px]">
              No help articles match "{searchQuery}"
            </div>
          )}
        </div>

        {/* Frequently Asked Questions */}
        <div className="px-5 mb-8">
          <h3 className="text-[14px] font-bold uppercase tracking-wider text-muted-foreground px-1 mb-3">
            FAQs
          </h3>
          {filteredFaqs.length > 0 ? (
            <div className="space-y-2">
              {filteredFaqs.map((faq, index) => {
                const isExpanded = expandedFaq === index;
                return (
                  <div
                    key={index}
                    className="rounded-2xl bg-card border border-border overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : index)}
                      className="w-full flex items-center justify-between p-4 text-left font-semibold text-[13.5px] text-foreground hover:bg-muted/30 transition-colors"
                    >
                      <span className="pr-4">{faq.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180 text-primary" : ""}`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 text-[13px] text-muted-foreground border-t border-border/50 animate-slide-up leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center rounded-2xl bg-secondary text-muted-foreground text-[12px]">
              No FAQs match "{searchQuery}"
            </div>
          )}
        </div>

        {/* Ticket Status Guide Section */}
        <div className="px-5 mb-8">
          <h3 className="text-[14px] font-bold uppercase tracking-wider text-muted-foreground px-1 mb-3">
            Ticket Status Guide
          </h3>
          <div className="rounded-3xl bg-card border border-border p-4 shadow-soft">
            <p className="text-[11.5px] text-muted-foreground mb-4 leading-relaxed">
              Tap any status badge to understand how your request flows through our support queue.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_GUIDE.map((sg, index) => {
                const isSelected = selectedStatus === index;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedStatus(isSelected ? null : index)}
                    className={`px-2 py-2 rounded-xl text-center border text-[11px] font-bold transition-all truncate ${sg.color} ${
                      isSelected
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-card scale-[1.03]"
                        : "hover:scale-[1.01]"
                    }`}
                  >
                    {sg.status}
                  </button>
                );
              })}
            </div>

            {/* Displaying selected status description */}
            {selectedStatus !== null && (
              <div className="mt-4 p-3 bg-secondary/80 rounded-2xl border border-border/50 animate-slide-up">
                <span className="text-[11px] font-extrabold text-primary uppercase block">
                  Status: {STATUS_GUIDE[selectedStatus].status}
                </span>
                <p className="text-[12px] text-foreground mt-1 leading-snug">
                  {STATUS_GUIDE[selectedStatus].desc}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div ref={contactCardRef} className="px-5 mb-8">
          <h3 className="text-[14px] font-bold uppercase tracking-wider text-muted-foreground px-1 mb-3">
            Direct Contact
          </h3>
          <div className="rounded-3xl bg-gradient-hero text-white p-5 shadow-elevated relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary-glow/40 blur-3xl" />
            <div className="relative space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-white/60 uppercase font-bold leading-none">
                    Support Email
                  </p>
                  <a
                    href="mailto:support@company.com"
                    className="text-[13.5px] font-semibold hover:underline block mt-0.5"
                  >
                    support@company.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-white/60 uppercase font-bold leading-none">
                    Direct Phone
                  </p>
                  <a
                    href="tel:+919876543210"
                    className="text-[13.5px] font-semibold hover:underline block mt-0.5"
                  >
                    +91 98765 43210
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-white/60 uppercase font-bold leading-none">
                    Working Hours
                  </p>
                  <p className="text-[13px] font-medium block mt-0.5">
                    Monday - Friday, 9:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="px-5 mb-8">
          <div className="rounded-3xl bg-card border border-border p-4 shadow-soft text-center">
            {feedbackState === "none" ? (
              <>
                <p className="text-[13.5px] font-bold text-foreground">Was this page helpful?</p>
                <div className="flex justify-center gap-3 mt-3">
                  <button
                    onClick={() => handleFeedback("yes")}
                    className="h-10 px-6 rounded-xl bg-secondary hover:bg-muted font-bold text-[12.5px] flex items-center gap-2 transition-all active:scale-[0.95]"
                  >
                    <ThumbsUp className="h-4 w-4 text-primary" /> Yes
                  </button>
                  <button
                    onClick={() => handleFeedback("no")}
                    className="h-10 px-6 rounded-xl bg-secondary hover:bg-muted font-bold text-[12.5px] flex items-center gap-2 transition-all active:scale-[0.95]"
                  >
                    <ThumbsDown className="h-4 w-4 text-destructive" /> No
                  </button>
                </div>
              </>
            ) : (
              <div className="py-2 animate-scale-in flex flex-col items-center">
                <CheckCircle2 className="h-8 w-8 text-success animate-bounce" />
                <p className="text-[13.5px] font-bold text-foreground mt-2">
                  Thank you for your feedback!
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Your input helps us improve support resources.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide-up Details Modal for Knowledge Base Articles */}
      {activeArticle !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-[440px] bg-card border-t border-border rounded-t-[2.5rem] p-6 shadow-elevated animate-slide-up max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-border/50">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                {activeArticle.category}
              </span>
              <button
                onClick={() => setActiveArticle(null)}
                className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <h2 className="text-[18px] font-extrabold text-foreground mt-4 leading-snug">
              {activeArticle.title}
            </h2>
            <div className="text-[13.5px] text-muted-foreground leading-relaxed mt-4 space-y-3 pb-8">
              <p>{activeArticle.content}</p>
              <div className="p-3 bg-secondary rounded-2xl flex items-start gap-2.5 mt-4 text-[12px] text-foreground/80">
                <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Need further assistance with this guide? Open a support ticket below for direct
                  engineer help.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-40 p-4 bg-background/80 backdrop-blur-md border-t border-border">
        <button
          onClick={() => navigate({ to: "/tickets/new" })}
          className="w-full h-14 rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-elevated hover:shadow-glow active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" /> Create Support Ticket
        </button>
      </div>
    </MobileShell>
  );
}
