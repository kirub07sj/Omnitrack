import { createHashRouter } from 'react-router-dom';
import SetupLayout from '../layouts/SetupLayout';
import SetupWizard from '../modules/setup/SetupWizard';
import App from '../App';
import DashboardLayout from '../layouts/DashboardLayout';
import OwnerDashboard from '../modules/dashboard/OwnerDashboard';
import ManagerDashboard from '../modules/dashboard/ManagerDashboard';
import CashierDashboard from '../modules/dashboard/CashierDashboard';
import AddProperty from '../modules/dashboard/AddProperty';
import EmployeeListPage from '../modules/employees/pages/EmployeeListPage';
import EmployeeDetailsPage from '../modules/employees/pages/EmployeeDetailsPage';
import AddEditEmployeePage from '../modules/employees/pages/AddEditEmployeePage';

import ProductListPage from '../modules/products/pages/ProductListPage';
import ProductDetailsPage from '../modules/products/pages/ProductDetailsPage';
import AddEditProductPage from '../modules/products/pages/AddEditProductPage';

import InventoryListPage from '../modules/inventory/pages/InventoryListPage';
import AddEditInventoryPage from '../modules/inventory/pages/AddEditInventoryPage';
import PurchasePage from '../modules/inventory/pages/PurchasePage';

import SupplierListPage from '../modules/suppliers/pages/SupplierListPage';
import AddEditSupplierPage from '../modules/suppliers/pages/AddEditSupplierPage';
import SupplierDetailsPage from '../modules/suppliers/pages/SupplierDetailsPage';

import POSPage from '../modules/orders/pages/POSPage';
import WaiterAppPage from '../modules/orders/pages/WaiterAppPage';
import TableManagementPage from '../modules/tables/pages/TableManagementPage';
import SettingsPage from '../modules/settings/pages/SettingsPage';
import AccountPermissionsPage from '../modules/settings/pages/AccountPermissionsPage';
import SyncBackupPage from '../modules/settings/pages/SyncBackupPage';
import KitchenAppPage from '../modules/kitchen/pages/KitchenAppPage';
import KitchenDashboardPage from '../modules/kitchen/pages/KitchenDashboardPage';
import SalesLayout from '../modules/sales/SalesLayout';
import PaymentQueue from '../modules/sales/pages/PaymentQueue';
import ManualSalePage from '../modules/sales/pages/ManualSalePage';
import SalesHistoryPage from '../modules/sales/pages/SalesHistoryPage';
import TransactionsPage from '../modules/transactions/pages/TransactionsPage';
import ExpensesPage from '../modules/expenses/pages/ExpensesPage';
import AddExpensePage from '../modules/expenses/pages/AddExpensePage';
import ReportsPage from '../modules/reports/pages/ReportsPage';

import Login from '../modules/auth/Login';
import SuperAdminDashboard from '../modules/super-admin/SuperAdminDashboard';

