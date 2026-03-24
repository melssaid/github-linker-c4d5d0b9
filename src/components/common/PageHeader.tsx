import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  description: string;
  tooltip?: string;
}

export function PageHeader({ title, description, tooltip }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2">
        <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
        {tooltip && <InfoTooltip content={tooltip} />}
      </div>
      <p className="text-muted-foreground text-sm mt-1">{description}</p>
    </motion.div>
  );
}
