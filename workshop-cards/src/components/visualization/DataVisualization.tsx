'use client';

import { useState, useEffect } from 'react';
import { BarChart3, PieChart, Download, Filter, Search, Users, MessageSquare, TrendingUp } from 'lucide-react';
import { dataService, ParticipantResponse, WorkshopSession } from '@/services/dataService';

interface DataVisualizationProps {
  sessionId?: string;
}

interface AnalyticsData {
  totalResponses: number;
  uniqueParticipants: number;
  averageConfidence: number;
  responsesByElement: { [elementType: string]: number };
  commonWords: { word: string; count: number }[];
  responseTimeline: { date: string; count: number }[];
}

export function DataVisualization({ sessionId }: DataVisualizationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<WorkshopSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>(sessionId || '');
  const [responses, setResponses] = useState<ParticipantResponse[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      loadSessionData();
    }
  }, [selectedSession]);

  const loadSessions = () => {
    const allSessions = dataService.getAllSessions();
    setSessions(allSessions);
    
    if (!selectedSession && allSessions.length > 0) {
      setSelectedSession(allSessions[0].id);
    }
  };

  const loadSessionData = () => {
    const sessionResponses = dataService.getResponsesBySession(selectedSession);
    setResponses(sessionResponses);
    
    // Calculate analytics
    const analytics = calculateAnalytics(sessionResponses);
    setAnalytics(analytics);
  };

  const calculateAnalytics = (responses: ParticipantResponse[]): AnalyticsData => {
    const uniqueParticipants = new Set(responses.map(r => r.participantId)).size;
    
    const responsesByElement: { [key: string]: number } = {};
    let totalConfidence = 0;
    let confidenceCount = 0;
    const allWords: string[] = [];
    
    responses.forEach(response => {
      response.elementResponses.forEach(elementResponse => {
        const type = elementResponse.elementType;
        responsesByElement[type] = (responsesByElement[type] || 0) + 1;
        
        if (elementResponse.confidence) {
          totalConfidence += elementResponse.confidence;
          confidenceCount++;
        }
        
        // Extract words for word cloud
        if (elementResponse.scannedValue) {
          const words = elementResponse.scannedValue
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3);
          allWords.push(...words);
        }
      });
    });

    // Count word frequency
    const wordCounts: { [word: string]: number } = {};
    allWords.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    const commonWords = Object.entries(wordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    // Create timeline (simplified)
    const responseTimeline = responses
      .reduce((acc, response) => {
        const date = response.processedAt.toDateString();
        const existing = acc.find(item => item.date === date);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ date, count: 1 });
        }
        return acc;
      }, [] as { date: string; count: number }[])
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      totalResponses: responses.length,
      uniqueParticipants,
      averageConfidence: confidenceCount > 0 ? totalConfidence / confidenceCount : 0,
      responsesByElement,
      commonWords,
      responseTimeline
    };
  };

  const filteredResponses = responses.filter(response => {
    const matchesSearch = searchTerm === '' || 
      response.participantId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.elementResponses.some(er => 
        er.scannedValue?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesFilter = filterType === 'all' || 
      response.elementResponses.some(er => er.elementType === filterType);
    
    return matchesSearch && matchesFilter;
  });

  const exportData = () => {
    const exportData = {
      session: sessions.find(s => s.id === selectedSession),
      analytics,
      responses: filteredResponses
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workshop-data-${selectedSession}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = ['Participant ID', 'Session ID', 'Card ID', 'Element Type', 'Scanned Value', 'Confidence', 'Processed At'];
    const rows = filteredResponses.flatMap(response =>
      response.elementResponses.map(elementResponse => [
        response.participantId,
        response.sessionId,
        response.cardId,
        elementResponse.elementType,
        elementResponse.scannedValue || '',
        elementResponse.confidence || '',
        response.processedAt.toISOString()
      ])
    );
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workshop-responses-${selectedSession}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <BarChart3 className="w-4 h-4" />
        <span>View Results</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Workshop Data & Analytics</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {/* Session Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Select Workshop Session</label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select a session...</option>
                  {sessions.map(session => (
                    <option key={session.id} value={session.id}>
                      {session.name} ({new Date(session.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              {analytics && (
                <>
                  {/* Analytics Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Total Responses</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900 mt-1">{analytics.totalResponses}</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Participants</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900 mt-1">{analytics.uniqueParticipants}</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Avg Confidence</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-900 mt-1">
                        {Math.round(analytics.averageConfidence * 100)}%
                      </p>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-center space-x-2">
                        <PieChart className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">Element Types</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-900 mt-1">
                        {Object.keys(analytics.responsesByElement).length}
                      </p>
                    </div>
                  </div>

                  {/* Response Distribution */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white border rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4">Responses by Element Type</h3>
                      <div className="space-y-2">
                        {Object.entries(analytics.responsesByElement).map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{type.replace('_', ' ')}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${(count / analytics.totalResponses) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4">Common Words</h3>
                      <div className="flex flex-wrap gap-2">
                        {analytics.commonWords.map(({ word, count }) => (
                          <span 
                            key={word}
                            className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                            style={{ fontSize: `${Math.min(16, 10 + count)}px` }}
                          >
                            {word} ({count})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Filters and Search */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search responses..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="all">All Elements</option>
                      {Object.keys(analytics.responsesByElement).map(type => (
                        <option key={type} value={type}>{type.replace('_', ' ')}</option>
                      ))}
                    </select>

                    <div className="flex space-x-2">
                      <button
                        onClick={exportCSV}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>CSV</span>
                      </button>
                      <button
                        onClick={exportData}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>JSON</span>
                      </button>
                    </div>
                  </div>

                  {/* Response List */}
                  <div className="bg-white border rounded-lg">
                    <div className="p-4 border-b">
                      <h3 className="text-lg font-semibold">
                        Individual Responses ({filteredResponses.length})
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {filteredResponses.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          No responses found matching your criteria.
                        </div>
                      ) : (
                        <div className="divide-y">
                          {filteredResponses.map(response => (
                            <div key={response.id} className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {response.participantId}
                                  </span>
                                  <span className="text-sm text-gray-500 ml-2">
                                    {response.processedAt.toLocaleString()}
                                  </span>
                                </div>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {response.cardId}
                                </span>
                              </div>
                              <div className="space-y-1">
                                {response.elementResponses.map((elementResponse, index) => (
                                  <div key={index} className="text-sm">
                                    <span className="font-medium text-gray-700">
                                      {elementResponse.elementType.replace('_', ' ')}:
                                    </span>
                                    <span className="ml-2 text-gray-600">
                                      "{elementResponse.scannedValue}"
                                    </span>
                                    {elementResponse.confidence && (
                                      <span className="ml-2 text-xs text-green-600">
                                        ({Math.round(elementResponse.confidence * 100)}% confidence)
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {!selectedSession && (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Session Selected</h3>
                  <p className="text-gray-600">
                    Select a workshop session to view analytics and participant responses.
                  </p>
                </div>
              )}

              {selectedSession && !analytics && (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
                  <p className="text-gray-600">
                    No participant responses found for this session. 
                    Scan some cards to see data here!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}