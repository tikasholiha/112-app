<script setup lang="ts">
import * as XLSX from 'xlsx'
import moment from 'moment'
import { Loading, QTableColumn } from 'quasar'
import { api } from 'src/boot/axios'
import { Notification } from 'src/boot/notify'
import { IBreadcrumbs } from 'src/components/common/BaseTitle.vue'
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'

// types
interface FormSchema {
    call_date: string
    location: string
    latitude: number | null
    longitude: number | null
    phone_number: number
    duration: number
    status: string
    notes: string
}

// data
const confirmDialog = ref(false)
const searchKeyword = ref<string>('')
const tableColumns: QTableColumn[] = [
    {
        name: 'call_date',
        label: 'Call Date',
        align: 'left',
        field: (row: any) => moment(row.call_date).format('LL')
    },
    {
        name: 'location',
        label: 'Location',
        align: 'left',
        field: (row: any) => row.location
    },
    {
        name: 'phone_number',
        label: 'Phone Number',
        align: 'left',
        field: (row: any) => row.phone_number
    },
    {
        name: 'duration',
        label: 'Duration',
        align: 'left',
        field: (row: any) => row.duration
    },
    {
        name: 'status',
        label: 'Status',
        align: 'left',
        field: (row: any) => row.status
    },
    {
        name: 'notes',
        label: 'Notes',
        align: 'left',
        field: (row: any) => row.notes || '-'
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
            const concatStr = moment(item.call_date).format('LL')
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
        title: 'Test Calls',
        href: '',
        icon: 'CallReceived'
    }
])
const callID = ref<number>()
const tableLoading = ref<boolean>(false)
const createDialog = ref(false)
const datas = ref<any>({})
const form = reactive<FormSchema>({
    call_date: '',
    location: '',
    latitude: null,
    longitude: null,
    phone_number: 0,
    duration: 0,
    status: '',
    notes: ''
})
const mapContainer = ref()
const mapConfirm = ref<boolean>(false)
let map = ref()
const address = ref()
const marker = ref<any>(null)
const dateRange = ref<any>()
watch(
    dateRange,
    (newVal, oldVal) => {
        if (oldVal?.from) {
            fetchCallReport()
        }
    },
    {
        deep: true
    }
)

// methods
const fetchCallReport = async () => {
    try {
        tableLoading.value = true

        const params = new URLSearchParams()
        if (dateRange.value?.from && dateRange.value?.to) {
            params.append('from', dateRange.value?.from)
            params.append('to', dateRange.value?.to)
        }

        const { data: response } = await api.get('/test-calls', { params })

        if (response.data) {
            tableRows.value = response.data
        }
    } catch (error) {
        console.log(error)
    } finally {
        tableLoading.value = false
    }
}

const openCreateDialog = (data: FormSchema | any) => {
    if (data) {
        form.call_date = data.call_date
        form.location = data.location
        form.phone_number = data.phone_number
        form.duration = data.duration
        form.status = data.status
        form.notes = data.notes
        form.longitude = data.longitude
        form.latitude = data.latitude

        datas.value = data
    } else {
        form.call_date = moment().format('YYYY-MM-DD')
    }

    createDialog.value = true
}

