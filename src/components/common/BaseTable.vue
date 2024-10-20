<template>
    <q-table
        flat
        :selection="selection"
        :pagination.sync="dataPagination"
        :dense="dataDense"
        :row-key="dataRowKey"
        :rows="dataRows"
        :columns="dataColumns"
        :loading="dataLoading"
        v-model:selected="dataSelected"
        :filter="dataSearch"
        @update:model-value="(value) => $emit('update:dataSelected', value)"
        :visible-columns="visibleColumn"
    >
        <!-- Header Slot -->
        <template v-slot:header="scope">
            <q-tr :props="scope">
                <q-th
                    v-if="selection"
                    class="!tw-bg-gray-100 tw-font-medium !tw-text-sm"
                >
                    <q-checkbox
                        size="30px"
                        v-model="scope.selected"
                        color="grey-10"
                        @click="$emit('call')"
                    />
                </q-th>
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

        <template v-slot:body="scope">
            <q-tr :props="scope">
                <q-td v-if="selection">
                    <q-checkbox
                        size="30px"
                        v-model="scope.selected"
                        color="grey-10"
                        @click="$emit('call')"
                    />
                </q-td>
                <q-td v-for="col in scope.cols" :key="col.name">
                    <slot :name="col.name" v-bind="scope">
                        {{ col.value }}
                    </slot>
                </q-td>
            </q-tr>

            <q-tr v-show="scope.expand" :props="scope">
                <q-td colspan="100%">
                    <slot name="expand" v-bind="scope"></slot>
                </q-td>
            </q-tr>
        </template>

        <!-- Loading Slot -->
        <template v-slot:loading>
            <q-inner-loading showing color="secondary" />
        </template>
    </q-table>
</template>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
    name: 'SideMenu',
    setup() {
        return {
            selected: ref([]),
            dataPagination: {
                rowsPerPage: 10
            }
        }
    },
    props: {
        dataColumns: {
            type: Array,
            default: []
        },
        dataRows: {
            type: Array,
            default: []
        },
        dataSearch: {
            type: String,
            default: null
        },
        dataLoading: {
            type: Boolean,
            default: false
        },
        dataSelected: {
            type: Array,
            default: []
        },
        dataRowKey: {
            type: String,
            default: 'ID'
        },
        dataDense: {
            type: Boolean,
            default: false
        },
        selection: {
            type: String
        },
        visibleColumn: Array
    },
    emits: ['call']
})
</script>
