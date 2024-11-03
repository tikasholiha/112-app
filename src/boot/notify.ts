import { Notify } from 'quasar'

export const Notification = (
    message: string,
    type: 'positive' | 'negative' | 'warning' | 'info'
) => {
    return Notify.create({
        message,
        type: type,
        timeout: 3000,
        position: 'bottom-right'
    })
}
