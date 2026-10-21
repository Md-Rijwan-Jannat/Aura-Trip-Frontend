import { Card } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";

interface TTermSectionCardProps {
  title: string;
  content: React.ReactNode;
  icon: React.ReactNode;
  sectionRef: React.RefObject<HTMLDivElement>;
}

const TermSectionCard = ({
  title,
  content,
  icon,
  sectionRef,
}: TTermSectionCardProps) => (
  <Card
    ref={sectionRef}
    className="p-6 mb-8 shadow-lg bg-default-50 border border-default-100"
  >
    <div className="flex items-center mb-4">
      <div className="mr-4 text-sage-600 dark:text-sage-400">{icon}</div>
      <p className="text-lg md:text-2xl font-bold text-sage-600 dark:text-sage-400">{title}</p>
    </div>
    <Divider className="my-4" />
    <div className="text-xs md:text-sm text-default-700">{content}</div>
  </Card>
);

export default TermSectionCard;
