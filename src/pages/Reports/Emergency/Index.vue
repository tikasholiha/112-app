<script setup lang="ts">
import * as XLSX from 'xlsx'
import { Loading, QTableColumn } from 'quasar'
import { api } from 'src/boot/axios'
import { IBreadcrumbs } from 'src/components/common/BaseTitle.vue'
import { computed, onMounted, ref } from 'vue'
import { Notification } from 'src/boot/notify'

// data
const searchKeyword = ref<string>('')
const tableColumns: QTableColumn[] = [
    {
        name: 'period',
        label: 'Period',
        align: 'left',
        field: (row: any) => row.period
    },
    {
        name: 'kecelakaan',
        label: 'Kecelakaan',
        align: 'left',
        field: (row: any) => row.kecelakaan
    },
    {
        name: 'kebakaran',
        label: 'Kebakaran',
        align: 'left',
        field: (row: any) => row.kebakaran
    },
    {
        name: 'ambulan_gratis',
        label: 'Ambulan Gratis & Medis (AGD)',
        align: 'left',
        field: (row: any) => row.ambulan_gratis
    },
    {
        name: 'pln',
        label: 'PLN',
        align: 'left',
        field: (row: any) => row.pln
    },
    {
        name: 'mobil_jenazah',
        label: 'Mobil jenazah',
        align: 'left',
        field: (row: any) => row.mobil_jenazah
    },
    {
        name: 'penanganan_hewan',
        label: 'Penanganan Pada Hewan',
        align: 'left',
        field: (row: any) => row.penanganan_hewan
    },
    {
        name: 'keamanan',
        label: 'Keamanan dan Ketertiban',
        align: 'left',
        field: (row: any) => row.keamanan
    },
    {
        name: 'kriminal',
        label: 'Kriminal',
        align: 'left',
        field: (row: any) => row.kriminal
    },
    {
        name: 'bencana_alam',
        label: 'Bencana Alam',
        align: 'left',
        field: (row: any) => row.bencana_alam
    },
    {
        name: 'kdrt',
        label: 'KDRT',
        align: 'left',
        field: (row: any) => row.kdrt
    },
    {
        name: 'gelandangan_tanpa_identitas',
        label: 'Gelandangan - Orang Tanpa Identitas',
        align: 'left',
        field: (row: any) => row.gelandangan_tanpa_identitas
    },
    {
        name: 'pipa_pdam_bocor',
        label: 'Pipa PDAM yang bocor',
        align: 'left',
        field: (row: any) => row.pipa_pdam_bocor
    },
    {
        name: 'odgj',
        label: 'ODGJ',
        align: 'left',
        field: (row: any) => row.odgj
    },
    {
        name: 'percobaan_bunuh_diri',
        label: 'Percobaan Bunuh Diri',
        align: 'left',
        field: (row: any) => row.percobaan_bunuh_diri
    },
    {
        name: 'oli_tumpah',
        label: 'Oli / Tanah tumpah di Jalan',
        align: 'left',
        field: (row: any) => row.oli_tumpah
    },
    {
        name: 'kabel_menjuntai',
        label: 'Kabel Menjuntai',
        align: 'left',
        field: (row: any) => row.kabel_menjuntai
    },
    {
        name: 'mobil_derek',
        label: 'Mobil Derek',
        align: 'left',
        field: (row: any) => row.mobil_derek
    },
    {
        name: 'tiang_rubuh',
        label: '⁠Tiang rubuh',
        align: 'left',
        field: (row: any) => row.tiang_rubuh
    },
    {
        name: 'terkunci_dirumah',
        label: 'Terkunci di dalam Rumah',
        align: 'left',
        field: (row: any) => row.terkunci_dirumah
    },
    {
        name: 'reklame_rubuh',
        label: 'Reklame yang Rubuh',
        align: 'left',
        field: (row: any) => row.reklame_rubuh
    },
    {
        name: 'orang_tenggelam',
        label: 'Orang Tenggelam',
        align: 'left',
        field: (row: any) => row.orang_tenggelam
    }
]
const tableRows = ref([])
const filteredTableRows = computed(() => {
    if (searchKeyword.value) {
        return tableRows.value.filter((item: any) => {
            if (
                item.period
                    .toLowerCase()
                    .includes(searchKeyword.value.toLowerCase())
            ) {
                return item
            }
        })
    } else {
        return tableRows.value
    }
})
const breadcrumbs = ref<IBreadcrumbs[]>([
    {
        title: 'Dashboard',
        href: 'dashboard-page',
        icon: 'Category2'
    },
    {
        title: 'Emergency Reports',
        href: '',
        icon: 'Brodcast'
    }
])
const confirmDialog = ref(false)
const emergencyID = ref<number>(0)

