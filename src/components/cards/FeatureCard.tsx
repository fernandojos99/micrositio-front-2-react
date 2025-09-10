import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  LucideIcon,
  Bot,
  Briefcase,
  Users,
  Settings,
  BookOpen,
  BarChart,
  FileText,
  Database,
  Zap,
  Shield,
  Globe,
  Search,
  TrendingUp,
  Lightbulb,
  Target,
  TestTube,
  UserCheck,
  Layers
} from 'lucide-react';

// Mapeo de strings a iconos
const iconMap: Record<string, LucideIcon> = {
  bot: Bot,
  briefcase: Briefcase,
  users: Users,
  settings: Settings,
  book: BookOpen,
  chart: BarChart,
  file: FileText,
  database: Database,
  zap: Zap,
  shield: Shield,
  globe: Globe,
  search: Search,
  trending: TrendingUp,
  lightbulb: Lightbulb,
  target: Target,
  test: TestTube,
  usercheck: UserCheck,
  layers: Layers
};

interface FeatureCardProps {
  nombre: string;
  descripcion: string;
  link: string;
  icon?: LucideIcon | string;
  colorClass?: string;
  bgColor?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  nombre, 
  descripcion, 
  link,
  icon,
  bgColor = "bg-gradient-to-br from-blue-50 to-indigo-100"
}) => {
  // Determinar qué icono usar
  let IconComponent: LucideIcon | null = null;
  
  if (icon) {
    if (typeof icon === 'string') {
      IconComponent = iconMap[icon] || null;
    } else {
      IconComponent = icon;
    }
  }

  return (
    <div className={`h-full min-h-[200px] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 ${bgColor} border border-gray-100`}>
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-start mb-4">
          {IconComponent && (
            <div className="flex-shrink-0 mr-3">
              <IconComponent className="h-8 w-8 text-gray-600" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 leading-tight">{nombre}</h3>
            <p className="text-sm text-gray-600 leading-relaxed flex-grow">{descripcion}</p>
          </div>
        </div>
        <Link 
          to={link} 
          className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800 mt-auto group text-sm transition-colors"
        >
          Explorar <ChevronRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default FeatureCard;