export const router = createHashRouter([
  {
    path: '/',
    element: <App />, // We'll update this later to Dashboard/Auth based on state
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/super-admin',
    element: <SuperAdminDashboard />
  },
  {
    path: '/waiter',
    element: <WaiterAppPage />
  },
  {
    path: '/kitchen',
    element: <KitchenAppPage />
  },
  {
    path: '/setup',
    element: <SetupLayout />,
    children: [
      {
        path: '',
        element: <SetupWizard />,
      }
    ]
  },
  {
    path: '/owner',
    element: <DashboardLayout />,
    children: [
      {
        path: '',
        element: <OwnerDashboard />
      },
      {
        path: 'add-property',
        element: <AddProperty />
      },
      {
        path: 'employees',
        element: <EmployeeListPage />
      },
      {
        path: 'employees/new',
        element: <AddEditEmployeePage />
      },
      {
        path: 'employees/:id',
        element: <EmployeeDetailsPage />
      },
      {
        path: 'employees/:id/edit',
        element: <AddEditEmployeePage />
      },
      {
        path: 'products',
        element: <ProductListPage />
      },
      {
        path: 'products/new',
        element: <AddEditProductPage />
      },
      {
        path: 'products/:id',
        element: <ProductDetailsPage />
      },
      {
        path: 'products/:id/edit',
        element: <AddEditProductPage />
      },
      {
        path: 'inventory',
        element: <InventoryListPage />
      },
      {
        path: 'inventory/new',
        element: <PurchasePage />
      },
      {
        path: 'inventory/:id/edit',
        element: <AddEditInventoryPage />
      },
      {
        path: 'suppliers',
        element: <SupplierListPage />
      },
      {
        path: 'suppliers/new',
        element: <AddEditSupplierPage />
      },
      {
        path: 'suppliers/:id',
        element: <SupplierDetailsPage />
      },
      {
        path: 'suppliers/:id/edit',
        element: <AddEditSupplierPage />
      },
      {
        path: 'pos',
        element: <POSPage />
      },
      {
        path: 'tables',
        element: <TableManagementPage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      },
      {
        path: 'account-permissions',
        element: <AccountPermissionsPage />
      },
      {
        path: 'sync',
        element: <SyncBackupPage />
      },
      {
        path: 'kitchen',
        element: <KitchenDashboardPage />
      },
      {
        path: 'sales',
        element: <SalesLayout />,
        children: [
          { index: true, element: <PaymentQueue /> },
          { path: 'manual', element: <ManualSalePage /> },
          { path: 'history', element: <SalesHistoryPage /> }
        ]
      },
      {
        path: 'transactions',
        element: <TransactionsPage />
      },
      {
        path: 'expenses',
        element: <ExpensesPage />
      },
      {
        path: 'expenses/new',
        element: <AddExpensePage />
      },
      {
        path: 'reports',
        element: <ReportsPage />
      }
    ]
  },
  {
    path: '/manager',
    element: <DashboardLayout />,
    children: [
      {
        path: '',
        element: <ManagerDashboard />
      },
      {
        path: 'employees',
        element: <EmployeeListPage />
      },
      {
        path: 'employees/new',
        element: <AddEditEmployeePage />
      },
      {
        path: 'employees/:id',
        element: <EmployeeDetailsPage />
      },
      {
        path: 'employees/:id/edit',
        element: <AddEditEmployeePage />
      },
      {
        path: 'products',
        element: <ProductListPage />
      },
      {
        path: 'products/new',
        element: <AddEditProductPage />
      },
      {
        path: 'products/:id',
        element: <ProductDetailsPage />
      },
      {
        path: 'products/:id/edit',
        element: <AddEditProductPage />
      },
      {
        path: 'inventory',
        element: <InventoryListPage />
      },
      {
        path: 'inventory/new',
        element: <PurchasePage />
      },
      {
        path: 'inventory/:id/edit',
        element: <AddEditInventoryPage />
      },
      {
        path: 'suppliers',
        element: <SupplierListPage />
      },
      {
        path: 'suppliers/new',
        element: <AddEditSupplierPage />
      },
      {
        path: 'suppliers/:id',
        element: <SupplierDetailsPage />
      },
      {
        path: 'suppliers/:id/edit',
        element: <AddEditSupplierPage />
      },
      {
        path: 'pos',
        element: <POSPage />
      },
      {
        path: 'tables',
        element: <TableManagementPage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      },
      {
        path: 'account-permissions',
        element: <AccountPermissionsPage />
      },
      {
        path: 'sync',
        element: <SyncBackupPage />
      },
      {
        path: 'kitchen',
        element: <KitchenDashboardPage />
      },
      {
        path: 'sales',
        element: <SalesLayout />,
        children: [
          { index: true, element: <PaymentQueue /> },
          { path: 'manual', element: <ManualSalePage /> },
          { path: 'history', element: <SalesHistoryPage /> }
        ]
      },
      {
        path: 'transactions',
        element: <TransactionsPage />
      },
      {
        path: 'expenses',
        element: <ExpensesPage />
      },
      {
        path: 'expenses/new',
        element: <AddExpensePage />
      },
      {
        path: 'reports',
        element: <ReportsPage />
      }
    ]
  },
  {
    path: '/cashier',
    element: <DashboardLayout />,
    children: [
      {
        path: '',
        element: <CashierDashboard />
      },
      {
        path: 'pos',
        element: <POSPage />
      },
      {
        path: 'tables',
        element: <TableManagementPage />
      },
      {
        path: 'sales',
        element: <SalesLayout />,
        children: [
          { index: true, element: <PaymentQueue /> },
          { path: 'manual', element: <ManualSalePage /> },
          { path: 'history', element: <SalesHistoryPage /> }
        ]
      },
      {
        path: 'transactions',
        element: <TransactionsPage />
      },
      {
        path: 'reports',
        element: <ReportsPage />
      },
      {
        path: 'sync',
        element: <SyncBackupPage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      }
    ]
  }
]);
