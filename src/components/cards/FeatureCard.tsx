import React from 'react';
import { Link } from 'react-router-dom';
import { 
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
import styles from './FeatureCard.module.css';
import chatgptIcon from '../../icons8-chatgpt-50.png';

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
  chatLink?: string; // Link para ChatGPT
  icon?: LucideIcon | string;
  colorClass?: string;
  bgColor?: string;
  onExplorarClick?: () => void; // Nueva función para manejar clic en "Explorar prompt"
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  nombre, 
  descripcion, 
  link,
  icon,
  bgColor = "bg-gradient-to-br from-blue-50 to-indigo-100",
  onExplorarClick
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

  // Mapear las clases de bgColor de Tailwind a CSS modules
  const bgClassMap: Record<string, string> = {
    "bg-gradient-to-br from-teal-50 to-cyan-100": styles.bgTealCyan,
    "bg-gradient-to-br from-blue-50 to-indigo-100": styles.bgBlueIndigo,
    "bg-gradient-to-br from-gray-50 to-slate-100": styles.bgGraySlate,
    "bg-gradient-to-br from-purple-50 to-violet-100": styles.bgPurpleViolet,
    "bg-gradient-to-br from-yellow-50 to-amber-100": styles.bgYellowAmber,
    "bg-gradient-to-br from-green-50 to-emerald-100": styles.bgGreenEmerald,
    "bg-gradient-to-br from-pink-50 to-rose-100": styles.bgPinkRose,
    "bg-gradient-to-br from-indigo-50 to-blue-100": styles.bgIndigoBlue,
    "bg-gradient-to-br from-purple-50 to-pink-100": styles.bgPurplePink,
  };

  const backgroundClass = bgClassMap[bgColor] || styles.bgBlueIndigo;

  return (
    <div className={`${styles.card} ${backgroundClass}`}>
      <div className={styles.cardContent}>
        <div className={styles.header}>
          {IconComponent && (
            <div className={styles.iconContainer}>
              <IconComponent className={styles.icon} />
            </div>
          )}
          <div className={styles.textContainer}>
            <h3 className={styles.title}>{nombre}</h3>
            <p className={styles.description}>{descripcion}</p>
          </div>
        </div>
        
        {/* Icono de ChatGPT en esquina inferior derecha */}
        <Link to={link} className="absolute bottom-3 right-3 w-10 h-10 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg">
          <img src={chatgptIcon} alt="Ver en ChatGPT" className="w-6 h-6" />
        </Link>
        
        {/* Botón "Explorar prompt" en esquina superior derecha */}
        {onExplorarClick ? (
          <button 
            onClick={onExplorarClick}
            className="absolute top-3 right-3 px-3 py-1 text-xs text-purple-600 hover:text-purple-800 border border-purple-300 rounded-md hover:bg-purple-50 transition-colors shadow-sm bg-white"
          >
            Explorar prompt 
          </button>
        ) : (
          <Link to={link} className="absolute top-3 right-3 px-3 py-1 text-xs text-purple-600 hover:text-purple-800 border border-purple-300 rounded-md hover:bg-purple-50 transition-colors shadow-sm bg-white flex items-center">
            Explorar prompt 
          </Link>
        )}
        
      </div>
    </div>
  );
};

export default FeatureCard;