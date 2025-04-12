"use client"
import { Bell, Lock, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function SettingsPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 md:p-8">
            <div className="w-full">
              <div className="mb-8">
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences and application settings</p>
              </div>

              <Card className="border-zinc-100 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">User Preferences</CardTitle>
                  <CardDescription>Configure your account and application settings</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-6">
                  <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="profile">Profile</TabsTrigger>
                      <TabsTrigger value="notifications">Notifications</TabsTrigger>
                      <TabsTrigger value="goals">Goals & Integration</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="mt-6 space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                          <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal information</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="first-name">First name</Label>
                                <Input id="first-name" defaultValue="Alex" />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="last-name">Last name</Label>
                                <Input id="last-name" defaultValue="" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input id="email" type="email" defaultValue="alex@example.com" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="timezone">Timezone</Label>
                              <select
                                id="timezone"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <option>Pacific Time (UTC-08:00)</option>
                                <option>Mountain Time (UTC-07:00)</option>
                                <option>Central Time (UTC-06:00)</option>
                                <option>Eastern Time (UTC-05:00)</option>
                              </select>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </Button>
                          </CardFooter>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription>Update your password</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="current-password">Current password</Label>
                              <Input id="current-password" type="password" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="new-password">New password</Label>
                              <Input id="new-password" type="password" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirm-password">Confirm password</Label>
                              <Input id="confirm-password" type="password" />
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button>
                              <Lock className="mr-2 h-4 w-4" />
                              Update Password
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="notifications" className="mt-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Notification Preferences</CardTitle>
                          <CardDescription>Choose when and how you want to be notified</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Daily Journal Reminder</p>
                              <p className="text-sm text-muted-foreground">
                                Receive a reminder to write in your journal
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Weekly Mood Summary</p>
                              <p className="text-sm text-muted-foreground">Get a weekly report of your mood patterns</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">New Suggestions</p>
                              <p className="text-sm text-muted-foreground">
                                Be notified when new well-being suggestions are available
                              </p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Goal Reminders</p>
                              <p className="text-sm text-muted-foreground">
                                Receive reminders about your personal goals
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button>
                            <Bell className="mr-2 h-4 w-4" />
                            Save Preferences
                          </Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>

                    <TabsContent value="goals" className="mt-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                          <CardHeader>
                            <CardTitle>Personal Goals</CardTitle>
                            <CardDescription>Set and track your well-being goals</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="exercise-goal">Exercise Goal</Label>
                              <div className="flex items-center gap-2">
                                <Input id="exercise-goal" type="number" defaultValue="3" className="w-20" />
                                <span>times per week</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="sleep-goal">Sleep Goal</Label>
                              <div className="flex items-center gap-2">
                                <Input id="sleep-goal" type="number" defaultValue="8" className="w-20" />
                                <span>hours per night</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="mindfulness-goal">Mindfulness Goal</Label>
                              <div className="flex items-center gap-2">
                                <Input id="mindfulness-goal" type="number" defaultValue="10" className="w-20" />
                                <span>minutes per day</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button>Save Goals</Button>
                          </CardFooter>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Integrations</CardTitle>
                            <CardDescription>Connect with other services</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">PIN AI</p>
                                <p className="text-sm text-muted-foreground">Connect to PIN AI for personalized data</p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Upstage</p>
                                <p className="text-sm text-muted-foreground">Connect to Upstage for document parsing</p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Calendar</p>
                                <p className="text-sm text-muted-foreground">Sync with your calendar app</p>
                              </div>
                              <Switch />
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button>Save Integration Settings</Button>
                          </CardFooter>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
