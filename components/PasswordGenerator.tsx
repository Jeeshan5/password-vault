'use client';

import { useState, useCallback } from 'react';

interface PasswordGeneratorProps {
  onPasswordGenerated?: (password: string) => void;
  className?: string;
}

export default function PasswordGenerator({ onPasswordGenerated, className = '' }: PasswordGeneratorProps) {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(true);
  const [copied, setCopied] = useState(false);

  // Character sets
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const similarChars = 'il1Lo0O'; // Characters that look similar

  const generatePassword = useCallback(() => {
    let charset = '';
    
    if (includeUppercase) charset += uppercaseChars;
    if (includeLowercase) charset += lowercaseChars;
    if (includeNumbers) charset += numberChars;
    if (includeSymbols) charset += symbolChars;

    if (!charset) {
      setPassword('Please select at least one character type');
      return;
    }

    // Remove similar looking characters if option is enabled
    if (excludeSimilar) {
      charset = charset.split('').filter(char => !similarChars.includes(char)).join('');
    }

    let result = '';
    
    // Ensure at least one character from each selected type
    const requiredChars = [];
    if (includeUppercase) requiredChars.push(uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)]);
    if (includeLowercase) requiredChars.push(lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)]);
    if (includeNumbers) requiredChars.push(numberChars[Math.floor(Math.random() * numberChars.length)]);
    if (includeSymbols) requiredChars.push(symbolChars[Math.floor(Math.random() * symbolChars.length)]);

    // Fill the rest randomly
    for (let i = requiredChars.length; i < length; i++) {
      requiredChars.push(charset[Math.floor(Math.random() * charset.length)]);
    }

    // Shuffle the array to avoid predictable patterns
    for (let i = requiredChars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [requiredChars[i], requiredChars[j]] = [requiredChars[j], requiredChars[i]];
    }

    result = requiredChars.join('');
    setPassword(result);
    
    if (onPasswordGenerated) {
      onPasswordGenerated(result);
    }
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar, onPasswordGenerated]);

  const copyToClipboard = async () => {
    if (!password || password === 'Please select at least one character type') return;
    
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(async () => {
        // Auto-clear clipboard after 15 seconds for security
        try {
          await navigator.clipboard.writeText('');
        } catch (_e) {
          // May be blocked by browser
        }
        setCopied(false);
      }, 15000);
    } catch (error) {
      console.error('Failed to copy password:', error);
    }
  };

  const getPasswordStrength = () => {
    if (!password || password === 'Please select at least one character type') return { strength: 0, label: 'None', color: 'gray' };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { strength: score, label: 'Weak', color: 'red' };
    if (score <= 4) return { strength: score, label: 'Fair', color: 'yellow' };
    if (score <= 6) return { strength: score, label: 'Good', color: 'blue' };
    return { strength: score, label: 'Strong', color: 'green' };
  };

  const strength = getPasswordStrength();

  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 ${className}`}>
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300 mr-3">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Password Generator
        </h3>
      </div>

      {/* Generated Password Display */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Generated Password
        </label>
        <div className="relative">
          <input
            type="text"
            value={password}
            readOnly
            className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:text-white"
            placeholder="Click 'Generate' to create a password"
          />
          <button
            onClick={copyToClipboard}
            disabled={!password || password === 'Please select at least one character type'}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="Copy to clipboard"
          >
            {copied ? (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Password Strength Indicator */}
        {password && password !== 'Please select at least one character type' && (
          <div className="mt-2 flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 bg-${strength.color}-500`}
                style={{ width: `${(strength.strength / 7) * 100}%` }}
              ></div>
            </div>
            <span className={`text-sm font-medium text-${strength.color}-600 dark:text-${strength.color}-400`}>
              {strength.label}
            </span>
          </div>
        )}
      </div>

      {/* Length Slider */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Length: {length} characters
        </label>
        <input
          type="range"
          min="8"
          max="64"
          value={length}
          onChange={(e) => setLength(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>8</span>
          <span>64</span>
        </div>
      </div>

      {/* Character Type Options */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={includeUppercase}
              onChange={(e) => setIncludeUppercase(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-colors ${includeUppercase ? 'bg-purple-500 border-purple-500' : 'border-gray-300 dark:border-gray-600'}`}>
              {includeUppercase && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Uppercase Letters</span>
          </label>
          <span className="text-xs text-gray-500 font-mono">ABC</span>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={includeLowercase}
              onChange={(e) => setIncludeLowercase(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-colors ${includeLowercase ? 'bg-purple-500 border-purple-500' : 'border-gray-300 dark:border-gray-600'}`}>
              {includeLowercase && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lowercase Letters</span>
          </label>
          <span className="text-xs text-gray-500 font-mono">abc</span>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-colors ${includeNumbers ? 'bg-purple-500 border-purple-500' : 'border-gray-300 dark:border-gray-600'}`}>
              {includeNumbers && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Numbers</span>
          </label>
          <span className="text-xs text-gray-500 font-mono">123</span>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-colors ${includeSymbols ? 'bg-purple-500 border-purple-500' : 'border-gray-300 dark:border-gray-600'}`}>
              {includeSymbols && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Symbols</span>
          </label>
          <span className="text-xs text-gray-500 font-mono">!@#</span>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={excludeSimilar}
              onChange={(e) => setExcludeSimilar(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-colors ${excludeSimilar ? 'bg-purple-500 border-purple-500' : 'border-gray-300 dark:border-gray-600'}`}>
              {excludeSimilar && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Exclude Similar Characters</span>
          </label>
          <span className="text-xs text-gray-500 font-mono">il1Lo0O</span>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generatePassword}
        className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
      >
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Generate Password
        </div>
      </button>

      {copied && (
        <div className="mt-3 text-center text-sm text-green-600 dark:text-green-400 font-medium">
          ✓ Password copied! Will clear from clipboard in 15 seconds
        </div>
      )}
    </div>
  );
}