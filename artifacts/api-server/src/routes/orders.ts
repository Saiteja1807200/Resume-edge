import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, ordersTable } from "@workspace/db";
import {
  CreateOrderBody,
  UpdateOrderStatusBody,
  UploadPaymentProofBody,
  GetOrderParams,
  UpdateOrderStatusParams,
  UploadPaymentProofParams,
} from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();

function generateOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${ts}-${rand}`;
}

function serializeOrder(order: typeof ordersTable.$inferSelect) {
  return {
    ...order,
    totalAmount: parseFloat(String(order.totalAmount)),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const orderId = generateOrderId();
  const [order] = await db
    .insert(ordersTable)
    .values({
      orderId,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      targetJobRole: parsed.data.targetJobRole,
      workExperience: parsed.data.workExperience,
      additionalNotes: parsed.data.additionalNotes ?? null,
      servicePackage: parsed.data.servicePackage,
      addOns: parsed.data.addOns ?? [],
      totalAmount: parsed.data.totalAmount.toString(),
      status: "pending_payment",
    })
    .returning();

  res.status(201).json(serializeOrder(order));
});

router.get("/orders/stats", async (req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable);

  const stats = {
    total: orders.length,
    pendingPayment: orders.filter((o) => o.status === "pending_payment").length,
    pendingVerification: orders.filter((o) => o.status === "pending_verification").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    inProgress: orders.filter((o) => o.status === "in_progress").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    totalRevenue: orders.reduce((sum, o) => sum + parseFloat(String(o.totalAmount)), 0),
  };

  res.json(stats);
});

router.get("/orders", async (req, res): Promise<void> => {
  const orders = await db
    .select()
    .from(ordersTable)
    .orderBy(sql`${ordersTable.createdAt} DESC`);

  res.json(orders.map(serializeOrder));
});

router.get("/orders/:orderId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.orderId, raw));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(serializeOrder(order));
});

router.patch("/orders/:orderId/status", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const validStatuses = ["pending_payment", "pending_verification", "confirmed", "in_progress", "delivered"];
  if (!validStatuses.includes(parsed.data.status)) {
    res.status(400).json({ error: "Invalid status value" });
    return;
  }

  const [order] = await db
    .update(ordersTable)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(ordersTable.orderId, raw))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(serializeOrder(order));
});

router.post("/orders/:orderId/payment-proof", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;

  const parsed = UploadPaymentProofBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (!parsed.data.paymentScreenshotUrl) {
    res.status(400).json({ error: "Payment screenshot is required" });
    return;
  }

  const [order] = await db
    .update(ordersTable)
    .set({
      paymentScreenshotUrl: parsed.data.paymentScreenshotUrl,
      transactionId: parsed.data.transactionId ?? null,
      status: "pending_verification",
      updatedAt: new Date(),
    })
    .where(eq(ordersTable.orderId, raw))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(serializeOrder(order));
});

export default router;
