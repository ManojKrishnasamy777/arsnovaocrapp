import { lazy } from 'react';
import Login from '../pages/Login';
import LockScreen from '../pages/LockScreen';
const Index = lazy(() => import('../pages/Index'));

const routes = [
    // dashboard
    {
        path: '/',
        element: <Login />,
        layout:'blank',
    },
    {
        path: '/lockscreen',
        element: <LockScreen />,
        layout:'blank',
    },
    {
        path: '/home',
        element: <Index />,
        layout: 'default',
    },

];

export { routes };
