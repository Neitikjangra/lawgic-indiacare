import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, Bot, Calendar, Users, Shield, Zap, CheckCircle, ArrowRight, Briefcase, Building, UserCheck, Calculator, Gavel } from 'lucide-react';
import lawgicLogo from '@/assets/lawgic-logo.png';
import heroDashboard from '@/assets/hero-dashboard.png';
interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
}
const LandingPage: React.FC<LandingPageProps> = ({
  onLogin,
  onSignup
}) => {
  const features = [{
    icon: <Bot className="w-8 h-8" />,
    title: "AI Legal Assistant",
    description: "Get instant answers to complex Indian laws and compliance questions in plain English/Hindi"
  }, {
    icon: <Calendar className="w-8 h-8" />,
    title: "Smart Deadline Tracker",
    description: "Never miss GST returns, ITR filing, or MCA compliance deadlines with automated reminders"
  }, {
    icon: <Users className="w-8 h-8" />,
    title: "Expert Connect",
    description: "Connect with verified CAs and Lawyers for professional consultation when you need expert advice"
  }];
  const targetAudience = [{
    icon: <Briefcase className="w-6 h-6" />,
    title: "Freelancers",
    description: "Manage contracts, tax compliance, and legal requirements"
  }, {
    icon: <Building className="w-6 h-6" />,
    title: "Startups",
    description: "Navigate incorporation, compliance, and growth regulations"
  }, {
    icon: <UserCheck className="w-6 h-6" />,
    title: "Small Businesses",
    description: "Stay compliant with licensing, taxation, and operational laws"
  }, {
    icon: <Calculator className="w-6 h-6" />,
    title: "Chartered Accountants",
    description: "Expand your practice and connect with potential clients"
  }, {
    icon: <Gavel className="w-6 h-6" />,
    title: "Lawyers",
    description: "Build your client base and offer consultation services"
  }];
  const benefits = ["Simplifies complex legal jargon into actionable insights", "Reduces compliance risks with automated deadline tracking", "Saves time with AI-powered document analysis", "Cost-effective alternative to expensive legal consultations", "Always up-to-date with latest Indian law changes"];
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={lawgicLogo} alt="Lawgic" className="w-10 h-10" />
            <h1 className="text-2xl font-bold gradient-text">Lawgic</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onLogin}>
              Login
            </Button>
            <Button variant="hero" onClick={onSignup}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-bg py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="text-sm">
                <Zap className="w-4 h-4 mr-2" />
                AI-Powered Legal Assistant
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Legal Compliance Made
                <span className="gradient-text block">Simple for India</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl">
                Your AI-powered companion for navigating Indian laws, tracking deadlines, 
                and connecting with expert professionals. Built specifically for startups, 
                freelancers, and small businesses.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="ai" size="xl" onClick={onSignup} className="group">
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="glass" size="xl" onClick={onLogin}>
                Login to Dashboard
              </Button>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl animate-glow-pulse" />
            <img src={heroDashboard} alt="Lawgic Dashboard" className="relative z-10 rounded-xl shadow-2xl border border-card-border" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need for Legal Compliance
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Lawgic combines AI intelligence with expert human knowledge to simplify 
              legal compliance for Indian businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => <Card key={index} className="card-gradient group hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built for Indian Professionals</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you're a business owner or a legal professional, Lawgic adapts to your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {targetAudience.map((audience, index) => <Card key={index} className="hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      {audience.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{audience.title}</h3>
                      <p className="text-sm text-muted-foreground">{audience.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Choose Lawgic?</h2>
              <p className="text-xl text-muted-foreground">
                Designed specifically for the Indian legal and compliance landscape.
              </p>
            </div>

            <div className="grid gap-4">
              {benefits.map((benefit, index) => <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-card/50 backdrop-blur-sm">
                  <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />
                  <span className="text-lg">{benefit}</span>
                </div>)}
            </div>

            <div className="text-center mt-12">
              <Button variant="ai" size="xl" onClick={onSignup} className="group">
                Get Started Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Simplify Your Legal Compliance?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of Indian businesses who trust Lawgic for their legal and compliance needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" onClick={onSignup}>
                Start Your Free Trial
              </Button>
              <Button variant="outline" size="xl" onClick={onLogin}>
                Login to Account
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <img src={lawgicLogo} alt="Lawgic" className="w-8 h-8" />
              <span className="text-lg font-semibold">Lawgic</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 Lawgic. Simplifying legal compliance for Indian businesses.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default LandingPage;