import { Outlet } from 'react-router-dom';

export default function SalesLayout() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Outlet />
    </div>
  );
}
