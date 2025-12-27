import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, MessageCircleIcon, MailIcon, PhoneIcon, BookOpenIcon, UsersIcon, HeadphonesIcon, ClockIcon, GlobeIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const ContactPage = () => {
  return (
    <div className="min-h-screen edu-gradient-subtle">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-emerald-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center text-emerald-600 hover:text-emerald-700 transition-colors font-medium">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo_eduboost.png"
                alt="EduBoost"
                width={28}
                height={28}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-slate-800">
                Edu<span className="text-emerald-600">Boost</span>
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-100/80 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <HeadphonesIcon className="w-4 h-4" />
              We&apos;re Here to Help
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 mb-6">
              Get in{" "}
              <span className="edu-text-gradient">Touch</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We&apos;d love to hear from you! Whether you have questions, feedback, or want to join our mission, reach out to us.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Primary Contact */}
            <Card className="bg-white border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-emerald-600 p-3 rounded-xl shadow-lg">
                    <MessageCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-slate-800">Main Contact</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-6">
                  For general inquiries, partnerships, or to join our team, reach out through Telegram.
                </p>
                <a 
                  href="https://t.me/Islombek_0072" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                    <MessageCircleIcon className="w-4 h-4 mr-2" />
                    Message on Telegram
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="bg-white border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-teal-600 p-3 rounded-xl shadow-lg">
                    <MailIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-slate-800">Quick Response</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-6">
                  We typically respond within 24 hours. For urgent matters, Telegram is the fastest way to reach us.
                </p>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-emerald-500" />
                    <span>Available: 24/7</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MailIcon className="w-4 h-4 text-emerald-500" />
                    <span>Response time: Within 24 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GlobeIcon className="w-4 h-4 text-emerald-500" />
                    <span>Languages: English, Uzbek</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form Alternative */}
          <Card className="bg-white border-slate-100 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                <span className="edu-text-gradient">Other Ways to Connect</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="group p-6 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="bg-emerald-600 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <BookOpenIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-slate-800">Content Questions</h3>
                  <p className="text-slate-600 text-sm">Questions about creating courses or teaching on the platform</p>
                </div>
                
                <div className="group p-6 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="bg-teal-600 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <PhoneIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-slate-800">Technical Support</h3>
                  <p className="text-slate-600 text-sm">Need help with the platform or experiencing technical issues</p>
                </div>
                
                <div className="group p-6 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="bg-cyan-600 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <UsersIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-slate-800">Partnerships</h3>
                  <p className="text-slate-600 text-sm">Interested in partnering with schools or organizations</p>
                </div>
              </div>
              
              <div className="text-center mt-10 pt-8 border-t border-slate-100">
                <p className="text-slate-600 mb-6">
                  For all inquiries, please contact us on Telegram for the fastest response.
                </p>
                <a 
                  href="https://t.me/Islombek_0072" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-xl"
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
