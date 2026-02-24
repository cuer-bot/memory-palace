import { readFileSync } from 'fs'
import { join } from 'path'
import OnboardClient from './OnboardClient'

export const dynamic = 'force-static'
export const revalidate = 3600

export default function OnboardPage() {
    const content = readFileSync(
        join(process.cwd(), 'public', 'memory-palace-onboard.md'),
        'utf-8'
    )
    return <OnboardClient content={content} />
}
