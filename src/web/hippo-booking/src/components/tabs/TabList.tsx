import { ReactElement, useState } from "react";
import "./Tabs.scss";
import React from "react";
import { sanitiseForId } from "../../helpers/StringHelpers";
import TabItem, { TabItemProps } from "./TabItem";

type TabProps = {
  activeTabIndex: number;
  children: ReactElement<TabItemProps> | ReactElement<TabItemProps>[];
  onChange: (index: number) => void;
};

const TabList: React.FC<TabProps> = ({ activeTabIndex, children, onChange }) => {
  const [activeTab, setActiveTab] = useState(activeTabIndex);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    onChange(index);
  };

  const tabs = React.Children.toArray(children).filter(
    (child): child is ReactElement<TabItemProps> => React.isValidElement(child) && child.type === TabItem,
  );

  return (
    <div className='tabs'>
      <nav className='tab-list-wrapper' id='tab-nav' aria-label='tab'>
        <div className='tab-list' role='tablist' aria-orientation='horizontal'>
          {tabs.map((tab, index) => (
              <button
                key={`tab-${index}`}
                role='tab'
                id={`tab-${sanitiseForId(tab.props.label)}`}
                aria-controls={`panel-${sanitiseForId(tab.props.label)}`}
                aria-selected={activeTab === index}
                onClick={() => handleTabClick(index)}
                className={`tab-btn ${activeTab === index && "tab-btn--active"}`}
              >
                {tab.props.label}
              </button>
          ))}
        </div>
      </nav>
      {tabs[activeTab]}
    </div>
  );
};

export default TabList;
export type { TabProps };
