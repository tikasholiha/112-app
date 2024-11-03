import { boot } from 'quasar/wrappers'
import axios, { AxiosInstance } from 'axios'
import { Notification } from './notify'

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $axios: AxiosInstance
        $api: AxiosInstance
    }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: import.meta.env.VITE_BASE_URL })
api.interceptors.request.use((config: any) => {
    config.headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }

    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response.status == 401) {
            Notification('Your Session is expired', 'warning')
            localStorage.removeItem('token')
            window.location.reload()
        } else if (error.response.status == 400) {
            if (error.response.data.message) {
                Notification(error.response.data.message, 'negative')
            } else {
                Notification('Action Failed!', 'negative')
            }
        } else if (error.response.status == 422) {
            if (error.response.data.message) {
                Notification(error.response.data.message, 'negative')
            } else {
                Notification('Action Failed!', 'negative')
            }
        } else if (error.response.status == 500) {
            Notification('Action Failed!', 'negative')
        }

        return Promise.reject(error)
    }
)

const form_data = axios.create({ baseURL: import.meta.env.VITE_BASE_URL })
form_data.interceptors.request.use((config: any) => {
    config.headers = {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }

    return config
})

form_data.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response.status == 401) {
            Notification('Your Session is expired', 'warning')

            localStorage.removeItem('token')
            window.location.reload()
        } else if (error.response.status == 400) {
            if (error.response.data.message) {
                Notification(error.response.data.message, 'negative')
            } else {
                Notification('Action Failed!', 'negative')
            }
        } else if (error.response.status == 422) {
            if (error.response.data.message) {
                Notification(error.response.data.message, 'negative')
            } else {
                Notification('Action Failed!', 'negative')
            }
        } else if (error.response.status == 500) {
            Notification('Action Failed!', 'negative')
        }

        return Promise.reject(error)
    }
)

export default boot(({ app }) => {
    // for use inside Vue files (Options API) through this.$axios and this.$api

    app.config.globalProperties.$axios = axios
    // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
    //       so you won't necessarily have to import axios in each vue file

    app.config.globalProperties.$api = api
    // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
    //       so you can easily perform requests against your app's API
})

export { api, form_data }
