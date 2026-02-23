import { createClient } from '../../utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createPalace } from './actions'
import { signout } from '../login/actions'

export default async function Dashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: palaces } = await supabase
        .from('palaces')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-3xl font-bold">Your Memory Palaces</h1>
                    <form action={signout}>
                        <button className="text-neutral-400 hover:text-white transition-colors">
                            Sign out
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {palaces?.map((palace) => (
                        <Link
                            key={palace.id}
                            href={`/dashboard/${palace.id}`}
                            className="block p-6 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-colors group"
                        >
                            <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                                {palace.name || 'Unnamed Palace'}
                            </h2>
                            <p className="text-neutral-500 text-sm mb-4 font-mono truncate">
                                {palace.id}
                            </p>
                            <div className="flex items-center text-sm text-neutral-400">
                                <span>View Memories →</span>
                            </div>
                        </Link>
                    ))}

                    {/* Create New Palace Card */}
                    <form action={createPalace} className="block p-6 bg-neutral-900/50 border border-neutral-800 border-dashed rounded-xl hover:bg-neutral-900 transition-colors flex flex-col justify-center items-center h-full min-h-[160px]">
                        <input
                            type="text"
                            name="name"
                            placeholder="Palace Name"
                            className="bg-transparent border-b border-neutral-700 text-center mb-4 focus:outline-none focus:border-blue-500 w-full"
                        />
                        <button className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-medium transition-colors">
                            + Create Palace
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
