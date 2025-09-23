"use client";

import { 
  VideoIcon, 
  UsersIcon, 
  BookOpenIcon, 
  TrendingUpIcon,
  HeartIcon,
  StarIcon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignUpButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const howItWorks = [
  {
    icon: VideoIcon,
    title: "Students create free courses",
    description: "Share your knowledge by creating engaging video courses for your peers - completely free.",
    gradient: "from-blue-500 to-blue-600"
  },
  {
    icon: BookOpenIcon,
    title: "Learners gain new skills",
    description: "Access a wide variety of courses created by your fellow students and master new subjects.",
    gradient: "from-green-500 to-green-600"
  },
  {
    icon: HeartIcon,
    title: "Volunteer and make impact",
    description: "Teaching is a rewarding volunteer experience that helps your community while building your skills.",
    gradient: "from-purple-500 to-purple-600"
  }
];

const whyEduBoost = [
  {
    icon: TrendingUpIcon,
    title: "Teach to learn better",
    description: "Teaching is the most effective way to master any subject and deepen your understanding.",
    gradient: "from-orange-500 to-orange-600"
  },
  {
    icon: StarIcon,
    title: "Build your profile",
    description: "Teaching experience looks great on university applications and develops leadership skills.",
    gradient: "from-indigo-500 to-indigo-600"
  },
  {
    icon: HeartIcon,
    title: "Empower others",
    description: "Your knowledge helps peers succeed for free, creating a positive impact in your community.",
    gradient: "from-pink-500 to-pink-600"
  },
  {
    icon: UsersIcon,
    title: "Be part of something bigger",
    description: "Join a network of motivated, talented students who are building the future together.",
    gradient: "from-teal-500 to-teal-600"
  }
];

export const LandingFeatures = () => {
  const { user } = useUser();
  const router = useRouter();

  const handleStartVolunteering = () => {
    if (user) {
      router.push("/studio");
    }
    // If user not logged in, SignUpButton will handle the signup
  };

  const handleLearnMore = () => {
    // Scroll to top of the features section
    document.getElementById("features")?.scrollIntoView({ 
      behavior: "smooth", 
      block: "start" 
    });
  };

  return (
    <div id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* How It Works Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-6">
            🚀 How It Works
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-12">
            Simple. Effective. 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}Free.
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {howItWorks.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card 
                key={index} 
                className="group bg-white/70 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <CardContent className="p-8 text-center">
                  <div className="flex items-center justify-center mb-6">
                    <div className="bg-white rounded-full p-4 shadow-lg mr-4">
                      <span className="text-2xl font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${step.gradient}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Why EduBoost Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-purple-50 rounded-full text-purple-700 text-sm font-medium mb-6">
            💡 Why EduBoost?
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-12">
            More than just a platform
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {whyEduBoost.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card 
                key={index} 
                className="group bg-white/70 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:rotate-1"
              >
                <CardContent className="p-6">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${benefit.gradient} mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Join Our Mission Section */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl shadow-2xl p-12 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Join Our Mission
              </h2>
              <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Become a teacher, a mentor, or a changemaker. EduBoost isn&apos;t just a platform—it&apos;s a movement.
              </p>
              <p className="text-2xl font-bold mb-8">
                Start teaching. Start leading. Start boosting your future.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Button 
                    onClick={handleStartVolunteering}
                    className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Start Volunteering
                  </Button>
                ) : (
                  <SignUpButton>
                    <Button className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      Start Volunteering
                    </Button>
                  </SignUpButton>
                )}
                <Button 
                  variant="outline"
                  onClick={handleLearnMore}
                  className="border-2 border-white hover:bg-white text-blue-600 hover:text-blue-600 px-8 py-4 rounded-full font-medium hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
