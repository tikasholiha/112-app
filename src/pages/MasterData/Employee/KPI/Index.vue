<script setup lang="ts">
import * as XLSX from 'xlsx'
import { Loading, QTableColumn } from 'quasar'
import { api } from 'src/boot/axios'
import { IBreadcrumbs } from 'src/components/common/BaseTitle.vue'
import { computed, onMounted, ref } from 'vue'
import { Notification } from 'src/boot/notify'

// data
const confirmDialog = ref(false)
const emergencyID = ref<number>(0)
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
        href: '',
        icon: ''
    }
])
const tableColumns: QTableColumn[] = [
    {
        name: 'period',
        label: 'Period',
        align: 'left',
        field: (row: any) => `${row.period} ${row.year}`
    },
    {
        name: 'employee_name',
        label: 'Employee Name',
        align: 'left',
        field: (row: any) => row.employee?.name || '-'
    },
    {
        name: 'kinerja',
        label: 'Kinerja (40%)',
        align: 'left',
        field: (row: any) => countAverage([row.calm, row.fast, row.dispatch])
    },
    {
        name: 'aktif',
        label: 'Aktif (30%)',
        align: 'left',
        field: (row: any) =>
            countAverage([
                row.greating_opening,
                row.greating_closing,
                row.activity
            ])
    },
    {
        name: 'loyal',
        label: 'Loyal (10%)',
        align: 'left',
        field: (row: any) => parseFloat(row.loyal).toFixed(1)
    },
    {
        name: 'disiplin',
        label: 'Disiplin (20%)',
        align: 'left',
        field: (row: any) => countAverage([row.late, row.clean, row.take_break])
    },
    {
        name: 'total_nilai',
        label: 'Total Nilai',
        align: 'left',
        field: (row: any) => row.total_nilai
    },
    {
        name: 'grade',
        label: 'Grade',
        align: 'left',
        field: (row: any) => row.grade
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
            if (
                item.employee.name
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
const tableLoading = ref(false)
const searchKeyword = ref<string>('')

// methods
const fetchEmployeeKPI = async () => {
    try {
        const { data: response } = await api.get('/employees-kpi')

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
        onDeleteEmployeeKPI()
    } else {
        emergencyID.value = 0
    }
}

const onDeleteEmployeeKPI = async () => {
    Loading.show({
        message: 'Please wait...'
    })

    try {
        const { data: response } = await api.delete(
            `/employees-kpi/${emergencyID.value}`
        )

        if (response.data) {
            Notification(response.message, 'positive')
            fetchEmployeeKPI()
        }
    } catch (error) {
        console.log(error)
    } finally {
        Loading.hide()
    }
}

const countAverage = (num: number[]) => {
    const count = num.length
    const sum = num.reduce((acc, num) => acc + num, 0)

    return (sum / count).toFixed(1)
}

const calculateTotalNilai = (row: any) => {
    const kinerja: any = countAverage([
        row.calm,
        row.fast,
        row.dispatch,
        row.sosialization
    ])
    const aktif: any = countAverage([
        row.greating_opening,
        row.greating_closing,
        row.activity
    ])
    const loyal: any = row.loyal
    const disiplin: any = countAverage([row.late, row.clean, row.take_break])

    return kinerja * 0.4 + aktif * 0.3 + loyal * 0.1 + disiplin * 0.2
}

const calculateGrade = (row: any) => {
    const nilai = calculateTotalNilai(row)
    let grade

    if (nilai <= 60) {
        grade = 'D'
    } else if (nilai <= 70) {
        grade = 'C'
    } else if (nilai <= 80) {
        grade = 'B'
    } else if (nilai <= 100) {
        grade = 'A'
    }

    return grade
}

const onExportData = async () => {
    generateXLSX(tableRows.value)
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
            `${item.period} ${item.year}`,
            item.employee?.name,
            countAverage([item.calm, item.fast, item.dispatch]),
            countAverage([
                item.greating_opening,
                item.greating_closing,
                item.activity
            ]),
            parseFloat(item.loyal).toFixed(1),
            countAverage([item.late, item.clean, item.take_break]),
            calculateTotalNilai(item).toFixed(2),
            calculateGrade(item)
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
        { wch: 10 }
    ]

    // Create a workbook and add the worksheet
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

    XLSX.writeFile(workbook, `Employee KPI.xlsx`)
}

// hooks
onMounted(() => {
    fetchEmployeeKPI()
})
</script>

<template>
    <base-title title="Employees KPI" :crumbs="breadcrumbs" />

    <base-card title="Lists KPI by Period">
        <template #action>
            <div class="tw-space-x-4">
                <q-btn
                    outline
                    no-caps
                    unelevated
                    color="info"
                    :to="{
                        name: 'employee-create-kpi-page'
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
                    <router-link
                        :to="{
                            name: 'employee-kpi-detail-page',
                            query: {
                                period: props.row.period,
                                year: props.row.year
                            }
                        }"
                    >
                        <div
                            class="tw-underline tw-cursor-pointer tw-text-teal-600"
                        >
                            {{ props.row.period }} {{ props.row.year }}
                        </div>
                    </router-link>
                </template>

                <template #total_nilai="props">
                    {{ calculateTotalNilai(props.row).toFixed(2) }}
                </template>

                <template #grade="props">
                    <q-badge
                        color="accent"
                        :label="calculateGrade(props.row)"
                    />
                </template>

                <template #action="props">
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
                                        name: 'employee-edit-page',
                                        params: {
                                            id: '123'
                                        }
                                    }"
                                    class="tw-hidden"
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
