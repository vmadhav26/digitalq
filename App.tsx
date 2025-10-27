import React, { useState, useCallback, useEffect } from 'react';
import { InspectionReport, UserRole, User, ParameterStatus, InspectionStatus, InspectionParameter, ProductDetails, Evidence } from './types';
import { authenticateUser, getInspectionById } from './data/db';
import LoginScreen from './components/LoginScreen';
import InspectionRoom from './components/InspectionRoom';
import AdminPanel from './components/AdminPanel';
import InspectorDashboard from './components/InspectorDashboard';
import JoinScreen from './components/JoinScreen';
import { generateGdtImage } from './services/geminiService';
import { GDT_SYMBOLS } from './constants';

export type Theme = 'light' | 'dark' | 'ambient';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'login' | 'join' | 'admin' | 'inspector_dashboard' | 'inspection_room'>('login');
  const [inspectionReport, setInspectionReport] = useState<InspectionReport | null>(null);
  const [joiningRole, setJoiningRole] = useState<UserRole | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');

  const loadInspectionAndCheckForDraft = useCallback((inspectionId: string) => {
    const inspection = getInspectionById(inspectionId);
    if (inspection) {
      const draftJSON = localStorage.getItem(`inspection_draft_${inspection.id}`);
      if (draftJSON) {
        if (window.confirm("A saved draft for this inspection was found. Do you want to load it? Discarding will use the original report data.")) {
          try {
            const draft = JSON.parse(draftJSON);
            setInspectionReport(draft);
          } catch (e) {
            console.error("Failed to parse draft from local storage", e);
            alert("The saved draft is corrupted and could not be loaded. Starting with the original report.");
            setInspectionReport(inspection); // Fallback to original
          }
        } else {
          setInspectionReport(inspection);
        }
      } else {
        setInspectionReport(inspection);
      }
      return true;
    }
    return false;
  }, []);

  // Handle routing based on URL hash on initial load
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/inspection/')) {
        const inspectionId = hash.substring('#/inspection/'.length);
        const success = loadInspectionAndCheckForDraft(inspectionId);
        if (success) {
          setView('join');
        } else {
          alert('Inspection not found.');
          window.location.hash = '';
          setView('login');
        }
      }
    };
    handleHashChange(); // Check on initial load
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [loadInspectionAndCheckForDraft]);

  const handleLogin = (username: string, password: string): boolean => {
    const user = authenticateUser(username, password);
    if (user) {
      setCurrentUser(user);
      if (user.role === UserRole.ADMIN) {
        setView('admin');
      } else if (user.role === UserRole.INSPECTOR) {
        setView('inspector_dashboard');
      } else {
        alert('This login is for Admins and Inspectors only. Please use an inspection link to join as another role.');
        return false;
      }
      return true;
    }
    return false;
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setInspectionReport(null);
    setJoiningRole(null);
    if(window.location.hash) {
      window.location.href = window.location.href.split('#')[0];
    }
    setView('login');
  };

  const handleJoin = (role: UserRole) => {
    setJoiningRole(role);
    setView('inspection_room');
  };

  const handleStartInspection = (inspection: InspectionReport) => {
    loadInspectionAndCheckForDraft(inspection.id);
    window.location.hash = `#/inspection/${inspection.id}`;
    setView('inspection_room');
  };

  const handleLeaveRoom = () => {
    if (currentUser?.role === UserRole.INSPECTOR) {
      setView('inspector_dashboard');
    } else {
      handleLogout();
      return; // handleLogout will redirect
    }
    setInspectionReport(null);
    window.location.hash = '';
  };

  const handleUpdateProductDetails = useCallback((updatedValues: Partial<ProductDetails>) => {
    setInspectionReport(prev => {
        if (!prev) return null;
        return {
            ...prev,
            productDetails: { ...prev.productDetails, ...updatedValues }
        };
    });
  }, []);

  const handleUpdateParameter = useCallback((id: number, updatedValues: Partial<InspectionParameter>) => {
    setInspectionReport(prevReport => {
        if (!prevReport) return null;
        const newParameters = prevReport.parameters.map(p => {
            if (p.id === id) {
                const newParam = { ...p, ...updatedValues };

                // Recalculate UTL/LTL if nominal or tolerance changes
                if ('nominal' in updatedValues || 'toleranceType' in updatedValues || 'toleranceValue' in updatedValues) {
                    const nominal = newParam.nominal;
                    const tolValue = newParam.toleranceValue ?? 0;
                    switch (newParam.toleranceType) {
                        case '+/-':
                            newParam.utl = nominal + tolValue;
                            newParam.ltl = nominal - tolValue;
                            break;
                        case '+':
                            newParam.utl = nominal + tolValue;
                            newParam.ltl = nominal;
                            break;
                        case '-':
                            newParam.utl = nominal;
                            newParam.ltl = nominal - tolValue;
                            break;
                    }
                }

                // If 'actual' value is cleared from the input
                if ('actual' in updatedValues && updatedValues.actual === undefined) {
                    newParam.deviation = undefined;
                    newParam.status = ParameterStatus.PENDING;
                } 
                // If 'actual' has a value, always recalculate deviation and status.
                else if (newParam.actual !== undefined) {
                    newParam.deviation = newParam.actual - newParam.nominal;
                    newParam.status = newParam.actual >= newParam.ltl && newParam.actual <= newParam.utl ? ParameterStatus.PASS : ParameterStatus.FAIL;
                }
                return newParam;
            }
            return p;
        });
        return { ...prevReport, parameters: newParameters };
    });
  }, []);

  const handleAddParameter = useCallback(() => {
    setInspectionReport(prevReport => {
      if (!prevReport) return null;
      
      const newId = prevReport.parameters.length > 0 
        ? Math.max(...prevReport.parameters.map(p => p.id)) + 1 
        : 1;

      const newParameter: InspectionParameter = {
        id: newId,
        description: 'New Parameter',
        nominal: 0,
        utl: 0,
        ltl: 0,
        toleranceType: '+/-',
        toleranceValue: 0,
        status: ParameterStatus.PENDING,
      };

      return {
        ...prevReport,
        parameters: [...prevReport.parameters, newParameter]
      };
    });
  }, []);

  const handleRemoveParameter = useCallback((id: number) => {
    setInspectionReport(prevReport => {
      if (!prevReport) return null;
      
      const newParameters = prevReport.parameters.filter(p => p.id !== id);

      return {
        ...prevReport,
        parameters: newParameters
      };
    });
  }, []);

  const handleGenerateGdtImage = useCallback(async (parameterId: number) => {
    const param = inspectionReport?.parameters.find(p => p.id === parameterId);
    if (!param || !param.gdtSymbol) {
      console.error("Parameter or GDT symbol not found.");
      return;
    }

    const gdtInfo = GDT_SYMBOLS.find(s => s.symbol === param.gdtSymbol);
    if (!gdtInfo) {
      console.error("GDT symbol details not found in constants.");
      return;
    }

    handleUpdateParameter(parameterId, { gdtImage: 'loading' });

    try {
      const imageDataUrl = await generateGdtImage(gdtInfo.name, gdtInfo.symbol);
      handleUpdateParameter(parameterId, { gdtImage: imageDataUrl });
    } catch (error) {
      console.error("Failed to generate GDT image.", error);
      handleUpdateParameter(parameterId, { gdtImage: undefined });
      alert("Sorry, the AI image generator failed. Please try again.");
    }
  }, [inspectionReport, handleUpdateParameter]);

  const handleSignOff = useCallback((role: UserRole, comment: string) => {
    setInspectionReport(prev => {
        if (!prev) return null;
        return {
            ...prev,
            signatures: { 
                ...prev.signatures, 
                [role]: { signed: true, comment, timestamp: new Date().toISOString() } 
            }
        };
    });
  }, []);

  const handleAddEvidence = useCallback((evidenceItem: Evidence) => {
    setInspectionReport(prev => {
        if (!prev) return null;
        return {
            ...prev,
            evidence: [...prev.evidence, evidenceItem]
        };
    });
  }, []);

  const handleAddEvidenceToParameter = useCallback((parameterId: number, evidenceItem: Evidence) => {
    setInspectionReport(prev => {
        if (!prev) return null;
        const newParameters = prev.parameters.map(p => {
            if (p.id === parameterId) {
                const updatedEvidence = [...(p.evidence || []), evidenceItem];
                return { ...p, evidence: updatedEvidence };
            }
            return p;
        });
        return { ...prev, parameters: newParameters };
    });
  }, []);

  const handleRemoveEvidenceFromParameter = useCallback((parameterId: number, evidenceIndex: number) => {
    setInspectionReport(prev => {
        if (!prev) return null;
        const newParameters = prev.parameters.map(p => {
            if (p.id === parameterId) {
                const updatedEvidence = [...(p.evidence || [])];
                updatedEvidence.splice(evidenceIndex, 1);
                return { ...p, evidence: updatedEvidence };
            }
            return p;
        });
        return { ...prev, parameters: newParameters };
    });
  }, []);

  const completeInspection = useCallback((finalStatus: InspectionStatus) => {
    setInspectionReport(prev => {
        if (!prev) return null;
        console.log(`Inspection ${prev.id} completed with status: ${finalStatus}. An email would be sent here.`);
        return {
            ...prev,
            isComplete: true,
            finalStatus
        };
    });
  }, []);

  const renderContent = () => {
    switch (view) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} theme={theme} onThemeChange={setTheme} />;
      case 'join':
        return <JoinScreen onJoin={handleJoin} inspectionTitle={inspectionReport?.title || 'Inspection'}/>;
      case 'admin':
        if (currentUser && currentUser.role === UserRole.ADMIN) {
          return <AdminPanel currentUser={currentUser} onLogout={handleLogout} />;
        }
        break;
      case 'inspector_dashboard':
        if (currentUser && currentUser.role === UserRole.INSPECTOR) {
          return <InspectorDashboard currentUser={currentUser} onStartInspection={handleStartInspection} onLogout={handleLogout} />;
        }
        break;
      case 'inspection_room':
        const currentRole = currentUser?.role || joiningRole;
        if (currentRole && inspectionReport) {
          return (
            <InspectionRoom
              userRole={currentRole}
              report={inspectionReport}
              onUpdateParameter={handleUpdateParameter}
              onUpdateProductDetails={handleUpdateProductDetails}
              onAddParameter={handleAddParameter}
              onRemoveParameter={handleRemoveParameter}
              onGenerateGdtImage={handleGenerateGdtImage}
              onAddEvidenceToParameter={handleAddEvidenceToParameter}
              onRemoveEvidenceFromParameter={handleRemoveEvidenceFromParameter}
              onSignOff={handleSignOff}
              onAddEvidence={handleAddEvidence}
              onCompleteInspection={completeInspection}
              onExit={handleLeaveRoom}
            />
          );
        }
        break;
    }
    // Fallback to login
    handleLogout();
    return <LoginScreen onLogin={handleLogin} theme={theme} onThemeChange={setTheme} />;
  }

  const themeClasses: Record<Theme, string> = {
    light: 'bg-gray-100 text-gray-800',
    dark: 'bg-gray-900 text-white',
    ambient: 'bg-gradient-to-br from-slate-900 via-indigo-900 to-gray-900 text-white'
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${themeClasses[theme]}`}>
      {renderContent()}
    </div>
  );
};

export default App;
