<script setup lang="ts">
import moment from 'moment'
import { QTableColumn } from 'quasar'
import { api } from 'src/boot/axios'
import { IBreadcrumbs } from 'src/components/common/BaseTitle.vue'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

// common
const route = useRoute()

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
        title: 'KPI',
        href: '',
        icon: ''
    }
])
const tableRows = ref<any>([])

// methods
const fetchEmployeeKPI = async () => {
    try {
        const params = new URLSearchParams()
        params.append('period', String(route.query.period))
        params.append('year', String(route.query.year))

        const { data: response } = await api.get('/employees-kpi', { params })

        if (response.data) {
            tableRows.value = response.data
        }
    } catch (error) {
        console.log(error)
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

// hooks
onMounted(() => {
    fetchEmployeeKPI()
})
</script>

<template>
    <base-title title="Employees KPI" :crumbs="breadcrumbs" />

    <base-card
        :title="`Lists Employee KPI from ${$route.query.period} ${$route.query.year}`"
    >
        <template #content>
            <q-markup-table flat bordered>
                <thead>
                    <tr>
                        <th
                            rowspan="2"
                            class="!tw-bg-gray-100 tw-font-medium !tw-text-sm !tw-border-r"
                        >
                            Name
                        </th>
                        <th
                            colspan="4"
                            class="!tw-bg-gray-100 tw-font-medium !tw-text-sm"
                        >
                            Kinerja (40%)
                        </th>
                        <th
                            colspan="3"
                            class="!tw-bg-gray-100 tw-font-medium !tw-text-sm !tw-border-l"
                        >
                            Aktif (30%)
                        </th>
                        <th
                            rowspan="2"
                            class="!tw-bg-gray-100 tw-font-medium !tw-text-sm !tw-border-l !tw-border-r"
                        >
                            Loyal (10%)
                        </th>
                        <th
                            colspan="3"
                            class="!tw-bg-gray-100 tw-font-medium !tw-text-sm !tw-border-r"
                        >
                            Disiplin (20%)
                        </th>
                        <th
                            rowspan="2"
                            class="!tw-bg-gray-100 tw-font-medium !tw-text-sm !tw-border-r"
                        >
                            Total Nilai
                        </th>
                        <th
                            rowspan="2"
                            class="!tw-bg-gray-100 tw-font-medium !tw-text-sm !tw-border-r"
                        >
                            Grade
                        </th>
                    </tr>
                    <tr>
                        <th class="!tw-bg-gray-100 tw-font-medium !tw-text-sm">
                            Tenang
                        </th>
                        <th
                            class="!tw-bg-gray-100 tw-font-medium !tw-text-sm !tw-border-l"
                        >
                            Cepat
                        </th>
                        <th
                            class="!tw-bg-gray-100 tw-font-medium !tw-text-sm !tw-border-l"
                        >
                            Dispatch
                        </th>
                        <th
                            class="!tw-bg-gray-100 tw-font-medium !tw-text-sm !tw-border-l"
                        >
                            Sosialisasi
                        </th>
                        <th
                            class="!tw-bg-gray-100 tw-font-medium !tw-text-sm !tw-border-l"
                        >
                            Greating Opening
                        </th>
                        <th
                            class="!tw-bg-gray-100 tw-font-medium !tw-text-sm !tw-border-l"
                        >
                            Greating Closing
                        </th>
                        <th
                            class="!tw-bg-gray-100 tw-font-medium !tw-text-sm !tw-border-l"
                        >
                            Aktivitas
                        </th>
                        <th class="!tw-bg-gray-100 tw-font-medium !tw-text-sm">
                            Telat
                        </th>
                        <th
                            class="!tw-bg-gray-100 tw-font-medium !tw-text-sm !tw-border-l"
                        >
                            Kebersihan
                        </th>
                        <th
                            class="!tw-bg-gray-100 tw-font-medium !tw-text-sm !tw-border-l !tw-border-r"
                        >
                            Take Break
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(row, i) in tableRows" :key="i">
                        <tr>
                            <td rowspan="3" class="!tw-border-r">
                                {{ row.employee?.name }}
                            </td>
                        </tr>
                        <tr class="!tw-text-center">
                            <td class="!tw-border-r">
                                {{ row.calm }}
                            </td>
                            <td class="!tw-border-r">
                                {{ row.fast }}
                            </td>
                            <td class="!tw-border-r">
                                {{ row.dispatch }}
                            </td>
                            <td class="!tw-border-r">
                                {{ row.sosialization || '-' }}
                            </td>
                            <td class="!tw-border-r">
                                {{ row.greating_opening }}
                            </td>
                            <td class="!tw-border-r">
                                {{ row.greating_closing }}
                            </td>
                            <td class="!tw-border-r">
                                {{ row.activity }}
                            </td>
                            <td class="!tw-border-r">{{ row.loyal }}</td>
                            <td class="!tw-border-r">
                                {{ row.late }}
                            </td>
                            <td class="!tw-border-r">
                                {{ row.clean }}
                            </td>
                            <td>{{ row.take_break }}</td>
                            <td rowspan="2" class="!tw-border-l">
                                {{ calculateTotalNilai(row) }}
                            </td>
                            <td rowspan="2" class="!tw-border-l">
                                <q-badge
                                    color="yellow-4"
                                    text-color="black"
                                    :label="calculateGrade(row)"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td
                                colspan="4"
                                class="tw-text-center tw-font-bold !tw-border-r"
                            >
                                {{
                                    countAverage([
                                        row.calm,
                                        row.fast,
                                        row.dispatch
                                    ])
                                }}
                            </td>
                            <td
                                colspan="3"
                                class="tw-text-center tw-font-bold !tw-border-r"
                            >
                                {{
                                    countAverage([
                                        row.greating_opening,
                                        row.greating_closing,
                                        row.activity
                                    ])
                                }}
                            </td>
                            <td
                                class="tw-text-center tw-font-bold !tw-border-r"
                            >
                                {{ row.loyal.toFixed(1) }}
                            </td>
                            <td colspan="3" class="tw-text-center tw-font-bold">
                                {{
                                    countAverage([
                                        row.late,
                                        row.clean,
                                        row.take_break
                                    ])
                                }}
                            </td>
                        </tr>
                    </template>
                </tbody>
            </q-markup-table>
        </template>
    </base-card>
</template>