const closeDialog = () => {
    createDialog.value = false

    datas.value = {}
    form.call_date = ''
    form.location = ''
    form.phone_number = 0
    form.duration = 0
    form.status = ''
    form.notes = ''
    form.longitude = null
    form.latitude = null
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
            `/test-calls/${callID.value}`
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

const onSubmitTestCall = async () => {
    Loading.show({
        message: 'Please wait...'
    })

    try {
        const payload = {
            call_date: form.call_date,
            location: form.location,
            latitude: String(form.latitude),
            longitude: String(form.longitude),
            phone_number: form.phone_number,
            duration: form.duration,
            status: form.status,
            notes: form.notes
        }

        if (datas.value?.id) {
            // Update Condition
            const { data: response } = await api.put(
                `/test-calls/${datas.value.id}`,
                payload
            )

            if (response.data) {
                Notification(response.message, 'positive')

                fetchCallReport()
                closeDialog()
            }
        } else {
            // Create Condition
            const { data: response } = await api.post('/test-calls', payload)

            if (response.data) {
                Notification(response.message, 'positive')

                fetchCallReport()
                closeDialog()
            }
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
        generateXLSX(tableRows.value)
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
            item.call_date,
            item.location,
            item.phone_number,
            item.duration,
            item.status,
            item.notes || '-'
        ]
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

    if (dateRange.value?.from && dateRange.value?.to) {
        const from = moment(dateRange.value?.from).format('LL')
        const to = moment(dateRange.value?.to).format('LL')

        XLSX.writeFile(workbook, `Test Call Reports ${from} - ${to}.xlsx`)
    } else {
        XLSX.writeFile(workbook, `Test Call Reports.xlsx`)
    }
}

const openMapDialog = () => {
    mapConfirm.value = true
    address.value = ''

    nextTick(() => {
        if (mapContainer.value) {
            // Initialize the map
            map.value = L.map(mapContainer.value).setView(
                [-6.1717253, 106.6402299],
                15
            )

            // Add a tile layer
            L.tileLayer(
                'http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}',
                {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap contributors'
                }
            ).addTo(map.value)

            // Invalidate the map size in case the container size changes
            setTimeout(() => {
                map.value.invalidateSize()
            }, 100)

            // Add a click event to get lat and long
            map.value.on('click', async (e: any) => {
                const { lat, lng } = e.latlng

                form.latitude = lat
                form.longitude = lng

                // Remove the existing marker if it exists
                if (marker.value) {
                    map.value.removeLayer(marker.value)
                }

                // Create a new marker at the clicked location
                marker.value = L.marker([lat, lng]).addTo(map.value)

                try {
                    Loading.show({
                        message: 'Please wait...'
                    })

                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
                    )
                    const data = await res.json()

                    if (data) {
                        console.log(data.display_name)
                        form.location = data.display_name
                        mapConfirm.value = false
                    }
                } catch (error) {
                    console.log(error)
                } finally {
                    Loading.hide()
                }
                // Call the reverse geocoding API

                // Update the address ref
                // address.value = data.display_name
            })
        }
    })
    // setTimeout(() => {
    // }, 1000)
}

const searchAddress = async () => {
    Loading.show({
        message: 'Searching Map Location....'
    })

    try {
        const response = await axios.get(
            'https://nominatim.openstreetmap.org/search',
            {
                params: {
                    q: address.value,
                    format: 'json',
                    addressdetails: 1
                }
            }
        )

        if (response.data.length > 0) {
            const location = response.data[0]
            const lat = parseFloat(location.lat)
            const lon = parseFloat(location.lon)

            marker.value = L.marker([lat, lon]).addTo(map.value) // Create a new marker

            map.value.setView([lat, lon], 13) // Move the map to the new position
        } else {
            alert('Address not found')
        }
    } catch (error) {
        console.error('Error searching for address:', error)
        Notification('Failed to search map location', 'negative')
    } finally {
        Loading.hide()
    }
}

// hooks
onMounted(() => {
    fetchCallReport()
})
</script>

<template>
    <base-title title="Test Calls" :crumbs="breadcrumbs" />

    <base-card title="Lists Test Calls">
        <template #action>
            <div class="tw-space-x-4">
                <q-btn
                    outline
                    no-caps
                    unelevated
                    color="info"
                    @click="openCreateDialog('')"
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
                <base-button-date-range v-model="dateRange" />
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
                <template #location="props">
                    <div class="tw-truncate tw-max-w-xs">
                        {{ props.row.location || '-' }}

                        <q-tooltip
                            v-if="props.row.location"
                            class="!tw-max-w-sm"
                        >
                            {{ props.row.location }}
                        </q-tooltip>
                    </div>
                </template>

                <template #notes="props">
                    <div class="tw-truncate tw-max-w-xs">
                        {{ props.row.notes || '-' }}
                    </div>
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
                                        @click="openCreateDialog(props.row)"
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

    <q-dialog v-model="createDialog" persistent>
        <q-card style="min-width: 750px">
            <q-card-section class="tw-p-8">
                <h1 class="tw-text-xl tw-font-semibold">
                    {{ !datas.id ? 'Create' : 'Edit' }} Test Calls
                </h1>

                <q-form @submit="onSubmitTestCall" class="q-gutter-md tw-mt-10">
                    <section class="tw-space-y-3">
                        <base-date
                            label="Call Date"
                            v-model="form.call_date"
                            dense
                            required
                        />
                        <base-text
                            label="Location"
                            v-model="form.location"
                            type="textarea"
                            required
                        />
                        <section
                            class="tw-flex tw-items-baseline tw-gap-x-3 tw-space-y-1 -tw-translate-y-3"
                        >
                            <div class="tw-w-40" />

                            <q-btn
                                flat
                                unelevated
                                no-caps
                                color="secondary"
                                @click="openMapDialog"
                            >
                                <base-icon icon-name="Map" class="tw-mr-3" />
                                <span>Open Map to Get Location</span>
                            </q-btn>
                        </section>
                        <base-text
                            v-if="form.latitude"
                            label="Latitude"
                            v-model="form.latitude"
                            required
                            dense
                        />
                        <base-text
                            v-if="form.longitude"
                            label="Longitude"
                            v-model="form.longitude"
                            required
                            dense
                        />
                        <base-text
                            label="Phone Number"
                            v-model="form.phone_number"
                            mask="#############"
                            dense
                            required
                        />
                        <base-text
                            label="Duration"
                            v-model.number="form.duration"
                            type="number"
                            dense
                            required
                            hint="In Minutes"
                        />
                        <base-select
                            label="Status"
                            v-model="form.status"
                            :options="[
                                {
                                    label: 'Terhubung',
                                    value: 'Terhubung'
                                },
                                {
                                    label: 'Tidak Terhubung',
                                    value: 'Tidak Terhubung'
                                },
                                {
                                    label: 'Terputus',
                                    value: 'Terputus'
                                },
                                {
                                    label: 'Note Service',
                                    value: 'Note Service'
                                },
                                {
                                    label: 'Sibuk',
                                    value: 'Sibuk'
                                }
                            ]"
                            emit-value
                            map-options
                            dense
                            :required="true"
                        />
                        <base-text
                            label="Notes"
                            v-model="form.notes"
                            type="textarea"
                        />
                    </section>

                    <div class="tw-flex tw-justify-center tw-gap-3">
                        <q-btn
                            unelevated
                            label="Submit"
                            type="submit"
                            color="secondary"
                        />
                        <q-btn
                            @click="closeDialog"
                            label="Cancel"
                            color="negative"
                            flat
                            class="q-ml-sm"
                        />
                    </div>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>

    <q-dialog v-model="mapConfirm" full-height full-width>
        <q-card>
            <q-card-section>
                <section class="tw-mb-5">
                    <q-form
                        @submit="searchAddress"
                        class="tw-flex tw-items-center tw-gap-5"
                    >
                        <base-text
                            align="top"
                            label="Search Address"
                            v-model="address"
                            dense
                            class="!tw-w-96"
                        />
                        <q-btn
                            type="submit"
                            unelevated
                            no-caps
                            color="secondary"
                            label="Search"
                            class="tw-translate-y-1.5"
                        />
                    </q-form>
                </section>
                <div id="map" ref="mapContainer"></div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<style scoped>
#map {
    height: 100vh; /* or specific value */
    width: 100%;
}
.leaflet-container {
    cursor: pointer;
}
</style>
