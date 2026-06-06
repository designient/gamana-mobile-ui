import { useState } from 'react';
import type { UserTour, CityPack } from '../../types';
import MyToursSection from './MyToursSection';
import RecommendedToursSection from './RecommendedToursSection';

type ToursSubTab = 'my_tours' | 'recommended';

const SUB_TABS: { id: ToursSubTab; label: string }[] = [
  { id: 'my_tours', label: 'My Tours' },
  { id: 'recommended', label: 'Recommended' },
];

interface ToursTabContentProps {
  userTours: UserTour[];
  userToursLoading: boolean;
  recommendedPacks: CityPack[];
  packsLoading: boolean;
  onCreateTour: () => void;
  onTapUserTour: (tour: UserTour) => void;
  onDeleteTour: (tourId: string) => void;
  onTapRecommendedPack: (packId: string) => void;
}

export default function ToursTabContent({
  userTours,
  userToursLoading,
  recommendedPacks,
  packsLoading,
  onCreateTour,
  onTapUserTour,
  onDeleteTour,
  onTapRecommendedPack,
}: ToursTabContentProps) {
  const [subTab, setSubTab] = useState<ToursSubTab>('my_tours');

  return (
    <div className="flex flex-col pb-4">
      <div className="px-4 pt-4 pb-2">
        <div className="flex gap-1.5 p-1 rounded-xl bg-canvas">
          {SUB_TABS.map((tab) => {
            const isActive = tab.id === subTab;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                className={`
                  flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200
                  ${isActive
                    ? 'bg-gamana-500 text-white shadow-sm'
                    : 'text-gamana-600/50 hover:text-gamana-600'
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {subTab === 'my_tours' && (
        <MyToursSection
          tours={userTours}
          isLoading={userToursLoading}
          onCreateTour={onCreateTour}
          onTapTour={onTapUserTour}
          onDeleteTour={onDeleteTour}
        />
      )}

      {subTab === 'recommended' && (
        <RecommendedToursSection
          packs={recommendedPacks}
          isLoading={packsLoading}
          onTapPack={onTapRecommendedPack}
        />
      )}
    </div>
  );
}
