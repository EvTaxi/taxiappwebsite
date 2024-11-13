// src/app/(dashboard)/shipping/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Loader2, Package, Truck, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface ShipmentTracking {
  order_id: string;
  tracking_number: string;
  carrier: string;
  status: string;
  estimated_delivery: string | null;
  tracking_events: Array<{
    date: string;
    status: string;
    location: string;
    description: string;
  }>;
}

export default function ShippingPage() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<ShipmentTracking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchShipments();
    }
  }, [user]);

  const fetchShipments = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .not('tracking_number', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Here you would typically fetch tracking info from your shipping provider
      // For now, we'll just show the basic tracking info we have
      const trackingData = data.map(order => ({
        order_id: order.id,
        tracking_number: order.tracking_number,
        carrier: order.shipping_carrier,
        status: order.shipping_status,
        estimated_delivery: order.estimated_delivery_date,
        tracking_events: []
      }));

      setShipments(trackingData);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast.error('Failed to load shipment tracking');
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

  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Shipment Tracking
      </h1>

      {shipments.length === 0 ? (
        <Card>
          <div className="p-6 text-center">
            <Truck className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No active shipments
            </h3>
            <p className="text-gray-500">
              When your orders ship, you'll be able to track them here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {shipments.map((shipment) => (
            <Card key={shipment.tracking_number}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Order #{shipment.order_id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Tracking Number: {shipment.tracking_number}
                    </p>
                  </div>
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {shipment.carrier}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Package className="w-4 h-4 mr-1" />
                      Status: {shipment.status}
                    </div>
                    {shipment.estimated_delivery && (
                      <div className="text-sm text-gray-500">
                        Estimated Delivery: {new Date(shipment.estimated_delivery).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tracking button */}
                <div className="mt-4">
                  <button
                    onClick={() => {
                      // Here you would typically open the carrier's tracking page
                      toast.info('Tracking page coming soon!');
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Track Shipment
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
