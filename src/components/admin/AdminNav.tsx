import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  ADMIN_NAV,
  ADMIN_MOBILE_SECTIONS,
  getAdminTabGroupId,
  type AdminTab,
  type AdminNavGroup,
  type AdminNavItem,
} from './adminNavConfig';

const COLLAPSIBLE_GROUP_IDS = ['operasional', 'marketplace', 'konten'] as const;

function isCollapsibleGroupId(id: string | null): id is (typeof COLLAPSIBLE_GROUP_IDS)[number] {
  return id != null && COLLAPSIBLE_GROUP_IDS.includes(id as (typeof COLLAPSIBLE_GROUP_IDS)[number]);
}

interface Props {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  newOrderCount?: number;
  pendingModerationCount?: number;
}

function NavButton({
  item,
  active,
  onClick,
  badge,
  compact,
}: {
  item: AdminNavItem;
  active: boolean;
  onClick: () => void;
  badge?: number;
  compact?: boolean;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full flex items-center gap-2.5 rounded-lg text-sm font-medium transition-colors ${
        compact ? 'px-3 py-2' : 'px-3 py-2.5'
      } ${
        active
          ? 'bg-red-50 text-red-700 ring-1 ring-red-100'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-red-600' : 'text-gray-400'}`} />
      <span className="truncate">{item.label}</span>
      {badge != null && badge > 0 && (
        <span className="ml-auto bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}

function SidebarGroup({
  group,
  activeTab,
  onTabChange,
  newOrderCount,
  pendingModerationCount,
  expanded,
  onToggle,
}: {
  group: AdminNavGroup;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  newOrderCount: number;
  pendingModerationCount: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const GroupIcon = group.icon;
  const hasActiveChild = group.items.some((i) => i.id === activeTab);
  const groupBadge =
    group.id === 'operasional' && newOrderCount > 0 ? newOrderCount : undefined;

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors ${
          hasActiveChild
            ? 'text-red-700 bg-red-50/80 hover:bg-red-50'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
        }`}
      >
        <GroupIcon className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="flex-1 text-left truncate">{group.label}</span>
        {groupBadge != null && (
          <span className="bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {groupBadge > 99 ? '99+' : groupBadge}
          </span>
        )}
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
        )}
      </button>
      {expanded && (
        <div className="mt-0.5 space-y-0.5 pl-1">
          {group.items.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={activeTab === item.id}
              onClick={() => onTabChange(item.id)}
              badge={
                item.id === 'pesanan'
                  ? newOrderCount
                  : item.id === 'moderasi'
                    ? pendingModerationCount
                    : undefined
              }
              compact
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminNav({
  activeTab,
  onTabChange,
  newOrderCount = 0,
  pendingModerationCount = 0,
}: Props) {
  const activeGroupId = getAdminTabGroupId(activeTab);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    if (isCollapsibleGroupId(activeGroupId)) {
      return new Set([activeGroupId]);
    }
    return new Set();
  });

  useEffect(() => {
    if (isCollapsibleGroupId(activeGroupId)) {
      setExpandedGroups(new Set([activeGroupId]));
    } else {
      setExpandedGroups(new Set());
    }
  }, [activeGroupId]);

  const toggleGroup = (groupId: string, accordion = false) => {
    setExpandedGroups((prev) => {
      if (prev.has(groupId)) {
        const next = new Set(prev);
        next.delete(groupId);
        return next;
      }
      return accordion ? new Set([groupId]) : new Set(prev).add(groupId);
    });
  };

  const collapseAllGroups = () => setExpandedGroups(new Set());

  const mobileExpandedGroupId = COLLAPSIBLE_GROUP_IDS.find((id) => expandedGroups.has(id)) ?? null;

  const mobileSubMenuGroup = mobileExpandedGroupId
    ? ADMIN_NAV.find((e) => e.type === 'group' && e.group.id === mobileExpandedGroupId)
    : null;
  const subItems =
    mobileSubMenuGroup?.type === 'group' ? mobileSubMenuGroup.group.items : [];

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:block w-56 flex-shrink-0">
        <div className="sticky top-20 bg-white rounded-xl border border-gray-100 shadow-sm p-2 space-y-1">
          {ADMIN_NAV.map((entry) =>
            entry.type === 'item' ? (
              <NavButton
                key={entry.item.id}
                item={entry.item}
                active={activeTab === entry.item.id}
                onClick={() => {
                  collapseAllGroups();
                  onTabChange(entry.item.id);
                }}
              />
            ) : (
              <SidebarGroup
                key={entry.group.id}
                group={entry.group}
                activeTab={activeTab}
                onTabChange={onTabChange}
                newOrderCount={newOrderCount}
                pendingModerationCount={pendingModerationCount}
                expanded={expandedGroups.has(entry.group.id)}
                onToggle={() => toggleGroup(entry.group.id, true)}
              />
            )
          )}
        </div>
      </nav>

      {/* Mobile: bar utama + sub-menu toggle */}
      <div className="lg:hidden space-y-2 mb-6">
        <div className="bg-slate-800 rounded-xl p-2 shadow-sm">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {ADMIN_MOBILE_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isStandalone = !!section.tab;
              const isGroupExpanded = section.groupId
                ? expandedGroups.has(section.groupId)
                : false;
              const isInGroup = section.groupId === activeGroupId;
              const isActive = isStandalone
                ? activeTab === section.tab
                : isGroupExpanded || isInGroup;
              const showBadge =
                section.groupId === 'operasional' && newOrderCount > 0 && !isGroupExpanded;

              return (
                <button
                  key={section.id}
                  type="button"
                  aria-expanded={section.groupId ? isGroupExpanded : undefined}
                  onClick={() => {
                    if (section.tab) {
                      collapseAllGroups();
                      onTabChange(section.tab);
                    } else if (section.groupId) {
                      toggleGroup(section.groupId, true);
                    }
                  }}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                    isActive
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-slate-700/60 text-slate-200 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {section.label}
                  {section.groupId && (
                    isGroupExpanded ? (
                      <ChevronDown className="w-3 h-3 opacity-80" />
                    ) : (
                      <ChevronRight className="w-3 h-3 opacity-80" />
                    )
                  )}
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5 border-2 border-slate-800">
                      {newOrderCount > 99 ? '99+' : newOrderCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {subItems.length > 0 && mobileSubMenuGroup?.type === 'group' && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-2 shadow-sm">
            <button
              type="button"
              onClick={() => toggleGroup(mobileSubMenuGroup.group.id, true)}
              className="w-full flex items-center justify-between gap-2 px-1 mb-1.5 text-left"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-red-500">
                {mobileSubMenuGroup.group.label}
              </p>
              <ChevronDown className="w-3.5 h-3.5 text-red-400" />
            </button>
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {subItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                    const badge =
                      item.id === 'pesanan'
                        ? newOrderCount
                        : item.id === 'moderasi'
                          ? pendingModerationCount
                          : 0;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onTabChange(item.id)}
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                      isActive
                        ? 'bg-white text-red-700 shadow-sm ring-1 ring-red-200'
                        : 'text-red-900/70 hover:bg-white/70 hover:text-red-800'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-600' : 'text-red-400'}`} />
                    {item.label}
                    {badge > 0 && (
                      <span className="bg-red-600 text-white text-[8px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
