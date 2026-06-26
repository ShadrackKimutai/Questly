import "@fontsource-variable/rubik/wght.css"
import Toaster from "@questly/web/components/Toaster"
import { socketClient } from "@questly/web/features/game/contexts/socket-context"
import "@questly/web/i18n"
import "@questly/web/index.css"
import { routeTree } from "@questly/web/route.gen"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

const router = createRouter({ routeTree, context: { socket: socketClient } })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const root = document.getElementById("root")

if (!root) {
  throw new Error("Root element not found")
}

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster />
  </StrictMode>,
)
