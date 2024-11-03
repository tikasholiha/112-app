<script setup lang="ts">
import html2PDF from 'jspdf-html2canvas'
import moment from 'moment'
import { Loading } from 'quasar'
import { api } from 'src/boot/axios'
import { onMounted, reactive, ref, watch } from 'vue'

// types
type CallStats = {
    disconnect_call?: number
    prank_call?: number
    education_call?: number
    emergency_call?: number
    abandoned?: number
}

type CallData = {
    by_month: CallStats
    by_year: CallStats
    total: any
}

// data
const filterRef = ref<any>()
const dateRange = ref<any>({})
watch(
    dateRange,
    () => {
        console.log('aksdlsak')
        fetchDashboard()
    },
    {
        deep: true
    }
)
const stats = ref<CallData>({
    by_month: {},
    by_year: {},
    total: []
})
const series = ref([
    {
        name: 'Total Panggilan',
        data: []
    }
])
const barSeries = ref([
    {
        name: 'Total Panggilan',
        data: []
    }
])
const chartOptions = ref({
    chart: {
        height: 350,
        type: 'line',
        zoom: {
            enabled: false
        }
    },
    colors: ['#C0504D'],
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'straight'
    },
    grid: {
        row: {
            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
            opacity: 0.5
        }
    },
    xaxis: {
        type: 'datetime',
        labels: {
            formatter: function (value: any) {
                return moment(value).format('DD MMM') // Format tanggal: 01 Jan, 02 Jan, dst.
            }
        },
        tickAmount: 10
    }
})

const barChartOptions = ref({
    chart: {
        height: 350,
        type: 'line',
        zoom: {
            enabled: false
        }
    },
    dataLabels: {
        enabled: false
    },
    colors: ['#4F81BD'],
    grid: {
        row: {
            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
            opacity: 0.5
        }
    }
})

// methods
const fetchDashboard = async () => {
    Loading.show({
        message: 'Please wait...'
    })

    try {
        const payload = {
            month_period: moment(dateRange.value?.from).format('MMMM'),
            year: moment(dateRange.value?.from).format('YYYY')
        }

        const { data: response } = await api.post(
            '/dashboard/call-reports',
            payload
        )

        if (response.data) {
            stats.value = response.data
            if (filterRef.value.Day == 'Tahun Ini') {
                series.value[0].data = response.data.grafik_year
                barSeries.value[0].data = response.data.bar_grafik_year
            } else {
                series.value[0].data = response.data.grafik_month
                barSeries.value[0].data = response.data.bar_grafik_month
            }
        }
    } catch (error) {
        console.log(error)
    } finally {
        Loading.hide()
    }
}

const printPDF = async () => {
    try {
        const content = document.getElementById('content')
        const buttons = document.querySelectorAll('.hiddenButton')

        if (!content) {
            console.error('Content element not found.')
            return
        }

        // Store the original display style of each button and hide them
        const buttonDisplayStyles: string[] = []
        buttons.forEach((button) => {
            const buttonElement = button as HTMLElement
            buttonDisplayStyles.push(buttonElement.style.display)
            buttonElement.style.display = 'none'
        })

        // Generate the PDF
        await html2PDF(content, {
            jsPDF: {
                unit: 'pt',
                format: 'a4'
            },
            html2canvas: {
                scrollX: 0,
                scrollY: -window.scrollY
            },
            imageType: 'image/jpeg',
            margin: {
                top: 15,
                right: 15,
                bottom: 15,
                left: 15
            },
            // pagebreak: { mode: ['avoid-all', 'css'] },
            output: `Dashboard Call Reports.pdf`
        })

        // Restore the original display style of each button
        buttons.forEach((button, index) => {
            const buttonElement = button as HTMLElement
            buttonElement.style.display = buttonDisplayStyles[index] || ''
        })
    } catch (error) {
        console.error('Error generating PDF:', error)
    }
}

// hooks
onMounted(() => {
    fetchDashboard()
})
</script>

