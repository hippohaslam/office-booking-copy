import React, { ReactNode } from "react";
import "./Tabs.scss";
import { sanitiseForId } from "../../helpers/StringHelpers";

type TabItemProps = {
  label: string;
  children: ReactNode;
};

const TabItem: React.FC<TabItemProps> = ({ label, children }) => {
  return (
    <div className='tab-panel' role='tabpanel' aria-labelledby={`tab-${sanitiseForId(label)}`} id={`panel-${sanitiseForId(label)}`} tabIndex={0}>
      {children}
    </div>
  );
};

export default TabItem;
export type { TabItemProps };
