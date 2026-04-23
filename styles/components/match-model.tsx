"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { MapPin, Calendar, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateMatchModal({ isOpen, onClose }: CreateMatchModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [type, setType] = useState("opponents");
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState(5);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [teamSize, setTeamSize] = useState(5);
  const [isSkillBased, setIsSkillBased] = useState(false);
  const [position, setPosition] = useState("any");
  const [skillLevel, setSkillLevel] = useState("any");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const matchData = {
        type,
        location,
        distance,
        date,
        time,
        teamSize,
        isSkillBased,
        positionsNeeded: [position],
        skillLevel,
      };

      const response = await fetch("/api/matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(matchData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create match");
      }

      toast({
        title: "Success!",
        description: "Your match has been created successfully.",
      });

      router.refresh();
      onClose();
    } catch (error: any) {
      console.error("Error creating match:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create match",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a Match</DialogTitle>
            <DialogDescription>
              Set up your match preferences and find opponents or teammates.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Match Type</Label>
              <Select defaultValue={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select match type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="opponents">Find Opponents</SelectItem>
                  <SelectItem value="teammates">Find Teammates</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Your Location</Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  placeholder="Enter your location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
                <Button type="button" variant="outline" size="icon">
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="flex gap-2">
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                  <Button type="button" variant="outline" size="icon">
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
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                  <Button type="button" variant="outline" size="icon">
                    <Clock className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-size">Team Size</Label>
              <Select
                defaultValue={teamSize.toString()}
                onValueChange={(v) => setTeamSize(parseInt(v))}
              >
                <SelectTrigger id="team-size">
                  <SelectValue placeholder="Select team size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3v3</SelectItem>
                  <SelectItem value="4">4v4</SelectItem>
                  <SelectItem value="5">5v5</SelectItem>
                  <SelectItem value="6">6v6</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="skill-based"
                checked={isSkillBased}
                onCheckedChange={setIsSkillBased}
              />
              <Label htmlFor="skill-based">
                Enable skill-based matchmaking
              </Label>
            </div>

            {type === "teammates" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="positions">Position Needed</Label>
                  <Select defaultValue={position} onValueChange={setPosition}>
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
                    defaultValue={skillLevel}
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
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>Creating...</span>
                </div>
              ) : (
                "Create Match"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
