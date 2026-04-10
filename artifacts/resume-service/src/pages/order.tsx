import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, ArrowLeft, ArrowRight, Clock, Upload, Smartphone, Check } from "lucide-react";
import {
  useListServices,
  useCreateOrder,
  useUploadPaymentProof,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const ADD_ONS = [
  { id: "express_delivery", name: "Express Delivery", description: "Priority processing, 24-hour turnaround", price: 499 },
  { id: "ats_boost", name: "ATS Optimization Boost", description: "Enhanced keyword mapping for your specific industry", price: 299 },
];

const detailsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(10, "Enter a valid phone number"),
  targetJobRole: z.string().min(3, "Enter your target job role"),
  workExperience: z.string().min(30, "Please describe your work experience (at least 30 characters)"),
  additionalNotes: z.string().optional(),
});

type DetailsFormValues = z.infer<typeof detailsSchema>;

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2" data-testid="step-indicator">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
              i + 1 < current
                ? "bg-primary text-primary-foreground"
                : i + 1 === current
                ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                : "bg-muted text-muted-foreground"
            }`}
            data-testid={`step-dot-${i + 1}`}
          >
            {i + 1 < current ? <Check className="h-3 w-3" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`w-12 h-0.5 ${i + 1 < current ? "bg-primary" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

const STEP_LABELS = ["Select plan", "Your details", "Make payment", "Upload proof"];

export default function Order() {
  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [paymentMethod, setPaymentMethod] = useState<"phonepe" | "googlepay">("phonepe");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: services, isLoading: servicesLoading } = useListServices();
  const createOrder = useCreateOrder();
  const uploadProof = useUploadPaymentProof();

  const detailsForm = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      targetJobRole: "",
      workExperience: "",
      additionalNotes: "",
    },
  });

  const selectedPkg = services?.find((s) => s.id === selectedPackage);
  const addOnTotal = selectedAddOns.reduce((sum, id) => {
    const ao = ADD_ONS.find((a) => a.id === id);
    return sum + (ao?.price ?? 0);
  }, 0);
  const totalAmount = (selectedPkg?.price ?? 0) + addOnTotal;

  function toggleAddOn(id: string) {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file (JPG, PNG, etc.)", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotDataUrl(reader.result as string);
      setScreenshotFileName(file.name);
    };
    reader.readAsDataURL(file);
  }

  async function handleDetailsSubmit(values: DetailsFormValues) {
    if (!selectedPackage || !selectedPkg) {
      toast({ title: "No plan selected", description: "Please select a service package", variant: "destructive" });
      return;
    }
    createOrder.mutate(
      {
        data: {
          name: values.name,
          email: values.email,
          phone: values.phone,
          targetJobRole: values.targetJobRole,
          workExperience: values.workExperience,
          additionalNotes: values.additionalNotes ?? null,
          servicePackage: selectedPackage,
          addOns: selectedAddOns,
          totalAmount,
        },
      },
      {
        onSuccess: (order) => {
          setOrderId(order.orderId);
          localStorage.setItem("resumeedge_order_id", order.orderId);
          setStep(3);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to create order. Please try again.", variant: "destructive" });
        },
      }
    );
  }

  async function handleUploadProof() {
    if (!screenshotDataUrl) {
      toast({ title: "Screenshot required", description: "Please upload your payment screenshot", variant: "destructive" });
      return;
    }
    if (!orderId) return;

    uploadProof.mutate(
      {
        orderId,
        data: {
          paymentScreenshotUrl: screenshotDataUrl,
          transactionId: transactionId || null,
        },
      },
      {
        onSuccess: () => {
          setLocation("/confirmation");
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to upload payment proof. Please try again.", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="page-order">
      <header className="border-b border-border bg-background/95 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg tracking-tight text-foreground" data-testid="logo">
            ResumeEdge
          </Link>
          <StepIndicator current={step} total={4} />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Step {step} of 4
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground" data-testid="heading-step">
            {STEP_LABELS[step - 1]}
          </h1>
        </div>

        {/* Step 1: Select Plan */}
        {step === 1 && (
          <div data-testid="step-select-plan">
            {servicesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {services?.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPackage(pkg.id)}
                    data-testid={`button-select-plan-${pkg.id}`}
                    className={`w-full text-left rounded-xl border p-5 transition-all ${
                      selectedPackage === pkg.id
                        ? "border-primary ring-1 ring-primary bg-accent/30"
                        : "border-border hover:border-muted-foreground/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground">{pkg.name}</span>
                          {pkg.isPopular && (
                            <Badge className="text-xs" data-testid={`badge-popular-order-${pkg.id}`}>Popular</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {pkg.features.slice(0, 3).map((f, i) => (
                            <span key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-primary" />
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-bold text-foreground" data-testid={`text-plan-price-${pkg.id}`}>
                          ₹{pkg.price}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center justify-end gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {pkg.deliveryDays} {pkg.deliveryDays === 1 ? "hour" : "hours"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}

                <div className="mt-6">
                  <p className="text-sm font-medium text-foreground mb-3">Add-ons (optional)</p>
                  <div className="space-y-3">
                    {ADD_ONS.map((ao) => (
                      <div
                        key={ao.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleAddOn(ao.id)}
                        onKeyDown={(e) => e.key === "Enter" && toggleAddOn(ao.id)}
                        data-testid={`button-addon-${ao.id}`}
                        className={`w-full text-left rounded-xl border p-4 transition-all flex items-center gap-4 cursor-pointer ${
                          selectedAddOns.includes(ao.id)
                            ? "border-primary ring-1 ring-primary bg-accent/20"
                            : "border-border hover:border-muted-foreground/40"
                        }`}
                      >
                        <Checkbox
                          checked={selectedAddOns.includes(ao.id)}
                          className="pointer-events-none shrink-0"
                          data-testid={`checkbox-addon-${ao.id}`}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm text-foreground">{ao.name}</p>
                          <p className="text-xs text-muted-foreground">{ao.description}</p>
                        </div>
                        <p className="font-semibold text-sm text-foreground shrink-0">+₹{ao.price}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedPkg && (
                  <div className="mt-6 bg-muted/50 rounded-xl p-4 flex items-center justify-between" data-testid="card-total">
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedPkg.name}</p>
                      {selectedAddOns.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          + {selectedAddOns.map((id) => ADD_ONS.find((a) => a.id === id)?.name).join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-xl font-bold text-foreground" data-testid="text-total-amount">
                        ₹{totalAmount}
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full mt-4"
                  size="lg"
                  disabled={!selectedPackage}
                  onClick={() => setStep(2)}
                  data-testid="button-next-step1"
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Fill Details */}
        {step === 2 && (
          <div data-testid="step-fill-details">
            {selectedPkg && (
              <div className="bg-accent/30 border border-primary/20 rounded-xl p-4 mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{selectedPkg.name}</p>
                  {selectedAddOns.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedAddOns.map((id) => ADD_ONS.find((a) => a.id === id)?.name).join(", ")}
                    </p>
                  )}
                </div>
                <p className="font-bold text-foreground" data-testid="text-total-step2">₹{totalAmount}</p>
              </div>
            )}

            <Form {...detailsForm}>
              <form onSubmit={detailsForm.handleSubmit(handleDetailsSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    control={detailsForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Priya Sharma" {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={detailsForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 98765 43210" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={detailsForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="priya@example.com" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={detailsForm.control}
                  name="targetJobRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Job Role</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Senior Product Manager, Data Analyst" {...field} data-testid="input-job-role" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={detailsForm.control}
                  name="workExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Experience</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your current or most recent role, key responsibilities, companies you've worked at, and years of experience..."
                          className="min-h-32 resize-none"
                          {...field}
                          data-testid="textarea-work-experience"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={detailsForm.control}
                  name="additionalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any specific requirements, companies you're targeting, skills to highlight, or other context..."
                          className="min-h-24 resize-none"
                          {...field}
                          data-testid="textarea-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    data-testid="button-back-step2"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createOrder.isPending}
                    data-testid="button-next-step2"
                  >
                    {createOrder.isPending ? "Saving..." : <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {/* Step 3: Make Payment */}
        {step === 3 && (
          <div data-testid="step-make-payment">
            {/* Amount banner */}
            <div className="bg-accent/30 border border-primary/20 rounded-xl p-4 mb-6 flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Amount to pay</p>
              <p className="text-2xl font-bold text-foreground" data-testid="text-payment-amount">
                ₹{totalAmount}
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-5">
                <Smartphone className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-foreground">Choose payment method</h2>
              </div>

              {/* Payment method tabs */}
              <div className="flex gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("phonepe")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                    paymentMethod === "phonepe"
                      ? "border-[#5f259f] bg-[#5f259f]/10 text-[#5f259f]"
                      : "border-border bg-muted/30 text-muted-foreground hover:border-[#5f259f]/40"
                  }`}
                  data-testid="tab-phonepe"
                >
                  <span className="text-lg">
                    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="48" height="48" rx="10" fill="#5f259f"/>
                      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="sans-serif">Pe</text>
                    </svg>
                  </span>
                  PhonePe
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("googlepay")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                    paymentMethod === "googlepay"
                      ? "border-[#1a73e8] bg-[#1a73e8]/10 text-[#1a73e8]"
                      : "border-border bg-muted/30 text-muted-foreground hover:border-[#1a73e8]/40"
                  }`}
                  data-testid="tab-googlepay"
                >
                  <span className="text-lg">
                    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="48" height="48" rx="10" fill="white" stroke="#e0e0e0"/>
                      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#1a73e8" fontSize="14" fontWeight="bold" fontFamily="sans-serif">G</text>
                    </svg>
                  </span>
                  Google Pay
                </button>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center mb-6">
                {paymentMethod === "phonepe" ? (
                  <img
                    src="/phonepe-qr.png"
                    alt="PhonePe QR Code"
                    className="w-56 h-56 rounded-xl object-contain border border-border"
                    data-testid="qr-phonepe"
                  />
                ) : (
                  <img
                    src="/googlepay-qr.jpg"
                    alt="Google Pay QR Code"
                    className="w-56 h-56 rounded-xl object-contain border border-border bg-white"
                    data-testid="qr-googlepay"
                  />
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Scan with {paymentMethod === "phonepe" ? "PhonePe" : "Google Pay"} camera
                </p>
              </div>

              {/* Instructions */}
              <div className="space-y-2.5">
                <div className="flex items-start gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">1</span>
                  <span className="text-muted-foreground">
                    Open <span className="font-medium text-foreground">{paymentMethod === "phonepe" ? "PhonePe" : "Google Pay"}</span> and tap <span className="font-medium text-foreground">Scan QR</span>
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">2</span>
                  <span className="text-muted-foreground">
                    Point your camera at the QR code above
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">3</span>
                  <span className="text-muted-foreground">
                    Enter exact amount: <span className="font-semibold text-foreground">₹{totalAmount}</span> and complete payment
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">4</span>
                  <span className="text-muted-foreground">Take a screenshot of the payment confirmation</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">5</span>
                  <span className="text-muted-foreground">Click continue below and upload the screenshot</span>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 mb-6 text-sm text-muted-foreground">
              Your order will remain in <span className="font-medium text-foreground">Pending Verification</span> status until we confirm your payment. We verify within 2 hours.
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => setStep(4)}
              data-testid="button-next-step3"
            >
              I have made the payment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 4: Upload Proof */}
        {step === 4 && (
          <div data-testid="step-upload-proof">
            <p className="text-muted-foreground mb-6">
              Upload a screenshot of your payment confirmation to complete your order.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Payment Screenshot <span className="text-destructive">*</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  data-testid="input-screenshot-file"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-upload-screenshot"
                  className={`w-full border-2 border-dashed rounded-xl p-8 transition-colors text-center ${
                    screenshotDataUrl
                      ? "border-primary bg-accent/20"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  {screenshotDataUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="h-8 w-8 text-primary" />
                      <p className="font-medium text-sm text-foreground">{screenshotFileName}</p>
                      <p className="text-xs text-muted-foreground">Click to replace</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="font-medium text-sm text-foreground">Upload payment screenshot</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG accepted. Click to browse.</p>
                    </div>
                  )}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Transaction ID <span className="text-muted-foreground font-normal">(optional but recommended)</span>
                </label>
                <Input
                  placeholder="Enter the transaction reference number"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  data-testid="input-transaction-id"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Find this in your payment app under transaction details
                </p>
              </div>

              {screenshotDataUrl && (
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm font-medium text-foreground mb-2">Preview</p>
                  <img
                    src={screenshotDataUrl}
                    alt="Payment screenshot"
                    className="max-h-40 rounded-lg object-contain border border-border"
                    data-testid="img-screenshot-preview"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(3)}
                  data-testid="button-back-step4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleUploadProof}
                  disabled={!screenshotDataUrl || uploadProof.isPending}
                  data-testid="button-submit-proof"
                >
                  {uploadProof.isPending ? "Submitting..." : "Submit order"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
