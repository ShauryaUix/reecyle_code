import pluralize from 'pluralize'
import isArray from 'lodash/isArray'

import Admin from './Admin'
import Group from './Group'

export default class GroupResource extends Group {
  static config = {
    ...Group.config,
    useTrash: false,
    archiveConfig: {},
    archiveTrashConfig: {},
    archiveComponent: 'PageArchiveTable',
    archiveLoadMethod: 'get',

    archiveLoadExtractData: (response) =>
      response
        ? { count: response.data.count, data: response.data.data }
        : { count: 0, data: [] },

    singleConfig: {},
    singleCreateConfig: {},
    singleEditConfig: {},
    singleComponent: 'PageSingle',
    singleLoadMethod: 'get',
    singleSaveMethod: 'patch',
    singleDeleteMethod: 'delete',
    singleDuplicateMethod: 'put',

    singleLoadExtractData: (response) => (response ? response.data : null),

    filters: [],
    fields: [],
  }

  static defaultArchiveConfig = {
    exact: true,
  }

  static create(config = {}) {
    config = this.getConfig(config)
    const {
      pages,

      path,
      icon,
      title,
      hidden,
      useTrash,

      redirect,

      archivePath = path,
      archiveTitle = `All ${title}`,
      archiveLabel = `All ${title}`,
      archiveConfig = {},
      archiveRedirect = redirect,
      archiveComponent,

      archiveLoadMethod,
      archiveLoadUrl = archivePath,
      archiveLoadExtractData,

      trashPath = `${archivePath}/trash`,
      trashTitle = 'Trash',
      trashLabel = 'Trash',
      trashConfig = {},
      trashRedirect = redirect,
      trashComponent = archiveComponent,

      trashLoadMethod = archiveLoadMethod,
      trashLoadUrl = archiveLoadUrl,
      trashLoadExtractData = archiveLoadExtractData,

      singleConfig = {},
      singleRedirect = redirect,
      singleComponent,

      singleCreatePath = `${archivePath}/create`,
      singleCreateTitle = `New ${pluralize.singular(title)}`,
      singleCreateHeaderTitle = 'Create',
      singleCreateLabel = 'Create',
      singleCreateConfig,
      singleCreateRedirect = singleRedirect,
      singleCreateComponent = singleComponent,

      singleEditPath = `${archivePath}/:id`,
      singleEditTitle = `Edit ${pluralize.singular(title)}`,
      singleEditHeaderTitle = 'Edit',
      singleEditLabel = 'Create',
      singleEditConfig,
      singleEditRedirect = singleRedirect,
      singleEditComponent = singleComponent,

      singleCreateMethod,
      singleCreateUrl = archiveLoadUrl,
      singleCreateRedirectPath = `${archivePath}/:_id`,

      singleLoadMethod = archiveLoadMethod,
      singleLoadUrl = `${archiveLoadUrl}/:id`,
      singleLoadExtractData,

      singleSaveMethod,
      singleSaveUrl = singleLoadUrl,

      singleDeleteMethod,
      singleDeleteUrl = singleLoadUrl,
      singleDeleteRedirectPath = archivePath,

      singleRestoreMethod,
      singleRestoreUrl = `${singleLoadUrl}/restore`,
      singleRestoreRedirectPath = singleCreateRedirectPath,

      singleDuplicateMethod,
      singleDuplicateUrl = `${singleLoadUrl}/duplicate`,
      singleDuplicateRedirectPath = singleCreateRedirectPath,

      fields,
      filters,

      notFoundMessage = `${pluralize.singular(title)} not found!`,

      getSkip,

      beforeArchivePages = [],
      afterArchivePages = [],
      beforeTrashPages = [],
      afterTrashPages = [],
      beforeSinglePages = [],
      afterSinglePages = [],

      ...restConfig
    } = config
    const compiledPages = Admin.compileFromLibrary(
      [
        ...beforeArchivePages,
        [
          archiveComponent,
          {
            ...restConfig,
            useTrash,
            activity: 'archive',
            filters: [
              ...(useTrash
                ? [
                    [
                      'FilterHidden',
                      {
                        id: 'not-in-trash',
                        section: 'top',
                        build: (builder) =>
                          builder.add('where', {
                            removed: { NE: true },
                          }),
                      },
                    ],
                  ]
                : []),
              ...filters,
            ],
            path: archivePath,
            title: archiveTitle,
            label: archiveLabel,
            redirect: archiveRedirect,
            loadUrl: archiveLoadUrl,
            loadMethod: archiveLoadMethod,
            loadExtractData: archiveLoadExtractData,
            ...(this.defaultArchiveConfig || {}),
            ...archiveConfig,
          },
        ],
        ...afterArchivePages,
        ...beforeTrashPages,
        ...(useTrash
          ? [
              [
                trashComponent,
                {
                  ...restConfig,
                  activity: 'trash',
                  filters: [
                    [
                      'FilterHidden',
                      {
                        id: 'in-trash',
                        section: 'top',
                        build: (builder) =>
                          builder.add('where', {
                            removed: true,
                          }),
                      },
                    ],
                    ...filters,
                  ],
                  path: trashPath,
                  title: trashTitle,
                  label: trashLabel,
                  redirect: trashRedirect,
                  loadUrl: trashLoadUrl,
                  loadMethod: trashLoadMethod,
                  loadExtractData: trashLoadExtractData,
                  ...(this.defaultTrashConfig || {}),
                  ...trashConfig,
                },
              ],
            ]
          : []),
        ...afterTrashPages,
        ...beforeSinglePages,
        [
          singleCreateComponent,
          {
            ...restConfig,
            activity: 'create',
            fields,
            useTrash,
            path: singleCreatePath,
            title: singleCreateTitle,
            headerTitle: singleCreateHeaderTitle,
            label: singleCreateLabel,
            redirect: singleCreateRedirect,
            createUrl: singleCreateUrl,
            createMethod: singleCreateMethod,
            createRedirectPath: singleCreateRedirectPath,
            ...singleConfig,
            ...singleCreateConfig,
          },
        ],
        [
          singleEditComponent,
          {
            ...restConfig,
            activity: 'edit',
            fields,
            useTrash,
            path: singleEditPath,
            title: singleEditTitle,
            headerTitle: singleEditHeaderTitle,
            label: singleEditLabel,
            alias: archivePath,
            redirect: singleEditRedirect,
            loadUrl: singleLoadUrl,
            loadMethod: singleLoadMethod,
            loadExtractData: singleLoadExtractData,
            saveUrl: singleSaveUrl,
            saveMethod: singleSaveMethod,
            deleteUrl: singleDeleteUrl,
            deleteMethod: singleDeleteMethod,
            deleteRedirectPath: singleDeleteRedirectPath,
            restoreUrl: singleRestoreUrl,
            restoreMethod: singleRestoreMethod,
            restoreRedirectPath: singleRestoreRedirectPath,
            duplicateUrl: singleDuplicateUrl,
            duplicateMethod: singleDuplicateMethod,
            duplicateRedirectPath: singleDuplicateRedirectPath,

            notFoundMessage,

            ...singleConfig,
            ...singleEditConfig,
          },
        ],
        ...afterSinglePages,
      ],
      true
    )
    const group = {
      ...restConfig,
      skip: Admin.compileFromLibrary(restConfig.skip, true),
      hidden: isArray(hidden)
        ? Admin.compileFromLibrary(hidden, true)
        : !!hidden,
      getSkip,
      icon,
      title,
      pages: compiledPages,
    }
    return group
  }
}

Admin.addToLibrary('GroupResource', (config) => GroupResource.create(config))
