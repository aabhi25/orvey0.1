import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { WhatsAppNavSections } from "@/components/whatsapp/WhatsAppNavSections";
import { isWhatsappLocation } from "@/components/whatsapp/sections";
import { SETTINGS_PATHS } from "@/pages/settings/settingsPaths";
// AI Calling (C)
import { CallingNavGroupItem, CallingNavFlat } from "@/components/calling/CallingNav";
import { useAiCallingAvailability } from "@/lib/aiCallingApi";
import { Button } from "@/components/ui/button";
import { Package, HelpCircle, ShieldCheck, LogOut, Contact, Home, Building2, Sparkles, Settings, Brain, BarChart3, MessageSquare, ShoppingBag, Calendar, GraduationCap, ChevronRight, Presentation, FileText, Key, LifeBuoy, ClipboardList, Route, Link2, Users, DollarSign, Percent, HardDrive, Gem, Image, Database, Camera, Cloud, Globe, Lightbulb, MessageCircle, MoreHorizontal, Bot, TrendingUp, Zap, BookOpen, Library, HelpCircle as QuizIcon, Briefcase, UserCircle, Terminal, PackageOpen, Megaphone, FileCode2, UsersRound, ScrollText, Gauge } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { AccountSwitcher } from "@/components/AccountSwitcher";
import type { MeResponseDto } from "@shared/dto";

interface AppSidebarProps {
  user: MeResponseDto | null;
}

