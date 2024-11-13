// src/app/(dashboard)/orders/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, 
  Package, 
  Truck, 
  MapPin, 
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderDetails {
  id: string;
  plan_name: string;
  status: string;
  total_amount: number;
  shipping_status: string;
  tracking_number: string | null;
  shipping_carrier: string | null;
  estimated_delivery_date: string | null;
  created_at: string;
  shipping_address: {
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  items: Array<{
    id: string;
    item_name: string;
    quantity: number;
  }>;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrderDetails(params.id as string);
    }
  }, [params.id]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-6">
        <Card>
          <div className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Order not found
            </h3>
            <p className="text-gray-500 mb-4">
              The order you're looking for doesn't exist or you don't have access to it.
            </p>
            <button
              onClick={() => router.push('/dashboard/orders')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push('/dashboard/orders')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Orders
        </button>
      </div>

      <div className="grid gap-6">
        {/* Order Summary */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Order Summary
            </h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Order ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{order.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Order Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(order.created_at).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">{order.status}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  ${order.total_amount.toFixed(2)}
                </dd>
              </div>
            </dl>
          </div>
        </Card>

        {/* Shipping Information */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Shipping Information
            </h2>
            {order.tracking_number ? (
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Truck className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900">
                    Tracking Number: {order.tracking_number}
                  </span>
                </div>
                {order.estimated_delivery_date && (
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">
                      Estimated Delivery: {new Date(order.estimated_delivery_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">
                Tracking information will be available once your order ships.
              </p>
            )}

            <div className="border-t pt-4">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Shipping Address
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {order.shipping_address.address_1}<br />
                    {order.shipping_address.address_2 && (
                      <>{order.shipping_address.address_2}<br /></>
                    )}
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}<br />
                    {order.shipping_address.country}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Order Items */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center">
                     <Package className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.item_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Order Timeline */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Order Timeline
            </h2>
            <div className="flow-root">
              <ul className="-mb-8">
                <li className="relative pb-8">
                  <div className="relative flex items-center space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                        <Check className="w-5 h-5 text-white" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Order Placed
                        </p>
                        <p className="mt-0.5 text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
                {/* Add more timeline items based on order status */}
              </ul>
            </div>
          </div>
        </Card>

        {/* Support Information */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Need Help?
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              If you have any questions about your order, please contact our support team.
            </p>
            <button
              onClick={() => window.location.href = 'mailto:support@evtaxi.app'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Contact Support
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}