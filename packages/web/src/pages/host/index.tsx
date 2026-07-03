import Landing from "@questly/web/features/manager/components/Landing"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/host/")({
  component: Landing,
})
