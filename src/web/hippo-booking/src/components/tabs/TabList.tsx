import { ReactElement, useEffect, useRef, useState } from "react";
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
  const [isFocused, setIsFocused] = useState(false);

  const tabButtonRef = useRef<(HTMLButtonElement | null)[]>([]);
  const tabListRef = useRef<HTMLDivElement | null>(null);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    onChange(index);
  };

  const tabs = React.Children.toArray(children).filter(
    (child): child is ReactElement<TabItemProps> => React.isValidElement(child) && child.type === TabItem,
  );

  const handleKeyDownEvent = (event: KeyboardEvent) => {
    if (!isFocused) return;

    let newActiveTab = activeTab;
    if (event.key === "ArrowLeft") {
      newActiveTab = (activeTab - 1 + tabs.length) % tabs.length;
    } else if (event.key === "ArrowRight") {
      newActiveTab = (activeTab + 1) % tabs.length;
    } else if (event.key === "Home") {
      newActiveTab = 0;
    } else if (event.key === "End") {
      newActiveTab = tabs.length - 1;
    }

    if (newActiveTab !== activeTab) {
      handleTabActivation(newActiveTab);
    }
  };

  useEffect(() => {
    if (isFocused) {
      document.addEventListener("keydown", handleKeyDownEvent);
    } else {
      document.removeEventListener("keydown", handleKeyDownEvent);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDownEvent);
    };
  }, [isFocused, activeTab, tabs.length]);

  const handleTabActivation = (newActiveTab: number) => {
    setActiveTab(newActiveTab);
    tabButtonRef.current[newActiveTab]?.focus();
    onChange(newActiveTab);
  };

  return (
    <div className='tabs' ref={tabListRef} tabIndex={-1}>
      <nav className='tab-list-wrapper' id='tab-nav' aria-label='tab'>
        <div
          className='tab-list'
          role='tablist'
          aria-orientation='horizontal'
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          {tabs.map((tab, index) => (
            <button
              key={`tab-button-${index}`}
              role='tab'
              ref={(el) => {
                tabButtonRef.current[index] = el;
              }}
              id={`tab-${sanitiseForId(tab.props.label)}`}
              aria-controls={`panel-${sanitiseForId(tab.props.label)}`}
              aria-selected={activeTab === index}
              onClick={() => handleTabClick(index)}
              className={`tab-btn ${activeTab === index && "tab-btn--active"}`}
              onFocus={() => handleTabActivation(index)}
              tabIndex={activeTab !== index ? -1 : 0}
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
