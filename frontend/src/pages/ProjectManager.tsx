import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';

// TypeScript interfaces
interface Participant {
  id: number;
  name: string;
  role: string;
  avatar: string;
  status: 'accepted' | 'invited' | 'completed';
}

interface Project {
  id: number;
  title: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  budget_min: number;
  budget_max: number;
  location_city: string;
  location_address: string;
  start_date: string;
  end_date: string;
  progress: number;
  participants: Participant[];
  created_at: string;
  required_skills?: string[];
}

interface NewProject {
  title: string;
  description: string;
  location_city: string;
  location_address: string;
  budget_min: string | number;
  budget_max: string | number;
  start_date: string;
  end_date: string;
  required_skills: string[];
}

interface User {
  id: number;
  name: string;
  type: 'client' | 'provider' | 'admin';
}

interface Provider {
  id: number;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  verified: boolean;
  corvus: boolean;
}

const ProjectManagementSystem: React.FC = () => {
  const [currentView, setCurrentView] = useState<'my-projects' | 'create-project' | 'workspace' | 'invite-provider' | 'project-settings'>('my-projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [user] = useState<User>({ id: 1, name: 'Kovács Péter', type: 'client' });

  // Mock API hívások
  const mockProjects: Project[] = [
    {
      id: 1,
      title: 'Konyha Felújítás',
      description: 'Teljes konyha átépítése modern berendezésekkel',
      status: 'active',
      budget_min: 500000,
      budget_max: 800000,
      location_city: 'Budapest',
      location_address: 'V. kerület, Váci utca 12.',
      start_date: '2024-03-15',
      end_date: '2024-04-30',
      progress: 65,
      participants: [
        { id: 2, name: 'Nagy István', role: 'Kőműves', avatar: 'NI', status: 'accepted' },
        { id: 3, name: 'Szabó János', role: 'Villanyszerelő', avatar: 'SJ', status: 'accepted' },
        { id: 4, name: 'Tóth Mária', role: 'Burkoló', avatar: 'TM', status: 'invited' }
      ],
      created_at: '2024-03-10'
    },
    {
      id: 2,
      title: 'Weboldal Fejlesztés',
      description: 'Új céges weboldal készítése React technológiával',
      status: 'planning',
      budget_min: 300000,
      budget_max: 500000,
      location_city: 'Budapest',
      location_address: 'XIII. kerület, Váci út 45.',
      start_date: '2024-04-01',
      end_date: '2024-05-15',
      progress: 15,
      participants: [
        { id: 5, name: 'Kiss Anna', role: 'Frontend Developer', avatar: 'KA', status: 'accepted' },
        { id: 6, name: 'Molnár Péter', role: 'UX Designer', avatar: 'MP', status: 'invited' }
      ],
      created_at: '2024-03-20'
    },
    {
      id: 3,
      title: 'Kert Tájépítés',
      description: 'Családi ház kertjének komplett újratervezése',
      status: 'completed',
      budget_min: 400000,
      budget_max: 600000,
      location_city: 'Debrecen',
      location_address: 'Nagyerdei körút 98.',
      start_date: '2024-02-01',
      end_date: '2024-03-01',
      progress: 100,
      participants: [
        { id: 7, name: 'Varga László', role: 'Kertész', avatar: 'VL', status: 'completed' }
      ],
      created_at: '2024-01-25'
    }
  ];

  useEffect(() => {
    // Mock API hívás
    setTimeout(() => {
      setProjects(mockProjects);
    }, 500);
  }, []);

  const [newProject, setNewProject] = useState<NewProject>({
    title: '',
    description: '',
    location_city: '',
    location_address: '',
    budget_min: '',
    budget_max: '',
    start_date: '',
    end_date: '',
    required_skills: []
  });

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const cities: string[] = ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs', 'Győr', 'Nyíregyháza', 'Kecskemét'];
  const skillCategories: string[] = [
    'Építés és Felújítás', 'Kert és Külső Területek', 'Takarítás és Háztartás',
    'IT és Technológia', 'Üzleti Szolgáltatások', 'Oktatás és Képzés'
  ];

  const getStatusColor = (status: Project['status']): string => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Project['status']): string => {
    switch (status) {
      case 'planning': return 'Tervezés';
      case 'active': return 'Aktív';
      case 'completed': return 'Befejezett';
      case 'cancelled': return 'Megszakított';
      default: return 'Ismeretlen';
    }
  };

  const formatBudget = (min: number, max: number): string => {
    return `${min?.toLocaleString()} - ${max?.toLocaleString()} Ft`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('hu-HU');
  };

  const createProject = async (): Promise<void> => {
    if (!newProject.title || !newProject.description) {
      alert('Kérjük töltse ki a kötelező mezőket!');
      return;
    }

    setLoading(true);
    
    // Mock API hívás
    setTimeout(() => {
      const projectToAdd: Project = {
        ...newProject,
        id: projects.length + 1,
        status: 'planning',
        progress: 0,
        participants: [],
        created_at: new Date().toISOString(),
        budget_min: parseInt(newProject.budget_min.toString()) || 0,
        budget_max: parseInt(newProject.budget_max.toString()) || 0,
      };

      setProjects([projectToAdd, ...projects]);
      setNewProject({
        title: '',
        description: '',
        location_city: '',
        location_address: '',
        budget_min: '',
        budget_max: '',
        start_date: '',
        end_date: '',
        required_skills: []
      });
      setShowCreateModal(false);
      setLoading(false);
      setCurrentView('my-projects');
    }, 1000);
  };

  const openProjectWorkspace = (project: Project): void => {
    setSelectedProject(project);
    setCurrentView('workspace');
  };

  const inviteProvider = (projectId: number, providerId: number): void => {
    // Mock API hívás szolgáltató meghívásához
    console.log(`Inviting provider ${providerId} to project ${projectId}`);
  };

  // Projekt Workspace komponens (egyszerűsített verzió)
  const ProjectWorkspace: React.FC<{ project: Project }> = ({ project }) => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <p className="opacity-90">Projekt ID: #{project.id}</p>
          </div>
          <button 
            onClick={() => setCurrentView('my-projects')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all"
          >
            ← Vissza a projektekhez
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">📋 Projekt Információk</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Státusz</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {getStatusText(project.status)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Költségvetés</span>
                <span className="font-semibold">{formatBudget(project.budget_min, project.budget_max)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Helyszín</span>
                <span className="font-semibold">{project.location_city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Haladás</span>
                <span className="font-semibold">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">👥 Csapat Tagok</h3>
            <div className="space-y-3">
              {project.participants.map((participant: Participant) => (
                <div key={participant.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {participant.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{participant.name}</div>
                    <div className="text-sm text-gray-500">{participant.role}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    participant.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {participant.status === 'accepted' ? 'Elfogadva' : 'Meghívva'}
                  </span>
                </div>
              ))}
              <button 
                onClick={() => setCurrentView('invite-provider')}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-center text-gray-500 hover:border-gray-400 transition-colors"
              >
                + Új tag meghívása
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">⚡ Gyors Műveletek</h3>
            <div className="space-y-3">
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
                💬 Üzenet küldése
              </button>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                📅 Meeting tervezése
              </button>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                📁 Fájl feltöltése
              </button>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                💰 Kifizetés kezdeményezése
              </button>
              <button 
                onClick={() => {
                  setSelectedProject(project);
                  setCurrentView('project-settings');
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                ⚙️ Projekt beállítások
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (currentView === 'workspace' && selectedProject) {
    return <ProjectWorkspace project={selectedProject} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 navbar-padding">
      {/* Navigation - Az új Navbar komponenst használjuk */}
      <Navbar />
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">📁 Projekt Menedzsment</h1>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentView('my-projects')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'my-projects'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Projektjeim
              </button>
              <button
                onClick={() => setCurrentView('create-project')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'create-project'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                + Új Projekt
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Projektjeim nézet */}
        {currentView === 'my-projects' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Projektjeim</h2>
                <p className="text-gray-600">Összes projekt: {projects.length}</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                + Új Projekt Létrehozása
              </button>
            </div>

            {/* Projektek statisztikái */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-xl">📋</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {projects.filter(p => p.status === 'planning').length}
                    </div>
                    <div className="text-sm text-gray-600">Tervezés alatt</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-xl">🚀</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {projects.filter(p => p.status === 'active').length}
                    </div>
                    <div className="text-sm text-gray-600">Aktív</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 text-xl">✅</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {projects.filter(p => p.status === 'completed').length}
                    </div>
                    <div className="text-sm text-gray-600">Befejezett</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 text-xl">💰</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {projects.reduce((sum, p) => sum + (p.budget_max || 0), 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Összes költségvetés (Ft)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Projektek listája */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project: Project) => (
                <div key={project.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {project.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {getStatusText(project.status)}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">📍 Helyszín</span>
                        <span className="font-medium">{project.location_city}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">💰 Költségvetés</span>
                        <span className="font-medium">{formatBudget(project.budget_min, project.budget_max)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">📅 Határidő</span>
                        <span className="font-medium">{formatDate(project.end_date)}</span>
                      </div>
                      {project.status !== 'planning' && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">📈 Haladás</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                      )}
                    </div>

                    {project.status !== 'planning' && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm text-gray-500">Csapat:</span>
                      <div className="flex -space-x-2">
                        {project.participants.slice(0, 3).map((participant: Participant) => (
                          <div 
                            key={participant.id}
                            className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                            title={participant.name}
                          >
                            {participant.avatar}
                          </div>
                        ))}
                        {project.participants.length > 3 && (
                          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white">
                            +{project.participants.length - 3}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openProjectWorkspace(project)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Munkaterület
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedProject(project);
                          setCurrentView('project-settings');
                        }}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        ⚙️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {projects.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Még nincsenek projektjei</h3>
                <p className="text-gray-600 mb-6">Kezdje el első projektjének létrehozását!</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  + Első Projekt Létrehozása
                </button>
              </div>
            )}
          </div>
        )}

        {/* Projekt létrehozás nézet */}
        {currentView === 'create-project' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">🚀 Új Projekt Létrehozása</h2>
                <p className="text-gray-600 mt-1">Töltse ki a projekt alapadatait és hívjon meg szakembereket</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Alapadatok */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">📋 Alapadatok</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Projekt címe *
                    </label>
                    <input
                      type="text"
                      value={newProject.title}
                      onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="pl. Konyha felújítás, Weboldal készítés..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Részletes leírás *
                    </label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Írja le részletesen, hogy pontosan mire van szüksége..."
                    />
                  </div>
                </div>

                {/* Helyszín */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">📍 Helyszín</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Város
                      </label>
                      <select
                        value={newProject.location_city}
                        onChange={(e) => setNewProject({...newProject, location_city: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Válasszon várost</option>
                        {cities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pontos cím (opcionális)
                      </label>
                      <input
                        type="text"
                        value={newProject.location_address}
                        onChange={(e) => setNewProject({...newProject, location_address: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="pl. V. kerület, Váci utca 12."
                      />
                    </div>
                  </div>
                </div>

                {/* Költségvetés */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">💰 Költségvetés</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum (Ft)
                      </label>
                      <input
                        type="number"
                        value={newProject.budget_min}
                        onChange={(e) => setNewProject({...newProject, budget_min: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum (Ft)
                      </label>
                      <input
                        type="number"
                        value={newProject.budget_max}
                        onChange={(e) => setNewProject({...newProject, budget_max: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Ütemezés */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">📅 Ütemezés</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tervezett kezdés
                      </label>
                      <input
                        type="date"
                        value={newProject.start_date}
                        onChange={(e) => setNewProject({...newProject, start_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Befejezési határidő
                      </label>
                      <input
                        type="date"
                        value={newProject.end_date}
                        onChange={(e) => setNewProject({...newProject, end_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Szükséges szakértelem */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">🔧 Szükséges szakértelem</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {skillCategories.map(skill => (
                      <label key={skill} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newProject.required_skills.includes(skill)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewProject({
                                ...newProject,
                                required_skills: [...newProject.required_skills, skill]
                              });
                            } else {
                              setNewProject({
                                ...newProject,
                                required_skills: newProject.required_skills.filter(s => s !== skill)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Műveletek */}
                <div className="flex gap-4 pt-6">
                  <button
                    onClick={createProject}
                    disabled={loading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Létrehozás...
                      </>
                    ) : (
                      '🚀 Projekt Létrehozása'
                    )}
                  </button>
                  <button
                    onClick={() => setCurrentView('my-projects')}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Mégse
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">🚀 Gyors Projekt Létrehozás</h3>
              <p className="text-gray-600 text-sm mt-1">Kezdje el új projektjét néhány alapadattal</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projekt címe *
                </label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="pl. Konyha felújítás"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rövid leírás *
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Mi a projekt célja?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Város
                </label>
                <select
                  value={newProject.location_city}
                  onChange={(e) => setNewProject({...newProject, location_city: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Válasszon várost</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    createProject();
                    setShowCreateModal(false);
                  }}
                  disabled={!newProject.title || !newProject.description}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Létrehozás
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewProject({
                      title: '',
                      description: '',
                      location_city: '',
                      location_address: '',
                      budget_min: '',
                      budget_max: '',
                      start_date: '',
                      end_date: '',
                      required_skills: []
                    });
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Mégse
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCurrentView('create-project');
                  }}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  🔧 Részletes projekt létrehozás
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provider Search & Invite Modal */}
      {currentView === 'invite-provider' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">🔍 Szolgáltató Keresése és Meghívása</h3>
              <p className="text-gray-600 text-sm mt-1">Találjon szakembereket a projektjéhez</p>
            </div>
            
            <div className="p-6">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Keresés név, szakma vagy helyszín szerint..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    Keresés
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="mb-6 flex flex-wrap gap-3">
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option>Minden kategória</option>
                  <option>Építés és Felújítás</option>
                  <option>IT és Technológia</option>
                  <option>Kert és Külső</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option>Minden város</option>
                  <option>Budapest</option>
                  <option>Debrecen</option>
                  <option>Szeged</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option>Minden értékelés</option>
                  <option>4.5+ csillag</option>
                  <option>4.0+ csillag</option>
                </select>
              </div>

              {/* Provider Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {([
                  { id: 1, name: 'Szabó János', role: 'Villanyszerelő', rating: 4.8, reviews: 127, verified: true, corvus: false },
                  { id: 2, name: 'Nagy István', role: 'Kőműves', rating: 4.9, reviews: 89, verified: true, corvus: true },
                  { id: 3, name: 'Tóth Mária', role: 'Burkoló', rating: 4.7, reviews: 56, verified: false, corvus: false },
                  { id: 4, name: 'Kiss Anna', role: 'Frontend Developer', rating: 4.6, reviews: 34, verified: true, corvus: true }
                ] as Provider[]).map(provider => (
                  <div key={provider.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {provider.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{provider.name}</h4>
                          {provider.verified && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">✓ Verified</span>
                          )}
                          {provider.corvus && (
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">👑 Corvus</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">{provider.role}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            {[1,2,3,4,5].map(star => (
                              <span key={star} className={`text-sm ${star <= Math.floor(provider.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">{provider.rating} ({provider.reviews} értékelés)</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => inviteProvider(selectedProject?.id || 0, provider.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          Meghívás
                        </button>
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                          Profil
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setCurrentView('workspace')}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Bezárás
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Settings Modal */}
      {currentView === 'project-settings' && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">⚙️ Projekt Beállítások</h3>
              <p className="text-gray-600 text-sm mt-1">{selectedProject.title}</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Project Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projekt státusz
                </label>
                <select 
                  value={selectedProject.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="planning">Tervezés</option>
                  <option value="active">Aktív</option>
                  <option value="completed">Befejezett</option>
                  <option value="cancelled">Megszakított</option>
                </select>
              </div>

              {/* Budget Update */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Költségvetés frissítése
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Min (Ft)"
                    defaultValue={selectedProject.budget_min}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="Max (Ft)"
                    defaultValue={selectedProject.budget_max}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Deadline Update */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Határidő módosítása
                </label>
                <input
                  type="date"
                  defaultValue={selectedProject.end_date}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Project Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projekt láthatósága
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="visibility" value="private" defaultChecked className="text-indigo-600" />
                    <span className="text-sm">Privát - csak meghívott tagok látják</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="visibility" value="public" className="text-indigo-600" />
                    <span className="text-sm">Nyilvános - szolgáltatók jelentkezhetnek</span>
                  </label>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-red-600 font-medium mb-3">⚠️ Veszélyes műveletek</h4>
                <div className="space-y-3">
                  <button className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg font-medium transition-colors">
                    📋 Projekt archiválása
                  </button>
                  <button className="w-full bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg font-medium transition-colors">
                    🗑️ Projekt törlése
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setCurrentView('my-projects')}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Mégse
              </button>
              <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                Változások mentése
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Toast */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {/* Example notification */}
        <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 opacity-0 transition-opacity">
          <span className="text-xl">✅</span>
          <span className="font-medium">Projekt sikeresen létrehozva!</span>
          <button className="ml-2 text-white hover:text-gray-200">✕</button>
        </div>
      </div>
    </div>
    {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">🚀 Corvus Platform</div>
              <p className="text-gray-400">
                Találd meg a tökéletes szakembert minden igényedre.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/services" className="hover:text-white transition-colors">Szolgáltatók böngészése</a></li>
                <li><a href="/register" className="hover:text-white transition-colors">Regisztráció</a></li>
                <li><a href="/education" className="hover:text-white transition-colors">Corvus Tanulás</a></li>
                <li><a href="/projects" className="hover:text-white transition-colors">Projektek</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Támogatás</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/help" className="hover:text-white transition-colors">Súgó központ</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Kapcsolat</a></li>
                <li><a href="/faq" className="hover:text-white transition-colors">GYIK</a></li>
                <li><a href="/guidelines" className="hover:text-white transition-colors">Irányelvek</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Kapcsolat</h4>
              <div className="space-y-2 text-gray-400">
                <p>📧 info@corvus-platform.hu</p>
                <p>📞 +36 1 234 5678</p>
                <p>📍 Budapest, Magyarország</p>
              </div>
            </div>
          </div>
          
          <hr className="border-gray-700 my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2025 Corvus Platform Kft. Minden jog fenntartva.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Adatvédelem</a>
              <a href="/terms" className="text-gray-400 hover:text-white transition-colors">ÁSZF</a>
              <a href="/cookies" className="text-gray-400 hover:text-white transition-colors">Sütik</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
    
  );
};

// Database Integration Helper Functions
const ProjectAPI = {
  // Projektek lekérése
  async getProjects(userId: number): Promise<Project[]> {
    try {
      const response = await fetch(`/api/projects?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  },

  // Új projekt létrehozása
  async createProject(projectData: Partial<Project>): Promise<Project> {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(projectData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Projekt frissítése
  async updateProject(projectId: number, updates: Partial<Project>): Promise<Project> {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updates)
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  // Szolgáltató meghívása projekthez
  async inviteProvider(projectId: number, providerId: number, role: string): Promise<any> {
    try {
      const response = await fetch('/api/project-participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          project_id: projectId,
          provider_id: providerId,
          role: role,
          status: 'invited'
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Error inviting provider:', error);
      throw error;
    }
  }
};

export default ProjectManagementSystem;