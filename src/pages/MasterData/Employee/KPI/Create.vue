<script setup lang="ts">
import moment from 'moment'
import { Loading } from 'quasar'
import { api } from 'src/boot/axios'
import { Notification } from 'src/boot/notify'
import { IBreadcrumbs } from 'src/components/common/BaseTitle.vue'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

// common
const router = useRouter()

// data
const breadcrumbs = ref<IBreadcrumbs[]>([
    {
        title: 'Dashboard',
        href: 'dashboard-page',
        icon: 'Category2'
    },
    {
        title: 'Employees',
        href: 'employee-page',
        icon: 'UserOctagon'
    },
    {
        title: 'KPI',
        href: 'employee-kpi-page',
        icon: 'Activity'
    },
    {
        title: 'Create',
        href: '',
        icon: ''
    }
])
type FormSchema = {
    month_period: {
        label: string
        value: any
    }
    year: string
    day: string
    kinerja: any
    aktif: any
    loyal: any
    disiplin: any
    detail: any
}
const form = reactive<FormSchema>({
    month_period: {
        label: '',
        value: ''
    },
    year: '',
    day: '',
    detail: [],
    kinerja: [
        {
            tenang: '',
            cepat: '',
            dispatch: '',
            sosialisasi: ''
        },
        {
            tenang: '',
            cepat: '',
            dispatch: '',
            sosialisasi: ''
        }
    ],
    aktif: [
        {
            greating_opening: '',
            greating_closing: '',
            aktivitas: ''
        },
        {
            greating_opening: '',
            greating_closing: '',
            aktivitas: ''
        }
    ],
    loyal: [
        {
            loyal: ''
        },
        {
            loyal: ''
        }
    ],
    disiplin: [
        {
            telat: '',
            kebersihan: '',
            take_break: ''
        },
        {
            telat: '',
            kebersihan: '',
            take_break: ''
        }
    ]
})
const isSubmitted = ref<boolean>(false)
const activeStep = ref<number>(1)
const employees = ref([])

// Methods
const onSubmitPeriod = () => {
    isSubmitted.value = true
}
const onUpdateMonth = () => {
    isSubmitted.value = false
}
const fetchEmployees = async () => {
    try {
        const { data: response } = await api.get('/employees')

        if (response.data) {
            employees.value = response.data
            employees.value.map((item: any) => {
                form.detail.push({
                    employee_id: item.id,
                    name: item.name,
                    kinerja: {
                        tenang: 0,
                        cepat: 0,
                        dispatch: 0,
                        sosialisasi: 0
                    },
                    aktif: {
                        greating_opening: 0,
                        greating_closing: 0,
                        aktivitas: 0
                    },
                    loyal: 0,
                    disiplin: {
                        telat: 0,
                        kebersihan: 0,
                        take_break: 0
                    }
                })
            })
        }
    } catch (error) {
        console.log(error)
    }
}
const onSubmitEmployeeKPI = async () => {
    Loading.show({
        message: 'Please wait...'
    })

    try {
        const payload = {
            period: form.month_period.label,
            year: form.year,
            detail: form.detail.map((item: any) => {
                return {
                    employee_id: item.employee_id,
                    calm: item.kinerja.tenang,
                    fast: item.kinerja.cepat,
                    dispatch: item.kinerja.dispatch,
                    sosialization: item.kinerja.sosialisasi,
                    greating_opening: item.aktif.greating_opening,
                    greating_closing: item.aktif.greating_closing,
                    activity: item.aktif.aktivitas,
                    loyal: item.loyal,
                    late: item.disiplin.telat,
                    clean: item.disiplin.kebersihan,
                    take_break: item.disiplin.take_break
                }
            })
        }

        const { data: response } = await api.post('/employees-kpi', payload)

        if (response.data) {
            Notification(response.message, 'positive')

            router.push({
                name: 'employee-kpi-page'
            })
        }
    } catch (error) {
        console.log(error)
    } finally {
        Loading.hide()
    }
}

// Hooks
onMounted(() => {
    form.year = moment().format('YYYY')

    fetchEmployees()
})
</script>

