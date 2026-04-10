import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle, Clock, Mail, FileText, ArrowRight } from "lucide-react";
import { useGetOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const NEXT_STEPS = [
  {
    icon: Clock,
    title: "Payment verified within 2 hours",
    description: "We'll check your payment screenshot and confirm your order status.",
  },
  {
    icon: FileText,
    title: "Resume writing begins",
    description: "Our writer will analyze your target role, optimize keywords, and craft your resume.",
  },
  {
    icon: Mail,
    title: "Delivery to your inbox",
    description: "Your completed resume arrives as PDF + Word files, ready to send.",
  },
];

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending Payment",
  pending_verification: "Pending Verification",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  delivered: "Delivered",
};

export default function Confirmation() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem("resumeedge_order_id");
    if (!stored) {
      setLocation("/");
    } else {
      setOrderId(stored);
    }
  }, [setLocation]);

  const { data: order, isLoading } = useGetOrder(orderId ?? "", {
    query: {
      enabled: !!orderId,
      queryKey: [orderId],
    },
  });

  if (!orderId || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading order details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="page-confirmation">
      <header className="border-b border-border bg-background/95 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <Link href="/" className="font-semibold text-lg tracking-tight text-foreground" data-testid="logo">
            ResumeEdge
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground" data-testid="heading-confirmation">
            Order submitted successfully
          </h1>
          <p className="mt-3 text-muted-foreground">
            Your payment is being verified. We'll get started as soon as it's confirmed.
          </p>
        </div>

        {order && (
          <div className="bg-card border border-border rounded-xl p-6 mb-8" data-testid="card-order-details">
            <div className="flex items-center justify-between mb-5 pb-5 border-b border-border">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                <p className="font-mono font-semibold text-foreground" data-testid="text-order-id">
                  {order.orderId}
                </p>
              </div>
              <Badge
                variant="secondary"
                className="text-xs"
                data-testid="badge-status"
              >
                {STATUS_LABELS[order.status] ?? order.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Package</p>
                <p className="text-sm font-medium text-foreground capitalize" data-testid="text-package">
                  {order.servicePackage}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Amount paid</p>
                <p className="text-sm font-medium text-foreground" data-testid="text-amount">
                  ₹{Number(order.totalAmount).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Name</p>
                <p className="text-sm font-medium text-foreground" data-testid="text-name">{order.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="text-sm font-medium text-foreground" data-testid="text-email">{order.email}</p>
              </div>
              {order.addOns && order.addOns.length > 0 && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Add-ons</p>
                  <div className="flex gap-2 flex-wrap">
                    {order.addOns.map((addon) => (
                      <Badge key={addon} variant="outline" className="text-xs capitalize">
                        {addon.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="font-semibold text-foreground mb-5" data-testid="heading-next-steps">What happens next</h2>
          <div className="space-y-5">
            {NEXT_STEPS.map((step, i) => (
              <div key={i} className="flex gap-4" data-testid={`step-next-${i}`}>
                <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <step.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-muted/50 rounded-xl p-5 text-sm text-muted-foreground mb-8">
          <p>
            Questions about your order? Email us at{" "}
            <a href="mailto:hello@resumeedge.in" className="text-primary hover:underline font-medium">
              hello@resumeedge.in
            </a>{" "}
            with your order ID and we'll respond within 4 hours.
          </p>
        </div>

        <Link href="/">
          <Button variant="outline" className="w-full" data-testid="button-back-home">
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
}
