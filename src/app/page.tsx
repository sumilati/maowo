import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CatSite } from '@/components/cat-site/cat-site'

export default async function Home() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }
  return <CatSite />
}
