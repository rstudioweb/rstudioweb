"use client"

import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function NavigationMenuDemo() {
    return (
        <div className="w-full shadow-md">
            <NavigationMenu className="max-w-9xl mx-auto w-full px-4 py-3">
                <NavigationMenuList className="flex items-center justify-between w-full">
                    <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                            <Link href="/" className="text-2xl font-extrabold tracking-wide text-red-600 hover:text-red-700 transition-colors">
                                R STUDIO
                            </Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <div className="flex items-center gap-4">
                            <NavigationMenuLink asChild>
                                <Link href="/signup" className="text-sm font-medium transition-colors">
                                    Apply
                                </Link>
                            </NavigationMenuLink>
                            <Button
                                variant="outline"
                                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black transition"
                            >
                                Join Us
                            </Button>
                            <Button
                                variant="default"
                                className="bg-red-600 hover:bg-red-700 transition"
                            >
                                Login
                            </Button>
                        </div>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    )
}
