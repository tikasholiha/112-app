<script setup lang="ts">
import { ref } from 'vue'
import tangerang_kota from 'assets/tangerang_kota.png'
import logo_update from 'assets/logo_update.png'
import { useRouter } from 'vue-router'
import { Loading, Notify, useMeta } from 'quasar'
import { api } from 'src/boot/axios'
import { useAuthStore } from 'src/stores/auth'

// common
const router = useRouter()
const authStore = useAuthStore()

useMeta({
    title: 'Laporan 112'
})

// data
const form = ref<{ username: string; password: string }>({
    username: '',
    password: ''
})
// methods
const onLogin = async () => {
    Loading.show({
        message: 'Please wait...'
    })

    try {
        const { data: response } = await api.post('/auth/login', {
            ...form.value
        })

        if (response.data) {
            localStorage.setItem('token', response.data.token)
            authStore.token = response.data.token

            Notify.create({
                message: response.message,
                type: 'positive',
                timeout: 3000,
                position: 'bottom-right'
            })

            router.push({
                name: 'dashboard-call-page'
            })
        }
    } catch (error: any) {
        console.log(error)
    } finally {
        Loading.hide()
    }
}
</script>

<template>
    <section class="login__section">
        <section class="tw-w-full tw-h-screen tw-grid tw-grid-cols-2 tw-gap-5">
            <div />
            <div class="tw-flex tw-flex-col tw-justify-center tw-items-center">
                <q-card flat class="tw-w-[500px] tw-bg-white/90">
                    <q-card-section>
                        <div
                            class="tw-h-full tw-p-10 tw-flex tw-flex-col tw-justify-between"
                        >
                            <div class="tw-flex tw-justify-center tw-mb-10">
                                <q-img :src="tangerang_kota" class="tw-w-28" />
                                <q-img :src="logo_update" class="tw-w-28" />
                            </div>

                            <div class="tw-z-50">
                                <h1
                                    class="tw-text-2xl tw-font-semibold tw-text-secondary"
                                >
                                    Welcome To 112 Reports
                                </h1>
                                <p class="tw-text-gray-500 tw-text-sm tw-mt-1">
                                    Enter the username and password
                                </p>

                                <q-form
                                    @submit.prevent="onLogin"
                                    class="tw-mt-8 tw-space-y-5"
                                >
                                    <base-text
                                        label="Username"
                                        v-model="form.username"
                                        align="top"
                                        icon="User"
                                        dense
                                        :required="true"
                                    />
                                    <base-password
                                        label="Password"
                                        v-model="form.password"
                                        align="top"
                                        type="password"
                                        icon="Lock1"
                                        dense
                                        :required="true"
                                    />

                                    <q-btn
                                        type="submit"
                                        unelevated
                                        no-caps
                                        color="secondary"
                                        label="Login"
                                        class="tw-w-full"
                                    />
                                </q-form>
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </div>
        </section>
    </section>
</template>

<style>
.login__section {
    width: 100%;
    height: 100vh;
    background: url(../../assets/login_image.jpg);
    background-position: center;
    background-size: cover;
}
.swiper {
    width: 100%;
    height: 100%;
    background: transparent !important;
}

.swiper-slide {
    text-align: center;
    font-size: 18px;

    /* Center slide text vertically */
    display: flex;
    justify-content: center;
    align-items: center;
}

.slide-card {
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.highlight .slide-card {
    transform: scale(1.1);
    opacity: 1;
}

.dim .slide-card {
    opacity: 0.5;
}
</style>
