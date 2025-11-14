/// <reference path="../../../../adonisrc.ts" />
/// <reference path="../../../../config/inertia.ts" />

import 'leaflet/dist/leaflet.css'
import '../css/app.css'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import AppLayout from '../components/app-layout'

const appName = import.meta.env.VITE_APP_NAME || 'Umimaclean'

createInertiaApp({
  title: (title) => `${title} | ${appName}`,

  resolve: (name) => {
    const firstPart = name.split('/')[0]
    const rest = name.split('/').slice(1).join('/')

    return resolvePageComponent(
      `/app/${firstPart}/ui/pages/${rest}.tsx`,
      import.meta.glob('/app/*/ui/pages/**/*.tsx')
    )
  },

  setup({ el, App, props }) {
    createRoot(el).render(
      <AppLayout>
        <App {...props} />
      </AppLayout>
    )
    // }
  },

  progress: {
    color: '#000000',
    delay: 500,
    includeCSS: true,
    showSpinner: true,
  },
})
