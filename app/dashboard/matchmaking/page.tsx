"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin, Calendar, Clock, Users, Search, Plus, Target,
  Zap, Activity, Filter, ArrowRight, Shield, Loader2, Star,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateMatchModal } from "@/components/match-model";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface User {
  _id: string;
  name?: string;
  email?: string;
}

function formatMatch(match: any) {
  return {
    _id: match._id,
    name: `Team ${match.createdBy?.name || "Anonymous"}`,
    location: match.location,
    distance: match.distance,
    rating: 4.5,
    availability: [new Date(match.dateTime).toLocaleDateString()],
    players: match.teamSize,
    createdBy: match.createdBy,
    dateTime: new Date(match.dateTime).toLocaleString("en-US", {
      timeZone: "Asia/Kathmandu",
    }),
    skillLevel: match.skillLevel,
    createdAt: match.createdAt,
    challenged: match.challenged ?? false,
  };
}

interface Profile {
  _id: string;
  user: User;
  profileImage?: string;
  position?: string;
  skillLevel?: string;
  bio?: string;
  invited?: boolean;
  inviteStatus?: "pending" | "accepted" | "rejected" | null; // ✅ added
  location?: string;
  availability?: any;
  notifications?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MatchmakingPage() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [position, setPosition] = useState("any");
  const [skillLevel, setSkillLevel] = useState("any");
  const [isSearching, setIsSearching] = useState(false);
  const [isCreateMatchOpen, setIsCreateMatchOpen] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matches, setMatches] = useState([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [challengingId, setChallengingId] = useState<string | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [myRequests, setMyRequests] = useState<{
    invitations: { received: any[]; sent: any[] };
    challenges: { received: any[]; sent: any[] };
  }>({
    invitations: { received: [], sent: [] },
    challenges: { received: [], sent: [] },
  });

  const [searchDate, setSearchDate] = useState("");
  const [searchTime, setSearchTime] = useState("");
  const [searchTeamSize, setSearchTeamSize] = useState("5");
  const [searchLocation, setSearchLocation] = useState("");
  const [isSkillBasedSearch, setIsSkillBasedSearch] = useState(false);

  useEffect(() => {
    fetchMatches();
    searchProfiles();
    fetchMyRequests();
    const timer = setTimeout(() => setIsPageLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const fetchMyRequests = async () => {
    try {
      const [invRes, chalRes] = await Promise.all([
        fetch("/api/players/invitations"),
        fetch("/api/teams/challenges"),
      ]);
      if (invRes.ok) {
        const invData = await invRes.json();
        setMyRequests((prev) => ({ ...prev, invitations: invData }));

        const sentInvitations = invData.sent || [];
        const receivedInvitations = invData.received || [];

        // ✅ update inviteStatus on profiles
        setProfiles((prev) =>
          prev.map((p) => {
            const sentInv = sentInvitations.find(
              (inv: any) =>
                inv.recipient?._id === p.user?._id ||
                inv.recipient === p.user?._id
            );
            const receivedInv = receivedInvitations.find(
              (inv: any) =>
                inv.sender?._id === p.user?._id ||
                inv.sender === p.user?._id
            );
            const anyInv = sentInv || receivedInv;
            return {
              ...p,
              inviteStatus: anyInv?.status || null,
            };
          })
        );
      }
      if (chalRes.ok) {
        const chalData = await chalRes.json();
        setMyRequests((prev) => ({
          ...prev,
          challenges: {
            received: chalData.received || [],
            sent: chalData.sent || [],
          },
        }));
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    }
  };

  const isUpcomingMatch = (match: any) => {
    const matchDate = new Date(match.dateTime);
    return matchDate.getTime() > Date.now();
  };

  const fetchMatches = async () => {
    try {
      setIsLoadingMatches(true);
      const response = await fetch("/api/matches");
      if (!response.ok) throw new Error("Failed to fetch matches");
      const data = await response.json();

      const upcomingMatches = (data.matches || []).filter(
        (m: any) => new Date(m.dateTime).getTime() > Date.now()
      );

      setMatches(upcomingMatches);

      setSearchResults((prev) =>
        hasSearched ? prev : upcomingMatches.map(formatMatch)
      );
    } catch (error) {
      toast({ title: "Error", description: "Failed to load matches", variant: "destructive" });
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const handleSearch = () => {
    setIsSearching(true);
    setHasSearched(true);

    const filtered = matches.filter((match: any) => {
      if (searchLocation.trim()) {
        if (!match.location?.toLowerCase().includes(searchLocation.trim().toLowerCase())) return false;
      }
      if (searchDate) {
        const matchDateStr = new Date(match.dateTime).toISOString().split("T")[0];
        if (matchDateStr !== searchDate) return false;
      }
      if (searchTime) {
        const [hh, mm] = searchTime.split(":").map(Number);
        const searchMins = hh * 60 + mm;
        const matchDate = new Date(match.dateTime);
        const matchMins = matchDate.getHours() * 60 + matchDate.getMinutes();
        if (Math.abs(matchMins - searchMins) > 60) return false;
      }
      if (searchTeamSize) {
        if (String(match.teamSize) !== String(searchTeamSize)) return false;
      }
      if (isSkillBasedSearch) {
        if (!match.skillLevel || match.skillLevel === "any") return false;
      }
      return true;
    });

    setSearchResults(filtered.map(formatMatch));
    setIsSearching(false);
  };

  const searchProfiles = async () => {
    try {
      setIsSearching(true);
      const queryParams = new URLSearchParams();
      queryParams.append("position", position);
      queryParams.append("skillLevel", skillLevel);
      const response = await fetch(`/api/profiles?${queryParams}`);
      if (!response.ok) throw new Error("Failed to search profiles");
      const data = await response.json();

      // ✅ fetch invitations to determine inviteStatus
      const invRes = await fetch("/api/players/invitations");
      const invData = invRes.ok ? await invRes.json() : { sent: [], received: [] };
      const sentInvitations = invData.sent || [];
      const receivedInvitations = invData.received || [];

      const profiles = (data.profiles || []).map((p: any) => {
        const sentInv = sentInvitations.find(
          (inv: any) =>
            inv.recipient?._id === p.user?._id ||
            inv.recipient === p.user?._id
        );
        const receivedInv = receivedInvitations.find(
          (inv: any) =>
            inv.sender?._id === p.user?._id ||
            inv.sender === p.user?._id
        );
        const anyInv = sentInv || receivedInv;
        return {
          ...p,
          inviteStatus: anyInv?.status || null,
        };
      });

      setProfiles(profiles);
    } catch (error) {
      console.error("Error searching profiles:", error);
      toast({ title: "Error", description: "Failed to search profiles", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleChallenge = async (teamId: string) => {
    try {
      setChallengingId(teamId);
      const match = searchResults.find((m) => m._id === teamId);
      if (!match) throw new Error("Match not found");

      const response = await fetch("/api/teams/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: match.createdBy._id,
          matchId: match._id,
          matchDetails: {
            date: match.dateTime.split(",")[0],
            time: match.dateTime.split(",")[1],
            location: match.location,
            teamSize: match.players,
            skillLevel: match.skillLevel || "any",
          },
          message: "I challenge your team to a match!",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send challenge");
      }

      setSearchResults((prev) =>
        prev.map((r) => (r._id === teamId ? { ...r, challenged: true } : r))
      );

      await Promise.all([fetchMatches(), fetchMyRequests()]);
      toast({ title: "Success", description: "Challenge sent successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send challenge",
        variant: "destructive",
      });
    } finally {
      setChallengingId(null);
    }
  };

  const handleInvitePlayer = async (playerId: string) => {
    try {
      setInvitingId(playerId);
      const profile = profiles.find((p) => p._id === playerId);
      if (!profile) throw new Error("Profile not found");

      const userId = profile.user._id || profile.user;
      const response = await fetch("/api/players/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: userId, message: "Would you like to join my team?" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send invitation");
      }

      await Promise.all([searchProfiles(), fetchMyRequests()]);
      toast({ title: "Success", description: "Invitation sent successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setInvitingId(null);
    }
  };

  const handleResponse = async (
    type: "invitation" | "challenge",
    id: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      const endpoint =
        type === "invitation"
          ? `/api/players/invitations/${id}`
          : `/api/teams/challenges/${id}`;
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      await Promise.all([fetchMatches(), searchProfiles(), fetchMyRequests()]);
      toast({
        title: status === "accepted" ? "Success!" : "Declined",
        description: `${type === "invitation" ? "Invitation" : "Challenge"} successfully ${status}.`,
        variant: status === "accepted" ? "default" : "destructive",
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  if (isPageLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-14 w-full rounded-2xl" />
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <Skeleton className="h-[500px] rounded-3xl" />
          </div>
          <div className="lg:col-span-8">
            <Skeleton className="h-[500px] rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-heading tracking-tight uppercase leading-none">
            Arena Finder
          </h1>
          <p className="text-muted-foreground font-medium mt-2 text-lg">
            Battle for the court. Find rivals or recruit talent.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateMatchOpen(true)}
          className="rounded-full h-14 px-8 font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
        >
          <Plus className="h-5 w-5 mr-2 stroke-[3]" />
          Host a Match
        </Button>
      </div>

      <CreateMatchModal
        isOpen={isCreateMatchOpen}
        onClose={() => setIsCreateMatchOpen(false)}
        onSuccess={() => {
          fetchMatches();
          fetchMyRequests();
        }}
      />

      <Tabs defaultValue="find-opponents" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-16 p-1.5 bg-muted/50 rounded-2xl max-w-lg mb-8">
          <TabsTrigger
            value="find-opponents"
            className="rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-lg"
          >
            Find Rivals
          </TabsTrigger>
          <TabsTrigger
            value="find-teammates"
            className="rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-lg"
          >
            Recruit Players
          </TabsTrigger>
          <TabsTrigger
            value="my-requests"
            className="rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-lg"
          >
            My Requests
            {myRequests.invitations.received.filter((i) => i.status === "pending").length +
              myRequests.challenges.received.filter((c) => c.status === "pending").length >
              0 && (
              <span className="ml-2 flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── FIND OPPONENTS ── */}
        <TabsContent value="find-opponents" className="space-y-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <Card className="lg:col-span-4 border-none shadow-xl shadow-black/5 rounded-[2.5rem] bg-background animate-form overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary to-accent" />
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black font-heading uppercase flex items-center gap-3">
                  <Filter className="h-5 w-5 text-primary" />
                  Battle Filters
                </CardTitle>
                <CardDescription className="font-bold text-xs uppercase tracking-widest text-muted-foreground/60">
                  Target your next match
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    Zone / City
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    <Input
                      placeholder="e.g. Kathmandu"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="rounded-2xl h-12 pl-12 bg-muted/30 border-none font-bold placeholder:text-muted-foreground/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                      Preferred Date
                    </Label>
                    <Input
                      type="date"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                      className="rounded-2xl h-12 bg-muted/30 border-none font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                      Time
                    </Label>
                    <Input
                      type="time"
                      value={searchTime}
                      onChange={(e) => setSearchTime(e.target.value)}
                      className="rounded-2xl h-12 bg-muted/30 border-none font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    Format
                  </Label>
                  <Select defaultValue="5" onValueChange={setSearchTeamSize}>
                    <SelectTrigger className="rounded-2xl h-12 bg-muted/30 border-none font-bold px-4">
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl">
                      <SelectItem value="5">5-a-Side</SelectItem>
                      <SelectItem value="6">6-a-Side</SelectItem>
                      <SelectItem value="7">7-a-Side</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div
                  className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10 group cursor-pointer"
                  onClick={() => setIsSkillBasedSearch(!isSkillBasedSearch)}
                >
                  <div className="space-y-0.5">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary cursor-pointer">
                      Skill Matching
                    </Label>
                    <p className="text-[10px] font-bold text-muted-foreground">Only face equal ranks</p>
                  </div>
                  <Switch
                    checked={isSkillBasedSearch}
                    onCheckedChange={setIsSkillBasedSearch}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </CardContent>
              <CardFooter className="p-8 pt-0">
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-lg shadow-xl shadow-primary/20"
                >
                  {isSearching ? <Loader2 className="h-6 w-6 animate-spin" /> : "SCAN ARENA"}
                </Button>
              </CardFooter>
            </Card>

            <div className="lg:col-span-8 space-y-6">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-pulse">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Target className="h-10 w-10 text-primary animate-ping" />
                  </div>
                  <h2 className="text-2xl font-black font-heading uppercase">Scanning for rivals...</h2>
                  <p className="text-muted-foreground font-medium mt-2">
                    Checking match history and local court schedules.
                  </p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">
                      {searchResults.length} {hasSearched ? "Matches Found" : "Available Matches"}
                    </h2>
                    <Badge variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-primary">
                      Live Data
                    </Badge>
                  </div>
                  {searchResults.map((match) => (
                    <Card
                      key={match._id}
                      className="animate-result border-none shadow-xl shadow-black/5 rounded-[2rem] bg-background overflow-hidden hover:shadow-2xl transition-all duration-500 group"
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          <div className="sm:w-48 bg-muted/20 relative overflow-hidden flex items-center justify-center p-6 border-r border-border/50">
                            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                              <Activity className="w-full h-full stroke-[0.5]" />
                            </div>
                            <Avatar className="h-20 w-20 border-4 border-background shadow-xl">
                              <AvatarFallback className="bg-primary text-white font-black text-2xl uppercase">
                                {match.name.replace("Team ", "").substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-3 left-3 flex gap-1">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  className={`h-2.5 w-2.5 ${
                                    i <= 4 ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex-1 p-8 space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                <h3 className="text-2xl font-black font-heading uppercase tracking-tight leading-none group-hover:text-primary transition-colors">
                                  {match.name}
                                </h3>
                                <div className="flex items-center gap-4 mt-3">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5 text-primary" />
                                    {match.location}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                                    <Users className="h-3.5 w-3.5 text-accent" />
                                    {match.players}v{match.players}
                                  </div>
                                </div>
                              </div>
                              <Badge className="w-fit rounded-full bg-accent/10 text-accent font-black text-[10px] tracking-[0.1em] border-none px-3 py-1">
                                {match.skillLevel || "OPEN RANK"}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap gap-6 pt-4 border-t border-border/50">
                              <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Match Date</p>
                                <p className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-primary" />
                                  {match.dateTime.split(",")[0]}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Kickoff</p>
                                <p className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-primary" />
                                  {match.dateTime.split(",")[1]}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Posted</p>
                                <p className="text-sm font-black uppercase tracking-tight">
                                  {match.createdAt ? new Date(match.createdAt).toLocaleDateString() : "JUST NOW"}
                                </p>
                              </div>
                            </div>

                            <div className="flex justify-end pt-4">
                              <Button
                                type="button"
                                className={`rounded-full h-12 px-8 font-black uppercase tracking-widest transition-all ${
                                  match.challenged ? "bg-muted text-muted-foreground" : "shadow-lg shadow-primary/20"
                                }`}
                                onClick={() => handleChallenge(match._id)}
                                disabled={match.challenged || challengingId === match._id}
                              >
                                {challengingId === match._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : match.challenged ? (
                                  "CHALLENGE SENT"
                                ) : (
                                  <>
                                    CHALLENGE TEAM
                                    <Zap className="h-4 w-4 ml-2 fill-current" />
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : !hasSearched ? (
                <div className="flex flex-col items-center justify-center py-32 text-center opacity-20 grayscale bg-muted/5 rounded-[3rem] border-4 border-dashed border-muted">
                  <Search className="h-20 w-20 mb-6 stroke-[1]" />
                  <h3 className="text-2xl font-black font-heading uppercase">Ready for action?</h3>
                  <p className="font-bold max-w-xs mt-2">Adjust the filters and scan the arena to find local rivals.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center opacity-20 grayscale bg-muted/5 rounded-[3rem] border-4 border-dashed border-muted">
                  <Search className="h-20 w-20 mb-6 stroke-[1]" />
                  <h3 className="text-2xl font-black font-heading uppercase">No matches found</h3>
                  <p className="font-bold max-w-xs mt-2">Try adjusting your filters or check back later.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── FIND TEAMMATES ── */}
        <TabsContent value="find-teammates" className="space-y-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <Card className="lg:col-span-4 border-none shadow-xl shadow-black/5 rounded-[2.5rem] bg-background animate-form overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-accent to-primary" />
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black font-heading uppercase flex items-center gap-3">
                  <Users className="h-5 w-5 text-accent" />
                  Recruit Talent
                </CardTitle>
                <CardDescription className="font-bold text-xs uppercase tracking-widest text-muted-foreground/60">
                  Build your dream squad
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Zone</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                    <Input placeholder="Search by city..." className="rounded-2xl h-12 pl-12 bg-muted/30 border-none font-bold" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Role Needed</Label>
                  <Select defaultValue="any" onValueChange={setPosition}>
                    <SelectTrigger className="rounded-2xl h-12 bg-muted/30 border-none font-bold px-4">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl">
                      <SelectItem value="any">Any Position</SelectItem>
                      <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                      <SelectItem value="Defender">Defender</SelectItem>
                      <SelectItem value="Midfielder">Midfielder</SelectItem>
                      <SelectItem value="Forward">Forward</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Min. Skill Rank</Label>
                  <Select defaultValue="any" onValueChange={setSkillLevel}>
                    <SelectTrigger className="rounded-2xl h-12 bg-muted/30 border-none font-bold px-4">
                      <SelectValue placeholder="Select rank" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl">
                      <SelectItem value="any">Open Ranking</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="p-8 pt-0">
                <Button
                  onClick={searchProfiles}
                  disabled={isSearching}
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-lg shadow-xl shadow-accent/20 bg-accent hover:bg-accent/90"
                >
                  {isSearching ? <Loader2 className="h-6 w-6 animate-spin" /> : "SCOUT PLAYERS"}
                </Button>
              </CardFooter>
            </Card>

            <div className="lg:col-span-8 space-y-6">
              {profiles.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">
                      {profiles.length} Active Players Nearby
                    </h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {profiles.map((profile) => (
                      <Card
                        key={profile._id}
                        className="animate-result border-none shadow-xl shadow-black/5 rounded-[2rem] bg-background overflow-hidden hover:shadow-2xl transition-all duration-500 relative group"
                      >
                        <div className="absolute top-0 right-0 p-4">
                          <Badge className="rounded-full bg-primary/10 text-primary border-none text-[8px] font-black tracking-widest px-2 py-0.5">
                            {profile.skillLevel?.toUpperCase()}
                          </Badge>
                        </div>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <Avatar className="h-14 w-14 border-2 border-background shadow-md">
                              <AvatarImage src={profile.profileImage || ""} />
                              <AvatarFallback className="bg-muted text-muted-foreground font-black">
                                {profile.user?.name?.[0] || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-black font-heading uppercase text-lg leading-none">
                                {profile.user?.name || "Player"}
                              </h4>
                              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.1em] mt-1.5">
                                {profile.position}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground font-medium line-clamp-2 h-8 mb-6 italic">
                            {profile.bio || "No bio available for this player."}
                          </p>
                          <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <div className="flex items-center gap-1.5">
                              <Shield className="h-3 w-3 text-primary" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Rank #4.5</span>
                            </div>
                            {/* ✅ Updated button with inviteStatus */}
                            <Button
                              size="sm"
                              className={`rounded-full px-5 font-black uppercase tracking-widest text-[10px] h-9 ${
                                profile.inviteStatus === "accepted"
                                  ? "bg-green-100 text-green-700 border border-green-200"
                                  : profile.inviteStatus === "pending"
                                  ? "bg-muted text-muted-foreground"
                                  : "bg-primary shadow-md shadow-primary/10"
                              }`}
                              onClick={() => {
                                if (profile.inviteStatus === "pending" || profile.inviteStatus === "accepted") return;
                                handleInvitePlayer(profile._id);
                              }}
                              disabled={profile.inviteStatus === "pending" || invitingId === profile._id}
                            >
                              {invitingId === profile._id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : profile.inviteStatus === "accepted" ? (
                                "FRIENDS"
                              ) : profile.inviteStatus === "pending" ? (
                                "INVITED"
                              ) : (
                                <>
                                  RECRUIT
                                  <ArrowRight className="h-3 w-3 ml-2" />
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                !isSearching && (
                  <div className="flex flex-col items-center justify-center py-32 text-center opacity-20 grayscale bg-muted/5 rounded-[3rem] border-4 border-dashed border-muted">
                    <Users className="h-20 w-20 mb-6 stroke-[1]" />
                    <h3 className="text-2xl font-black font-heading uppercase">Draft New Talent</h3>
                    <p className="font-bold max-w-xs mt-2">Filter by position and rank to build your perfect five.</p>
                  </div>
                )
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── MY REQUESTS ── */}
        <TabsContent value="my-requests" className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* RECEIVED */}
            <div className="space-y-6">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground px-2">
                Incoming Requests
              </h2>
              <div className="space-y-4">
                {myRequests.challenges.received.map((ch) => (
                  <Card key={ch._id} className="border-none shadow-lg rounded-3xl overflow-hidden bg-background">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-accent text-white flex items-center justify-center font-black uppercase">
                            {ch.sender?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-sm uppercase">{ch.sender?.name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Team Challenge</p>
                          </div>
                        </div>
                        <Badge
                          className={`rounded-full text-[8px] font-black uppercase tracking-widest ${
                            ch.status === "pending"
                              ? "bg-amber-500/10 text-amber-500"
                              : ch.status === "accepted"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-red-500/10 text-red-500"
                          } border-none`}
                        >
                          {ch.status}
                        </Badge>
                      </div>
                      <p className="text-xs font-medium bg-muted/30 p-3 rounded-xl mb-4 italic">
                        &quot;{ch.message}&quot;
                      </p>
                      {ch.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest"
                            onClick={() => handleResponse("challenge", ch._id, "accepted")}
                          >
                            Accept
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest"
                            onClick={() => handleResponse("challenge", ch._id, "rejected")}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}

                {myRequests.invitations.received.map((inv) => (
                  <Card key={inv._id} className="border-none shadow-lg rounded-3xl overflow-hidden bg-background">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-black uppercase">
                            {inv.sender?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-sm uppercase">{inv.sender?.name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Squad Invitation</p>
                          </div>
                        </div>
                        <Badge
                          className={`rounded-full text-[8px] font-black uppercase tracking-widest ${
                            inv.status === "pending"
                              ? "bg-amber-500/10 text-amber-500"
                              : inv.status === "accepted"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-red-500/10 text-red-500"
                          } border-none`}
                        >
                          {inv.status}
                        </Badge>
                      </div>
                      <p className="text-xs font-medium bg-muted/30 p-3 rounded-xl mb-4 italic">
                        &quot;{inv.message}&quot;
                      </p>
                      {inv.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest"
                            onClick={() => handleResponse("invitation", inv._id, "accepted")}
                          >
                            Join
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest"
                            onClick={() => handleResponse("invitation", inv._id, "rejected")}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}

                {myRequests.challenges.received.length === 0 &&
                  myRequests.invitations.received.length === 0 && (
                    <div className="py-20 text-center opacity-20 grayscale border-2 border-dashed border-muted rounded-[2rem]">
                      <Activity className="h-12 w-12 mx-auto mb-4" />
                      <p className="text-xs font-black uppercase tracking-widest">No Incoming Requests</p>
                    </div>
                  )}
              </div>
            </div>

            {/* SENT */}
            <div className="space-y-6">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Outbox</h2>
              <div className="space-y-4">
                {myRequests.challenges.sent.map((ch) => (
                  <Card key={ch._id} className="border-none shadow-lg rounded-3xl overflow-hidden bg-background/50">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center font-black uppercase text-xs">
                            {ch.recipient?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-xs uppercase">{ch.recipient?.name}</p>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest text-blue-500">To: Rivals</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="rounded-full text-[8px] font-black uppercase tracking-widest border-muted">
                          {ch.status}
                        </Badge>
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground line-clamp-1 opacity-60 italic">
                        Challenge: {ch.message}
                      </p>
                    </div>
                  </Card>
                ))}

                {myRequests.invitations.sent.map((inv) => (
                  <Card key={inv._id} className="border-none shadow-lg rounded-3xl overflow-hidden bg-background/50">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-black uppercase text-xs">
                            {inv.recipient?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-xs uppercase">{inv.recipient?.name}</p>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest text-primary">To: Player</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="rounded-full text-[8px] font-black uppercase tracking-widest border-muted">
                          {inv.status}
                        </Badge>
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground line-clamp-1 opacity-60 italic">
                        Invite: {inv.message}
                      </p>
                    </div>
                  </Card>
                ))}

                {myRequests.challenges.sent.length === 0 &&
                  myRequests.invitations.sent.length === 0 && (
                    <div className="py-20 text-center opacity-20 grayscale border-2 border-dashed border-muted rounded-[2rem]">
                      <Zap className="h-12 w-12 mx-auto mb-4" />
                      <p className="text-xs font-black uppercase tracking-widest">No Sent Requests</p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}