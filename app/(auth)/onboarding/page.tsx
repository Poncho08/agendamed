import type { Metadata } from "next"
import { OnboardingFlow } from "./onboarding-flow"

export const metadata: Metadata = { title: "Configura tu consultorio" }

export default function OnboardingPage() {
  return <OnboardingFlow />
}
