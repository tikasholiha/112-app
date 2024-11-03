<script setup lang="ts">
import html2PDF from 'jspdf-html2canvas'
import moment from 'moment'
import { Loading } from 'quasar'
import { api } from 'src/boot/axios'
import { computed, onMounted, reactive, ref, watch } from 'vue'

// data
const dateRange = ref<any>({})
watch(
    dateRange,
    (newVal, oldVal) => {
        if (oldVal?.from) {
            fetchDashboard()
        }
    },
    {
        deep: true
    }
)
const form = reactive({
    month_period: {
        label: '',
        value: ''
    },
    kecamatan: ''
})
const series = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
const districtSeries = ref([])
const chartOptions = reactive({
    chart: {
        width: 380,
        type: 'donut'
    },
    colors: [
        '#FF5733', // Kasus Kecelakaan
        '#C70039', // Kasus Kebakaran
        '#900C3F', // Kasus Ambulan
        '#581845', // Kasus PLN
        '#1C2833', // Kasus Mobil
        '#2E86C1', // Kasus Penanganan
        '#28B463', // Kasus Kriminal
        '#F1C40F', // Kasus Bencana
        '#E67E22', // Kasus Gawat
        '#8E44AD', // Kasus KDRT
        '#34495E', // Kasus Keamanan
        '#34495E',
        '#FF5733',
        '#C70039',
        '#900C3F',
        '#581845',
        '#1C2833',
        '#2E86C1',
        '#28B463',
        '#F1C40F',
        '#8E44AD',
        '#E67E22'
    ],
    dataLabels: {
        enabled: true
        // style: {
        //     fontSize: '22px', // Increase the font size
        //     fontWeight: 'bold' // Optional: make the text bold
        // },
        // formatter: function (val: any, opts: any) {
        //     // const label = opts.w.globals.labels[opts.seriesIndex]
        //     const value = opts.w.globals.series[opts.seriesIndex]
        //     return value
        // }
    },
    labels: [
        'Kecelakaan',
        'Kebakaran',
        'Ambulan Gratis & Medis',
        'PLN',
        'Mobil Jenazah',
        'Penanganan Hewan',
        'Kriminal',
        'Bencana Alam',
        'KDRT',
        'Keamanan & Ketertiban',
        'Gelandangan - Orang Tanpa Identitas',
        'Pipa PDAM yang bocor ',
        '⁠ODGJ',
        '⁠Percobaan Bunuh Diri',
        '⁠Oli / Tanah tumpah di Jalan',
        '⁠Kabel Menjuntai',
        '⁠Mobil Derek',
        '⁠Tiang rubuh',
        'Terkunci di dalam Rumah',
        '⁠Reklame yang Rubuh',
        '⁠Orang Tenggelam'
    ],
    legend: {
        show: true, // This hides the legend (right label),
        position: 'bottom'
    },
    responsive: [
        {
            breakpoint: 480,
            options: {
                chart: {
                    width: 200
                },
                legend: {
                    show: false // This hides the legend (right label)
                }
            }
        }
    ]
})
const chartOptionsDistrict = reactive({
    chart: {
        width: 380,
        type: 'donut'
    },
    // colors: [
    //     '#FF5733', // Kasus Kecalakaan
    //     '#C70039', // Kasus Kebakaran
    //     '#900C3F', // Kasus Ambulan
    //     '#581845', // Kasus PLN
    //     '#1C2833', // Kasus Mobil
    //     '#2E86C1', // Kasus Penanganan
    //     '#28B463', // Kasus Kriminal
    //     '#F1C40F', // Kasus Bencana
    //     '#E67E22', // Kasus Gawat
    //     '#8E44AD', // Kasus KDRT
    //     '#34495E' // Kasus Keamanan
    // ],
    dataLabels: {
        enabled: true
        // style: {
        //     fontSize: '22px', // Increase the font size
        //     fontWeight: 'bold' // Optional: make the text bold
        // },
        // formatter: function (val: any, opts: any) {
        //     const value = opts.w.globals.series[opts.seriesIndex]
        //     return value
        // }
    },
    labels: [],
    legend: {
        show: true, // This hides the legend (right label),
        position: 'bottom'
    },
    responsive: [
        {
            breakpoint: 480,
            options: {
                chart: {
                    width: 200
                },
                legend: {
                    show: false // This hides the legend (right label)
                }
            }
        }
    ]
})
const stats = computed(() => {
    return [
        {
            label: 'Kecelakaan',
            color: '#FF5733',
            value: series.value[0]
        },
        { label: 'Kebakaran', color: '#C70039', value: series.value[1] },
        {
            label: 'Ambulan Gratis & Medis ',
            color: '#900C3F',
            value: series.value[2]
        },
        { label: 'PLN', color: '#581845', value: series.value[3] },
        { label: 'Mobil Jenazah', color: '#1C2833', value: series.value[4] },
        { label: 'Penanganan Hewan', color: '#2E86C1', value: series.value[5] },
        {
            label: 'Keamanan & Ktertiban',
            color: '#34495E',
            value: series.value[6]
        },
        { label: 'Kriminal', color: '#28B463', value: series.value[7] },
        { label: 'Bencana Alam', color: '#F1C40F', value: series.value[8] },
        { label: 'KDRT', color: '#8E44AD', value: series.value[9] },
        {
            label: 'Gelandangan - Orang Tanpa Identitas',
            color: '#34495E',
            value: series.value[10]
        },
        {
            label: 'Pipa PDAM yang bocor ',
            value: series.value[11],
            color: '#FF5733'
        },
        { label: '⁠ODGJ', value: series.value[12], color: '#C70039' },
        {
            label: '⁠Percobaan Bunuh Diri',
            value: series.value[13],
            color: '#900C3F'
        },
        {
            label: '⁠Oli / Tanah tumpah di Jalan',
            value: series.value[14],
            color: '#581845'
        },
        {
            label: '⁠Kabel Menjuntai',
            value: series.value[15],
            color: '#1C2833'
        },
        { label: '⁠Mobil Derek', value: series.value[16], color: '#2E86C1' },
        { label: '⁠Tiang rubuh', value: series.value[17], color: '#28B463' },
        {
            label: 'Terkunci di dalam Rumah',
            value: series.value[18],
            color: '#F1C40F'
        },
        {
            label: ' ⁠Reklame yang Rubuh',
            value: series.value[19],
            color: '#E67E22'
        },
        {
            label: ' ⁠Orang Tenggelam',
            value: series.value[20],
            color: '#8E44AD'
        },
        {
            label: 'Total Result',
            color: '#0d1b2a',
            value: series.value.reduce((a, b) => a + b, 0)
        }
    ]
})
const loadingState = ref(false)
const optDistricts = ref<any>([])
const filterRef = ref<any>()

