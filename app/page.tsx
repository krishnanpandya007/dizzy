import { DizzyDashboard } from "@/components/dizzy-dashboard"
import { AuthGuard } from "@/components/auth-guard"

export default function Page() {
  return (
    <AuthGuard>
      <DizzyDashboard />
    </AuthGuard>
  )
}
