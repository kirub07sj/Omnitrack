import { create } from 'zustand';
import { apiFetch } from '@/lib/api';

interface OrderState {
  orders: any[];
  tables: any[];
  isLoading: boolean;
  error: string | null;
  
  fetchOrders: (businessId: string) => Promise<void>;
  fetchTables: (businessId: string) => Promise<void>;
  createOrder: (orderData: any) => Promise<any>;
  updateOrder: (id: string, updateData: any) => Promise<any>;
  deleteOrder: (id: string) => Promise<void>;
  
  addOrderFromEvent: (order: any) => void;
  updateOrderFromEvent: (order: any) => void;
  deleteOrderFromEvent: (id: string) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  tables: [],
  isLoading: false,
  error: null,

  fetchOrders: async (businessId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiFetch(`/api/orders?business_id=${businessId}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      set({ orders: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchTables: async (businessId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiFetch(`/api/tables?business_id=${businessId}`);
      if (!res.ok) throw new Error('Failed to fetch tables');
      const data = await res.json();
      const sortedTables = Array.isArray(data) ? [...data].sort((a, b) => {
        const numA = parseInt(String(a.table_number || '').replace(/\D/g, '')) || 0;
        const numB = parseInt(String(b.table_number || '').replace(/\D/g, '')) || 0;
        return numA - numB;
      }) : data;
      set({ tables: sortedTables, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createOrder: async (orderData: any) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiFetch(`/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create order');
      }
      const newOrder = await res.json();
      // The SSE will also push this order, but we can optimistically update
      // Actually, let's let SSE handle the state update to avoid duplicates, or just do it here and ensure no duplicates.
      set(state => {
        const exists = state.orders.find(o => o.id === newOrder.id);
        if (exists) return state;
        return { orders: [newOrder, ...state.orders], isLoading: false };
      });
      return newOrder;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateOrder: async (id: string, updateData: any) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiFetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) throw new Error('Failed to update order');
      const updatedOrder = await res.json();
      set(state => ({
        orders: state.orders.map(o => o.id === id ? updatedOrder : o),
        isLoading: false
      }));
      return updatedOrder;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteOrder: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiFetch(`/api/orders/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete order');
      set(state => ({
        orders: state.orders.filter(o => o.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  addOrderFromEvent: (order: any) => {
    set(state => {
      const exists = state.orders.find(o => o.id === order.id);
      if (exists) return state;
      return { orders: [order, ...state.orders] };
    });
  },

  updateOrderFromEvent: (order: any) => {
    set(state => ({
      orders: state.orders.map(o => o.id === order.id ? order : o)
    }));
  },

  deleteOrderFromEvent: (id: string) => {
    set(state => ({
      orders: state.orders.filter(o => o.id !== id)
    }));
  }
}));
