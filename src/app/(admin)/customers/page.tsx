// src/app/(admin)/customers/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, 
  Search, 
  User,
  Mail,
  Phone,
  Car,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  car_make: string | null;
  car_model: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
  total_orders: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Then get order counts for each customer
      const customersWithOrders = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { count } = await supabase
            .from('orders')
            .select('*', { count: 'exact' })
            .eq('user_id', profile.id);

          return {
            ...profile,
            total_orders: count || 0
          };
        })
      );

      setCustomers(customersWithOrders);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery) ||
    customer.car_make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.car_model?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search customers..."
            className="pl-10 pr-4 py-2 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id}>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {customer.first_name} {customer.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {customer.total_orders} orders
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  {customer.email}
                </div>
                {customer.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    {customer.phone}
                  </div>
                )}
                {(customer.car_make || customer.car_model) && (
                  <div className="flex items-center text-sm">
                    <Car className="h-4 w-4 text-gray-400 mr-2" />
                    {customer.car_make} {customer.car_model}
                  </div>
                )}
                {(customer.city || customer.state) && (
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    {customer.city}, {customer.state}
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {/* Add view details functionality */}}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View Details
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}