// methods
const fetchEmergencyReports = async () => {
    try {
        const { data: response } = await api.get('/emergency-reports')

        if (response.data) {
            tableRows.value = response.data
        }
    } catch (error) {
        console.log(error)
    }
}

const openDeleteDialog = (id: number) => {
    emergencyID.value = id

    confirmDialog.value = true
}

const handleAction = (val: boolean) => {
    confirmDialog.value = false
    if (val) {
        onDeleteCallReport()
    } else {
        emergencyID.value = 0
    }
}

const onDeleteCallReport = async () => {
    Loading.show({
        message: 'Please wait...'
    })

    try {
        const { data: response } = await api.delete(
            `/emergency-reports/${emergencyID.value}`
        )

        if (response.data) {
            Notification(response.message, 'positive')
            fetchEmergencyReports()
        }
    } catch (error) {
        console.log(error)
    } finally {
        Loading.hide()
    }
}

const onExportData = async () => {
    Loading.show({
        message: 'Please wait....'
    })

    try {
        const { data: response } = await api.get('/emergency-reports/export')

        if (response.data) {
            generateXLSX(response.data)
        }
    } catch (error) {
        console.log(error)
    } finally {
        Loading.hide()
    }
}

const generateXLSX = (data: any) => {
    const headers = tableColumns
        .filter((item) => {
            if (item.name != 'action') {
                return item.label
            }
        })
        .map((item) => item.label)

    const rows = data.map((item: any) => {
        return [
            item.period,
            item.district.name,
            item.kecelakaan,
            item.kebakaran,
            item.ambulan_gratis,
            item.pln,
            item.mobil_jenazah,
            item.penanganan_hewan,
            item.keamanan,
            item.kriminal,
            item.bencana_alam,
            item.kdrt,
            item.gawat_darurat_lain
        ]
    })

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])

    worksheet['!cols'] = [
        { wch: 20 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 }
    ]

    // Create a workbook and add the worksheet
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

    XLSX.writeFile(workbook, `Emergency Reports.xlsx`)
}

// hooks
onMounted(() => {
    fetchEmergencyReports()
})
</script>

<template>
    <base-title title="Emergency Reports" :crumbs="breadcrumbs" />

    <base-card title="Lists Emergency Reports">
        <template #action>
            <div class="tw-space-x-4">
                <q-btn
                    outline
                    no-caps
                    unelevated
                    color="info"
                    :to="{
                        name: 'emergency-report-create-page'
                    }"
                >
                    <base-icon
                        icon-name="AddSquare"
                        size="16"
                        class="tw-mr-3"
                    />
                    Create New
                </q-btn>

                <q-btn
                    outline
                    no-caps
                    unelevated
                    color="negative"
                    @click="onExportData"
                >
                    <base-icon
                        icon-name="DocumentDownload"
                        size="16"
                        class="tw-mr-3"
                    />
                    Export Data
                </q-btn>
            </div>

            <q-input
                filled
                v-model="searchKeyword"
                type="text"
                label="Search District"
                color="secondary"
                dense
            >
                <template #prepend>
                    <base-icon icon-name="SearchStatus" class="tw-mr-2" />
                </template>
            </q-input>
        </template>

        <template #content>
            <base-table
                :columns="tableColumns"
                :rows="filteredTableRows"
                row-key="name"
            >
                <template #period="props">
                    <q-td>
                        <router-link
                            :to="{
                                name: 'emergency-report-detail-page',
                                params: {
                                    period: props.row.period,
                                    year: props.row.year
                                }
                            }"
                            class="tw-underline tw-cursor-pointer"
                        >
                            {{ props.row.period }} {{ props.row.year }}
                        </router-link>
                    </q-td>
                </template>
            </base-table>
        </template>
    </base-card>

    <base-confirmation-dialog
        v-model="confirmDialog"
        action="delete"
        @onAction="handleAction"
    />
</template>
