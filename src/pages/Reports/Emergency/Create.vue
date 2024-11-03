<script setup lang="ts">
import { computed, onMounted, reactive, ref, toRef, watch } from 'vue'
import { IBreadcrumbs } from 'src/components/common/BaseTitle.vue'
import moment from 'moment'
import { Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { Notification } from 'src/boot/notify'
import { useRoute, useRouter } from 'vue-router'

type FormSchema = {
    month_period: {
        label: string
        value: any
    }
    year: string
    district_id: any
    day: any
    detail: {
        district_id: number
        kecelakaan: number
        kebakaran: number
        ambulan_gratis: number
        pln: number
        mobil_jenazah: number
        penanganan_hewan: number
        keamanan: number
        kriminal: number
        bencana_alam: number
        kdrt: number
        gelandangan_tanpa_identitas: number
        pipa_pdam_bocor: number
        odgj: number
        percobaan_bunuh_diri: number
        oli_tumpah: number
        kabel_menjuntai: number
        mobil_derek: number
        tiang_rubuh: number
        terkunci_dirumah: number
        reklame_rubuh: number
        orang_tenggelam: number
    }[]
}
const router = useRouter()
const route = useRoute()

// data
const breadcrumbs = ref<IBreadcrumbs[]>([
    {
        title: 'Dashboard',
        href: 'dashboard-page',
        icon: 'Category2'
    },
    {
        title: 'Emergency Reports',
        href: 'emergency-report-page',
        icon: 'Brodcast'
    },
    {
        title: 'Create',
        href: '',
        icon: ''
    }
])
const form = reactive<FormSchema>({
    month_period: {
        label: '',
        value: ''
    },
    day: '',
    year: '',
    district_id: [],
    detail: []
})
const isSubmitted = ref<boolean>(false)
const optDistrict = ref<{ label: string; value: number }[]>([])
const confirmDialog = ref(false)
const confirmCheckDialog = ref(false)

// methods
const onSubmitPeriod = () => {
    form.day = moment(new Date(`${form.year}-${form.month_period.value}-01`))
        .endOf('month')
        .format('D')

    isSubmitted.value = true

    form.detail = []

    form.district_id.map((x: any) => {
        form.detail.push({
            district_id: x,
            kecelakaan: 0,
            kebakaran: 0,
            ambulan_gratis: 0,
            pln: 0,
            mobil_jenazah: 0,
            penanganan_hewan: 0,
            keamanan: 0,
            kriminal: 0,
            bencana_alam: 0,
            kdrt: 0,
            gelandangan_tanpa_identitas: 0,
            pipa_pdam_bocor: 0,
            odgj: 0,
            percobaan_bunuh_diri: 0,
            oli_tumpah: 0,
            kabel_menjuntai: 0,
            mobil_derek: 0,
            tiang_rubuh: 0,
            terkunci_dirumah: 0,
            reklame_rubuh: 0,
            orang_tenggelam: 0
        })
    })

    localStorage.setItem('temp_emergency_reports', JSON.stringify(form))
}

const onSubmitEmergencyReport = async () => {
    try {
        const monthYearString = `${form.month_period.label} ${form.year}`

        const firstDate = moment(monthYearString, 'MMMM YYYY')
            .startOf('month')
            .format('YYYY-MM-DD')

        const { data: response } = await api.post('/emergency-reports', {
            period: form.month_period.label,
            period_date: firstDate,
            year: form.year,
            detail: form.detail
        })

        if (response.data) {
            Notification(response.message, 'positive')

            if (route.query.code && route.query.month) {
                form.month_period.label = String(route.query.month)
                form.month_period.value = route.query.code

                router.back()
            } else {
                router.push({
                    name: 'emergency-report-page'
                })
            }

            localStorage.removeItem('temp_emergency_reports')
        }
    } catch (error) {
        console.log(error)
    }
}

const handleAction = (val: boolean) => {
    confirmDialog.value = false

    if (val) {
        onSubmitEmergencyReport()
    }
}

const handleCheckLocalData = (val: boolean) => {
    confirmCheckDialog.value = false

    if (val) {
        isSubmitted.value = true
        const temp = JSON.parse(
            localStorage.getItem('temp_emergency_reports') ?? ''
        ) as FormSchema

        form.day = temp.day
        form.month_period = temp.month_period
        form.year = temp.year
        form.detail = temp.detail
        form.district_id = temp.district_id
    }
}

const fetchDistrict = async () => {
    try {
        const { data: response } = await api.get('/districts')

        if (response.data) {
            optDistrict.value = response.data
                .filter((item: any) => {
                    if (route.query.district_ids) {
                        let ids: any = route.query.district_ids
                        ids = ids.split(',')
                        return !ids.includes(String(item.id))
                    } else {
                        return item
                    }
                })
                .map((x: { name: string; id: number }) => {
                    return {
                        label: x.name,
                        value: x.id
                    }
                })
        }
    } catch (error) {}
}

const onValueChange = () => {
    localStorage.setItem('temp_emergency_reports', JSON.stringify(form))
}

// hooks
onMounted(() => {
    form.year = moment().format('YYYY')

    fetchDistrict()

    if (route.query.code && route.query.month) {
        form.month_period.label = String(route.query.month)
        form.month_period.value = route.query.code
    }

    if (localStorage.getItem('temp_emergency_reports')) {
        confirmCheckDialog.value = true
    }
})
</script>

<template>
    <base-title title="Emergency Reports" :crumbs="breadcrumbs" />

    <base-card
        title="Create Emergency Reports"
        subtitle="Input Year, Month and Kecamatan"
    >
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
                    :placeholder="form.month_period?.label"
                    dense
                    :required="true"
                />

                <base-select
                    label="Kecamatan"
                    v-model="form.district_id"
                    :options="optDistrict"
                    map-options
                    emit-value
                    dense
                    multiple
                    use-chips
                    clearable
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

    <template v-if="isSubmitted">
        <base-card
            v-for="item in form.detail"
            :key="item.district_id"
            :title="`Kecamatan : ${
                optDistrict.find((x: any) => x.value == item.district_id)?.label
            }`"
            subtitle="Input Reports"
        >
            {{ item }}
            <template #content>
                <q-form>
                    <section class="tw-grid tw-grid-cols-4 tw-gap-5">
                        <base-text
                            align="top"
                            label="Kecelakaan"
                            v-model="item.kecelakaan"
                            @update:model-value="(val:any) => onValueChange()"
                            dense
                        />
                        <base-text
                            align="top"
                            label="Kebakaran"
                            v-model="item.kebakaran"
                            @update:model-value="(val:any) => onValueChange()"
                            dense
                        />
                        <base-text
                            align="top"
                            label="Ambulan Gratis & Medis (AGD)"
                            v-model="item.ambulan_gratis"
                            @update:model-value="(val:any) => onValueChange()"
                            dense
                        />
                        <base-text
                            align="top"
                            label="PLN"
                            v-model="item.pln"
                            @update:model-value="(val:any) => onValueChange()"
                            dense
                        />
                        <base-text
                            align="top"
                            label="Mobil jenazah"
                            v-model="item.mobil_jenazah"
                            @update:model-value="(val:any) => onValueChange()"
                            dense
                        />
                        <base-text
                            align="top"
                            label="Penanganan Pada Hewan"
                            v-model="item.penanganan_hewan"
                            @update:model-value="(val:any) => onValueChange()"
                            dense
                        />
                        <base-text
                            align="top"
                            label="Keamanan dan Ketertiban"
                            v-model="item.keamanan"
                            @update:model-value="(val:any) => onValueChange()"
                            dense
                        />
                        <base-text
                            align="top"
                            label="Kriminal"
                            v-model="item.kriminal"
                            @update:model-value="(val:any) => onValueChange()"
                            dense
                        />
                        <base-text
                            align="top"
                            label="Bencana Alam"
                            v-model="item.bencana_alam"
                            @update:model-value="(val:any) => onValueChange()"
                            dense
                        />
                        <base-text
                            align="top"
                            label="KDRT"
                            v-model="item.kdrt"
                            @update:model-value="(val:any) => onValueChange()"
                            dense
                        />
                        <base-text
                            align="top"
                            label="Gelandangan - Orang Tanpa Identitas"
                            v-model="item.gelandangan_tanpa_identitas"
                            @update:model-value="(val:any) => onValueChange()"
                            dense
                        />
                        <base-text
                            align="top"
                            label="Pipa PDAM yang bocor"
                            v-model="item.pipa_pdam_bocor"
                            @update:model-value="(val:any) => onValueChange()"
                            dense
                        />
                        <base-text
                            align="top"
                            label="⁠ODGJ"
                            v-model="item.odgj"
                            @update:model-value="(val:any) => onValueChange()"
                            dense
                        />
                        <base-text
                            align="top"
                            label="⁠Percobaan Bunuh Diri"
                            v-model="item.percobaan_bunuh_diri"
                            @update:model-value="(val:any) => onValueChange()"
                            dense
                        />
                        <base-text
                            align="top"
                            label="⁠Oli / Tanah tumpah di Jalan"
                            v-model="item.oli_tumpah"
                            @update:model-value="(val:any) => onValueChange()"
                            dense
                        />
                        <base-text
                            align="top"
                            label="⁠Kabel Menjuntai"
                            v-model="item.kabel_menjuntai"
                            @update:model-value="(val:any) => onValueChange()"
                            dense
                        />
                        <base-text
                            align="top"
                            label="⁠Mobil Derek"
                            v-model="item.mobil_derek"
                            @update:model-value="(val:any) => onValueChange()"
                            dense
                        />
                        <base-text
                            align="top"
                            label="⁠Tiang rubuh"
                            v-model="item.tiang_rubuh"
                            @update:model-value="(val:any) => onValueChange()"
                            dense
                        />
                        <base-text
                            align="top"
                            label="Terkunci di dalam Rumah"
                            v-model="item.terkunci_dirumah"
                            @update:model-value="(val:any) => onValueChange()"
                            dense
                        />
                        <base-text
                            align="top"
                            label="⁠Reklame yang Rubuh"
                            v-model="item.reklame_rubuh"
                            @update:model-value="(val:any) => onValueChange()"
                            dense
                        />
                        <base-text
                            align="top"
                            label="⁠Orang Tenggelam"
                            v-model="item.orang_tenggelam"
                            @update:model-value="(val:any) => onValueChange()"
                            dense
                        />
                    </section>
                </q-form>
            </template>
        </base-card>

        <div class="tw-flex tw-justify-center tw-mt-5 tw-gap-2">
            <q-btn
                unelevated
                no-caps
                label="Submit"
                type="submit"
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
    </template>

    <base-confirmation-dialog
        v-model="confirmDialog"
        action="confirm_form"
        @onAction="handleAction"
    />

    <base-confirmation-dialog
        v-model="confirmCheckDialog"
        action="check_data"
        @onAction="handleCheckLocalData"
    />
</template>
