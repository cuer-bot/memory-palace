import { createClient } from '../../../utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default async function PalaceGallery({ params }) {
    const { palace_id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Verify ownership
    const { data: palace } = await supabase
        .from('palaces')
        .select('*')
        .eq('id', palace_id)
        .eq('owner_id', user.id)
        .single()

    if (!palace) {
        redirect('/dashboard') // Or 404
    }

    // Fetch memories for this palace
    const { data: memories } = await supabase
        .from('memories')
        .select('*')
        .eq('palace_id', palace_id)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <Link href="/dashboard" className="text-neutral-400 hover:text-white mb-4 inline-block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold">{palace.name || 'Unnamed Palace'} Gallery</h1>
                    <p className="text-sm text-neutral-500 font-mono mt-2">API Key: {palace.id}</p>
                </div>

                {memories?.length === 0 ? (
                    <div className="text-center py-24 text-neutral-500 bg-neutral-900/30 rounded-xl border border-neutral-800 border-dashed">
                        <p>No memories generated yet.</p>
                        <p className="text-sm mt-2">Point your agents to /api/store using this Palace's API Key.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {memories?.map((memory) => (
                            <div key={memory.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col group">
                                <div className="aspect-square relative bg-neutral-950 flex items-center justify-center">
                                    {memory.image_url ? (
                                        <Image
                                            src={memory.image_url}
                                            alt={memory.session_name || 'Memory Image'}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="text-neutral-600 font-mono text-sm">No Image</span>
                                    )}
                                </div>
                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="font-semibold text-lg text-white mb-1 truncate">
                                        {memory.session_name || 'Unknown Session'}
                                    </h3>
                                    <div className="flex flex-wrap gap-2 text-xs font-mono text-neutral-400 mb-4">
                                        <span className="bg-neutral-800 px-2 py-1 rounded">Agent: {memory.agent}</span>
                                        <span className="bg-neutral-800 px-2 py-1 rounded">Room: {memory.status}</span>
                                    </div>
                                    <div className="mt-auto pt-4 border-t border-neutral-800/50 flex justify-between items-center text-sm">
                                        <a href={`/q/${memory.short_id}`} target="_blank" className="text-blue-400 hover:text-blue-300">
                                            View JSON
                                        </a>
                                        <span className="text-neutral-500 font-mono text-xs">{memory.short_id}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
