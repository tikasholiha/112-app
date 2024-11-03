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
            form.detail.gelandangan_tanpa_identitas =
                response.data.gelandangan_tanpa_identitas
            form.detail.pipa_pdam_bocor = response.data.pipa_pdam_bocor
            form.detail.odgj = response.data.odgj
            form.detail.percobaan_bunuh_diri =
                response.data.percobaan_bunuh_diri
            form.detail.oli_tumpah = response.data.oli_tumpah
            form.detail.kabel_menjuntai = response.data.kabel_menjuntai
            form.detail.mobil_derek = response.data.mobil_derek
            form.detail.tiang_rubuh = response.data.tiang_rubuh
            form.detail.terkunci_dirumah = response.data.terkunci_dirumah
            form.detail.reklame_rubuh = response.data.reklame_rubuh
            form.detail.orang_tenggelam = response.data.orang_tenggelam
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
                gelandangan_tanpa_identitas:
                    form.detail.gelandangan_tanpa_identitas,
                pipa_pdam_bocor: form.detail.pipa_pdam_bocor,
                odgj: form.detail.odgj,
                percobaan_bunuh_diri: form.detail.percobaan_bunuh_diri,
                oli_tumpah: form.detail.oli_tumpah,
                kabel_menjuntai: form.detail.kabel_menjuntai,
                mobil_derek: form.detail.mobil_derek,
                tiang_rubuh: form.detail.tiang_rubuh,
                terkunci_dirumah: form.detail.terkunci_dirumah,
                reklame_rubuh: form.detail.reklame_rubuh,
                orang_tenggelam: form.detail.orang_tenggelam
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
                        label="Gelandangan - Orang Tanpa Identitas"
                        v-model="form.detail.gelandangan_tanpa_identitas"
                        dense
                    />
                    <base-text
                        align="top"
                        label="Pipa PDAM yang bocor"
                        v-model="form.detail.pipa_pdam_bocor"
                        dense
                    />
                    <base-text
                        align="top"
                        label="⁠ODGJ"
                        v-model="form.detail.odgj"
                        dense
                    />
                    <base-text
                        align="top"
                        label="⁠Percobaan Bunuh Diri"
                        v-model="form.detail.percobaan_bunuh_diri"
                        dense
                    />
                    <base-text
                        align="top"
                        label="⁠Oli / Tanah tumpah di Jalan"
                        v-model="form.detail.oli_tumpah"
                        dense
                    />
                    <base-text
                        align="top"
                        label="⁠Kabel Menjuntai"
                        v-model="form.detail.kabel_menjuntai"
                        dense
                    />
                    <base-text
                        align="top"
                        label="⁠Mobil Derek"
                        v-model="form.detail.mobil_derek"
                        dense
                    />
                    <base-text
                        align="top"
                        label="⁠Tiang rubuh"
                        v-model="form.detail.tiang_rubuh"
                        dense
                    />
                    <base-text
                        align="top"
                        label="Terkunci di dalam Rumah"
                        v-model="form.detail.terkunci_dirumah"
                        dense
                    />
                    <base-text
                        align="top"
                        label="⁠Reklame yang Rubuh"
                        v-model="form.detail.reklame_rubuh"
                        dense
                    />
                    <base-text
                        align="top"
                        label="⁠Orang Tenggelam"
                        v-model="form.detail.orang_tenggelam"
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
