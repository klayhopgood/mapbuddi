import { ContentWrapper } from "@/components/content-wrapper";
import { Footer } from "@/components/footer";
import { NavBar } from "@/components/navbar";
import { Heading } from "@/components/ui/heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin, ShoppingCart, CreditCard, Map, Download, Smartphone, Users, DollarSign, BarChart3 } from "lucide-react";

export default function HelpCentre({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const defaultTab = searchParams.tab || 'buyers';

  return (
    <div className="min-h-screen w-full flex flex-col">
      <NavBar showSecondAnnouncementBar={false} />
      
      <ContentWrapper className="max-w-4xl mx-auto py-12 flex-1">
        <div className="text-center mb-12">
          <Heading size="h1" className="mb-4">Help Centre</Heading>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about buying and selling location lists on MapBuddi
          </p>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-96 grid-cols-2">
              <TabsTrigger value="buyers">For Buyers</TabsTrigger>
              <TabsTrigger value="sellers">For Sellers</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="buyers" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <ShoppingCart className="h-6 w-6" />
                  Buying Guide
                </CardTitle>
                <CardDescription>
                  Learn how to find, purchase, and use location lists
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="getting-started">
                    <AccordionTrigger>Getting Started</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <p>Welcome to MapBuddi! Here's how to get started as a buyer:</p>
                        <ul className="list-disc list-inside space-y-2">
                          <li>Browse our collection of location lists from local experts</li>
                          <li>Use filters to find lists that match your interests</li>
                          <li>Read reviews and ratings from other buyers</li>
                          <li>Purchase lists that catch your attention</li>
                        </ul>
                        <Link href="/lists">
                          <Button className="mt-4">Browse Location Lists</Button>
                        </Link>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="finding-lists">
                    <AccordionTrigger>Finding the Right Lists</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <p>Tips for discovering lists that match your travel style:</p>
                        <ul className="list-disc list-inside space-y-2">
                          <li>Use location-based search to find lists for your destination</li>
                          <li>Filter by category (restaurants, attractions, hidden gems, etc.)</li>
                          <li>Check seller ratings and reviews</li>
                          <li>Look for recently updated lists for current information</li>
                          <li>Preview list descriptions and sample locations</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="purchasing">
                    <AccordionTrigger>Making a Purchase</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <p>How to buy location lists:</p>
                        <ul className="list-disc list-inside space-y-2">
                          <li>Add lists to your cart</li>
                          <li>Review your order and total cost</li>
                          <li>Complete secure checkout with Stripe</li>
                          <li>Receive instant access to your purchased lists</li>
                        </ul>
                        <div className="bg-blue-50 p-4 rounded-lg mt-4">
                          <p className="text-sm text-blue-800">
                            <strong>💳 Secure Payments:</strong> All payments are processed securely through Stripe. We never store your payment information.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="google-maps">
                    <AccordionTrigger>Google Maps Integration</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <p>Sync your purchased lists directly to Google Maps:</p>
                        <ul className="list-disc list-inside space-y-2">
                          <li>Connect your Google account in your account settings</li>
                          <li>Select which lists to sync to your Google Maps</li>
                          <li>Lists appear as custom maps in your Google Maps app</li>
                          <li>Access your lists offline for travel convenience</li>
                          <li>Get directions and navigation to any location</li>
                        </ul>
                        <Link href="/account/buying/lists">
                          <Button variant="outline" className="mt-4">Manage Your Lists</Button>
                        </Link>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="account-management">
                    <AccordionTrigger>Managing Your Account</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <p>Keep track of your purchases and preferences:</p>
                        <ul className="list-disc list-inside space-y-2">
                          <li>View all purchased lists in your account</li>
                          <li>Access download links and sync options</li>
                          <li>Track your purchase history</li>
                          <li>Update your profile and preferences</li>
                          <li>Manage Google account connections</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Quick Start Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold mb-2">1. Browse & Buy</h3>
                    <p className="text-sm text-muted-foreground">Find and purchase lists that match your interests</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Download className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold mb-2">2. Sync to Maps</h3>
                    <p className="text-sm text-muted-foreground">Connect Google Maps and sync your lists</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Smartphone className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold mb-2">3. Explore</h3>
                    <p className="text-sm text-muted-foreground">Use your integrated lists on any device</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sellers" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <MapPin className="h-6 w-6" />
                  Selling Guide
                </CardTitle>
                <CardDescription>
                  Everything you need to know about creating and selling location lists
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="getting-started-selling">
                    <AccordionTrigger>Getting Started as a Seller</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <p>Turn your local knowledge into income:</p>
                        <ul className="list-disc list-inside space-y-2">
                          <li>Set up your seller profile with bio and expertise</li>
                          <li>Connect your payment method to receive earnings</li>
                          <li>Create your first location list</li>
                          <li>Set competitive pricing for your lists</li>
                          <li>Publish and start earning</li>
                        </ul>
                        <Link href="/account/selling/profile">
                          <Button className="mt-4">Set Up Your Profile</Button>
                        </Link>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="creating-lists">
                    <AccordionTrigger>Creating Great Location Lists</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <p>Best practices for creating compelling location lists:</p>
                        <ul className="list-disc list-inside space-y-2">
                          <li>Focus on specific themes or areas you know well</li>
                          <li>Include detailed descriptions for each location</li>
                          <li>Add personal insights and local tips</li>
                          <li>Use high-quality cover images</li>
                          <li>Categorize locations clearly</li>
                          <li>Keep lists updated with current information</li>
                        </ul>
                        <div className="bg-green-50 p-4 rounded-lg mt-4">
                          <p className="text-sm text-green-800">
                            <strong>💡 Pro Tip:</strong> Lists with 10+ locations and detailed descriptions tend to sell better!
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="pricing-strategy">
                    <AccordionTrigger>Pricing Your Lists</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <p>How to price your location lists competitively:</p>
                        <ul className="list-disc list-inside space-y-2">
                          <li>Research similar lists in your area</li>
                          <li>Consider the time invested in research</li>
                          <li>Factor in the uniqueness of your locations</li>
                          <li>Start with competitive pricing to build reviews</li>
                          <li>Adjust pricing based on demand and feedback</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="payments">
                    <AccordionTrigger>Getting Paid</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <p>How payments work for sellers:</p>
                        <ul className="list-disc list-inside space-y-2">
                          <li>Earn 85% of each sale (we keep 15% platform fee)</li>
                          <li>Payments processed through Stripe Connect</li>
                          <li>Set up PayPal or bank account for payouts</li>
                          <li>Track earnings in your seller dashboard</li>
                          <li>Receive payments weekly or monthly</li>
                        </ul>
                        <Link href="/account/selling/payments">
                          <Button variant="outline" className="mt-4">Setup Payments</Button>
                        </Link>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="membership">
                    <AccordionTrigger>Seller Membership</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <p>Unlock additional features with a seller membership:</p>
                        <ul className="list-disc list-inside space-y-2">
                          <li>Create unlimited location lists</li>
                          <li>Access to premium selling tools</li>
                          <li>Priority customer support</li>
                          <li>Advanced analytics and insights</li>
                          <li>Featured seller status</li>
                        </ul>
                        <Link href="/account/selling/membership">
                          <Button variant="outline" className="mt-4">Learn About Membership</Button>
                        </Link>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="promoting">
                    <AccordionTrigger>Promoting Your Lists</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <p>Tips to increase visibility and sales:</p>
                        <ul className="list-disc list-inside space-y-2">
                          <li>Use relevant keywords in titles and descriptions</li>
                          <li>Respond to customer questions promptly</li>
                          <li>Encourage satisfied customers to leave reviews</li>
                          <li>Share your lists on social media</li>
                          <li>Keep your profile and lists updated</li>
                          <li>Offer seasonal or themed collections</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Seller Quick Start
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold mb-2">1. Profile</h3>
                    <p className="text-sm text-muted-foreground">Set up your seller profile and bio</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold mb-2">2. Payments</h3>
                    <p className="text-sm text-muted-foreground">Connect your payout method</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold mb-2">3. Create</h3>
                    <p className="text-sm text-muted-foreground">Build your first location list</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold mb-2">4. Earn</h3>
                    <p className="text-sm text-muted-foreground">Start earning from sales</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Still Need Help?</CardTitle>
            <CardDescription>
              Can't find what you're looking for? Get in touch with our support team.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button>Contact Support</Button>
            <Button variant="outline">Community Forum</Button>
          </CardContent>
        </Card>
      </ContentWrapper>

      <Footer />
    </div>
  );
}
