import { Link, useMatchRoute } from '@tanstack/react-router'
import { KeyRoundIcon, ScrollTextIcon, SquareActivityIcon, WaypointsIcon } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

const navItems = [
  {
    icon: <SquareActivityIcon />,
    title: 'Dashboard',
    href: '/',
  },
  {
    icon: <KeyRoundIcon />,
    title: 'API Keys',
    href: '/api-keys',
  },
  {
    icon: <ScrollTextIcon />,
    title: 'Logs',
    href: '/logs',
  },
]

export function AppSidebar() {
  const { setOpenMobile } = useSidebar()
  const matchRoute = useMatchRoute()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              asChild
            >
              <Link to="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                  <WaypointsIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Proxicy</span>
                  <span className="truncate text-xs">LLM Gateway</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={!!matchRoute({ to: item.href })}
                    tooltip={{ children: item.title }}
                    asChild
                  >
                    <Link to={item.href} onClick={() => setOpenMobile(false)}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
