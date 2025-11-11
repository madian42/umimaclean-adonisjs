import ReactDOMServer from 'react-dom/server'
import { createInertiaApp } from '@inertiajs/react'
import AppLayout from '../components/app-layout'

export default function render(page: any) {
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => {
        // Only import the `core` pages eagerly on the server.
        // Importing all app pages eagerly causes browser-only libraries
        // (like leaflet in other modules) to be loaded during SSR and crash.
        const rest = name.split('/').slice(1).join('/')
        const pages = import.meta.glob('/app/core/ui/pages/**/*.tsx', { eager: true })
        return pages[`/app/core/ui/pages/${rest}.tsx`]
    },
    setup: ({ App, props }) => (
      <AppLayout>
        <App {...props} />
      </AppLayout>
    ),
  })
}
