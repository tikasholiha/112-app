<script setup lang="ts">
import { QTableColumn } from 'quasar'
import { api } from 'src/boot/axios'
import { IBreadcrumbs } from 'src/components/common/BaseTitle.vue'
import { onMounted, ref } from 'vue'
import TBRows from './_components/TBRows.vue'

// data
const breadcrumbs = ref<IBreadcrumbs[]>([
    {
        title: 'Dashboard',
        href: 'dashboard-page',
        icon: 'Category2'
    },
    {
        title: 'Settings',
        href: '',
        icon: 'Headphones'
    },
    {
        title: 'Role',
        href: '',
        icon: 'Lock'
    }
])
const searchKeyword = ref('')
const tableColumns: QTableColumn[] = [
    {
        name: 'name',
        label: 'Name',
        align: 'left',
        field: (row: any) => row.name
    },
    {
        name: 'url',
        label: 'Url',
        align: 'left',
        field: (row: any) => row.url || '-'
    },
    {
        name: 'ord',
        label: 'Order',
        align: 'left',
        field: (row: any) => row.ord || '-'
    },
    {
        name: 'icon',
        label: 'Icon',
        align: 'left',
        field: (row: any) => row.icon || '-'
    }
]
const tableRows = ref<any>([])
const tableLoading = ref<boolean>(false)

// methods
const fetchMenus = async () => {
    tableLoading.value = true

    try {
        const { data: response } = await api.get('/menus')

        if (response.data) {
            tableRows.value = response.data
        }
    } catch (error) {
        console.log(error)
    } finally {
        tableLoading.value = false
    }
}

// hooks
onMounted(() => {
    fetchMenus()
})
</script>

<template>
    <base-title title="Employees" :crumbs="breadcrumbs" />

    <base-card title="Lists Menus">
        <template #content>
            <q-table
                flat
                :columns="tableColumns"
                :rows="tableRows"
                row-key="name"
            >
                <template v-slot:header="scope">
                    <q-tr :props="scope">
                        <q-th
                            v-for="col in scope.cols"
                            :key="col.name"
                            :props="scope"
                            class="!tw-bg-gray-100 tw-font-medium !tw-text-sm"
                        >
                            {{ col.label }}
                        </q-th>
                    </q-tr>
                </template>

                <template v-slot:body="props">
                    <TBRows
                        :props="props"
                        :row="props.row"
                        :indent="0"
                    />
                </template>
            </q-table>
        </template>
    </base-card>
</template>
