import { login, signup } from './actions'

export default function LoginPage({ searchParams }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white">
            <div className="w-full max-w-sm p-8 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl">
                <h1 className="text-2xl font-bold text-center mb-6">Memory Palace</h1>

                <form className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                        <button formAction={login} className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors">
                            Log in
                        </button>
                        <button formAction={signup} className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md font-medium transition-colors">
                            Sign up
                        </button>
                    </div>

                    {searchParams?.message && (
                        <p className="mt-4 p-3 bg-red-950/50 text-red-400 text-sm text-center rounded">
                            {searchParams.message}
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}
