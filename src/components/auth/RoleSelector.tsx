'use client';

import { Search, Store } from 'lucide-react';
import { useState } from 'react';

export type UserRole = 'USER' | 'BUSINESS_OWNER';

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  icon: any;
}

const roleOptions: RoleOption[] = [
  {
    id: 'USER',
    title: 'Find Tea Shops',
    description: 'I want to discover and review loaded tea shops',
    icon: Search
  },
  {
    id: 'BUSINESS_OWNER',
    title: 'List My Business',
    description: 'I own a loaded tea shop and want to manage my listing',
    icon: Store
  }
];

interface RoleSelectorProps {
  selectedRole: UserRole | null;
  onSelectRole: (role: UserRole) => void;
}

export function RoleSelector({ selectedRole, onSelectRole }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {roleOptions.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelectRole(option.id)}
          className={`p-6 rounded-xl border transition-all duration-300 ${
            selectedRole === option.id
              ? 'border-primary bg-primary/10'
              : 'border-white/10 hover:border-primary/50'
          }`}
        >
          <option.icon className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
          <p className="text-muted-foreground">{option.description}</p>
        </button>
      ))}
    </div>
  );
}
