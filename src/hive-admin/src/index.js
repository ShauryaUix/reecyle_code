import * as Router from 'react-router-dom'

// import './components/DashboardChart';
// import './components/DashboardChartHistory';
// import './components/DashboardChartRating';

import './components/Action'
import './components/ActionAccountActivation'
import './components/ActionAsync'
import './components/ActionCreate'
import './components/ActionSave'
import './components/ActionSaveAndReload'
import './components/ActionDelete'
import './components/ActionDuplicate'
import './components/ActionLogin'
import './components/ActionPasswordReset'
import './components/ActionPasswordSet'
import './components/ActionRestore'
import './components/ActionWithRequest'
import './components/ActionWithFormBasedRequest'
import './components/ActionWithFormModal'

import './components/Divider'

import './components/Field'
import './components/FieldAutoComplete'
import './components/FieldAutoCompleteSelect'
// import './components/FieldCodeEditor';
import './components/FieldSwitch'
import './components/FieldConnectionList'
import './components/FieldConnectionSelect'
import './components/FieldDatePicker'
// import './components/FieldGoogleAddress';
// import './components/FieldGooglePolygon';
import './components/FieldHidden'
import './components/FieldJSON'
// import './components/FieldMarkdown';
import './components/FieldNumber'
import './components/FieldRadio'
import './components/FieldRating'
import './components/FieldReact'
import './components/FieldSelect'
import './components/FieldSortableList'
import './components/FieldText'
import './components/FieldTextArea'
import './components/FieldTitle'
import './components/FieldUpload'
import './components/FieldUploadRefs'
// import './components/FieldWYSIWYG';
// import './components/FieldWYSIWYGDecorator';
// import './components/FieldWYSIWYGToolbarItemInline';

import './components/Group'
import './components/GroupResource'

import './components/Filter'
import './components/FilterHidden'
import './components/FilterField'
import './components/FilterSelect'
import './components/FilterPagination'
import './components/FilterRegexSearch'

import './components/Page'
import './components/Page404'
import './components/PageAccountActivation'
import './components/PageArchive'
import './components/PageArchiveGrid'
import './components/PageArchiveTable'
import './components/PageArchiveTableAutoRefresh'
// import './components/PageDashboard';
// import './components/PageHTML';
import './components/PageLogin'
import './components/PagePasswordReset'
import './components/PagePasswordSet'
import './components/PageSingle'
import './components/PageSmallForm'

import './library/redirect'
import './library/validation'
import './library/condition'

import * as Loader from './modules/loader'
import * as Storage from './modules/storage'
import * as Client from './modules/client'

import Admin from './components/Admin'

Admin.Router = Router
Admin.Loader = Loader
Admin.Storage = Storage
Admin.Client = Client

export { Router, Loader, Storage, Client }

export default Admin
