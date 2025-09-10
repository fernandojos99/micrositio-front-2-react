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
  Search
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
  search: Search
};

interface FeatureCardProps {
  nombre: string;
  descripcion: string;
  link: string;
  icon?: LucideIcon | string;
  colorClass?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  nombre, 
  descripcion, 
  link,
  icon,
  colorClass = "from-primary-purple to-secondary-purple"
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
    <div className="h-full min-h-[250px] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-600 to-blue-600 text-white">
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center mb-3">
          {IconComponent && <IconComponent className="h-8 w-8 mr-3" />}
          <h2 className="text-2xl font-bold">{nombre}</h2>
        </div>
        <p className="mb-4 flex-grow">{descripcion}</p>
        <Link 
          to={link} 
          className="inline-flex items-center text-white font-medium hover:underline mt-auto group"
        >
          Explorar <ChevronRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default FeatureCard;