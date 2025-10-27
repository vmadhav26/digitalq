import React, { useState } from 'react';
import { Theme } from '../App';
import { SunIcon, MoonIcon, SparklesIcon } from './icons';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => boolean;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const ThemeToggler: React.FC<{ currentTheme: Theme, onThemeChange: (theme: Theme) => void }> = ({ currentTheme, onThemeChange }) => {
    const themes: { name: Theme; icon: React.ReactNode }[] = [
        { name: 'light', icon: <SunIcon className="w-5 h-5" /> },
        { name: 'dark', icon: <MoonIcon className="w-5 h-5" /> },
        { name: 'ambient', icon: <SparklesIcon className="w-5 h-5" /> },
    ];

    const buttonBaseClasses = "p-2 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";
    const buttonTextClasses: Record<Theme, string> = {
      light: "text-gray-600 focus:ring-offset-gray-100 focus:ring-yellow-500",
      dark: "text-gray-400 focus:ring-offset-gray-900 focus:ring-cyan-500",
      ambient: "text-indigo-300 focus:ring-offset-slate-900 focus:ring-indigo-400"
    };
    const buttonActiveClasses: Record<Theme, string> = {
      light: "bg-yellow-400/30 text-yellow-700",
      dark: "bg-cyan-500/20 text-cyan-300",
      ambient: "bg-indigo-500/20 text-indigo-200"
    };

    return (
        <div className="absolute top-4 right-4 bg-black/10 p-1 rounded-full flex gap-1 backdrop-blur-sm">
            {themes.map(({ name, icon }) => (
                <button
                    key={name}
                    onClick={() => onThemeChange(name)}
                    className={`${buttonBaseClasses} ${buttonTextClasses[currentTheme]} ${currentTheme === name ? buttonActiveClasses[currentTheme] : 'hover:bg-black/10'}`}
                    aria-label={`Switch to ${name} theme`}
                    title={`Switch to ${name} theme`}
                >
                    {icon}
                </button>
            ))}
        </div>
    );
};


const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, theme, onThemeChange }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onLogin(username, password);
    if (!success) {
      setError('Invalid username or password.');
    }
  };

  const themeStyles = {
    light: {
      container: 'bg-white rounded-2xl shadow-2xl text-gray-800',
      title: 'text-cyan-600',
      subtitle: 'text-gray-600',
      text: 'text-gray-500',
      textMuted: 'text-gray-400',
      inputLabel: 'text-gray-600',
      input: 'bg-gray-100 border-gray-300 text-gray-800 focus:ring-cyan-500',
      button: 'bg-cyan-600 hover:bg-cyan-700 text-white',
      error: 'text-red-600',
    },
    dark: {
      container: 'bg-gray-800 rounded-2xl shadow-2xl text-white',
      title: 'text-cyan-400',
      subtitle: 'text-gray-300',
      text: 'text-gray-400',
      textMuted: 'text-gray-500',
      inputLabel: 'text-gray-400',
      input: 'bg-gray-700 border-gray-600 text-white focus:ring-cyan-500',
      button: 'bg-cyan-600 hover:bg-cyan-700 text-white',
      error: 'text-red-400',
    },
    ambient: {
      container: 'bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 text-white',
      title: 'text-cyan-300',
      subtitle: 'text-gray-200',
      text: 'text-gray-300',
      textMuted: 'text-gray-400',
      inputLabel: 'text-gray-300',
      input: 'bg-white/5 border-white/20 text-white placeholder-gray-400 focus:ring-cyan-400 focus:border-cyan-400',
      button: 'bg-cyan-500/80 hover:bg-cyan-500 text-white',
      error: 'text-red-400',
    }
  };
  
  const styles = themeStyles[theme];

  return (
    <div className="flex items-center justify-center min-h-screen relative">
      <ThemeToggler currentTheme={theme} onThemeChange={onThemeChange} />
      <div className={`w-full max-w-md p-8 space-y-6 transition-colors duration-300 ${styles.container}`}>
        <div className="text-center">
          <h1 className={`text-4xl font-bold ${styles.title}`}>Qopikun Services</h1>
          <p className={`mt-2 text-lg ${styles.subtitle}`}>Digital Inspection Portal</p>
        </div>
        <div className="text-center">
          <p className={`text-sm ${styles.text}`}>Admin & Inspector Login</p>
          <p className={`text-xs mt-1 ${styles.textMuted}`}>Other participants must join via a shared inspection link.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className={`text-sm font-bold block ${styles.inputLabel}`}>Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={`w-full mt-1 p-3 border rounded-md focus:outline-none focus:ring-2 ${styles.input}`}
              placeholder="e.g., admin or inspector1"
            />
          </div>
          <div>
            <label htmlFor="password" className={`text-sm font-bold block ${styles.inputLabel}`}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full mt-1 p-3 border rounded-md focus:outline-none focus:ring-2 ${styles.input}`}
              placeholder="e.g., password"
            />
          </div>
          {error && <p className={`text-sm text-center ${styles.error}`}>{error}</p>}
          <div>
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-md font-semibold transition-colors duration-300 ${styles.button}`}
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
