import { Button } from "@/components/ui/button";
import { UserCircle, Bug, Mail } from "lucide-react";
import { signInWithGoogle, signOut } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";

export function Header() {
  const { user, loading } = useAuth();

  return (
    <div className="fixed top-0 right-0 p-4 flex items-center gap-2 z-50">
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-600 hover:text-gray-900"
        onClick={() => window.open('mailto:contact@yesilai.com')}
      >
        <Mail className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-600 hover:text-gray-900"
        onClick={() => window.open('https://github.com/yourusername/yesilai/issues', '_blank')}
      >
        <Bug className="h-5 w-5" />
      </Button>
      {!loading && (
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          onClick={user ? signOut : signInWithGoogle}
        >
          {user ? (
            <>
              <img 
                src={user.photoURL || ''} 
                alt={user.displayName || 'User'} 
                className="h-6 w-6 rounded-full"
              />
              <span className="text-sm">{user.displayName}</span>
            </>
          ) : (
            <>
              <UserCircle className="h-5 w-5" />
              <span className="text-sm">Sign In</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
} 