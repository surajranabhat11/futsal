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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Clock, Users, Search } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedLoader } from "@/components/ui/animated-loader";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { CreateMatchModal } from "@/components/match-model";
import { toast } from "@/components/ui/use-toast";

interface User {
  _id: string;
  name?: string;
  email?: string;
}

interface Profile {
  _id: string;
  user: User;
  profileImage?: string;
  position?: string;
  skillLevel?: string;
  bio?: string;
  invited?: boolean;
  location?: string;
  availability?: any;
  notifications?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MatchmakingPage() {
  const [distance, setDistance] = useState(5);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [position, setPosition] = useState("any");
  const [skillLevel, setSkillLevel] = useState("any");
  const [isSearching, setIsSearching] = useState(false);
  const [isCreateMatchOpen, setIsCreateMatchOpen] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matches, setMatches] = useState([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  const searchProfiles = async () => {
    try {
      setIsSearching(true);

      const queryParams = new URLSearchParams();

      queryParams.append("position", position);
      queryParams.append("skillLevel", skillLevel);

      console.log("Query Params:", queryParams.toString());

      const response = await fetch(`/api/profiles?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to search profiles");
      }

      const data = await response.json();
      console.log("Raw profile data:", data.profiles);
      setProfiles(data.profiles || []);
    } catch (error) {
      console.error("Error searching profiles:", error);
      toast({
        title: "Error",
        description: "Failed to search profiles",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const fetchMatches = async () => {
    try {
      setIsLoadingMatches(true);
      const response = await fetch("/api/matches");
      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches);
      }
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // Mock teams data
  const mockTeams = [
    {
      id: 1,
      name: "Team Alpha",
      location: "Kathmandu",
      distance: 2.3,
      rating: 4.8,
      availability: ["Mon", "Wed", "Fri"],
      players: 5,
    },
    {
      id: 2,
      name: "Futsal Kings",
      location: "Lalitpur",
      distance: 3.5,
      rating: 4.5,
      availability: ["Tue", "Thu", "Sat"],
      players: 5,
    },
    {
      id: 3,
      name: "Goal Getters",
      location: "Bhaktapur",
      distance: 4.8,
      rating: 4.2,
      availability: ["Mon", "Thu", "Sun"],
      players: 5,
    },
  ];

  // Simulate initial page loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Update the handleSearch function
  const [searchDate, setSearchDate] = useState("");
  const [searchTime, setSearchTime] = useState("");
  const [searchTeamSize, setSearchTeamSize] = useState("5");
  const [searchLocation, setSearchLocation] = useState("");
  const [isSkillBasedSearch, setIsSkillBasedSearch] = useState(false);

  const handleSearch = async () => {
    try {
      setIsSearching(true);

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("type", "opponents");

      if (searchLocation) {
        queryParams.append("location", searchLocation);
        queryParams.append("distance", distance.toString());
      }

      if (searchDate) {
        queryParams.append("date", searchDate);
      }

      if (searchTime) {
        queryParams.append("time", searchTime);
      }

      queryParams.append("teamSize", searchTeamSize);
      queryParams.append("isSkillBased", isSkillBasedSearch.toString());

      // Make API call
      const response = await fetch(
        `/api/matches/search?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to search for matches");
      }

      const data = await response.json();

      // Transform the matches into the format expected by the UI
      const formattedResults = data.matches.map(
        (match: {
          _id: any;
          createdBy: { name: any };
          location: any;
          distance: any;
          dateTime: string | number | Date;
          teamSize: any;
          skillLevel: any;
        }) => ({
          id: match._id,
          name: `Team ${match.createdBy?.name || "Anonymous"}`,
          location: match.location,
          distance: match.distance,
          rating: 4.5, // You might want to add a rating system later
          availability: [new Date(match.dateTime).toLocaleDateString()],
          players: match.teamSize,
          createdBy: match.createdBy,
          dateTime: new Date(match.dateTime).toLocaleString(),
          skillLevel: match.skillLevel,
        })
      );

      setSearchResults(formattedResults);
    } catch (error) {
      console.error("Error searching for matches:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleChallenge = async (teamId: string) => {
    try {
      setIsSearching(true);
      
      // Find the match details to get the creator's ID
      const match = searchResults.find(m => m.id === teamId);
      if (!match) {
        throw new Error("Match not found");
      }

      const response = await fetch("/api/teams/challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: match.createdBy._id,
          matchDetails: {
            date: match.dateTime.split(' ')[0],
            time: match.dateTime.split(' ')[1],
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

      // Update UI to show challenge was sent
      setSearchResults(prevResults =>
        prevResults.map(result =>
          result.id === teamId ? { ...result, challenged: true } : result
        )
      );

      toast({
        title: "Success",
        description: "Challenge sent successfully",
      });
    } catch (error) {
      console.error("Error sending challenge:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send challenge",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleInvitePlayer = async (playerId: string) => {
    try {
      setIsSearching(true);

      // Find the profile to get the user ID
      const profile = profiles.find(p => p._id === playerId);
      console.log("Found profile:", profile);

      if (!profile) {
        console.error("Profile not found:", { playerId, profiles });
        throw new Error("Profile not found");
      }

      if (!profile.user) {
        console.error("Profile has no user data:", profile);
        throw new Error("Profile has no user data");
      }

      const userId = profile.user._id || profile.user;
      if (!userId) {
        console.error("No user ID found in profile:", profile);
        throw new Error("No user ID found in profile");
      }

      console.log("Sending invitation to user:", userId);

      const response = await fetch("/api/players/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: userId,
          message: "Would you like to join my team?",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send invitation");
      }

      const data = await response.json();
      console.log("Invitation sent successfully:", data);

      // Update UI to show invitation was sent
      setProfiles(prevProfiles =>
        prevProfiles.map(profile =>
          profile._id === playerId ? { ...profile, invited: true } : profile
        )
      );

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-[250px] mb-2" />
          <Skeleton className="h-4 w-[350px]" />
        </div>

        <div className="w-full">
          <div className="flex w-full mb-6">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Matchmaking</h1>
        <p className="text-muted-foreground">
          Find opponents or teammates for your next futsal match.
        </p>
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setIsCreateMatchOpen(true)}
      >
        Create a Match
      </Button>

      <CreateMatchModal
        isOpen={isCreateMatchOpen}
        onClose={() => setIsCreateMatchOpen(false)}
      />

      <Tabs defaultValue="find-opponents" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="find-opponents">Find Opponents</TabsTrigger>
          <TabsTrigger value="find-teammates">Find Teammates</TabsTrigger>
        </TabsList>
        <TabsContent value="find-opponents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Criteria</CardTitle>
              <CardDescription>
                Set your preferences to find the perfect opponent for your
                match.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Your Location</Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    placeholder="Enter your location"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                  <Button variant="outline" size="icon">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Distance (km): {distance}</Label>
                </div>
                <Slider
                  value={[distance]}
                  min={1}
                  max={20}
                  step={1}
                  onValueChange={(value) => setDistance(value[0])}
                />
              </div> */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <div className="flex gap-2">
                    <Input
                      id="date"
                      type="date"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                    />
                    <Button variant="outline" size="icon">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <div className="flex gap-2">
                    <Input
                      id="time"
                      type="time"
                      value={searchTime}
                      onChange={(e) => setSearchTime(e.target.value)}
                    />
                    <Button variant="outline" size="icon">
                      <Clock className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-size">Team Size</Label>
                <Select
                  defaultValue="5"
                  onValueChange={(value) => setSearchTeamSize(value)}
                >
                  <SelectTrigger id="team-size">
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5a Side</SelectItem>
                    <SelectItem value="6">6a Side</SelectItem>
                    <SelectItem value="6">7a Side</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="skill-based"
                  checked={isSkillBasedSearch}
                  onCheckedChange={setIsSkillBasedSearch}
                />
                <Label htmlFor="skill-based">
                  Enable skill-based matchmaking
                </Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full"
              >
                {isSearching ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" animated />
                    <span>Searching...</span>
                  </div>
                ) : (
                  "Search for Opponents"
                )}
              </Button>
            </CardFooter>
          </Card>

          {isSearching ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Searching for opponents...</h2>
              <div className="flex justify-center p-8">
                <AnimatedLoader
                  size="lg"
                  text="Finding the perfect match for you"
                />
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Search Results</h2>
              {searchResults.map((match) => (
                <Card key={match.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-bold">{match.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-1 h-3 w-3" />
                          {match.location} ({match.distance} km away)
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="mr-1 h-3 w-3" />
                          {match.players} players
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Match Time:</span>{" "}
                          {match.dateTime}
                        </div>
                        {match.skillLevel && match.skillLevel !== "any" && (
                          <div className="text-sm">
                            <span className="font-medium">Skill Level:</span>{" "}
                            {match.skillLevel}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => handleChallenge(match.id)}
                        disabled={match.challenged || isSearching}
                      >
                        {match.challenged ? "Challenge Sent" : "Challenge"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
        </TabsContent>
        <TabsContent value="find-teammates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Find Teammates</CardTitle>
              <CardDescription>
                Looking for players to join your team? Set your preferences
                below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="player-location">Your Location</Label>
                <div className="flex gap-2">
                  <Input
                    id="player-location"
                    placeholder="Enter your location"
                  />
                  <Button variant="outline" size="icon">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {/* <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Distance (km): {distance}</Label>
                </div>
                <Slider
                  value={[distance]}
                  min={1}
                  max={20}
                  step={1}
                  onValueChange={(value) => setDistance(value[0])}
                />
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="positions">Positions Needed</Label>
                <Select defaultValue="any" onValueChange={setPosition}>
                  <SelectTrigger id="positions">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Position</SelectItem>
                    <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                    <SelectItem value="Defender">Defender</SelectItem>
                    <SelectItem value="Midfielder">Midfielder</SelectItem>
                    <SelectItem value="Forward">Forward</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill-level">Skill Level</Label>
                <Select
                  defaultValue="intermediate"
                  onValueChange={setSkillLevel}
                >
                  <SelectTrigger id="skill-level">
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Skill Level</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={searchProfiles}
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Find Players
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {profiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Players</CardTitle>
                <CardDescription>
                  {profiles.length} player(s) match your criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profiles.map((profile) => (
                    <div
                      key={profile._id}
                      className="flex items-center justify-between border-b pb-4"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={profile.profileImage || ""} />
                          <AvatarFallback>
                            {profile.user?.name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {profile.user?.name || "Anonymous"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {profile.position} • {profile.skillLevel}
                          </p>
                          {profile.bio && (
                            <p className="text-sm mt-1">{profile.bio}</p>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleInvitePlayer(profile._id)}
                        disabled={profile.invited || isSearching}
                      >
                        {profile.invited ? "Invited" : "Invite"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {profiles.length === 0 && !isSearching && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <p>No players match your search criteria.</p>
                  <p className="text-sm mt-1">Try adjusting your filters.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
