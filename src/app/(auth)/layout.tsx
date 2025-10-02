import Image from "next/image";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({children}: LayoutProps) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center relative overflow-hidden">
            {/* Softer Background Blobs (no animation to avoid artifacts) */}
            <div className="absolute -top-10 -left-10 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -right-8 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl" />

            {/* Logo */}
            <div className="absolute top-8 left-8 flex items-center space-x-2 z-10">
                <Image src="/logo_eduboost.png" alt="EduBoost Logo" width={32} height={32} className="drop-shadow-sm" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    EduBoost
                </span>
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full px-4">
                <div className="mx-auto w-full max-w-md p-8 bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/60">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            Welcome to EduBoost
                        </h2>
                        <p className="text-gray-600">
                            Where learning meets teaching
                        </p>
                    </div>
                    <div className="flex justify-center">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Layout;