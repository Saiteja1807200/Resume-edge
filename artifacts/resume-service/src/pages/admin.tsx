import { useState } from "react";
import { Link } from "wouter";
import { Users, Clock, CheckCircle, TrendingUp, Package, FileText, ExternalLink } from "lucide-react";
import {
  useListOrders,
  useGetOrderStats,
  useUpdateOrderStatus,
  getListOrdersQueryKey,
  getGetOrderStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const STATUS_OPTIONS = [
  { value: "pending_payment", label: "Pending Payment" },
  { value: "pending_verification", label: "Pending Verification" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In Progress" },
  { value: "delivered", label: "Delivered" },
];

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-800 border-yellow-200",
  pending_verification: "bg-orange-100 text-orange-800 border-orange-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
};

const PACKAGE_LABELS: Record<string, string> = {
  basic: "Basic",
  professional: "Professional",
  premium: "Premium",
};

export default function Admin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: orders, isLoading: ordersLoading } = useListOrders();
  const { data: stats, isLoading: statsLoading } = useGetOrderStats();
  const updateStatus = useUpdateOrderStatus();

  function handleStatusChange(orderId: string, status: string) {
    updateStatus.mutate(
      { orderId, data: { status: status as any } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetOrderStatsQueryKey() });
          toast({ title: "Status updated", description: `Order ${orderId} marked as ${status.replace(/_/g, " ")}` });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to update order status", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="page-admin">
      <header className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-semibold text-lg tracking-tight text-foreground" data-testid="logo">
              ResumeEdge
            </Link>
            <span className="text-border">|</span>
            <span className="text-sm font-medium text-muted-foreground">Admin Panel</span>
          </div>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            View site
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-foreground" data-testid="heading-admin">
            Orders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track all resume writing orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-8">
          {statsLoading ? (
            Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
            ))
          ) : stats ? (
            <>
              <div className="bg-card border border-border rounded-xl p-4 col-span-1" data-testid="stat-total">
                <p className="text-xs text-muted-foreground mb-1">Total</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4" data-testid="stat-pending-payment">
                <p className="text-xs text-muted-foreground mb-1">Pending Payment</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayment}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4" data-testid="stat-pending-verification">
                <p className="text-xs text-muted-foreground mb-1">Pending Verify</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingVerification}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4" data-testid="stat-confirmed">
                <p className="text-xs text-muted-foreground mb-1">Confirmed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4" data-testid="stat-in-progress">
                <p className="text-xs text-muted-foreground mb-1">In Progress</p>
                <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4" data-testid="stat-delivered">
                <p className="text-xs text-muted-foreground mb-1">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              </div>
              <div className="bg-card border border-primary/20 rounded-xl p-4 col-span-1" data-testid="stat-revenue">
                <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                <p className="text-2xl font-bold text-primary">₹{Number(stats.totalRevenue).toLocaleString()}</p>
              </div>
            </>
          ) : null}
        </div>

        {/* Orders Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {ordersLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading orders...</div>
          ) : !orders || orders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground">No orders yet</p>
              <p className="text-sm text-muted-foreground mt-1">Orders will appear here once customers start placing them.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-orders">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Order ID</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Customer</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Package</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Amount</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Files</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors" data-testid={`row-order-${order.orderId}`}>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-medium text-foreground" data-testid={`text-order-id-${order.orderId}`}>
                          {order.orderId}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground" data-testid={`text-customer-name-${order.orderId}`}>{order.name}</p>
                        <p className="text-xs text-muted-foreground">{order.email}</p>
                        <p className="text-xs text-muted-foreground">{order.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground" data-testid={`text-package-${order.orderId}`}>
                          {PACKAGE_LABELS[order.servicePackage] ?? order.servicePackage}
                        </p>
                        {order.addOns && order.addOns.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {order.addOns.map((ao) => (
                              <span key={ao} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                +{ao.replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{order.targetJobRole}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-foreground" data-testid={`text-amount-${order.orderId}`}>
                          ₹{Number(order.totalAmount).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={order.status}
                          onValueChange={(val) => handleStatusChange(order.orderId, val)}
                        >
                          <SelectTrigger
                            className={`h-8 text-xs w-44 border font-medium ${STATUS_COLORS[order.status] ?? ""}`}
                            data-testid={`select-status-${order.orderId}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {order.resumeFileUrl ? (
                            <a
                              href={order.resumeFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                              data-testid={`link-resume-${order.orderId}`}
                            >
                              <FileText className="h-3 w-3" /> Resume
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">No resume</span>
                          )}
                          {order.paymentScreenshotUrl ? (
                            <a
                              href={order.paymentScreenshotUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                              data-testid={`link-payment-${order.orderId}`}
                            >
                              <ExternalLink className="h-3 w-3" /> Payment proof
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">No proof</span>
                          )}
                          {order.transactionId && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              TXN: {order.transactionId}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
