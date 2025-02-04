import React, { useState, useRef, useEffect } from 'react';
import { ChatCategory } from './types';
import {
  MessageCircle,
  Users,
  Bug,
  Phone,
  CheckCircle,
  UserPlus,
  Clock,
  ListFilter
} from 'lucide-react';

import '../css/Agentes/ChatCategories.css'

interface ChatCategoriesProps {
  onCategoryChange: (category: string) => void;
  initialCategory?: string;
}

const categories: ChatCategory[] = [
  { icon: <ListFilter size={15} />, label: 'Todos' },
  { icon: <MessageCircle size={15} />, label: 'sin gestionar' },
  { icon: <Users size={15} />, label: 'conversacion' },
  { icon: <Bug size={15} />, label: 'depuracion' },
  { icon: <Phone size={15} />, label: 'llamada' },
  { icon: <Clock size={15} />, label: 'segunda llamada' },
  { icon: <CheckCircle size={15} />, label: 'inscrito' },
  { icon: <UserPlus size={15} />, label: 'venta perdida' },
  { icon: <UserPlus size={15} />, label: 'gestionado' }
];

const STORAGE_KEY = 'navActiveCategory';

const ChatCategories: React.FC<ChatCategoriesProps> = ({ 
  onCategoryChange,
  initialCategory = 'Todos'
}) => {
  const [activeCategory, setActiveCategory] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const index = categories.findIndex(cat => cat.label === saved);
      return index !== -1 ? index : 0;
    }
    return categories.findIndex(cat => cat.label === initialCategory) || 0;
  });

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, categories[activeCategory].label);
    onCategoryChange(categories[activeCategory].label);
  }, [activeCategory]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      };
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current!.offsetLeft);
    setScrollLeft(containerRef.current!.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current!.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current!.scrollLeft = scrollLeft - walk;
  };

  const handleCategoryClick = (index: number) => {
    setActiveCategory(index);
  };

  return (
    <div className="Nav_Categories_Container">
      <div
        ref={containerRef}
        className={`Nav_Categories_Scroll ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <div className="Nav_Categories_List">
          {categories.map((category, index) => (
            <button
              key={category.label}
              className={`Nav_Category_Btn ${activeCategory === index ? 'active' : ''}`}
              onClick={() => handleCategoryClick(index)}
            >
              {category.icon}
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatCategories;