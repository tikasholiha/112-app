<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { IBreadcrumbs } from 'src/components/common/BaseTitle.vue'
import moment from 'moment'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import { Loading } from 'quasar'
import { Notification } from 'src/boot/notify'

const route = useRoute()
const router = useRouter()

// Data
const breadcrumbs = ref<IBreadcrumbs[]>([
    {
        title: 'Dashboard',
        href: 'dashboard-page',
        icon: 'Category2'
    },
    {
        title: 'Call Reports',
        href: 'call-report-page',
        icon: 'Headphones'
    },
    {
        title: 'Edit',
        href: '',
        icon: ''
    }
])

type CallReports = {
    day: string
    disconnect_call: number
    prank_call: number
    education_call: number
    emergency_call: number
    abandoned: number
}

type FormSchema = {
    month_period: {
        label: string
        value: any
    }
    year: string
    day: string
    detail: CallReports[]
}

const form = reactive<FormSchema>({
    month_period: { label: '', value: '' },
    year: '',
    day: '',
    detail: []
})
const isSubmitted = ref<boolean>(true)
const confirmDialog = ref(false)

// methods
const onSubmitPeriod = () => {
    form.day = moment(new Date(`${form.year}-${form.month_period.value}-01`))
        .endOf('month')
        .format('D')

    for (let index = 1; index <= parseInt(form.day); index++) {
        const template: CallReports = {
            day: String(index).padStart(2, '0'),
            disconnect_call: 0,
            prank_call: 0,
            education_call: 0,
            emergency_call: 0,
            abandoned: 0
        }

        form.detail.push(template)
    }

    isSubmitted.value = true
}

const fetchCallReportByID = async () => {
    Loading.show({
        message: 'Please wait..'
    })

    try {
        const { data: response } = await api.get(
            `/call-reports/${route.params.id}`
        )

        if (response.data) {
            form.detail = response.data.detail
            form.month_period.label = response.data.month_period
        }
    } catch (error) {
        console.log(error)
    } finally {
        Loading.hide()
    }
}

const onSubmitCallReports = async () => {
    Loading.show({
        message: 'Please wait..'
    })

    try {
        const payload = {
            ...form,
            month_period: form.month_period.label
        }

        const { data: response } = await api.put(
            `/call-reports/${route.params.id}`,
            payload
        )

        if (response.data) {
            Notification(response.message, 'positive')

            router.push({
                name: 'call-report-page'
            })
        }
    } catch (error) {
        console.log(error)
    } finally {
        Loading.hide()
    }
}

const handleAction = (val: boolean) => {
    confirmDialog.value = false

    if (val) {
        onSubmitCallReports()
    }
}

// hooks
onMounted(() => {
    form.year = moment().format('YYYY')
    fetchCallReportByID()
})
</script>

<template>
    <base-title title="Call Reports" :crumbs="breadcrumbs" />

    <base-card title="Update Call Reports" subtitle="Input Year and Month">
        <template #content>
            <q-form @submit="onSubmitPeriod" class="tw-space-y-3">
                <base-text
                    label="Year"
                    type="number"
                    v-model="form.year"
                    dense
                    :required="true"
                    :disabled="true"
                />

                <base-month
                    label="Month Period"
                    v-model="form.month_period"
                    :placeholder="form.month_period?.label"
                    dense
                    :required="true"
                    :disabled="true"
                />

                <div class="tw-justify-center tw-hidden">
                    <q-btn
                        unelevated
                        no-caps
                        label="Apply"
                        type="submit"
                        color="info"
                        :disable="!form.month_period.label"
                    />
                </div>
            </q-form>
        </template>
    </base-card>

    <template v-if="isSubmitted">
        <base-card title="Input Reports">
            <template #content>
                <q-form @submit.prevent="onSubmitCallReports">
                    <section class="tw-space-y-5">
                        <div
                            class="tw-grid tw-grid-cols-6 tw-gap-5 tw-text-center"
                        >
                            <h1 class="tw-text-left">Day</h1>
                            <h1>Disconnect Calls</h1>
                            <h1>Prank Calls</h1>
                            <h1>Education Calls</h1>
                            <h1>Emergency Calls</h1>
                            <h1>Abandoned</h1>
                        </div>

                        <div
                            v-for="item in form.detail"
                            :key="item.day"
                            class="tw-grid tw-grid-cols-6 tw-gap-5 tw-text-center tw-place-items-center"
                        >
                            <div class="tw-w-full -tw-mt-1">
                                <h1 class="tw-text-left tw-text-gray-600">
                                    {{ item.day }} {{ form.month_period.label }}
                                </h1>
                            </div>
                            <base-text
                                align="top"
                                v-model="item.disconnect_call"
                                dense
                            />
                            <base-text
                                align="top"
                                v-model="item.prank_call"
                                dense
                            />
                            <base-text
                                align="top"
                                v-model="item.education_call"
                                dense
                            />
                            <base-text
                                align="top"
                                v-model="item.emergency_call"
                                dense
                            />
                            <base-text
                                align="top"
                                v-model="item.abandoned"
                                dense
                            />
                        </div>
                    </section>

                    <div class="tw-flex tw-justify-center tw-mt-5 tw-gap-2">
                        <q-btn
                            unelevated
                            no-caps
                            label="Update"
                            color="secondary"
                            :disable="!form.month_period.label"
                            @click="confirmDialog = true"
                        />

                        <q-btn
                            flat
                            unelevated
                            no-caps
                            label="Cancel"
                            color="secondary"
                            :disable="!form.month_period.label"
                            @click="$router.back()"
                        />
                    </div>
                </q-form>
            </template>
        </base-card>
    </template>

    <base-confirmation-dialog
        v-model="confirmDialog"
        action="confirm_form"
        @onAction="handleAction"
    />
</template>
