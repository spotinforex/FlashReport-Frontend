import React, { useState, useEffect } from "react";
import { fetchEvents, searchEvents } from "../services/api";
import { Event } from "../services/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AlertTriangle, MapPin, Clock, Search, ExternalLink, ShieldAlert, FileText, Activity, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const CATEGORIES = [
  "All",
  "kidnapping",
  "armed attack",
  "protest",
  "flood",
  "fire",
  "riot/violence"
];

const SEVERITY_COLORS: Record<string, string> = {
  high: "bg-red-500 hover:bg-red-600",
  medium: "bg-orange-500 hover:bg-orange-600",
  low: "bg-yellow-500 hover:bg-yellow-600",
};

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEvents();
      setEvents(data.events);
    } catch (err: any) {
      setError(err.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery && !locationQuery && selectedCategory === "All") {
      loadEvents();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let keyword = searchQuery;
      if (!keyword && selectedCategory !== "All") {
        keyword = selectedCategory;
      } else if (!keyword) {
        keyword = "news"; // Fallback keyword if only location is provided
      }

      const data = await searchEvents(keyword, locationQuery || undefined);
      setEvents(data.events);
    } catch (err: any) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    if (selectedCategory !== "All" && event.event_type.replace("_", " ").toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">FlashReport</h1>
          </div>
          <div className="text-sm text-neutral-500 font-medium">
            Intelligence Gathering & Clustering
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-3">Filters</h2>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-500">Keyword</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Search events..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-500">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Filter by location..."
                    className="pl-9"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">Apply Filters</Button>
              {(searchQuery || locationQuery) && (
                <Button type="button" variant="outline" className="w-full" onClick={() => {
                  setSearchQuery("");
                  setLocationQuery("");
                  loadEvents();
                }}>
                  Clear Filters
                </Button>
              )}
            </form>
          </div>

          <Separator />

          <div>
            <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-3">Categories</h2>
            <div className="space-y-1">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedCategory === category
                      ? "bg-neutral-900 text-white font-medium"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-neutral-900">
              {selectedCategory === "All" ? "Recent Events" : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Events`}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadEvents}
                disabled={loading}
                className="flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Badge variant="secondary" className="px-3 py-1">
                {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'}
              </Badge>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="space-y-2">
                    <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                    <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-neutral-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">Error loading events</h3>
                <p className="text-sm mt-1">{error}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={loadEvents}>Try Again</Button>
              </div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 bg-white border border-neutral-200 rounded-lg">
              <ShieldAlert className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-neutral-900">No events found</h3>
              <p className="text-neutral-500 mt-1">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredEvents.map(event => (
                <Card key={event.event_id} className="hover:shadow-md transition-shadow cursor-pointer flex flex-col" onClick={() => setSelectedEvent(event)}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="capitalize">
                        {event.event_type.replace("_", " ")}
                      </Badge>
                      <Badge className={`${SEVERITY_COLORS[event.severity?.toLowerCase()] || "bg-neutral-500"} text-white border-none capitalize`}>
                        {event.severity} Severity
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-2 text-xs">
                      <MapPin className="w-3 h-3" /> {event.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 flex-1">
                    <p className="text-sm text-neutral-600 line-clamp-3">
                      {event.analysis.brief}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between items-center text-xs text-neutral-500 border-t border-neutral-100 mt-auto pt-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(event.last_updated), { addSuffix: true })}
                    </div>
                    <div className="flex items-center gap-1 font-medium">
                      <FileText className="w-3 h-3" />
                      {event.articles?.length || 0} {(event.articles?.length || 0) === 1 ? 'Source' : 'Sources'}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          {selectedEvent && (
            <>
              <div className="p-6 pb-4 border-b border-neutral-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="capitalize">
                      {selectedEvent.event_type.replace("_", " ")}
                    </Badge>
                    <Badge className={`${SEVERITY_COLORS[selectedEvent.severity?.toLowerCase()] || "bg-neutral-500"} text-white border-none capitalize`}>
                      {selectedEvent.severity} Severity
                    </Badge>
                    {selectedEvent.analysis.alert && (
                      <Badge variant="destructive" className="animate-pulse">Active Alert</Badge>
                    )}
                  </div>
                  <div className="text-xs text-neutral-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Updated {formatDistanceToNow(new Date(selectedEvent.last_updated), { addSuffix: true })}
                  </div>
                </div>
                <DialogTitle className="text-2xl leading-tight mb-2">{selectedEvent.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-1 text-sm">
                  <MapPin className="w-4 h-4" /> {selectedEvent.location}
                </DialogDescription>
              </div>

              <ScrollArea className="flex-1 p-6 pt-2">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="sources">Sources ({selectedEvent.articles?.length || 0})</TabsTrigger>
                    {selectedEvent.image_urls?.length > 0 && (
                      <TabsTrigger value="media">Media</TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-2">Analysis Brief</h3>
                      <p className="text-neutral-800 leading-relaxed">
                        {selectedEvent.analysis.brief}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100">
                        <div className="text-xs text-neutral-500 mb-1">Confidence Score</div>
                        <div className="text-xl font-semibold text-neutral-900">
                          {Math.round(selectedEvent.confidence * 100)}%
                        </div>
                      </div>
                      <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100">
                        <div className="text-xs text-neutral-500 mb-1">Status</div>
                        <div className="text-xl font-semibold text-neutral-900 capitalize">
                          {selectedEvent.status}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="sources" className="space-y-4">
                    {selectedEvent.articles?.map(article => (
                      <Card key={article.article_id} className="border-neutral-200 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                              {article.source}
                            </span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              Credibility: {Math.round(article.credibility_score * 100)}%
                            </Badge>
                          </div>
                          <h4 className="font-medium text-neutral-900 mb-2 line-clamp-2">
                            {article.title}
                          </h4>
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-xs text-neutral-400">
                              {new Date(article.published_at).toLocaleDateString()}
                            </span>
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              Read Original <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  {selectedEvent.image_urls?.length > 0 && (
                    <TabsContent value="media">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedEvent.image_urls.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Event media ${idx + 1}`}
                            className="w-full h-48 object-cover rounded-lg border border-neutral-200"
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
