"use client";

import { Button } from "@/components/ui/button";
import { SignUpButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { 
  ArrowRightIcon, 
  VideoIcon, 
  BookOpenIcon, 
  AwardIcon, 
  UsersIcon, 
  TrendingUpIcon, 
  HeartIcon,
  GraduationCapIcon,
  LightbulbIcon,
  TargetIcon
} from "lucide-react";

const features = [
  {
    number: "01",
    icon: VideoIcon,
    title: "Create Free Courses",
    description:
      "Share your knowledge by creating engaging video courses. No barriers, no costs—just pure learning and teaching.",
    color: "emerald",
  },
  {
    number: "02",
    icon: BookOpenIcon,
    title: "Learn From Peers",
    description:
      "Access courses created by fellow students who understand exactly what you need to succeed in your studies.",
    color: "teal",
  },
  {
    number: "03",
    icon: AwardIcon,
    title: "Build Your Profile",
    description:
      "Teaching experience strengthens university applications and develops leadership skills that last a lifetime.",
    color: "cyan",
  },
];

const benefits = [
  {
    icon: TrendingUpIcon,
    title: "Teach to Learn",
    description: "Teaching is the most effective way to master any subject.",
  },
  {
    icon: UsersIcon,
    title: "Community Driven",
    description: "Join motivated students building the future of education.",
  },
  {
    icon: HeartIcon,
    title: "Make an Impact",
    description: "Your knowledge helps peers succeed in their journey.",
  },
];

const getIconBg = (color: string) => {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-600",
    teal: "bg-teal-600",
    cyan: "bg-cyan-600",
  };
  return colors[color] || "bg-emerald-600";
};

export const LandingFeatures = () => {
  const { user } = useUser();
  const router = useRouter();

  const handleStartVolunteering = () => {
    if (user) {
      router.push("/studio");
    }
  };

  return (
    <>
      {/* Feature Grid Section */}
      <section id="features" className="py-24 bg-slate-50/80">
        <div className="max-w-6xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-100/80 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <LightbulbIcon className="w-4 h-4" />
              How It Works
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 tracking-tight">
              Simple. Effective. <span className="edu-text-gradient">Free.</span>
            </h2>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.number}
                  className="relative bg-white border border-slate-100 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-emerald-200/60 transition-all duration-300 group hover:-translate-y-1"
                >
                  {/* Large Number */}
                  <span className="absolute top-6 right-6 text-7xl font-bold text-slate-100 group-hover:text-emerald-100 transition-colors select-none">
                    {feature.number}
                  </span>

                  {/* Icon */}
                  <div className={`relative z-10 w-14 h-14 ${getIconBg(feature.color)} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="relative z-10 text-xl font-bold text-slate-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="relative z-10 text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-100/80 text-teal-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <TargetIcon className="w-4 h-4" />
                Why EduBoost
              </div>
              <h2 className="text-4xl font-bold text-slate-800 tracking-tight mb-6">
                More than just a <span className="edu-text-gradient">platform</span>
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                EduBoost empowers students to become teachers. By sharing what
                you know, you reinforce your own learning while helping others
                succeed.
              </p>

              <div className="space-y-6">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className="flex gap-4 group">
                      <div className="flex-shrink-0 w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                        <Icon className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-1">
                          {benefit.title}
                        </h4>
                        <p className="text-slate-600">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Stats */}
            <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-10 shadow-2xl shadow-emerald-600/20">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="text-5xl font-bold text-white mb-2">50+</div>
                  <div className="text-emerald-100 text-sm uppercase tracking-wider font-medium">
                    Lessons
                  </div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="text-5xl font-bold text-white mb-2">1000+</div>
                  <div className="text-emerald-100 text-sm uppercase tracking-wider font-medium">
                    Students
                  </div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="text-5xl font-bold text-white mb-2">100%</div>
                  <div className="text-emerald-100 text-sm uppercase tracking-wider font-medium">
                    Free
                  </div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="text-5xl font-bold text-white mb-2">4.9</div>
                  <div className="text-emerald-100 text-sm uppercase tracking-wider font-medium">
                    Rating
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <GraduationCapIcon className="w-4 h-4" />
            Start Your Journey
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to start teaching?
          </h2>
          <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
            Join thousands of students who are already sharing knowledge and
            building their future on EduBoost.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Button
                onClick={handleStartVolunteering}
                size="lg"
                className="bg-white hover:bg-slate-50 text-emerald-700 rounded-xl px-8 py-6 text-base font-semibold shadow-lg"
              >
                Go to Studio
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Button>
            ) : (
              <SignUpButton>
                <Button
                  size="lg"
                  className="bg-white hover:bg-slate-50 text-emerald-700 rounded-xl px-8 py-6 text-base font-semibold shadow-lg"
                >
                  Start for free
                  <ArrowRightIcon className="ml-2 w-5 h-5" />
                </Button>
              </SignUpButton>
            )}
          </div>
        </div>
      </section>
    </>
  );
};
