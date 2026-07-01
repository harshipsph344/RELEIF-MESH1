import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please make sure your passwords match.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    const result = await signup(username, email, password);

    if (result.success) {
      toast({ title: "Account created", description: "Welcome to ReliefMesh!" });
      navigate('/');
    } else {
      toast({ title: "Signup failed", description: result.error, variant: "destructive" });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex font-sans" style={{ background: 'var(--color-bg-app)' }}>

      {/* Left panel - Brand Visual */}
      <div className="hidden lg:flex flex-col justify-between w-[55%] p-12 text-white relative overflow-hidden" style={{ background: 'var(--gradient-risk)' }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")' }}></div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-sm">RM</div>
          <span className="text-xl font-semibold tracking-tight">ReliefMesh</span>
        </div>

        <div className="relative z-10">
          <p className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-4">Join the Network</p>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Be Part of<br />the Response.
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-md">
            Create your account to start coordinating disaster relief efforts — register resources, submit help requests, and manage shelter capacity.
          </p>
        </div>

        <div className="flex gap-3 relative z-10">
          {['Real-Time', 'Geo-located', 'Open Platform'].map(tag => (
            <div key={tag} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm border border-white/20">
              {tag}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div className="w-7 h-7 rounded flex items-center justify-center text-white font-bold text-xs" style={{ background: 'var(--color-primary)' }}>RM</div>
            <span className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>ReliefMesh</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Create account</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Fill in your details to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Username</Label>
              <Input id="username" type="text" placeholder="your_username" value={username} onChange={(e) => setUsername(e.target.value)} required className="h-10 bg-white border-gray-200 focus:border-black focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg text-sm" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-10 bg-white border-gray-200 focus:border-black focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg text-sm" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-10 bg-white border-gray-200 focus:border-black focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg text-sm" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Confirm Password</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="h-10 bg-white border-gray-200 focus:border-black focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg text-sm" />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-10 w-full mt-2 rounded-lg text-white font-semibold text-sm transition-all"
              style={{ background: isLoading ? '#9CA3AF' : 'var(--color-primary)' }}
            >
              {isLoading ? 'Creating account...' : 'Create account →'}
            </Button>
          </form>

          <p className="text-sm mt-6 text-center" style={{ color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: 'var(--color-primary)' }}>Sign in</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
