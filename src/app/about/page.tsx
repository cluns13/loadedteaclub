import { Container } from '@/components/ui/container'

export const metadata = {
  title: 'About Loaded Tea Finder | Find Loaded Tea Clubs Near You',
  description: 'Discover the story behind Loaded Tea Finder - a community-driven app helping enthusiasts find loaded tea nutrition clubs across the United States. Created by a developer whose girlfriend loves loaded teas.',
  keywords: 'loaded tea, nutrition clubs, loaded tea finder, healthy drinks, energy drinks, meal replacement, nutrition drinks, find loaded tea, loaded tea near me'
}

export default function AboutPage() {
  return (
    <main className="py-16">
      <Container>
        <div className="max-w-3xl mx-auto space-y-12">
          <header>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              About Loaded Tea Finder
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              A passion project born from the love of loaded teas and the desire to build something useful for the community.
            </p>
          </header>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Our Story</h2>
            <p className="text-gray-600">
              Hi, I'm Cody, a software developer who loves building applications that solve real-world problems. 
              The idea for Loaded Tea Finder came from my girlfriend's passion for loaded teas from nutrition clubs. 
              During our travels, she would always search for local clubs that serve these energizing drinks, but 
              finding them on Google wasn't always easy.
            </p>
            <p className="text-gray-600">
              That's when it hit me - why not create an app specifically for finding loaded tea locations? As a 
              developer who enjoys building random apps that make life easier, I set out to create a platform that 
              would help enthusiasts like my girlfriend discover these unique drinks wherever they go.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">What is Loaded Tea?</h2>
            <p className="text-gray-600">
              Loaded teas are vibrant, energizing drinks served at nutrition clubs across the United States. These 
              colorful beverages combine energy-boosting ingredients with metabolism-supporting components, creating 
              a refreshing alternative to traditional energy drinks. Each loaded tea is uniquely crafted, often featuring 
              creative flavors and beautiful layered designs.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">For Tea Enthusiasts</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Discover New Locations</h3>
                <p className="text-gray-600">
                  Find loaded tea clubs in your area or while traveling, with accurate location data and real user reviews.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Community Reviews</h3>
                <p className="text-gray-600">
                  Share your experiences and discover new favorites through authentic community reviews.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Save Favorites</h3>
                <p className="text-gray-600">
                  Create your personal collection of favorite locations and drinks for easy access.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Stay Updated</h3>
                <p className="text-gray-600">
                  Get the latest information about operating hours, menus, and special drinks.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">For Club Owners</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Manage Your Listing</h3>
                <p className="text-gray-600">
                  Take control of your business profile with easy-to-use management tools.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Showcase Your Club</h3>
                <p className="text-gray-600">
                  Display your unique drinks, atmosphere, and special offerings with photo galleries.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Connect with Customers</h3>
                <p className="text-gray-600">
                  Engage with your community through reviews and updates about your business.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Business Tools</h3>
                <p className="text-gray-600">
                  Access analytics and management tools designed specifically for nutrition clubs.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Innovative Features</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">AI-Powered Menu Processing</h3>
                <p className="mt-2 text-gray-600">
                  Our advanced AI technology automatically extracts menu items from uploaded photos and PDFs, 
                  making it effortless for club owners to keep their menus up-to-date. Simply upload a picture 
                  of your menu, and our system will do the rest.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Smart Analytics Dashboard</h3>
                <p className="mt-2 text-gray-600">
                  Club owners get access to powerful analytics tools that provide insights into:
                </p>
                <ul className="mt-3 grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">Visitor engagement metrics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">Popular menu items</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">Customer search patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">Peak visit times</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900">Advanced Search Capabilities</h3>
                <p className="mt-2 text-gray-600">
                  Our intelligent search system helps users find exactly what they're looking for:
                </p>
                <ul className="mt-3 grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">Location-based search</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">Menu item search</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">Operating hours filter</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">Rating-based sorting</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900">Business Management Suite</h3>
                <p className="mt-2 text-gray-600">
                  A comprehensive set of tools for club owners to manage their online presence:
                </p>
                <ul className="mt-3 grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">Real-time menu updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">Photo gallery management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">Business hours control</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">Customer review management</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            <p className="text-gray-600">
              Loaded Tea Finder aims to create a thriving community where enthusiasts can easily discover new loaded tea 
              locations and club owners can connect with their customers. We're constantly improving our platform based 
              on feedback from both tea lovers and club owners, making it easier than ever to be part of this growing community.
            </p>
          </section>

          <section className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900">Join Our Community</h2>
            <p className="mt-4 text-gray-600">
              Whether you're a loaded tea enthusiast or a club owner, we invite you to be part of our growing community. 
              Help us make it easier for everyone to discover and enjoy loaded teas across the United States.
            </p>
          </section>
        </div>
      </Container>
    </main>
  )
}
