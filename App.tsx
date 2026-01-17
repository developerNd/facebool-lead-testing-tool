
import React, { useState } from 'react';
import { Send, Info, CheckCircle, XCircle, Loader2, ExternalLink, Key, Code, HelpCircle } from 'lucide-react';

// Define interfaces locally since types.ts is not configured as a module to fix the 'not a module' error
interface FacebookApiResponse {
  id?: string;
  error?: {
    message: string;
  };
  [key: string]: any;
}

interface TestLeadState {
  success: boolean;
  data: FacebookApiResponse;
  leadDetails?: boolean;
}

const App: React.FC = () => {
  const [formId, setFormId] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');
  const [apiVersion, setApiVersion] = useState<string>('v20.0');
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<TestLeadState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createTestLead = async () => {
    if (!formId || !accessToken) {
      setError('Please provide both Form ID and Access Token');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const url = `https://graph.facebook.com/${apiVersion}/${formId}/test_leads`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken
        })
      });

      const data: FacebookApiResponse = await res.json();

      if (res.ok) {
        setResponse({
          success: true,
          data: data
        });
      } else {
        setError(data.error?.message || 'Failed to create test lead');
        setResponse({
          success: false,
          data: data
        });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getLeadData = async (leadId: string) => {
    if (!leadId || !accessToken) return;

    setLoading(true);
    try {
      const url = `https://graph.facebook.com/${apiVersion}/${leadId}?fields=field_data,ad_name,campaign_name&access_token=${accessToken}`;
      
      const res = await fetch(url);
      const data: FacebookApiResponse = await res.json();

      setResponse({
        success: res.ok,
        data: data,
        leadDetails: true
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching lead data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Send className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Facebook Lead Ads Testing Tool</h1>
                <p className="text-blue-100 mt-1 opacity-90">Simulate and verify your Lead Ads integration in seconds</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Requirements Section */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
              <div className="flex items-start gap-3">
                <Info className="text-blue-600 mt-1 flex-shrink-0" size={22} />
                <div>
                  <h2 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    Before you start
                  </h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-blue-800">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      Page Access Token with <code>leads_retrieval</code>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      Page role Advertiser or higher
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      No existing test leads for this form
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      Form should not be in production
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Input Form */}
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Code size={16} className="text-gray-400" /> API Version
                  </label>
                  <select
                    value={apiVersion}
                    onChange={(e) => setApiVersion(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
                  >
                    <option value="v20.0">v20.0 (Latest)</option>
                    <option value="v19.0">v19.0</option>
                    <option value="v18.0">v18.0</option>
                    <option value="v17.0">v17.0</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <HelpCircle size={16} className="text-gray-400" /> Form ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    placeholder="e.g. 123456789012345"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all font-mono"
                  />
                  <p className="text-xs text-gray-400 mt-2 italic">
                    You can find this in the Facebook Business Suite or Lead Ads Forms manager.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Key size={16} className="text-gray-400" /> Page Access Token <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Paste your long-lived or session Page Access Token here..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm shadow-sm transition-all"
                />
              </div>

              <button
                onClick={createTestLead}
                disabled={loading || !formId || !accessToken}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-[0.98] ${
                  loading || !formId || !accessToken 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send size={24} />
                    Create Test Lead
                  </>
                )}
              </button>
            </div>

            {/* Error Feedback */}
            {error && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-lg">
                  <div className="flex items-start gap-4">
                    <XCircle className="text-red-600 flex-shrink-0" size={24} />
                    <div className="flex-1">
                      <h3 className="font-bold text-red-800">API Error</h3>
                      <p className="text-red-700 text-sm mt-1 leading-relaxed">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Response Section */}
            {response && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <div className={`border-l-4 p-6 rounded-r-lg shadow-sm ${
                  response.success 
                    ? 'bg-green-50 border-green-500' 
                    : 'bg-amber-50 border-amber-500'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${response.success ? 'bg-green-100' : 'bg-amber-100'}`}>
                      {response.success ? (
                        <CheckCircle className="text-green-600" size={24} />
                      ) : (
                        <Info className="text-amber-600" size={24} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-lg font-bold ${
                          response.success ? 'text-green-800' : 'text-amber-800'
                        }`}>
                          {response.success ? 'Lead Created Successfully' : 'Response Received'}
                        </h3>
                        {response.success && (
                          <span className="px-3 py-1 bg-green-200 text-green-800 text-xs font-bold rounded-full uppercase tracking-wider">
                            HTTP 200
                          </span>
                        )}
                      </div>
                      
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-inner">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">JSON Response Payload</span>
                          <button 
                            onClick={() => navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                        <pre className="p-4 text-xs font-mono text-gray-800 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                          {JSON.stringify(response.data, null, 2)}
                        </pre>
                      </div>

                      {response.data.id && !response.leadDetails && (
                        <div className="mt-6 flex items-center gap-4">
                          <button
                            onClick={() => getLeadData(response.data.id!)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                          >
                            <Info size={18} />
                            Fetch Full Lead Details
                          </button>
                          <span className="text-xs text-green-700 font-medium italic opacity-70">
                            ID: {response.data.id}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Help Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <ExternalLink size={20} className="text-blue-500" />
                  Authentication Guide
                </h3>
                <div className="space-y-3 text-sm text-gray-600 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <ol className="list-decimal list-inside space-y-3">
                    <li>
                      Visit <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium inline-flex items-center gap-0.5">Graph API Explorer <ExternalLink size={12}/></a>
                    </li>
                    <li>Select your Meta App from the dropdown menu.</li>
                    <li>Click <span className="font-semibold text-gray-700">Generate Access Token</span> and select your Page.</li>
                    <li>
                      Enable permissions: 
                      <div className="mt-2 flex flex-wrap gap-2">
                        <code className="bg-white border border-gray-200 text-blue-700 px-2 py-0.5 rounded text-xs font-mono">leads_retrieval</code>
                        <code className="bg-white border border-gray-200 text-blue-700 px-2 py-0.5 rounded text-xs font-mono">pages_manage_ads</code>
                        <code className="bg-white border border-gray-200 text-blue-700 px-2 py-0.5 rounded text-xs font-mono">pages_read_engagement</code>
                      </div>
                    </li>
                    <li>Copy the long string and paste it into the field above.</li>
                  </ol>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Code size={20} className="text-blue-500" />
                  API Endpoint Reference
                </h3>
                <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl font-mono text-[11px] leading-relaxed relative group">
                  <div className="mb-2 text-slate-500 text-[10px] uppercase tracking-widest font-bold">Standard Request</div>
                  <div className="space-y-2">
                    <p><span className="text-pink-400 font-bold">POST</span> /<span className="text-blue-300">{apiVersion}</span>/<span className="text-amber-300">{'{FORM_ID}'}</span>/test_leads</p>
                    <div className="pt-2 border-t border-slate-800">
                      <p className="text-slate-500 mb-1">PAYLOAD:</p>
                      <p className="text-green-300">{`{ "access_token": "..." }`}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-800">
                      <p className="text-slate-500 mb-1">CURL:</p>
                      <p className="break-all opacity-80 select-all">
                        curl -X POST "https://graph.facebook.com/{apiVersion}/{formId || '{FORM_ID}'}/test_leads?access_token={'{TOKEN}'}"
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4 italic text-center">
                  Note: Test leads expire and are automatically deleted by Meta after a short period.
                </p>
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-100 p-6 text-center">
            <p className="text-xs text-gray-400 font-medium flex items-center justify-center gap-1">
              Developed for Meta Marketing API Integrations • <span className="text-blue-400">v2.0.0</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