// methods
const fetchDashboard = async () => {
    try {
        loadingState.value = true
        Loading.show({
            message: 'Please wait...'
        })

        const payload = {
            from: moment(dateRange.value?.from).format('MM'),
            to: moment(dateRange.value?.to).format('MM'),
            month_period: moment(dateRange.value?.from).format('MM'),
            year: moment(dateRange.value?.from).format('YYYY'),
            district_id: form.kecamatan
        }

        const { data: response } = await api.post(
            '/dashboard/emergency-reports',
            payload
        )

        if (response.data) {
            series.value = Object.values(response.data.by_month)
            chartOptionsDistrict.labels = response.data.by_year.label
            districtSeries.value = response.data.by_year.series
        }
    } catch (error) {
        console.log(error)
    } finally {
        Loading.hide()
        loadingState.value = false
    }
}

const fetchDistricts = async () => {
    try {
        Loading.show({
            message: 'Please wait...'
        })

        const { data: response } = await api.get('/districts')

        if (response.data) {
            optDistricts.value = response.data.map((item: any) => {
                return {
                    label: item.name,
                    value: item.id
                }
            })

            form.kecamatan = optDistricts.value[0]?.value
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
            output: `Dashboard Emergency Reports.pdf`
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
    fetchDistricts().then(() => {
        fetchDashboard()
    })
})
</script>

<template>
    <section id="content">
        <base-title title="Jumlah Gawat Darurat">
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

        <base-card title="Filter">
            <template #content>
                <base-select
                    label="Kecamatan"
                    v-model="form.kecamatan"
                    @update:model-value="fetchDashboard"
                    :options="optDistricts"
                    map-options
                    emit-value
                    dense
                    :required="true"
                />
            </template>
        </base-card>

        <section v-if="!loadingState">
            <main class="tw-grid tw-grid-cols-12 tw-gap-5 tw-my-5">
                <div class="tw-col-span-12 tw-grid tw-grid-cols-3 tw-gap-5">
                    <template v-for="item in stats" :key="stats.label">
                        <q-card
                            flat
                            class="tw-border-l-8"
                            :style="{
                                borderLeftColor: `${item.color}`
                            }"
                        >
                            <q-card-section>
                                <h4
                                    class="text-h4 tw-font-semibold"
                                    :style="{
                                        color: `${item.color}`
                                    }"
                                >
                                    {{ item.value }}
                                </h4>
                                <div
                                    :style="{
                                        color: `${item.color}`
                                    }"
                                >
                                    {{ item.label }}
                                </div>
                            </q-card-section>
                        </q-card>
                    </template>
                </div>
            </main>

            <main class="tw-grid tw-grid-cols-12 tw-gap-5">
                <base-card
                    title="Grand Total"
                    class="tw-col-span-6 !tw-mt-0 tw-h-full"
                >
                    <template #content>
                        <div
                            class="tw-flex tw-justify-center tw-items-center tw-h-full"
                        >
                            <apexchart
                                type="pie"
                                :options="chartOptions"
                                :series="series"
                                class="tw-w-full !tw-mb-10"
                            />
                        </div>
                    </template>
                </base-card>

                <base-card
                    title="Grand Total All Kecamatan"
                    class="tw-col-span-6 !tw-mt-0 tw-h-full"
                >
                    <template #content>
                        <div
                            class="tw-flex tw-justify-center tw-items-center tw-h-full"
                        >
                            <apexchart
                                type="pie"
                                :options="chartOptionsDistrict"
                                :series="districtSeries"
                                class="tw-w-full !tw-mb-10"
                            />
                        </div>
                    </template>
                </base-card>
            </main>
        </section>
    </section>
</template>
