<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { IBreadcrumbs } from 'src/components/common/BaseTitle.vue'
import moment from 'moment'
import { api, form_data } from 'src/boot/axios'
import { Notification } from 'src/boot/notify'
import { useRouter } from 'vue-router'
import { Loading } from 'quasar'

type FormSchema = {
    name: string
    jasnita_number: string
    education: string
    employment_status: string
    gender: string
    dob: string
    marital_status_id: string
    religion_id: string
    address: string
    avatar: any
}

// common
const router = useRouter()

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
        title: 'Create',
        href: '',
        icon: ''
    }
])
const form = reactive<FormSchema>({
    name: '',
    jasnita_number: '',
    education: '',
    employment_status: '',
    gender: '',
    dob: '',
    marital_status_id: '',
    religion_id: '',
    address: '',
    avatar: ''
})
const master_data = reactive<any>({
    marital_status: [],
    gender: [
        {
            label: 'Male',
            value: 'Male'
        },
        {
            label: 'Female',
            value: 'Female'
        }
    ],
    status: [
        {
            label: '(ASN) Aparatur Sipil Negara',
            value: '(ASN) Aparatur Sipil Negara'
        },
        {
            label: '(THL) Tenaga Harian Lepas',
            value: '(THL) Tenaga Harian Lepas'
        },
        {
            label: 'P3K',
            value: 'P3K'
        },
        {
            label: 'Tenaga Ahli',
            value: 'Tenaga Ahli'
        },
        {
            label: 'Tenaga Pendukung',
            value: 'Tenaga Pendukung'
        }
    ],
    education: [
        {
            label: 'Strata 1',
            value: 'Strata 1'
        },
        {
            label: 'Strata 2',
            value: 'Strata 2'
        },
        {
            label: 'Strata 3',
            value: 'Strata 3'
        },
        {
            label: 'Diploma 1',
            value: 'Diploma 1'
        },
        {
            label: 'Diploma 2',
            value: 'Diploma 2'
        },
        {
            label: 'Diploma 3',
            value: 'Diploma 3'
        },
        {
            label: 'SMK / SMA',
            value: 'SMK / SMA'
        }
    ],
    religions: []
})
const isSubmitted = ref<boolean>(false)

// methods
const fetchMasterData = async (url: string, destination: any) => {
    try {
        const { data: response } = await api.get(url)

        if (response.data) {
            master_data[destination] = response.data.map((item: any) => {
                return {
                    label: item.name,
                    value: item.id
                }
            })
        }
    } catch (error) {
        console.log(error)
    }
}

const onSubmitEmployee = async () => {
    const formData = new FormData()
    formData.append('religion_id', form.religion_id)
    formData.append('marital_status_id', form.marital_status_id)
    formData.append('name', form.name)
    formData.append('education', form.education)
    formData.append('jasnita_number', form.jasnita_number)
    formData.append('employment_status', form.employment_status)
    formData.append('gender', form.gender)
    formData.append('dob', form.dob)
    formData.append('address', form.address)
    if (form.avatar) {
        formData.append('avatar', form.avatar)
    }

    Loading.show({
        message: 'Please wait...'
    })

    try {
        const { data: response } = await form_data.post('/employees', formData)

        if (response.data) {
            Notification(response.message, 'positive')

            router.push({
                name: 'employee-page'
            })
        }
    } catch (error) {
        console.log(error)
    } finally {
        Loading.hide()
    }
}

// hooks
onMounted(() => {
    fetchMasterData('/marital-status', 'marital_status')
    fetchMasterData('/religions', 'religions')
})
</script>

<template>
    <base-title title="Employees" :crumbs="breadcrumbs" />

    <base-card title="Create Employee" subtitle="Input all required field.">
        <template #content>
            <q-form @submit="onSubmitEmployee" class="tw-space-y-3 tw-grid">
                <base-text
                    label="Name"
                    v-model="form.name"
                    dense
                    :required="true"
                />

                <base-text
                    label="Jasnita Number"
                    v-model="form.jasnita_number"
                    type="number"
                    dense
                    :required="true"
                />

                <base-select
                    label="Education"
                    v-model="form.education"
                    :options="master_data.education"
                    emit-value
                    map-options
                    dense
                    :required="true"
                />

                <base-select
                    label="Employment Status"
                    v-model="form.employment_status"
                    :options="master_data.status"
                    emit-value
                    map-options
                    dense
                    :required="true"
                />

                <base-select
                    label="Gender"
                    v-model="form.gender"
                    :options="master_data.gender"
                    emit-value
                    map-options
                    dense
                    :required="true"
                />

                <base-date
                    label="Date of Birth"
                    v-model="form.dob"
                    dense
                    :required="true"
                />

                <base-select
                    label="Marital Status"
                    v-model="form.marital_status_id"
                    :options="master_data.marital_status"
                    emit-value
                    map-options
                    dense
                    :required="true"
                />

                <base-select
                    label="Religion"
                    v-model="form.religion_id"
                    :options="master_data.religions"
                    emit-value
                    map-options
                    dense
                    :required="true"
                />

                <base-text
                    label="Address"
                    v-model="form.address"
                    textarea
                    dense
                    :required="true"
                />

                <div class="tw-flex tw-items-baseline tw-gap-x-3 tw-space-y-1">
                    <label class="tw-w-52"> Avatar </label>
                    <q-file
                        class="tw-w-full"
                        filled
                        color="secondary"
                        v-model="form.avatar"
                        dense
                    >
                        <template v-slot:prepend>
                            <base-icon
                                icon-name="DocumentUpload"
                                size="18"
                                @click.stop.prevent
                                class="tw-mr-2"
                            />
                        </template>
                    </q-file>
                </div>

                <div class="tw-flex tw-justify-center tw-gap-3 tw-pt-10">
                    <q-btn
                        unelevated
                        no-caps
                        label="Submit"
                        type="submit"
                        color="secondary"
                    />

                    <q-btn
                        flat
                        unelevated
                        no-caps
                        label="Cancel"
                        color="secondary"
                        @click="$router.back()"
                    />
                </div>
            </q-form>
        </template>
    </base-card>
</template>
