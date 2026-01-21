import { getServerAuthSession } from "@/lib/auth"
import { getFoods } from "@/app/food-actions"
import { UnauthorizedMessage } from "@/components/UnauthorizedMessage"
import { ManageDashboard } from "./ManageDashboard"

export const dynamic = 'force-dynamic';

export default async function ManagePage() {
  const session = await getServerAuthSession()

  if (!session) {
    return <UnauthorizedMessage />
  }

  // Pre-fetch foods for authenticated users
  const foods = await getFoods()

  return <ManageDashboard initialFoods={foods} />
}