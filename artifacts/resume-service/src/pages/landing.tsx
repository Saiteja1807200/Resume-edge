import { Link } from "wouter";
import { CheckCircle, ArrowRight, Clock, FileText, Users, Star, Zap, Shield } from "lucide-react";
import { useListServices } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Software Engineer at Infosys",
    text: "Got 3 interview calls within a week of sending the new resume. The ATS optimization made a real difference — I was getting ghosted before.",
  },
  {
    name: "Rahul Mehta",
    role: "Product Manager at a Series B startup",
    text: "My old resume listed responsibilities. This one leads with outcomes and numbers. Recruiters started responding the same day I sent it out.",
  },
  {
    name: "Anjali Reddy",
    role: "Data Analyst, recently placed at HDFC",
    text: "The premium package was worth every rupee. They restructured my entire narrative around the role I was targeting. Landed the job in 3 weeks.",
  },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Select your package",
    description: "Choose a service tier that fits your experience level and timeline. Add-ons available.",
  },
  {
    step: "02",
    title: "Submit your details",
    description: "Share your work history, target role, and current resume. We do the heavy lifting.",
  },
  {
    step: "03",
    title: "Receive your resume",
    description: "Get a tailored, ATS-ready resume delivered to your inbox within the promised timeframe.",
  },
];

export default function Landing() {
  const { data: services, isLoading } = useListServices();

  return (
    <div className="min-h-screen bg-background" data-testid="page-landing">
      {/* Nav */}
      <header className="border-b border-border bg-background/95 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="font-semibold text-lg tracking-tight text-foreground" data-testid="logo">
            ResumeEdge
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#services" className="hover:text-foreground transition-colors">Packages</a>
            <a href="#process" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
          </nav>
          <Link href="/order">
            <Button size="sm" data-testid="button-get-started-nav">Get started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24">
        <div className="max-w-3xl">
          <Badge variant="secondary" className="mb-5 text-xs font-medium" data-testid="badge-hero">
            ATS-optimized resume writing
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight" data-testid="heading-hero">
            Resumes tailored to specific job roles and ATS systems
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl" data-testid="text-hero-description">
            Most resumes fail before a human sees them. We build resumes that pass automated screening, match recruiter expectations, and are structured around the exact role you are targeting.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link href="/order">
              <Button size="lg" className="w-full sm:w-auto" data-testid="button-order-now">
                Order your resume <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#services">
              <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-view-packages">
                View packages
              </Button>
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2" data-testid="stat-delivery">
              <Clock className="h-4 w-4 text-primary" />
              <span>2–5 day delivery</span>
            </div>
            <div className="flex items-center gap-2" data-testid="stat-ats">
              <Shield className="h-4 w-4 text-primary" />
              <span>ATS-tested formatting</span>
            </div>
            <div className="flex items-center gap-2" data-testid="stat-revisions">
              <FileText className="h-4 w-4 text-primary" />
              <span>Revisions included</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="bg-muted/40 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground" data-testid="heading-services">
              Service packages
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Three tiers designed for different career stages and urgency levels.
            </p>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-xl border border-border h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services?.map((pkg) => (
                <div
                  key={pkg.id}
                  data-testid={`card-service-${pkg.id}`}
                  className={`relative bg-card rounded-xl border p-6 flex flex-col ${
                    pkg.isPopular
                      ? "border-primary shadow-lg ring-1 ring-primary"
                      : "border-border"
                  }`}
                >
                  {pkg.isPopular && (
                    <div className="absolute -top-3 left-6">
                      <Badge className="text-xs font-semibold" data-testid={`badge-popular-${pkg.id}`}>
                        Most popular
                      </Badge>
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg text-foreground" data-testid={`text-service-name-${pkg.id}`}>
                      {pkg.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{pkg.description}</p>
                  </div>
                  <div className="mb-5">
                    <span className="text-3xl font-bold text-foreground" data-testid={`text-service-price-${pkg.id}`}>
                      ₹{pkg.price.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-sm ml-1">one-time</span>
                  </div>
                  <div className="text-xs font-medium text-primary mb-4 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {pkg.deliveryDays}-day delivery
                  </div>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {pkg.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/order">
                    <Button
                      className="w-full"
                      variant={pkg.isPopular ? "default" : "outline"}
                      data-testid={`button-select-${pkg.id}`}
                    >
                      Select this plan
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
          <p className="mt-6 text-sm text-muted-foreground text-center">
            Add-ons available at checkout: Express Delivery (+₹499) and ATS Optimization Boost (+₹299)
          </p>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground" data-testid="heading-process">
              How it works
            </h2>
            <p className="mt-3 text-muted-foreground">Three steps to a resume that gets responses.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PROCESS_STEPS.map((step) => (
              <div key={step.step} className="flex gap-4" data-testid={`step-${step.step}`}>
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">{step.step}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-muted/40 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground" data-testid="heading-testimonials">
              What clients say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border p-6"
                data-testid={`card-testimonial-${i}`}
              >
                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-5">"{t.text}"</p>
                <div>
                  <p className="font-medium text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-primary rounded-2xl p-10 sm:p-14 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-4">
              Stop sending a resume that isn't working
            </h2>
            <p className="text-primary-foreground/80 text-base sm:text-lg mb-8 max-w-xl mx-auto">
              Get an ATS-optimized, recruiter-structured resume tailored to the specific role you're targeting.
            </p>
            <Link href="/order">
              <Button
                size="lg"
                variant="secondary"
                className="font-semibold"
                data-testid="button-cta-final"
              >
                Order your resume now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">ResumeEdge</span>
          <span>Resumes structured for recruiter screening and ATS systems</span>
        </div>
      </footer>
    </div>
  );
}
