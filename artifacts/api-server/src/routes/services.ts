import { Router, type IRouter } from "express";
import type { ServicePackage } from "@workspace/api-zod";

const router: IRouter = Router();

const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: "basic",
    name: "Basic Resume",
    slug: "basic",
    price: 999,
    deliveryDays: 5,
    description: "A clean, professionally formatted resume built from your existing experience.",
    features: [
      "Professional formatting & layout",
      "Concise, action-verb driven content",
      "One revision included",
      "PDF + Word file delivery",
      "5-day turnaround",
    ],
    isPopular: false,
  },
  {
    id: "professional",
    name: "Professional Resume",
    slug: "professional",
    price: 1999,
    deliveryDays: 3,
    description: "ATS-optimized resume engineered to pass automated screening systems and reach hiring managers.",
    features: [
      "Everything in Basic",
      "ATS keyword optimization",
      "Tailored to your target job role",
      "Industry-specific formatting",
      "Two revisions included",
      "3-day turnaround",
    ],
    isPopular: true,
  },
  {
    id: "premium",
    name: "Premium Resume",
    slug: "premium",
    price: 3499,
    deliveryDays: 2,
    description: "A recruiter-focused rewrite structured to command attention and drive interview callbacks.",
    features: [
      "Everything in Professional",
      "Recruiter-focused narrative rewrite",
      "LinkedIn profile summary included",
      "Quantified achievements highlighted",
      "Three revisions included",
      "2-day turnaround",
      "Cover letter template",
    ],
    isPopular: false,
  },
];

router.get("/services", async (_req, res): Promise<void> => {
  res.json(SERVICE_PACKAGES);
});

export default router;
