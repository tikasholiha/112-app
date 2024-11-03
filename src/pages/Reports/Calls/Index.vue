<script setup lang="ts">
import * as XLSX from 'xlsx'
import { Loading, QTableColumn } from 'quasar'
import { api } from 'src/boot/axios'
import { Notification } from 'src/boot/notify'
import { IBreadcrumbs } from 'src/components/common/BaseTitle.vue'
import { computed, onMounted, ref } from 'vue'

// data
const confirmDialog = ref(false)
const searchKeyword = ref<string>('')
const tableColumns: QTableColumn[] = [
    {
        name: 'period',
        label: 'Period',
        align: 'left',
        field: (row: any) => row.period
    },
    {
        name: 'disconnect_call',
        label: 'Disconnect Calls',
        align: 'left',
        field: (row: any) => row.total_disconnect_call
    },
    {
        name: 'prank_call',
        label: 'Prank Calls',
        align: 'left',
        field: (row: any) => row.total_prank_call
    },
    {
        name: 'education_call',
        label: 'Education Calls',
        align: 'left',
        field: (row: any) => row.total_education_call
    },
    {
        name: 'emergency_call',
        label: 'Emergency Calls',
        align: 'left',
        field: (row: any) => row.total_emergency_call
    },
    {
        name: 'abandoned',
        label: 'Abandoned',
        align: 'left',
        field: (row: any) => row.total_abandoned
    },
    {
        name: 'action',
        label: 'Action',
        align: 'left',
        field: ''
    }
]
const tableRows = ref([])
const filteredTableRows = computed(() => {
    if (searchKeyword.value) {
        return tableRows.value.filter((item: any) => {
            const concatStr = `${item.month_period} ${item.year}`
            console.log(concatStr)
            if (
                concatStr
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
        title: 'Call Reports',
        href: '',
        icon: 'Headphones'
    }
])
const callID = ref<number>()
const tableLoading = ref<boolean>(false)

// methods
const fetchCallReport = async () => {
    try {
        tableLoading.value = true

        const { data: response } = await api.get('/call-reports')

        if (response.data) {
            tableRows.value = response.data
        }
    } catch (error) {
        console.log(error)
    } finally {
        tableLoading.value = false
    }
}

const openDeleteDialog = (id: number) => {
    callID.value = id

    confirmDialog.value = true
}

const handleAction = (val: boolean) => {
    confirmDialog.value = false
    if (val) {
        onDeleteCallReport()
    } else {
        callID.value = 0
    }
}

const onDeleteCallReport = async () => {
    Loading.show({
        message: 'Please wait...'
    })

    try {
        const { data: response } = await api.delete(
            `/call-reports/${callID.value}`
        )

        if (response.data) {
            Notification(response.message, 'positive')
            fetchCallReport()
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
        const { data: response } = await api.get('/call-reports/export')

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
    const headers = [
        'Day',
        'Disconnect Calls',
        'Prank Calls',
        'Education Calls',
        'Emergency Calls',
        'Abandoned'
    ]

    const rows = data.flatMap((item: any) => {
        return item.detail.map((x: any) => {
            return [
                `${x.day} ${item.month_period} ${item.year}`, // Period
                x.disconnect_call, // Disconnect Calls
                x.prank_call, // Prank Calls
                x.education_call, // Education Calls
                x.emergency_call, // Emergency Calls
                x.abandoned // Abandoned
            ]
        })
    })

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])

    worksheet['!cols'] = [
        { wch: 20 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 }
    ]

    // Create a workbook and add the worksheet
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

    XLSX.writeFile(workbook, `Call Reports.xlsx`)
}

// hooks
onMounted(() => {
    fetchCallReport()
})
</script>

<template>
    <base-title title="Call Reports" :crumbs="breadcrumbs" />

    <base-card title="Lists Call Reports">
        <template #action>
            <div class="tw-space-x-4">
                <q-btn
                    outline
                    no-caps
                    unelevated
                    color="info"
                    :to="{
                        name: 'call-report-create-page'
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
                color="secondary"
                label="Search"
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
                :loading="tableLoading"
                row-key="name"
            >
                <template #period="props">
                    <q-td>
                        <router-link
                            :to="{
                                name: 'call-report-edit-page',
                                params: {
                                    id: props.row.id || 0
                                }
                            }"
                        >
                            <div
                                class="tw-underline tw-cursor-pointer"
                            >
                                {{ props.row.month_period }}
                                {{ props.row.year }}
                            </div>
                        </router-link>
                    </q-td>
                </template>

                <template #action="props">
                    <q-td>
                        <q-btn flat no-caps unelevated color="secondary">
                            <base-icon icon-name="More" size="16" />

                            <q-menu
                                anchor="bottom end"
                                self="top end"
                                class="tw-shadow-lg tw-shadow-gray-50"
                            >
                                <q-list style="min-width: 100px">
                                    <q-item
                                        clickable
                                        :to="{
                                            name: 'call-report-edit-page',
                                            params: {
                                                id: props.row.id || 0
                                            }
                                        }"
                                    >
                                        <q-item-section
                                            class="tw-flex-row tw-gap-3 tw-items-center tw-justify-start"
                                        >
                                            <base-icon
                                                icon-name="Edit"
                                                class="text-warning"
                                            />
                                            <span>Edit</span>
                                        </q-item-section>
                                    </q-item>
                                    <q-separator />
                                    <q-item
                                        clickable
                                        @click="openDeleteDialog(props.row.id)"
                                    >
                                        <q-item-section
                                            class="tw-flex-row tw-gap-3 tw-items-center tw-justify-start"
                                        >
                                            <base-icon
                                                icon-name="Trash"
                                                class="text-negative"
                                            />

                                            <span>Delete</span>
                                        </q-item-section>
                                    </q-item>
                                </q-list>
                            </q-menu>
                        </q-btn>
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
