import React from 'react';

interface SpecialOpenHour {
  start: string;
  end: string;
  label: string;
  isClosed: boolean;
  openTime: string;
  closeTime?: string;
}

interface StoreSpecialOpeningHoursProps {
  specialOpenHours: SpecialOpenHour[];
}

const formatTime = (time: string): string => {
  if (!time || time === '0000') return '';
  const hours = time.slice(0, 2);
  const minutes = time.slice(2, 4);
  return minutes === '00' ? hours : `${hours}:${minutes}`;
};

const parseDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDate = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  return `${day}/${month}`;
};

const formatDateRange = (start: string, end: string): string => {
  if (start === end) return formatDate(start);
  return `${formatDate(start)} - ${formatDate(end)}`;
};

const StoreSpecialOpeningHours: React.FC<StoreSpecialOpeningHoursProps> = ({
  specialOpenHours,
}) => {
  if (!specialOpenHours?.length) return null;

  const today = new Date();
  const todayLocal = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const upcomingHours = specialOpenHours
    .filter((hour) => parseDate(hour.end) >= todayLocal)
    .sort((a, b) => parseDate(a.start).getTime() - parseDate(b.start).getTime())
    .slice(0, 10);

  if (!upcomingHours.length) return null;

  return (
    <div className="divide-y divide-dashed">
      {upcomingHours.map((hour, index) => {
        const dateRange = formatDateRange(hour.start, hour.end);
        const hoursDisplay = hour.isClosed
          ? 'Stängt'
          : hour.closeTime
            ? `${formatTime(hour.openTime)}–${formatTime(hour.closeTime)}`
            : formatTime(hour.openTime);

        return (
          <div key={index} className="grid w-1/2 grid-cols-2 gap-4 py-2">
            <div>
              {hour.label && <p className="font-medium">{hour.label}</p>}
              <p
                className={hour.label ? 'text-sm text-gray-600' : 'font-medium'}
              >
                {dateRange}
              </p>
            </div>
            <p>{hoursDisplay}</p>
          </div>
        );
      })}
    </div>
  );
};

export default StoreSpecialOpeningHours;
