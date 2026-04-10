import { Router, type IRouter } from "express";
import type { ServicePackage } from "@workspace/api-zod";

const router: IRouter = Router();

const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: "basic",
    name: "Basic Resume",
    slug: "basic",
    price: 30,
    deliveryDays: 5,
    description: "A clean, professionally formatted resume built to meet standard company hiring requirements.",
    features: [
      "Professional formatting & layout",
      "Concise, action-verb driven content",
      "Formatted to company application standards",
      "One revision included",
      "PDF + Word file delivery",
      "5-hour turnaround",
    ],
    isPopular: false,
  },
  {
    id: "professional",
    name: "Professional Resume",
    slug: "professional",
    price: 50,
    deliveryDays: 2,
    description: "ATS-optimized resume built for companies like Google, Amazon, and Microsoft — engineered to pass automated screening.",
    features: [
      "Everything in Basic",
      "ATS keyword optimization",
      "Tailored to your target job role",
      "Formatted to company-specific standards (FAANG, Big4, MNCs)",
      "Industry-specific formatting",
      "Two revisions included",
      "2-hour turnaround",
    ],
    isPopular: true,
  },
  {
    id: "premium",
    name: "Premium Resume",
    slug: "premium",
    price: 100,
    deliveryDays: 1,
    description: "A recruiter-focused rewrite built for top-tier companies — structured to command attention and drive callbacks.",
    features: [
      "Everything in Professional",
      "Recruiter-focused narrative rewrite",
      "LinkedIn profile summary included",
      "Quantified achievements highlighted",
      "Formatted for specific company portals (Google, Amazon, Deloitte, TCS)",
      "Three revisions included",
      "1-hour turnaround",
      "Cover letter template",
    ],
    isPopular: false,
  },
];

router.get("/services", async (_req, res): Promise<void> => {
  res.json(SERVICE_PACKAGES);
});

export default router;
