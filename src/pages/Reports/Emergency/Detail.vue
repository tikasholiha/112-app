<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { IBreadcrumbs } from 'src/components/common/BaseTitle.vue'
import moment from 'moment'
import { Loading, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { useRoute, useRouter } from 'vue-router'
import { Notification } from 'src/boot/notify'

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
        gawat_darurat_lain: number
    }
}

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
        title: 'Emergency Reports',
        href: 'emergency-report-page',
        icon: 'Brodcast'
    },
    {
        title: 'Edit',
        href: '',
        icon: ''
    }
])
const form = reactive<FormSchema>({
    month_period: { label: '', value: '' },
    year: '',
    day: '',
    detail: {
        district_id: 0,
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
        gawat_darurat_lain: 0
    },
    district_id: []
})
const emergencyData = ref<any>({})

// methods
const fetchEmergencyDetail = async () => {
    Loading.show({
        message: 'Please wait...'
    })

    try {
        const { data: response } = await api.get(
            `/emergency-reports/${route.params.id}`
        )

        if (response.data) {
            emergencyData.value = response.data

            form.year = response.data.year
            form.month_period.label = response.data.period
            form.detail.kecelakaan = response.data.kecelakaan
            form.detail.kebakaran = response.data.kebakaran
            form.detail.ambulan_gratis = response.data.ambulan_gratis
            form.detail.pln = response.data.pln
            form.detail.mobil_jenazah = response.data.mobil_jenazah
            form.detail.penanganan_hewan = response.data.penanganan_hewan
            form.detail.keamanan = response.data.keamanan
            form.detail.kriminal = response.data.kriminal
            form.detail.bencana_alam = response.data.bencana_alam
            form.detail.kdrt = response.data.kdrt
            form.detail.gawat_darurat_lain = response.data.gawat_darurat_lain
        }
    } catch (error) {
        console.log(error)
    } finally {
        Loading.hide()
    }
}

const onSubmitEmergencyReport = async () => {
    try {
        const { data: response } = await api.put(
            `/emergency-reports/${route.params.id}`,
            {
                period: form.month_period.label,
                year: form.year,
                district_id: emergencyData.value?.district_id,
                kecelakaan: form.detail.kecelakaan,
                kebakaran: form.detail.kebakaran,
                ambulan_gratis: form.detail.ambulan_gratis,
                pln: form.detail.pln,
                mobil_jenazah: form.detail.mobil_jenazah,
                penanganan_hewan: form.detail.penanganan_hewan,
                keamanan: form.detail.keamanan,
                kriminal: form.detail.kriminal,
                bencana_alam: form.detail.bencana_alam,
                kdrt: form.detail.kdrt,
                gawat_darurat_lain: form.detail.gawat_darurat_lain
            }
        )

        if (response.data) {
            Notification(response.message, 'positive')

            router.push({
                name: 'emergency-report-page'
            })
        }
    } catch (error) {
        console.log(error)
    }
}

// hooks
onMounted(() => {
    form.year = moment().format('YYYY')
    fetchEmergencyDetail()
})
</script>

<template>
    <base-title title="Emergency Reports" :crumbs="breadcrumbs" />

    <base-card
        title="Update Emergency Reports"
        subtitle="Input Year, Month and Kecamatan"
    >
        <template #content>
            <div class="tw-space-y-3">
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
            </div>
        </template>
    </base-card>

    <base-card :title="emergencyData?.district?.name" subtitle="Input Reports">
        <template #content>
            <q-form @submit="onSubmitEmergencyReport">
                <section class="tw-grid tw-grid-cols-4 tw-gap-5">
                    <base-text
                        align="top"
                        label="Kecelakaan"
                        v-model="form.detail.kecelakaan"
                        dense
                    />
                    <base-text
                        align="top"
                        label="Kebakaran"
                        v-model="form.detail.kebakaran"
                        dense
                    />
                    <base-text
                        align="top"
                        label="Ambulan Gratis & Medis (AGD)"
                        v-model="form.detail.ambulan_gratis"
                        dense
                    />
                    <base-text
                        align="top"
                        label="PLN"
                        v-model.number="form.detail.pln"
                        dense
                    />
                    <base-text
                        align="top"
                        label="Mobil jenazah"
                        v-model="form.detail.mobil_jenazah"
                        dense
                    />
                    <base-text
                        align="top"
                        label="Penanganan Pada Hewan"
                        v-model="form.detail.penanganan_hewan"
                        dense
                    />
                    <base-text
                        align="top"
                        label="Keamanan dan Ketertiban"
                        v-model="form.detail.keamanan"
                        dense
                    />
                    <base-text
                        align="top"
                        label="Kriminal"
                        v-model="form.detail.kriminal"
                        dense
                    />
                    <base-text
                        align="top"
                        label="Bencana Alam"
                        v-model="form.detail.bencana_alam"
                        dense
                    />
                    <base-text
                        align="top"
                        label="KDRT"
                        v-model="form.detail.kdrt"
                        dense
                    />
                    <base-text
                        align="top"
                        label="Gawat Darurat Lain"
                        v-model="form.detail.gawat_darurat_lain"
                        dense
                    />
                </section>

                <div class="tw-flex tw-justify-center tw-mt-5 tw-gap-2">
                    <q-btn
                        unelevated
                        no-caps
                        label="Submit"
                        type="submit"
                        color="secondary"
                        :disable="!form.month_period.label"
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