<template>
    <section id="content">
        <base-title title="Dashboard Panggilan">
            <div class="tw-space-x-4">
                <base-filter-date-range
                    ref="filterRef"
                    v-model="dateRange"
                    class="hiddenButton"
                />
                <q-btn
                    @click="printPDF"
                    unelevated
                    color="negative"
                    class="tw-capitalize tw-rounded tw-px-4 tw-py-2 hiddenButton"
                >
                    <base-icon icon-name="DocumentText" size="22" />
                    <div class="tw-ml-2">Export Data</div>
                </q-btn>
            </div>
        </base-title>

        <main
            v-if="filterRef?.Day != 'Tahun Ini'"
            class="tw-my-5 tw-grid tw-grid-cols-5 tw-gap-5"
        >
            <q-card flat class="tw-border-l-8 tw-border-l-[#9BBB59]">
                <q-card-section>
                    <h4 class="text-h4 tw-text-[#9BBB59] tw-font-semibold">
                        {{ stats.by_month.disconnect_call }}
                    </h4>
                    <div class="tw-text-[#9BBB59]">Disconnect</div>
                </q-card-section>
            </q-card>

            <q-card flat class="tw-border-l-8 tw-border-l-[#4BACC6]">
                <q-card-section>
                    <h4 class="text-h4 tw-text-[#4BACC6] tw-font-semibold">
                        {{ stats.by_month.prank_call }}
                    </h4>
                    <div class="tw-text-[#4BACC6]">Prank</div>
                </q-card-section>
            </q-card>

            <q-card flat class="tw-border-l-8 tw-border-l-[#F79646]">
                <q-card-section>
                    <h4 class="text-h4 tw-text-[#F79646] tw-font-semibold">
                        {{ stats.by_month.education_call }}
                    </h4>
                    <div class="tw-text-[#F79646]">Education</div>
                </q-card-section>
            </q-card>

            <q-card flat class="tw-border-l-8 tw-border-l-[#C0504D]">
                <q-card-section>
                    <h4 class="text-h4 tw-text-[#C0504D] tw-font-semibold">
                        {{ stats.by_month.emergency_call }}
                    </h4>
                    <div class="tw-text-[#C0504D]">Emergency</div>
                </q-card-section>
            </q-card>

            <q-card flat class="tw-border-l-8 tw-border-l-[#8064A2]">
                <q-card-section>
                    <h4 class="text-h4 tw-text-[#8064A2] tw-font-semibold">
                        {{ stats.by_month.abandoned }}
                    </h4>
                    <div class="tw-text-[#8064A2]">Abandoned</div>
                </q-card-section>
            </q-card>
        </main>

        <main class="tw-my-5 tw-grid tw-grid-cols-5 tw-gap-5">
            <q-card flat class="tw-border-l-8 tw-border-l-[#9BBB59]">
                <q-card-section>
                    <h4 class="text-h4 tw-text-[#9BBB59] tw-font-semibold">
                        {{ stats.by_year.disconnect_call }}
                    </h4>
                    <div class="tw-text-[#9BBB59]">Total Disconnect</div>
                </q-card-section>
            </q-card>

            <q-card flat class="tw-border-l-8 tw-border-l-[#4BACC6]">
                <q-card-section>
                    <h4 class="text-h4 tw-text-[#4BACC6] tw-font-semibold">
                        {{ stats.by_year.prank_call }}
                    </h4>
                    <div class="tw-text-[#4BACC6]">Total Prank</div>
                </q-card-section>
            </q-card>

            <q-card flat class="tw-border-l-8 tw-border-l-[#F79646]">
                <q-card-section>
                    <h4 class="text-h4 tw-text-[#F79646] tw-font-semibold">
                        {{ stats.by_year.education_call }}
                    </h4>
                    <div class="tw-text-[#F79646]">Total Education</div>
                </q-card-section>
            </q-card>

            <q-card flat class="tw-border-l-8 tw-border-l-[#C0504D]">
                <q-card-section>
                    <h4 class="text-h4 tw-text-[#C0504D] tw-font-semibold">
                        {{ stats.by_year.emergency_call }}
                    </h4>
                    <div class="tw-text-[#C0504D]">Total Emergency</div>
                </q-card-section>
            </q-card>

            <q-card flat class="tw-border-l-8 tw-border-l-[#8064A2]">
                <q-card-section>
                    <h4 class="text-h4 tw-text-[#8064A2] tw-font-semibold">
                        {{ stats.by_year.abandoned }}
                    </h4>
                    <div class="tw-text-[#8064A2]">Total Abandoned</div>
                </q-card-section>
            </q-card>
        </main>

        <main class="tw-grid tw-grid-cols-5 tw-gap-5">
            <base-card
                :title="`Grafik Panggilan Harian ${filterRef?.Day}`"
                class="tw-col-span-3"
            >
                <template #content>
                    <apexchart
                        type="line"
                        height="350"
                        :options="chartOptions"
                        :series="series"
                    />
                </template>
            </base-card>

            <base-card
                :title="`Rincian Panggilan ${filterRef?.Day}`"
                class="tw-col-span-2"
            >
                <template #content>
                    <apexchart
                        type="bar"
                        height="350"
                        :options="barChartOptions"
                        :series="barSeries"
                    />
                </template>
            </base-card>
        </main>

        <base-card
            title="Total Keseluruhan Panggilan Tahun 2024"
            class="tw-col-span-3"
        >
            <template #content>
                <q-markup-table flat>
                    <thead>
                        <tr>
                            <th
                                class="text-left !tw-bg-gray-100 tw-font-medium !tw-text-sm"
                            >
                                Month Period
                            </th>
                            <th
                                class="!tw-bg-gray-100 tw-font-medium !tw-text-sm"
                            >
                                Disconnect Calls
                            </th>
                            <th
                                class="!tw-bg-gray-100 tw-font-medium !tw-text-sm"
                            >
                                Prank Calls
                            </th>
                            <th
                                class="!tw-bg-gray-100 tw-font-medium !tw-text-sm"
                            >
                                Education Calls
                            </th>
                            <th
                                class="!tw-bg-gray-100 tw-font-medium !tw-text-sm"
                            >
                                Emergency Calls
                            </th>
                            <th
                                class="!tw-bg-gray-100 tw-font-medium !tw-text-sm"
                            >
                                Abandoned
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="item in stats.total">
                            <tr>
                                <td
                                    class="text-left tw-font-semibold tw-text-teal-600"
                                >
                                    {{ item.month_period }}
                                </td>
                                <td class="text-center">
                                    {{ item.total_disconnect_call }}
                                </td>
                                <td class="text-center">
                                    {{ item.total_prank_call }}
                                </td>
                                <td class="text-center">
                                    {{ item.total_education_call }}
                                </td>
                                <td class="text-center">
                                    {{ item.total_emergency_call }}
                                </td>
                                <td class="text-center">
                                    {{ item.total_abandoned }}
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </q-markup-table>
            </template>
        </base-card>
    </section>
</template>
