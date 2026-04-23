import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";

interface ProfileContextType {
  profile: ProfileType | null;
  loading: boolean;
  updateProfile: (data: Partial<ProfileType>) => Promise<void>;
  error: string | null;
}

export interface ProfileType {
  location?: string;
  bio?: string;
  position?: string;
  skillLevel?: string;
  availability?: Record<string, any>;
  notifications?: boolean;
  profileImage?: string;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile when session changes
  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch("/api/profile");

        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await res.json();
        setProfile(data.profile || null);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [session]);

  // Update profile
  const updateProfile = async (data: Partial<ProfileType>) => {
    if (!session?.user) return;

    try {
      setLoading(true);
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedData = await res.json();
      setProfile(updatedData.profile);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
      throw err; // Re-throw to handle in the component
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, updateProfile, error }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
