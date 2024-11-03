<template>
    <section class="tw-h-screen tw-w-full tw-grid tw-place-content-center">
        <q-btn
            unelevated
            color="primary"
            icon="check"
            label="OK"
            @click="openDialog"
        />
    </section>

    <q-dialog v-model="confirm" full-height full-width>
        <q-card>
            <q-card-section>
                <div id="map" ref="mapContainer"></div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import L from 'leaflet'
import { Loading } from 'quasar'

import 'leaflet/dist/leaflet.css'

const mapContainer = ref()
const confirm = ref(false)

let map
const openDialog = () => {
    confirm.value = true

    setTimeout(() => {
        nextTick(() => {
            if (mapContainer.value) {
                // Initialize the map
                map = L.map(mapContainer.value).setView([-6.2088, 106.8456], 10)

                // Add a tile layer
                L.tileLayer(
                    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    {
                        maxZoom: 19,
                        attribution: '© OpenStreetMap contributors'
                    }
                ).addTo(map)

                // Invalidate the map size in case the container size changes
                setTimeout(() => {
                    map.invalidateSize()
                }, 100)

                // Add a click event to get lat and long
                map.on('click', async (e) => {
                    const { lat, lng } = e.latlng

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
    }, 1000)
}

onMounted(() => {})
</script>

<style scoped>
#map {
    height: 100vh; /* or specific value */
    width: 100%;
}
.leaflet-container {
    cursor: pointer;
}
</style>
