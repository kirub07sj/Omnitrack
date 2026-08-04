import { createBrowserRouter } from 'react-router-dom';
import SetupLayout from '../layouts/SetupLayout';
import SetupWizard from '../modules/setup/SetupWizard';
import App from '../App';

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
  }
]);
