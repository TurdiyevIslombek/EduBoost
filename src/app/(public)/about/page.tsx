import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon, BookOpenIcon, UsersIcon, TrendingUpIcon, HeartIcon, StarIcon, GraduationCapIcon, TargetIcon, LightbulbIcon, RocketIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const AboutPage = () => {
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
              <GraduationCapIcon className="w-4 h-4" />
              Our Story
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 mb-6">
              About{" "}
              <span className="edu-text-gradient">EduBoost</span>
            </h1>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
              <p className="text-xl text-slate-700 leading-relaxed">
                At EduBoost, we believe that the best way to learn is by teaching. Our platform empowers students to share their knowledge with their peers—for free. By teaching others, students not only help their communities grow but also strengthen their own understanding of the subjects they love.
              </p>
              <p className="text-lg text-slate-600 mt-6">
                Our mission is to build a community where learning is collaborative, impactful, and recognized. Every course taught on EduBoost contributes to a stronger network of young minds helping each other achieve their goals.
              </p>
            </div>
          </div>

          {/* Our Goals */}
          <Card className="bg-white border-slate-100 shadow-lg mb-12">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-teal-100/80 text-teal-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                  <TargetIcon className="w-4 h-4" />
                  Our Mission
                </div>
                <span className="block edu-text-gradient">Our Goals</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4 group">
                  <div className="bg-emerald-600 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                    <BookOpenIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2">Empower Student Teachers</h3>
                    <p className="text-slate-600">Help students become confident learners and teachers through volunteer teaching opportunities.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 group">
                  <div className="bg-teal-600 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                    <HeartIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2">Free Education Access</h3>
                    <p className="text-slate-600">Create free, accessible education for everyone—by students, for students.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 group">
                  <div className="bg-cyan-600 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                    <TrendingUpIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2">Develop Life Skills</h3>
                    <p className="text-slate-600">Foster leadership, communication, and academic skills through volunteer teaching experience.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 group">
                  <div className="bg-emerald-500 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                    <UsersIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2">Build Community</h3>
                    <p className="text-slate-600">Create a supportive network where students help each other succeed and grow together.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits for Students */}
          <Card className="bg-white border-slate-100 shadow-lg mb-12">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-emerald-100/80 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                  <LightbulbIcon className="w-4 h-4" />
                  Why Join Us
                </div>
                <span className="block edu-text-gradient">Benefits for Students</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-5">
                {[
                  { icon: BookOpenIcon, text: "Gain deeper knowledge by teaching your peers", color: "emerald" },
                  { icon: StarIcon, text: "Build a strong portfolio with teaching experience and volunteer work", color: "teal" },
                  { icon: TrendingUpIcon, text: "Develop key life skills—public speaking, leadership, teamwork, and mentoring", color: "cyan" },
                  { icon: UsersIcon, text: "Join a growing network of motivated and like-minded students", color: "emerald" },
                  { icon: HeartIcon, text: "Make a difference by making education more accessible to all", color: "teal" },
                ].map((item, index) => {
                  const Icon = item.icon;
                  const bgColor = item.color === "emerald" ? "bg-emerald-600" : item.color === "teal" ? "bg-teal-600" : "bg-cyan-600";
                  return (
                    <div key={index} className="flex items-center space-x-4 group p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className={`${bgColor} p-2.5 rounded-xl shadow-md`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-lg text-slate-700">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Join Our Team */}
          <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl shadow-2xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
            </div>
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <RocketIcon className="w-4 h-4" />
                Join the Movement
              </div>
              <h2 className="text-4xl font-bold mb-8">Join Our Team</h2>
              <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed text-emerald-100">
                We are looking for passionate, driven, and creative individuals to join our team at EduBoost. Together, we will build a platform that changes how students learn and grow.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 text-left mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-4">We need:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-white rounded-full mr-3 mt-2"></div>
                      <span><strong>Content Creators & Teachers</strong> – Students who want to share their expertise</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-white rounded-full mr-3 mt-2"></div>
                      <span><strong>Developers & Designers</strong> – To help build and improve our platform</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-4">More roles:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-white rounded-full mr-3 mt-2"></div>
                      <span><strong>Marketing & Community Managers</strong> – To spread our mission and connect with schools</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-white rounded-full mr-3 mt-2"></div>
                      <span><strong>Partnership Coordinators</strong> – To collaborate with organizations and institutions</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <p className="text-lg text-emerald-100">
                If you believe in our mission and want to make an impact, join us. Together, we can empower the next generation of learners and leaders.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
