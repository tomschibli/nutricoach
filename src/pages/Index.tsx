import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Utensils, MessageCircle } from "lucide-react";

const features = [
  {
    path: "/food-analyzer",
    icon: Utensils,
    title: "Food Analyzer",
    description:
      "Upload a photo of any food and get instant nutritional analysis powered by Claude's vision AI.",
    color: "emerald",
    bg: "from-green-50 to-emerald-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    border: "hover:border-emerald-300",
  },
  {
    path: "/coach",
    icon: MessageCircle,
    title: "Personal Coach",
    description:
      "Chat with an AI coach to clarify goals, work through challenges, and take meaningful steps forward.",
    color: "violet",
    bg: "from-violet-50 to-indigo-50",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    border: "hover:border-violet-300",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Claude AI Tools
          </h1>
          <p className="text-gray-500 text-lg">
            Two tools powered by Claude — choose one to get started.
          </p>
        </div>

        <div className="grid gap-4">
          {features.map(
            ({
              path,
              icon: Icon,
              title,
              description,
              bg,
              iconBg,
              iconColor,
              border,
            }) => (
              <Card
                key={path}
                className={`cursor-pointer border-2 border-transparent ${border} transition-all hover:shadow-md bg-gradient-to-br ${bg}`}
                onClick={() => navigate(path)}
              >
                <CardContent className="p-6 flex gap-5 items-start">
                  <div
                    className={`${iconBg} p-3 rounded-xl shrink-0`}
                  >
                    <Icon className={`h-7 w-7 ${iconColor}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      {title}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Requires the API server running on localhost:3001
        </p>
      </div>
    </div>
  );
};

export default Index;
