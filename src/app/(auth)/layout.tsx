import Image from "next/image";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({children}: LayoutProps) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center relative">
            {/* Background Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '4s'}}></div>

            {/* Logo */}
            <div className="absolute top-8 left-8 flex items-center space-x-2 z-10">
                <Image src="/logo_eduboost.png" alt="EduBoost Logo" width={32} height={32} className="drop-shadow-sm" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    EduBoost
                </span>
            </div>

            {/* Main Content */}
            <div className="relative z-10">
                <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            Welcome to EduBoost
                        </h2>
                        <p className="text-gray-600">
                            Where learning meets teaching
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Layout;