'use client';

import React, { useState, useEffect } from 'react';

interface EnvStatus {
  status: string;
  timestamp: string;
  environment: Record<string, string>;
  securityAnalysis: {
    issues: string[];
    recommendations: string[];
  };
  platform: {
    isAmplify: boolean;
    isVercel: boolean;
    isLambda: boolean;
    isEC2: boolean;
  };
}

export default function EnvClientProbe() {
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Client-side environment variables (only NEXT_PUBLIC_* are available)
  const clientEnvVars = {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'NOT_SET',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || 'NOT_SET',
    NEXT_PUBLIC_COGNITO_USER_POOL_ID: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || 'NOT_SET',
    NEXT_PUBLIC_COGNITO_CLIENT_ID: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || 'NOT_SET',
    NEXT_PUBLIC_S3_BUCKET_NAME: process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'NOT_SET',
    NEXT_PUBLIC_S3_REGION: process.env.NEXT_PUBLIC_S3_REGION || 'NOT_SET',
    NEXT_PUBLIC_API_GATEWAY_URL: process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'NOT_SET',
  };

  const fetchEnvStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/env-check');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setEnvStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch environment status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvStatus();
  }, []);

  const getStatusIcon = (value: string) => {
    if (value === 'SET' || value === 'true') return '✅';
    if (value === 'NOT_SET' || value === 'false') return '❌';
    return 'ℹ️';
  };

  const getStatusColor = (value: string) => {
    if (value === 'SET' || value === 'true') return 'text-green-600';
    if (value === 'NOT_SET' || value === 'false') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Environment Variables Audit</h2>
        <button
          onClick={fetchEnvStatus}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client-Side Environment Variables */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Client-Side Variables (NEXT_PUBLIC_*)</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            {Object.entries(clientEnvVars).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="font-mono text-sm">{key}</span>
                <span className={`font-mono text-sm ${getStatusColor(value)}`}>
                  {getStatusIcon(value)} {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Server-Side Environment Status */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Server-Side Status</h3>
          {envStatus ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="font-semibold text-blue-900 mb-2">Platform Detection</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Amplify:</span>
                    <span className={getStatusColor(envStatus.platform.isAmplify.toString())}>
                      {getStatusIcon(envStatus.platform.isAmplify.toString())} {envStatus.platform.isAmplify ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vercel:</span>
                    <span className={getStatusColor(envStatus.platform.isVercel.toString())}>
                      {getStatusIcon(envStatus.platform.isVercel.toString())} {envStatus.platform.isVercel ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lambda:</span>
                    <span className={getStatusColor(envStatus.platform.isLambda.toString())}>
                      {getStatusIcon(envStatus.platform.isLambda.toString())} {envStatus.platform.isLambda ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>EC2:</span>
                    <span className={getStatusColor(envStatus.platform.isEC2.toString())}>
                      {getStatusIcon(envStatus.platform.isEC2.toString())} {envStatus.platform.isEC2 ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {envStatus.securityAnalysis.issues.length > 0 && (
                <div className="bg-red-50 p-4 rounded-md">
                  <h4 className="font-semibold text-red-900 mb-2">Security Issues</h4>
                  <ul className="space-y-1 text-sm text-red-700">
                    {envStatus.securityAnalysis.issues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-green-50 p-4 rounded-md">
                <h4 className="font-semibold text-green-900 mb-2">Recommendations</h4>
                <ul className="space-y-1 text-sm text-green-700">
                  {envStatus.securityAnalysis.recommendations.map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 p-4 rounded-md text-center text-gray-600">
              {loading ? 'Loading server status...' : 'Click refresh to load server status'}
            </div>
          )}
        </div>
      </div>

      {/* Full Environment Variables (Server Response) */}
      {envStatus && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Complete Environment Variables</h3>
          <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(envStatus.environment, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h4 className="font-semibold text-yellow-900 mb-2">Important Notes</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Only variables prefixed with <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_</code> are available in client-side code</li>
          <li>• Server-only variables like API keys are never exposed to the browser</li>
          <li>• This component demonstrates proper client-side environment variable usage</li>
          <li>• For production, remove or restrict access to this debug component</li>
        </ul>
      </div>
    </div>
  );
}
