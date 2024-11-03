<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import Navigation, { NavigationProps } from 'components/common/Navigation.vue'
import { Loading, useMeta } from 'quasar'
import logo_image from 'assets/logo_update.png'
import { useAuthStore } from 'src/stores/auth'
import female_avatar from 'assets/female.jpg'
import male_avatar from 'assets/male.jpg'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import header_112_image from 'assets/header_image_.png'

// common
defineOptions({
    name: 'MainLayout'
})
useMeta({
    title: 'Laporan 112'
})
const router = useRouter()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
authStore.$subscribe((mutation, state) => {
    if (state.isTokenExpired) {
        reLogin.value = true
    }
})

// data
const leftDrawerOpen = ref(false)
const userAvatar = ref(female_avatar)
watch(
    user,
    () => {
        if (user.value.employee?.avatar == 'default.png') {
            if (user.value.employee.gender == 'male') {
                userAvatar.value = male_avatar
            } else {
                userAvatar.value = female_avatar
            }
        } else {
            userAvatar.value = `${import.meta.env.VITE_BASE_IMAGE_URL}/${
                user.value.employee?.avatar
            }`
        }
    },
    {
        deep: true
    }
)
const reLogin = ref<boolean>(false)
watch(reLogin, () => {
    if (reLogin.value) {
        intervalTimeout.value = setInterval(() => {
            timeout.value -= 1
        }, 1000)
    }
})
const timeout = ref<number>(59)
watch(timeout, () => {
    if (timeout.value < 1 && reLogin.value) {
        onLogout()
    }
})
const intervalTimeout = ref<any>()
const password = ref<string>('')

// methods
const toggleLeftDrawer = () => {
    leftDrawerOpen.value = !leftDrawerOpen.value
}

const onLogout = () => {
    localStorage.removeItem('token')

    router.push({
        name: 'login-page'
    })
}

const onExtendSessions = async () => {
    Loading.show({
        message: 'Please wait...'
    })

    try {
        const { data: response } = await api.post('/auth/refresh-token')

        if (response.data) {
            authStore.token = response.data.token
            localStorage.setItem('token', response.data.token)
            authStore.checkTokenExpiration()
            authStore.fetchUserData()
            reLogin.value = false
            timeout.value = 59

            clearInterval(intervalTimeout.value)
        }
    } catch (error) {
        console.log(error)
    } finally {
        Loading.hide()
    }
}

// hooks
onMounted(() => {
    if (!authStore.user.id) {
        authStore.fetchUserData()
    }

    authStore.startTokenExpirationCheck()
})

onUnmounted(() => {
    authStore.stopTokenExpirationCheck()
})
</script>

<template>
    <q-layout view="lHh lpR fFf">
        <q-header reveal class="tw-py-1.5 tw-text-gray-800 tw-bg-[#F4F5F6]">
            <q-toolbar class="tw-px-5 tw-justify-between">
                <div class="tw-flex tw-items-center tw-gap-3">
                    <div>
                        <base-icon
                            icon-name="HambergerMenu"
                            :size="20"
                            @click="toggleLeftDrawer"
                            class="tw-cursor-pointer"
                        />
                    </div>
                </div>

                <q-img :src="header_112_image" class="tw-w-full tw-mx-5" />

                <div class="tw-flex tw-justify-end tw-items-center tw-gap-3">
                    <section class="tw-flex tw-items-center tw-cursor-pointer">
                        <div class="tw-flex tw-gap-5 tw-items-center">
                            <q-avatar size="35px">
                                <q-img
                                    v-if="authStore.user"
                                    :src="userAvatar"
                                    class="tw-w-full tw-h-full tw-object-cover"
                                />
                            </q-avatar>

                            <div class="tw-flex tw-gap-3 tw-items-center">
                                <div>
                                    <h1
                                        class="tw-font-semibold tw-text-sm tw-whitespace-nowrap"
                                    >
                                        {{ user.employee?.name }}
                                    </h1>
                                    <p class="tw-text-xs tw-text-gray-600">
                                        {{
                                            user.roles
                                                ?.map((x) => x.role.name)
                                                .join(', ')
                                        }}
                                    </p>
                                </div>
                            </div>
                            <base-icon icon-name="ArrowDown2" size="14" />

                            <q-menu
                                anchor="bottom right"
                                self="top end"
                                class="tw-shadow-sm tw-translate-y-2"
                            >
                                <q-list style="min-width: 150px">
                                    <q-item
                                        clickable
                                        v-close-popup
                                        @click="onLogout"
                                    >
                                        <q-item-section>
                                            <div
                                                class="tw-flex tw-items-center tw-justify-start tw-gap-3 tw-text-xs"
                                            >
                                                <base-icon
                                                    icon-name="Logout"
                                                    size="14"
                                                    class="tw-text-red-600"
                                                />
                                                <h1>Logout</h1>
                                            </div>
                                        </q-item-section>
                                    </q-item>
                                </q-list>
                            </q-menu>
                        </div>
                    </section>
                </div>
            </q-toolbar>
        </q-header>

        <q-drawer
            v-model="leftDrawerOpen"
            show-if-above
            class="tw-bg-secondary tw-text-white"
            :width="290"
        >
            <q-list class="tw-mt-5">
                <q-item class="tw-mb-5">
                    <q-item-section
                        class="tw-flex-row tw-justify-start tw-items-center tw-gap-3"
                    >
                        <q-img :src="logo_image" class="tw-w-10" />
                        <h1 class="tw-text-2xl tw-font-semibold tw-text-white">
                            Reports.
                        </h1>
                    </q-item-section>
                </q-item>

                <navigation
                    v-for="menu in authStore.USER_MENUS"
                    :key="menu.name"
                    v-bind="menu"
                />
            </q-list>
        </q-drawer>

        <q-page-container>
            <main class="tw-px-5 tw-py-5">
                <router-view />
            </main>
        </q-page-container>
    </q-layout>

    <q-dialog v-model="reLogin" persistent>
        <q-card class="tw-py-8 tw-px-16 !tw-rounded-xl">
            <q-card-section class="tw-space-y-10">
                <section class="tw-space-y-3">
                    <div
                        class="tw-flex tw-justify-center tw-items-center tw-flex-col tw-gap-5"
                    >
                        <base-icon
                            icon-name="Warning2"
                            class="tw-w-10 tw-h-10 tw-text-primary"
                        />
                        <h1 class="tw-font-semibold tw-text-lg tw-text-primary">
                            Session Expiry Warning!
                        </h1>
                    </div>
                    <p class="tw-text-gray-500 tw-text-center">
                        Your session will expire in {{ timeout }} seconds. Do
                        you want to extend the session or logout?
                    </p>
                </section>

                <q-form @submit="onExtendSessions">
                    <div
                        class="tw-flex ttw-justify-center tw-items-center tw-gap-3"
                    >
                        <q-btn
                            label="Logout"
                            color="negative"
                            outline
                            class="tw-w-full"
                            v-close-popup
                            @click="onLogout"
                        />
                        <q-btn
                            unelevated
                            label="Extend Session"
                            type="submit"
                            color="secondary"
                            class="tw-w-full"
                        />
                    </div>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>
