import { redirect } from 'next/navigation'

export default function CostAnalysisRedirect() {
  redirect('/protected/reports/cost-analysis')
  return null
}
