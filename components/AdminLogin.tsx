
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, ShieldAlert, X, Loader2, User } from 'lucide-react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const MotionDiv = motion.div as any;

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setError(false);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onSuccess();
    } catch (err: any) {
      setError(true);
      setErrorMsg("Invalid Credentials");
      setIsChecking(false);
      setTimeout(() => setError(false), 2000);
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-white dark:bg-neutral-950 flex items-center justify-center p-6">
      <button 
        onClick={onCancel}
        className="absolute top-8 right-8 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
      >
        <X size={32} />
      </button>

      <MotionDiv 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-900 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-neutral-200 dark:border-neutral-800 relative overflow-hidden">
           <AnimatePresence mode="wait">
             {isChecking ? (
                <MotionDiv 
                    key="loader"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                >
                    <Loader2 size={32} className="text-emerald-500 animate-spin" />
                </MotionDiv>
             ) : (
                <MotionDiv
                    key="lock"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                >
                    <Lock size={32} className={error ? "text-red-500 animate-shake" : "text-neutral-500"} />
                </MotionDiv>
             )}
           </AnimatePresence>
        </div>

        <h2 className="text-3xl font-bold tracking-tighter uppercase mb-2">Cloud Access</h2>
        <p className="text-neutral-500 font-mono text-xs uppercase tracking-[0.2em] mb-12">Login with Firebase Account</p>

        <form onSubmit={handleSubmit} className="relative flex flex-col gap-4">
          <div className="relative">
             <User size={16} className="absolute left-0 top-4 text-neutral-400" />
             <input 
                ref={inputRef}
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isChecking}
                placeholder="admin@example.com"
                className="w-full bg-transparent border-b-2 pl-6 py-3 text-lg font-light focus:outline-none transition-colors border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
              />
          </div>

          <div className="relative">
              <Lock size={16} className="absolute left-0 top-4 text-neutral-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isChecking}
                placeholder="Password"
                className={`w-full bg-transparent border-b-2 pl-6 py-3 text-lg font-light focus:outline-none transition-colors placeholder:text-neutral-300 dark:placeholder:text-neutral-700 disabled:opacity-50 ${
                  error ? 'border-red-500 text-red-500' : 'border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white'
                }`}
              />
          </div>
          
          <div className="flex justify-center mt-8">
            <button 
                type="submit" 
                disabled={isChecking || !email || !password}
                className="p-4 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
                <ArrowRight size={24} />
            </button>
          </div>
        </form>

        <AnimatePresence>
          {error && (
            <MotionDiv 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 flex items-center justify-center gap-2 text-red-500 font-mono text-xs uppercase tracking-widest"
            >
              <ShieldAlert size={14} /> {errorMsg}
            </MotionDiv>
          )}
        </AnimatePresence>

        <div className="mt-16 pt-8 border-t border-neutral-100 dark:border-neutral-900">
           <p className="text-[10px] text-neutral-400 uppercase tracking-widest leading-relaxed">
             Security Level: Firebase Authentication<br/>
             Authorized Personnel Only.
           </p>
        </div>
      </MotionDiv>
    </div>
  );
};

export default AdminLogin;
