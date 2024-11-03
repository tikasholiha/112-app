import { boot } from 'quasar/wrappers'

import BaseIcon from 'components/common/BaseIcon.vue'
import BaseCard from 'components/common/BaseCard.vue'
import BaseTitle from 'components/common/BaseTitle.vue'
import BaseTable from 'components/common/BaseTable.vue'
import BaseText from 'components/form/BaseTextField.vue'
import BaseDate from 'components/form/BaseDate.vue'
import BaseMonth from 'components/form/BaseMonth.vue'
import BaseSelect from 'components/form/BaseSelect.vue'
import VueApexCharts from 'vue3-apexcharts'
import BasePassword from 'components/form/BasePassword.vue'
import BaseConfirmationDialog from 'components/common/BaseConfirmationDialog.vue'
import BaseFilterDateRange from 'components/common/BaseFilterDateRange.vue'
import BaseButtonDateRange from 'components/common/BaseButtonDateRange.vue'

export default boot(async ({ app }) => {
    // Common
    app.component('BaseIcon', BaseIcon)
    app.component('BaseCard', BaseCard)
    app.component('BaseTitle', BaseTitle)
    app.component('BaseTable', BaseTable)
    app.component('BaseConfirmationDialog', BaseConfirmationDialog)
    app.component('BaseFilterDateRange', BaseFilterDateRange)
    app.component('BaseButtonDateRange', BaseButtonDateRange)

    // Form
    app.component('BaseText', BaseText)
    app.component('BaseDate', BaseDate)
    app.component('BaseMonth', BaseMonth)
    app.component('BaseSelect', BaseSelect)
    app.component('BasePassword', BasePassword)

    // Chart
    app.component('apexchart', VueApexCharts)
})
