import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, MessageCircleIcon, MailIcon, PhoneIcon, BookOpenIcon, UsersIcon } from "lucide-react";
import Link from "next/link";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduBoost
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Get in 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}Touch
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We&apos;d love to hear from you! Whether you have questions, feedback, or want to join our mission, reach out to us.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Primary Contact */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-full">
                    <MessageCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  Main Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  For general inquiries, partnerships, or to join our team, reach out through Telegram.
                </p>
                <a 
                  href="https://t.me/Islombek_0072" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <MessageCircleIcon className="w-4 h-4 mr-2" />
                    Message on Telegram
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-full">
                    <MailIcon className="w-6 h-6 text-white" />
                  </div>
                  Quick Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  We typically respond within 24 hours. For urgent matters, Telegram is the fastest way to reach us.
                </p>
                <div className="text-sm text-gray-500">
                  <p>📧 Available: 24/7</p>
                  <p>⚡ Response time: Within 24 hours</p>
                  <p>🌍 Language: English, Uzbek</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form Alternative */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  Other Ways to Connect
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <BookOpenIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Content Questions</h3>
                  <p className="text-gray-600 text-sm">Questions about creating courses or teaching on the platform</p>
                </div>
                
                <div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <PhoneIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Technical Support</h3>
                  <p className="text-gray-600 text-sm">Need help with the platform or experiencing technical issues</p>
                </div>
                
                <div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <UsersIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Partnerships</h3>
                  <p className="text-gray-600 text-sm">Interested in partnering with schools or organizations</p>
                </div>
              </div>
              
              <div className="text-center mt-8">
                <p className="text-gray-600 mb-6">
                  For all inquiries, please contact us on Telegram for the fastest response.
                </p>
                <a 
                  href="https://t.me/Islombek_0072" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <MessageCircleIcon className="w-5 h-5 mr-2" />
                    Contact Us on Telegram
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
