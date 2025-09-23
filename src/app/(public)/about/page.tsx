import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon, BookOpenIcon, UsersIcon, TrendingUpIcon, HeartIcon, StarIcon } from "lucide-react";
import Link from "next/link";

const AboutPage = () => {
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
              About 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}EduBoost
              </span>
            </h1>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
              <p className="text-xl text-gray-700 leading-relaxed">
                At EduBoost, we believe that the best way to learn is by teaching. Our platform empowers students to share their knowledge with their peers—for free. By teaching others, students not only help their communities grow but also strengthen their own understanding of the subjects they love.
              </p>
              <p className="text-lg text-gray-600 mt-6">
                Our mission is to build a community where learning is collaborative, impactful, and recognized. Every course taught on EduBoost contributes to a stronger network of young minds helping each other achieve their goals.
              </p>
            </div>
          </div>

          {/* Our Goals */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg mb-12">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center mb-6">
                <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  Our Goals
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-full">
                    <BookOpenIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">Empower Student Teachers</h3>
                    <p className="text-gray-600">Help students become confident learners and teachers through volunteer teaching opportunities.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-full">
                    <HeartIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">Free Education Access</h3>
                    <p className="text-gray-600">Create free, accessible education for everyone—by students, for students.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-full">
                    <TrendingUpIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">Develop Life Skills</h3>
                    <p className="text-gray-600">Foster leadership, communication, and academic skills through volunteer teaching experience.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-full">
                    <UsersIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">Build Community</h3>
                    <p className="text-gray-600">Create a supportive network where students help each other succeed and grow together.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits for Students */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg mb-12">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center mb-6">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Benefits for Students
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-full">
                    <BookOpenIcon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-lg text-gray-700">Gain deeper knowledge by teaching your peers</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-full">
                    <StarIcon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-lg text-gray-700">Build a strong portfolio with teaching experience and volunteer work</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-full">
                    <TrendingUpIcon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-lg text-gray-700">Develop key life skills—public speaking, leadership, teamwork, and mentoring</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-2 rounded-full">
                    <UsersIcon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-lg text-gray-700">Join a growing network of motivated and like-minded students</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-2 rounded-full">
                    <HeartIcon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-lg text-gray-700">Make a difference by making education more accessible to all</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Join Our Team */}
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl shadow-2xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
            </div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-4xl font-bold mb-8">Join Our Team</h2>
              <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
                We are looking for passionate, driven, and creative individuals to join our team at EduBoost. Together, we will build a platform that changes how students learn and grow.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 text-left mb-8">
                <div>
                  <h3 className="font-bold text-lg mb-4">We need:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                      <strong>Content Creators & Teachers</strong> – Students who want to share their expertise
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                      <strong>Developers & Designers</strong> – To help build and improve our platform
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg mb-4 opacity-0">Roles:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                      <strong>Marketing & Community Managers</strong> – To spread our mission and connect with schools
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                      <strong>Partnership Coordinators</strong> – To collaborate with organizations and institutions
                    </li>
                  </ul>
                </div>
              </div>
              
              <p className="text-lg mb-8">
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
