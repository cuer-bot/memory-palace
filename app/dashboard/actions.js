'use server'

import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '../../utils/supabase/server'

export async function createPalace(formData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const name = formData.get('name') || 'New Palace'

    const { error } = await supabase
        .from('palaces')
        .insert([
            { id: uuidv4(), name, owner_id: user.id }
        ])

    if (error) {
        console.error('Error creating Palace:', error)
        throw new Error('Failed to create Palace')
    }

    revalidatePath('/dashboard')
}
