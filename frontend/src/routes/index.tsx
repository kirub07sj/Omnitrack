import { createBrowserRouter } from 'react-router-dom';
import SetupLayout from '../layouts/SetupLayout';
import SetupWizard from '../modules/setup/SetupWizard';
import App from '../App';
import DashboardLayout from '../layouts/DashboardLayout';
import OwnerDashboard from '../modules/dashboard/OwnerDashboard';
import AddProperty from '../modules/dashboard/AddProperty';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // We'll update this later to Dashboard/Auth based on state
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
      }
    ]
  }
]);
