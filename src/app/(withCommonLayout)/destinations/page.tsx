import { destinations } from '@/src/lib/data';
import DestinationGrid from '../_component/module/destination/destinationGrid';
import BackButton from '../../(withAuthLayout)/_component/ui/backButton';

export default function DestinationPage() {
  return (
    <div className="max-w-7xl mx-auto px-2 md:px-4 py-8 pt-20 space-y-5">
      <BackButton />
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-8 text-sage-700 dark:text-sage-300">
        Discover Amazing Destinations
      </h1>
      <DestinationGrid destinations={destinations} />
    </div>
  );
}