<template>
    <base-title title="Employees KPI" :crumbs="breadcrumbs" />

    <base-card title="Create Employee KPI">
        <template #content>
            <q-form @submit="onSubmitPeriod" class="tw-space-y-3">
                <base-text
                    label="Year"
                    type="number"
                    v-model="form.year"
                    dense
                    :required="true"
                />

                <base-month
                    label="Month Period"
                    v-model="form.month_period"
                    @update:model-value="(val: any) => onUpdateMonth()"
                    :placeholder="form.month_period?.label"
                    dense
                    :required="true"
                />

                <div class="tw-flex tw-justify-center">
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

    <base-card v-if="isSubmitted" title="Input Employee KPI">
        <template #content>
            <q-stepper flat v-model="activeStep" ref="stepper" animated>
                <q-step
                    color="secondary"
                    :name="1"
                    title="Kinerja (40%)"
                    icon="settings"
                    :done="activeStep > 1"
                >
                    <section class="tw-space-y-5">
                        <template
                            v-for="row in form.detail"
                            :key="row.employee_id"
                        >
                            <div class="tw-space-y-3">
                                <h1 class="tw-font-semibold tw-text-lg">
                                    {{ row.name }}
                                </h1>

                                <div class="tw-grid tw-grid-cols-4 tw-gap-5">
                                    <base-text
                                        align="top"
                                        label="Tenang"
                                        v-model="row.kinerja.tenang"
                                        placeholder="ex: 85%"
                                        dense
                                    />
                                    <base-text
                                        align="top"
                                        label="Cepat"
                                        v-model="row.kinerja.cepat"
                                        placeholder="ex: 85%"
                                        dense
                                    />
                                    <base-text
                                        align="top"
                                        label="Dispatch"
                                        v-model="row.kinerja.dispatch"
                                        placeholder="ex: 85%"
                                        dense
                                    />
                                    <base-text
                                        align="top"
                                        label="Sosialisasi"
                                        v-model="row.kinerja.sosialisasi"
                                        placeholder="ex: 85%"
                                        dense
                                    />
                                </div>
                            </div>
                        </template>
                    </section>
                </q-step>

                <q-step
                    color="secondary"
                    :name="2"
                    title="Aktif (30%)"
                    icon="eva-activity-outline"
                    :done="activeStep > 2"
                >
                    <section class="tw-space-y-5">
                        <template
                            v-for="row in form.detail"
                            :key="row.employee_id"
                        >
                            <div class="tw-space-y-3">
                                <h1 class="tw-font-semibold tw-text-lg">
                                    {{ row.name }}
                                </h1>

                                <div class="tw-grid tw-grid-cols-3 tw-gap-5">
                                    <base-text
                                        align="top"
                                        label="Greating Opening"
                                        v-model="row.aktif.greating_opening"
                                        placeholder="ex: 85%"
                                        dense
                                    />
                                    <base-text
                                        align="top"
                                        label="Greating Closing"
                                        v-model="row.aktif.greating_closing"
                                        placeholder="ex: 85%"
                                        dense
                                    />
                                    <base-text
                                        align="top"
                                        label="Aktivitas"
                                        v-model="row.aktif.aktivitas"
                                        placeholder="ex: 85%"
                                        dense
                                    />
                                </div>
                            </div>
                        </template>
                    </section>
                </q-step>

                <q-step
                    color="secondary"
                    :name="3"
                    title="Loyal (10%)"
                    icon="eva-award-outline"
                    :done="activeStep > 3"
                >
                    <section class="tw-space-y-5">
                        <template
                            v-for="row in form.detail"
                            :key="row.employee_id"
                        >
                            <div class="tw-space-y-3">
                                <h1 class="tw-font-semibold tw-text-lg">
                                    {{ row.name }}
                                </h1>

                                <div class="tw-grid tw-grid-cols-1 tw-gap-5">
                                    <base-text
                                        label="Loyal"
                                        v-model="row.loyal"
                                        placeholder="ex: 85%"
                                        dense
                                    />
                                </div>
                            </div>
                        </template>
                    </section>
                </q-step>

                <q-step
                    color="secondary"
                    :name="4"
                    title="Disiplin (20%)"
                    icon="eva-briefcase-outline"
                    :done="activeStep > 4"
                >
                    <section class="tw-space-y-5">
                        <template
                            v-for="row in form.detail"
                            :key="row.employee_id"
                        >
                            <div class="tw-space-y-3">
                                <h1 class="tw-font-semibold tw-text-lg">
                                    {{ row.name }}
                                </h1>

                                <div class="tw-grid tw-grid-cols-3 tw-gap-5">
                                    <base-text
                                        align="top"
                                        label="Telat"
                                        v-model="row.disiplin.telat"
                                        placeholder="ex: 85%"
                                        dense
                                    />

                                    <base-text
                                        align="top"
                                        label="Kebersihan"
                                        v-model="row.disiplin.kebersihan"
                                        placeholder="ex: 85%"
                                        dense
                                    />

                                    <base-text
                                        align="top"
                                        label="Take Break"
                                        v-model="row.disiplin.take_break"
                                        placeholder="ex: 85%"
                                        dense
                                    />
                                </div>
                            </div>
                        </template>
                    </section>
                </q-step>

                <template v-slot:navigation>
                    <q-stepper-navigation>
                        <q-btn
                            v-if="activeStep <= 3"
                            unelevated
                            @click="$refs?.stepper?.next()"
                            color="info"
                            :label="activeStep === 4 ? 'Submit' : 'Continue'"
                        />
                        <q-btn
                            v-if="activeStep == 4"
                            unelevated
                            color="info"
                            label="Submit"
                            @click="onSubmitEmployeeKPI"
                        />
                        <q-btn
                            v-if="activeStep > 1"
                            flat
                            color="info"
                            @click="$refs?.stepper?.previous()"
                            label="Back"
                            class="q-ml-sm"
                        />
                    </q-stepper-navigation>
                </template>
            </q-stepper>
        </template>
    </base-card>
</template>
