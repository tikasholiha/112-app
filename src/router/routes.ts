import { Notify } from 'quasar'
import {
    NavigationGuardNext,
    RouteLocationNormalized,
    RouteRecordRaw
} from 'vue-router'

const authRequired = (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
) => {
    const token = localStorage.getItem('token')

    if (!token) {
        Notify.create({
            message: 'Permission Denied!',
            type: 'warning',
            timeout: 3000,
            position: 'bottom-right'
        })

        next({ name: 'login-page' })
    } else {
        if (to.path === '/') {
            next({ name: 'dashboard-call-page' })
        } else {
            next()
        }
    }
}

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: () => import('layouts/DashboardLayout.vue'),
        beforeEnter: authRequired,
        children: [
            {
                path: '',
                component: () => import('pages/Dashboard/Calls/Index.vue')
            },
            {
                path: '/dashboard/calls',
                component: () => import('pages/Dashboard/Calls/Index.vue'),
                name: 'dashboard-call-page'
            },
            {
                path: '/dashboard/emergency',
                component: () => import('pages/Dashboard/Emergency/Index.vue'),
                name: 'dashboard-emergency-page'
            },

            // Call Reports
            {
                path: '/call-reports',
                component: () => import('pages/Reports/Calls/Index.vue'),
                name: 'call-report-page'
            },
            {
                path: '/call-reports/create',
                component: () => import('pages/Reports/Calls/Create.vue'),
                name: 'call-report-create-page'
            },
            {
                path: '/call-reports/:id/edit',
                component: () => import('pages/Reports/Calls/Detail.vue'),
                name: 'call-report-edit-page'
            },

            // Test Calls
            {
                path: '/test-calls',
                component: () => import('pages/Reports/TestCalls/Index.vue'),
                name: 'test-call-page'
            },

            // Emergency Reports
            {
                path: '/emergency-reports',
                component: () => import('pages/Reports/Emergency/Index.vue'),
                name: 'emergency-report-page'
            },
            {
                path: '/emergency-reports/:period/:year',
                component: () => import('pages/Reports/Emergency/Show.vue'),
                name: 'emergency-report-detail-page',
                props: true
            },
            {
                path: '/emergency-reports/create',
                component: () => import('pages/Reports/Emergency/Create.vue'),
                name: 'emergency-report-create-page'
            },
            {
                path: '/emergency-reports/:id/edit',
                component: () => import('pages/Reports/Emergency/Detail.vue'),
                name: 'emergency-report-edit-page'
            },

            // Master Data
            // # Employee
            {
                path: '/master-data/employees',
                component: () => import('pages/MasterData/Employee/Index.vue'),
                name: 'employee-page'
            },
            {
                path: '/master-data/employees/create',
                component: () => import('pages/MasterData/Employee/Create.vue'),
                name: 'employee-create-page'
            },
            {
                path: '/master-data/employees/:id/edit',
                component: () => import('pages/MasterData/Employee/Detail.vue'),
                name: 'employee-edit-page'
            },
            {
                path: '/master-data/employees/kpi',
                component: () =>
                    import('pages/MasterData/Employee/KPI/Index.vue'),
                name: 'employee-kpi-page'
            },
            {
                path: '/master-data/employees/kpi/create',
                component: () =>
                    import('pages/MasterData/Employee/KPI/Create.vue'),
                name: 'employee-create-kpi-page'
            },
            {
                path: '/master-data/employees/kpi/detail',
                component: () =>
                    import('pages/MasterData/Employee/KPI/Detail.vue'),
                name: 'employee-kpi-detail-page'
            },

            // # Religions
            {
                path: '/master-data/religions',
                component: () => import('pages/MasterData/Religion/Index.vue'),
                name: 'religion-page'
            },

            // # Status
            {
                path: '/master-data/status',
                component: () => import('pages/MasterData/Status/Index.vue'),
                name: 'status-page'
            },

            // # District
            {
                path: '/master-data/districts',
                component: () => import('pages/MasterData/District/Index.vue'),
                name: 'district-page'
            },

            // Settings
            // # Menus
            {
                path: '/settings/menus',
                component: () => import('pages/Settings/Menus/Index.vue'),
                name: 'menu-page'
            },
            {
                path: '/settings/roles',
                component: () => import('pages/Settings/Roles/Index.vue'),
                name: 'role-page'
            },
            {
                path: '/settings/users',
                component: () => import('pages/Settings/Users/Index.vue'),
                name: 'user-page'
            }
        ]
    },

    {
        path: '/auth/login',
        component: () => import('pages/Auth/Login.vue'),
        name: 'login-page',
        beforeEnter: (to, from, next) => {
            const token = localStorage.getItem('token')
            if (token) {
                Notify.create({
                    message: 'You have already login.',
                    type: 'warning',
                    timeout: 3000,
                    position: 'bottom-right'
                })
                next({ name: 'dashboard-call-page' })
            } else {
                next()
            }
        }
    },

    // Always leave this as last one,
    // but you can also remove it
    {
        path: '/:catchAll(.*)*',
        component: () => import('pages/ErrorNotFound.vue')
    }
]

export default routes
