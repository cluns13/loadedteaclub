'use client';

import { useState, useEffect } from 'react';

interface BusinessHoursEditorProps {
  businessId: string;
  hours?: Record<string, string>;
  isEditing: boolean;
  onUpdate: (hours: Record<string, string>) => void;
}

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export function BusinessHoursEditor({ businessId, hours = {}, isEditing, onUpdate }: BusinessHoursEditorProps) {
  const [localHours, setLocalHours] = useState<Record<string, string>>(hours);
  const [isLoading, setIsLoading] = useState(false);

  const handleHourChange = (day: string, value: string) => {
    setLocalHours(prev => ({
      ...prev,
      [day]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await fetch(`/api/business/${businessId}/hours`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hours: localHours }),
      });
      onUpdate(localHours);
    } catch (error) {
      console.error('Failed to update hours:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {DAYS.map(day => (
        <div key={day} className="flex items-center gap-4">
          <label className="w-24 capitalize">{day}</label>
          <input
            type="text"
            value={localHours[day] || ''}
            onChange={(e) => handleHourChange(day, e.target.value)}
            placeholder="9:00 AM - 5:00 PM"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
            disabled={!isEditing}
          />
        </div>
      ))}
      {isEditing && (
        <LoadingButton
          onClick={handleSave}
          isLoading={isLoading}
          className="mt-4"
        >
          Save Hours
        </LoadingButton>
      )}
    </div>
  );
}
