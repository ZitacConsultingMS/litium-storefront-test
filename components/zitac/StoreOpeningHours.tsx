type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

interface TimeSpan {
  open: string;
  close: string;
}

interface DayInfo {
  state: 'Open' | 'Closed';
  span: TimeSpan[];
}

interface OpenHours {
  mon: DayInfo;
  tue: DayInfo;
  wed: DayInfo;
  thu: DayInfo;
  fri: DayInfo;
  sat: DayInfo;
  sun: DayInfo;
}

interface GroupedHours {
  days: string[];
  hours: string;
}

const DAYS_MAP: Record<DayKey, string> = {
  mon: 'Måndag',
  tue: 'Tisdag',
  wed: 'Onsdag',
  thu: 'Torsdag',
  fri: 'Fredag',
  sat: 'Lördag',
  sun: 'Söndag',
};

const formatTime = (time: string): string => {
  const hours = time.slice(0, 2);
  const minutes = time.slice(2, 4);
  return minutes === '00' ? hours : `${hours}:${minutes}`;
};

const formatHours = (spans: TimeSpan[]): string => {
  if (spans.length === 0) return 'Stängt';

  return spans
    .map((span) => `${formatTime(span.open)}–${formatTime(span.close)}`)
    .join(', ');
};

const processOpenHours = (openHours: OpenHours): GroupedHours[] => {
  const groupedHours: GroupedHours[] = [];
  let currentGroup: GroupedHours | null = null;

  Object.entries(openHours).forEach(([day, info]) => {
    const dayName = DAYS_MAP[day as DayKey];
    const { state, span } = info;
    const hours =
      state === 'Open' && span.length > 0 ? formatHours(span) : 'Stängt';

    if (currentGroup && currentGroup.hours === hours) {
      currentGroup.days.push(dayName);
    } else {
      if (currentGroup) groupedHours.push(currentGroup);
      currentGroup = { days: [dayName], hours };
    }
  });

  if (currentGroup) groupedHours.push(currentGroup);

  return groupedHours;
};

const formatGroupedHours = (groupedHours: GroupedHours[]) =>
  groupedHours.map(({ days, hours }, index) => {
    const dayRange =
      days.length > 1 ? `${days[0]} - ${days[days.length - 1]}` : days[0];
    return (
      <div key={index} className="grid w-1/2 grid-cols-2 gap-4 py-2">
        <p className="font-medium">{dayRange}</p>
        <p>{hours}</p>
      </div>
    );
  });

interface StoreHoursProps {
  openHours: OpenHours;
}

const StoreOpeningHours: React.FC<StoreHoursProps> = ({ openHours }) => {
  const groupedHours = processOpenHours(openHours);

  return (
    <div className="divide-y divide-dashed">
      {formatGroupedHours(groupedHours).map((line, index) => (
        <div key={index}>{line}</div>
      ))}
    </div>
  );
};

export default StoreOpeningHours;
