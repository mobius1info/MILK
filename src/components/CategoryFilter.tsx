import { Category } from '../types';
import * as Icons from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: 'thin' }}>
          <button
            onClick={() => onSelectCategory(null)}
            className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all snap-start ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Products
          </button>
          {categories.map((category) => {
            const Icon = Icons[category.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all snap-start ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