function NavItem({ icon: Icon, label, onClick, isActive, badge, testId }: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  isActive: boolean;
  badge?: number;
  testId?: string;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={onClick}
        isActive={isActive}
        data-testid={testId}
        className={`group/nav relative transition-all duration-200 ${
          isActive
            ? 'bg-white/[0.08] text-white font-medium shadow-sm ring-1 ring-white/10'
            : 'text-ink-200 hover:bg-white/[0.06] hover:text-white'
        }`}
      >
        <div className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-gradient-to-br from-brand-500 to-brand-800 shadow-sm shadow-black/40'
            : 'bg-white/[0.06] group-hover/nav:bg-white/10'
        }`}>
          <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-white' : 'text-ink-300 group-hover/nav:text-white'}`} />
        </div>
        <span className="text-[14px]">{label}</span>
        {badge && badge > 0 ? (
          <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0 h-5 min-w-5 flex items-center justify-center" data-testid="badge-ticket-count">
            {badge}
          </Badge>
        ) : null}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar({ user }: AppSidebarProps) {
  const [location, setLocation] = useLocation();

  const isSuperAdmin = user?.role === "super_admin";
  const isSuperAdminImpersonating = isSuperAdmin && !!user?.activeBusinessAccountId;
  const isGroupAdmin = user?.role === "account_group_admin";
  const showBusinessNav = (!isSuperAdmin && !isGroupAdmin) || isSuperAdminImpersonating;
  
  const productTier = user?.businessAccount?.productTier || 'chroney';
  const hasChroneyAccess = user?.businessAccount?.chroneyEnabled === true;
  const isTopscholar = user?.businessAccount?.isTopscholar === true;
  const hasJewelryAccess = productTier === 'jewelry_showcase' || productTier === 'jewelry_showcase_chroney';
  
  const hasShopifyEnabled = user?.businessAccount?.shopifyEnabled === true;
  const hasAppointmentsEnabled = user?.businessAccount?.appointmentsEnabled === true && hasChroneyAccess;
  const hasSupportTicketsEnabled = user?.businessAccount?.supportTicketsEnabled === true;
  const hasJewelryShowcaseEnabled = hasJewelryAccess && (
    productTier === 'jewelry_showcase' || 
    user?.businessAccount?.jewelryShowcaseEnabled === true
  );
  const hasWhatsappEnabled = user?.businessAccount?.whatsappEnabled === true;
  const hasWhatsappMarketingEnabled = hasWhatsappEnabled && user?.businessAccount?.whatsappMarketingEnabled === true;
  const hasInstagramEnabled = user?.businessAccount?.instagramEnabled === true;
  const hasFacebookEnabled = user?.businessAccount?.facebookEnabled === true;
  // AI Calling (C): "Phone calls" agent, only when the super admin switched it on.
  const { enabled: hasAiCallingEnabled } = useAiCallingAvailability(showBusinessNav ? user : null);
  
  const hasTrainingAccess = hasChroneyAccess || hasWhatsappEnabled || hasInstagramEnabled || hasFacebookEnabled;
  const hasProductsAccess = hasChroneyAccess || hasWhatsappEnabled || hasJewelryAccess;
  const hasMoreFeaturesAccess = hasChroneyAccess || hasWhatsappEnabled;
  
  const systemMode = user?.businessAccount?.systemMode || 'full';
  const showFullFeatures = isSuperAdminImpersonating || systemMode === 'full';
  const isEducationK12 = user?.businessAccount?.k12EducationEnabled === true;
  const isJobPortal = user?.businessAccount?.jobPortalEnabled === true;
  const hasDemoOrdersEnabled = user?.businessAccount?.demoOrdersEnabled === true;

  // Seeded open when the user is already somewhere in WhatsApp, so a page refresh does not
  // collapse the navigation out from under whichever screen they are looking at.
  const [whatsappNavOpen, setWhatsappNavOpen] = useState(() => isWhatsappLocation(location));

  const enabledAgentCount = [hasChroneyAccess, hasWhatsappEnabled, hasInstagramEnabled, hasFacebookEnabled, hasAiCallingEnabled].filter(Boolean).length;
  const isSingleProduct = enabledAgentCount === 1;
  const hasAnyAgent = hasChroneyAccess || hasWhatsappEnabled || hasInstagramEnabled || hasFacebookEnabled || hasAiCallingEnabled;
  const hasWorkspaceItems = (hasTrainingAccess && showFullFeatures) || hasProductsAccess || hasAppointmentsEnabled || hasJewelryShowcaseEnabled;

  const { data: ticketStats } = useQuery<{ open: number }>({
    queryKey: ["/api/tickets/stats"],
    enabled: showBusinessNav && !!user,
  });
  
  const openTicketCount = ticketStats?.open || 0;

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      sessionStorage.removeItem("lastPath");
      queryClient.clear();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Sidebar className="border-r-0 sidebar-orvey">
      <SidebarHeader className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src="/orvey-logo.svg" className="w-9 h-9 object-contain" alt="Orvey" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-[15px] tracking-wide text-white">Orvey</h2>
            {showBusinessNav && user?.businessAccountId && user?.businessAccount?.name ? (
              <AccountSwitcher 
                businessName={user.businessAccount.name}
                businessAccountId={user.businessAccountId}
              />
            ) : (
              <p className="text-xs text-ink-300 font-medium">{user?.username}</p>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {showBusinessNav && (
          <>
            {isJobPortal ? (
              <>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu className="space-y-0.5">
                      <NavItem
                        icon={Home}
                        label="Home"
                        onClick={() => setLocation("/")}
                        isActive={location === "/"}
                        testId="link-home"
                      />
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                  <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-ink-300/70 font-semibold px-3 mb-1">Recruitment</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu className="space-y-0.5">
                      <NavItem
                        icon={Briefcase}
                        label="Jobs"
                        onClick={() => setLocation("/admin/jobs")}
                        isActive={location === "/admin/jobs"}
                        testId="link-jobs"
                      />
                      <NavItem
                        icon={UserCircle}
                        label="Applicants"
                        onClick={() => setLocation("/admin/applicants")}
                        isActive={location === "/admin/applicants"}
                        testId="link-applicants"
                      />
                      <NavItem
                        icon={MessageSquare}
                        label="Conversations"
                        onClick={() => setLocation("/conversations")}
                        isActive={location === "/conversations"}
                        testId="link-conversations"
                      />
                      <NavItem
                        icon={Contact}
                        label="Leads"
                        onClick={() => setLocation("/admin/leads")}
                        isActive={location === "/admin/leads"}
                        testId="link-leads"
                      />
                      <NavItem
                        icon={BarChart3}
                        label="Insights"
                        onClick={() => setLocation("/insights")}
                        isActive={location === "/insights"}
                        testId="link-insights"
                      />
                      <NavItem
                        icon={GraduationCap}
                        label="Training"
                        onClick={() => setLocation("/admin/training")}
                        isActive={location === "/admin/training" || location === "/train-orvey" || location === "/conversation-journeys" || location === "/admin/faqs" || location === "/admin/about" || location === "/admin/scan-docs" || location === "/admin/url-training"}
                        testId="link-training"
                      />
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </>
            ) : isEducationK12 ? (
              <>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu className="space-y-0.5">
                      <NavItem
                        icon={Home}
                        label="Home"
                        onClick={() => setLocation("/")}
                        isActive={location === "/"}
                        testId="link-home"
                      />
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                  <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-ink-300/70 font-semibold px-3 mb-1">Education</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu className="space-y-0.5">
                      {!isTopscholar && (
                        <NavItem
                          icon={BookOpen}
                          label="Content"
                          onClick={() => setLocation("/admin/k12/content")}
                          isActive={location.startsWith("/admin/k12/content") || location.startsWith("/admin/k12/topic")}
                          testId="link-k12-content"
                        />
                      )}
                      {isTopscholar && (
                        <NavItem
                          icon={Library}
                          label="Ext. Content"
                          onClick={() => setLocation("/admin/topscholar/content")}
                          isActive={location.startsWith("/admin/topscholar/content")}
                          testId="link-topscholar-content"
                        />
                      )}
                      {isTopscholar && (
                        <NavItem
                          icon={Terminal}
                          label="Testing"
                          onClick={() => setLocation("/admin/topscholar/tester")}
                          isActive={location.startsWith("/admin/topscholar/tester")}
                          testId="link-topscholar-tester"
                        />
                      )}
                      <NavItem
                        icon={MessageSquare}
                        label="Conversations"
                        onClick={() => setLocation("/conversations")}
                        isActive={location === "/conversations"}
                        testId="link-conversations"
                      />
                      <NavItem
                        icon={Contact}
                        label="Students"
                        onClick={() => setLocation("/admin/leads")}
                        isActive={location === "/admin/leads"}
                        testId="link-students"
                      />
                      {!isTopscholar && (
                        <NavItem
                          icon={BarChart3}
                          label="Insights"
                          onClick={() => setLocation("/insights")}
                          isActive={location === "/insights"}
                          testId="link-insights"
                        />
                      )}
                      {isTopscholar && (
                        <NavItem
                          icon={TrendingUp}
                          label="Analytics"
                          onClick={() => setLocation("/admin/topscholar/analytics")}
                          isActive={location.startsWith("/admin/topscholar/analytics")}
                          testId="link-topscholar-analytics"
                        />
                      )}
                      <NavItem
                        icon={GraduationCap}
                        label="Training"
                        onClick={() => setLocation("/admin/training")}
                        isActive={location === "/admin/training" || location === "/train-orvey" || location === "/conversation-journeys" || location === "/admin/faqs" || location === "/admin/about" || location === "/admin/scan-docs" || location === "/admin/url-training"}
                        testId="link-training"
                      />
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </>
            ) : (
            <>
            {hasChroneyAccess && (
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-0.5">
                    <NavItem
                      icon={Home}
                      label="Home"
                      onClick={() => setLocation("/")}
                      isActive={location === "/"}
                      testId="link-home"
                    />
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {hasJewelryShowcaseEnabled && (
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-0.5">
                    <NavItem
                      icon={Gem}
                      label="Vista Search"
                      onClick={() => setLocation("/jewelry-showcase")}
                      isActive={location === "/jewelry-showcase"}
                      testId="link-jewelry-showcase"
                    />
                    <NavItem
                      icon={Camera}
                      label="Vista Studio"
                      onClick={() => setLocation("/admin/jewelry-image-generator")}
                      isActive={location === "/admin/jewelry-image-generator"}
                      testId="link-vista-studio"
                    />
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {hasAnyAgent && !isSingleProduct && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-ink-300/70 font-semibold px-3 mb-1">AI Agents</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-0.5">
                    {hasChroneyAccess && (
                      <NavItem
                        icon={Globe}
                        label="Website"
                        onClick={() => setLocation("/admin/website")}
                        isActive={location === "/admin/website" || location === "/conversations" || location === "/admin/leads" || location === "/tickets" || location.startsWith("/tickets/") || location === "/insights"}
                        testId="link-website-agent"
                      />
                    )}

                    {hasWhatsappEnabled && (
                      <SidebarMenuItem>
                        <Collapsible open={whatsappNavOpen} onOpenChange={setWhatsappNavOpen}>
                          {/* The whole row is a collapse/expand toggle — clicking it never
                              navigates anywhere. The sub-rows handle their own navigation. */}
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              isActive={isWhatsappLocation(location)}
                              data-testid="link-whatsapp"
                              aria-label={whatsappNavOpen ? "Collapse WhatsApp sections" : "Expand WhatsApp sections"}
                              className={`group/nav relative transition-all duration-200 ${
                                isWhatsappLocation(location)
                                  ? 'bg-white/[0.08] text-white font-medium shadow-sm ring-1 ring-white/10'
                                  : 'text-ink-200 hover:bg-white/[0.06] hover:text-white'
                              }`}
                            >
                              <div className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 ${
                                isWhatsappLocation(location)
                                  ? 'bg-gradient-to-br from-brand-500 to-brand-800 shadow-sm shadow-black/40'
                                  : 'bg-white/[0.06] group-hover/nav:bg-white/10'
                              }`}>
                                <MessageSquare className={`w-3.5 h-3.5 transition-colors ${isWhatsappLocation(location) ? 'text-white' : 'text-ink-300 group-hover/nav:text-white'}`} />
                              </div>
                              <span className="text-[14px]">WhatsApp</span>
                              <ChevronRight className={`ml-auto w-3.5 h-3.5 text-ink-300 transition-transform duration-200 ${whatsappNavOpen ? 'rotate-90' : ''}`} />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              <WhatsAppNavSections
                                marketingEnabled={hasWhatsappMarketingEnabled}
                                location={location}
                                onNavigate={setLocation}
                              />
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </Collapsible>
                      </SidebarMenuItem>
                    )}

                    {hasInstagramEnabled && (
                      <NavItem
                        icon={Camera}
                        label="Instagram"
                        onClick={() => setLocation("/admin/instagram")}
                        isActive={location.startsWith("/admin/instagram")}
                        testId="link-instagram"
                      />
                    )}

                    {hasFacebookEnabled && (
                      <NavItem
                        icon={MessageCircle}
                        label="Facebook"
                        onClick={() => setLocation("/admin/facebook")}
                        isActive={location.startsWith("/admin/facebook")}
                        testId="link-facebook"
                      />
                    )}

                    {/* AI Calling (C) */}
                    {hasAiCallingEnabled && (
                      <CallingNavGroupItem location={location} onNavigate={setLocation} />
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {isSingleProduct && hasChroneyAccess && (
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-0.5">
                    <NavItem
                      icon={MessageSquare}
                      label="Conversations"
                      onClick={() => setLocation("/conversations")}
                      isActive={location === "/conversations"}
                      testId="link-conversations"
                    />
                    <NavItem
                      icon={Contact}
                      label="Leads"
                      onClick={() => setLocation("/admin/leads")}
                      isActive={location === "/admin/leads"}
                      testId="link-leads"
                    />
                    {hasSupportTicketsEnabled && showFullFeatures && (
                      <NavItem
                        icon={LifeBuoy}
                        label="Tickets"
                        onClick={() => setLocation("/tickets")}
                        isActive={location === "/tickets" || location.startsWith("/tickets/")}
                        testId="link-tickets"
                        badge={openTicketCount > 0 ? openTicketCount : undefined}
                      />
                    )}
                    <NavItem
                      icon={BarChart3}
                      label="Insights"
                      onClick={() => setLocation("/insights")}
                      isActive={location === "/insights"}
                      testId="link-insights"
                    />
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {isSingleProduct && hasWhatsappEnabled && (
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-0.5">
                    <WhatsAppNavSections
                      marketingEnabled={hasWhatsappMarketingEnabled}
                      location={location}
                      onNavigate={setLocation}
                    />
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {isSingleProduct && hasInstagramEnabled && (
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-0.5">
                    <NavItem
                      icon={MessageSquare}
                      label="Conversations"
                      onClick={() => setLocation("/admin/instagram-conversations")}
                      isActive={location === "/admin/instagram-conversations"}
                      testId="link-ig-conversations"
                    />
                    <NavItem
                      icon={Contact}
                      label="Leads"
                      onClick={() => setLocation("/admin/instagram-leads")}
                      isActive={location === "/admin/instagram-leads"}
                      testId="link-ig-leads"
                    />
                    <NavItem
                      icon={Route}
                      label="Flows"
                      onClick={() => setLocation("/admin/instagram-flows")}
                      isActive={location === "/admin/instagram-flows"}
                      testId="link-ig-flows"
                    />
                    <NavItem
                      icon={BarChart3}
                      label="Insights"
                      onClick={() => setLocation("/admin/instagram-insights")}
                      isActive={location === "/admin/instagram-insights"}
                      testId="link-ig-insights"
                    />
                    <NavItem
                      icon={MessageCircle}
                      label="Comments"
                      onClick={() => setLocation("/admin/instagram-comments")}
                      isActive={location === "/admin/instagram-comments"}
                      testId="link-ig-comments"
                    />
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {isSingleProduct && hasFacebookEnabled && (
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-0.5">
                    <NavItem
                      icon={MessageSquare}
                      label="Conversations"
                      onClick={() => setLocation("/admin/facebook-conversations")}
                      isActive={location === "/admin/facebook-conversations"}
                      testId="link-fb-conversations"
                    />
                    <NavItem
                      icon={Contact}
                      label="Leads"
                      onClick={() => setLocation("/admin/facebook-leads")}
                      isActive={location === "/admin/facebook-leads"}
                      testId="link-fb-leads"
                    />
                    <NavItem
                      icon={Route}
                      label="Flows"
                      onClick={() => setLocation("/admin/facebook-flows")}
                      isActive={location === "/admin/facebook-flows"}
                      testId="link-fb-flows"
                    />
                    <NavItem
                      icon={BarChart3}
                      label="Insights"
                      onClick={() => setLocation("/admin/facebook-insights")}
                      isActive={location === "/admin/facebook-insights"}
                      testId="link-fb-insights"
                    />
                    <NavItem
                      icon={MessageCircle}
                      label="Comments"
                      onClick={() => setLocation("/admin/facebook-comments")}
                      isActive={location === "/admin/facebook-comments"}
                      testId="link-fb-comments"
                    />
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* AI Calling (C): account whose only AI agent is phone calls */}
            {isSingleProduct && hasAiCallingEnabled && (
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-0.5">
                    <CallingNavFlat location={location} onNavigate={setLocation} />
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {hasWorkspaceItems && (
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-0.5">
                    {hasTrainingAccess && showFullFeatures && (
                      <NavItem
                        icon={GraduationCap}
                        label="Training"
                        onClick={() => setLocation("/admin/training")}
                        isActive={location === "/admin/training" || location === "/train-orvey" || location === "/conversation-journeys" || location === "/admin/faqs" || location === "/admin/about" || location === "/admin/scan-docs" || location === "/admin/url-training"}
                        testId="link-training"
                      />
                    )}

                    {hasProductsAccess && !hasShopifyEnabled && (
                      <NavItem
                        icon={Package}
                        label="Products"
                        onClick={() => setLocation("/admin/products")}
                        isActive={location === "/admin/products"}
                        testId="link-products"
                      />
                    )}
                    {hasProductsAccess && hasShopifyEnabled && (
                      <NavItem
                        icon={ShoppingBag}
                        label="Shopify"
                        onClick={() => setLocation("/admin/shopify")}
                        isActive={location === "/admin/shopify"}
                        testId="link-shopify"
                      />
                    )}

                    {hasAppointmentsEnabled && (
                      <NavItem
                        icon={Calendar}
                        label="Calendar"
                        onClick={() => setLocation("/admin/calendar")}
                        isActive={location === "/admin/calendar"}
                        testId="link-calendar"
                      />
                    )}

                    {hasDemoOrdersEnabled && (
                      <NavItem
                        icon={PackageOpen}
                        label="Demo Orders"
                        onClick={() => setLocation("/admin/demo-orders")}
                        isActive={location === "/admin/demo-orders"}
                        testId="link-demo-orders"
                      />
                    )}

                    {hasJewelryShowcaseEnabled && (
                      <>
                        <NavItem
                          icon={Image}
                          label="Match History"
                          onClick={() => setLocation("/admin/uploads")}
                          isActive={location === "/admin/uploads"}
                          testId="link-uploads"
                        />
                        <NavItem
                          icon={BarChart3}
                          label="Analytics"
                          onClick={() => setLocation("/vista-insights")}
                          isActive={location === "/vista-insights"}
                          testId="link-analytics"
                        />
                      </>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {hasMoreFeaturesAccess && (
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-0.5">
                    <NavItem
                      icon={MoreHorizontal}
                      label="More"
                      onClick={() => setLocation("/admin/more")}
                      isActive={location === "/admin/more" || location.startsWith("/admin/menu-builder") || location === "/ai-insights" || location === "/question-bank" || location === "/admin/smart-discounts" || location.startsWith("/guidance-campaigns")}
                      testId="link-more"
                    />
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
            </>
            )}
          </>
        )}

        {isSuperAdmin && !isSuperAdminImpersonating ? (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-ink-300/70 font-semibold px-3 mb-1">Super Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                <NavItem icon={ShieldCheck} label="Business Accounts" onClick={() => setLocation("/super-admin")} isActive={location === "/super-admin"} testId="link-super-admin" />
                <NavItem icon={BarChart3} label="Insights" onClick={() => setLocation("/super-admin/insights")} isActive={location === "/super-admin/insights"} testId="link-super-admin-insights" />
                <NavItem icon={DollarSign} label="Cost Analytics" onClick={() => setLocation("/super-admin/costs")} isActive={location === "/super-admin/costs"} testId="link-super-admin-costs" />
                <NavItem icon={Gauge} label="Usage & Limits" onClick={() => setLocation("/super-admin/usage")} isActive={location === "/super-admin/usage"} testId="link-super-admin-usage" />
                <NavItem icon={Presentation} label="Demo" onClick={() => setLocation("/super-admin/demo")} isActive={location === "/super-admin/demo"} testId="link-super-admin-demo" />
                <NavItem icon={Key} label="API Keys" onClick={() => setLocation("/super-admin/api-keys")} isActive={location === "/super-admin/api-keys"} testId="link-super-admin-api-keys" />
                <NavItem icon={Bot} label="Chat APIs" onClick={() => setLocation("/super-admin/chat-apis")} isActive={location === "/super-admin/chat-apis"} testId="link-super-admin-chat-apis" />
                <NavItem icon={Link2} label="Account Groups" onClick={() => setLocation("/super-admin/account-groups")} isActive={location === "/super-admin/account-groups"} testId="link-super-admin-account-groups" />
                <NavItem icon={ClipboardList} label="MIS" onClick={() => setLocation("/super-admin/mis")} isActive={location === "/super-admin/mis"} testId="link-super-admin-mis" />
                <NavItem icon={Cloud} label="Google Photos" onClick={() => setLocation("/super-admin/google-photos")} isActive={location === "/super-admin/google-photos"} testId="link-super-admin-google-photos" />
                <NavItem icon={Globe} label="Server Info" onClick={() => setLocation("/super-admin/server-info")} isActive={location === "/super-admin/server-info"} testId="link-super-admin-server-info" />
                <NavItem icon={Terminal} label="Live Logs" onClick={() => setLocation("/super-admin/live-logs")} isActive={location === "/super-admin/live-logs"} testId="link-super-admin-live-logs" />
                <NavItem icon={ScrollText} label="Audit Logs" onClick={() => setLocation("/super-admin/audit-logs")} isActive={location === "/super-admin/audit-logs"} testId="link-super-admin-audit-logs" />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : isGroupAdmin ? (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-ink-300/70 font-semibold px-3 mb-1">Group Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                <NavItem icon={Users} label="Leads" onClick={() => setLocation("/group-admin/leads")} isActive={location === "/group-admin/leads"} testId="link-group-admin-leads" />
                <NavItem icon={MessageSquare} label="Conversations" onClick={() => setLocation("/group-admin/conversations")} isActive={location === "/group-admin/conversations"} testId="link-group-admin-conversations" />

                <NavItem icon={Lightbulb} label="Account Insights" onClick={() => setLocation("/group-admin/insights")} isActive={location === "/group-admin/insights"} testId="link-group-admin-insights" />
                <NavItem icon={TrendingUp} label="Group Analytics" onClick={() => setLocation("/group-admin/group-analytics")} isActive={location === "/group-admin/group-analytics"} testId="link-group-admin-group-analytics" />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-white/10">
        <SidebarMenu className="space-y-0.5">
          <NavItem
            icon={Settings}
            label="Settings"
            onClick={() => setLocation(isSuperAdmin && !isSuperAdminImpersonating ? "/super-admin/settings" : SETTINGS_PATHS.root)}
            isActive={location === SETTINGS_PATHS.root || location.startsWith(`${SETTINGS_PATHS.root}/`) || location === "/super-admin/settings"}
            testId="link-settings"
          />
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              data-testid="button-logout"
              className="group/nav transition-all duration-200 text-ink-200 hover:bg-red-500/10"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.06] group-hover/nav:bg-red-500/20 transition-all duration-200">
                <LogOut className="w-3.5 h-3.5 text-ink-300 group-hover/nav:text-red-400 transition-colors" />
              </div>
              <span className="text-[14px] group-hover/nav:text-red-400 transition-colors">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
