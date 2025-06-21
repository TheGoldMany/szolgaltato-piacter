import React, { useState, useCallback, useEffect, useRef } from 'react';
import Layout from '../layout/Layout';
import Container from '../layout/Container';
import Card from '../common/Card';
import { useAuth } from '../../context/AuthContext'; // ← Ez hiányzott!
import Navbar from '../layout/Navbar';
import { profileService } from '../../services/profileService';

// Types
interface GridPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ModuleData {
  id: string;
  type: ModuleType;
  position: GridPosition;
  content: any;
  isVisible: boolean;
  sortOrder: number;
}

type ModuleType = 
  | 'hero'
  | 'text' 
  | 'image'
  | 'gallery'
  | 'video'
  | 'contact'
  | 'price_list'
  | 'testimonial'
  | 'stats'
  | 'social';

interface ModuleTemplate {
  type: ModuleType;
  name: string;
  icon: string;
  defaultSize: { width: number; height: number };
  category: string;
  description: string;
  maxInstances?: number;
}

// Module Templates
const MODULE_TEMPLATES: ModuleTemplate[] = [
  {
    type: 'hero',
    name: 'Hero Banner',
    icon: '🎯',
    defaultSize: { width: 4, height: 2 },
    category: 'Bemutatkozás',
    description: 'Főcím és profilkép',
    maxInstances: 1
  },
  {
    type: 'text',
    name: 'Szövegblokk',
    icon: '📝',
    defaultSize: { width: 2, height: 2 },
    category: 'Bemutatkozás',
    description: 'Bemutatkozó szöveg'
  },
  {
    type: 'contact',
    name: 'Kapcsolat',
    icon: '📞',
    defaultSize: { width: 2, height: 2 },
    category: 'Kapcsolat',
    description: 'Elérhetőségek'
  },
  {
    type: 'price_list',
    name: 'Árlista',
    icon: '💰',
    defaultSize: { width: 2, height: 3 },
    category: 'Szolgáltatások',
    description: 'Szolgáltatások és árak'
  },
  {
    type: 'stats',
    name: 'Statisztikák',
    icon: '📊',
    defaultSize: { width: 4, height: 1 },
    category: 'Bemutatkozás',
    description: 'Számlálók és eredmények'
  },
  {
    type: 'gallery',
    name: 'Képgaléria',
    icon: '🖼️',
    defaultSize: { width: 3, height: 2 },
    category: 'Média',
    description: 'Képek megjelenítése'
  },
  {
    type: 'video',
    name: 'Videó',
    icon: '🎥',
    defaultSize: { width: 3, height: 2 },
    category: 'Média',
    description: 'Videó beágyazás'
  }
];

const GRID_CONFIG = {
  cols: 4,
  rows: 8,
  cellWidth: 200,
  cellHeight: 100,
  gap: 8
};

const ModularProfileEditor: React.FC = () => {
  const { user } = useAuth(); // ← Ez hiányzott!
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [draggedFromPalette, setDraggedFromPalette] = useState<ModuleTemplate | null>(null);
  const [draggedModule, setDraggedModule] = useState<ModuleData | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dropIndicator, setDropIndicator] = useState<GridPosition | null>(null);
  const [userProfileId, setUserProfileId] = useState<number | null>(null); // ← Új state a profile ID-hoz

  
  const gridRef = useRef<HTMLDivElement>(null);

  // Default modules
  useEffect(() => {
    if (modules.length === 0) {
      const defaultModules: ModuleData[] = [
        {
          id: 'hero-1',
          type: 'hero',
          position: { x: 0, y: 0, width: 4, height: 2 },
          content: {
            title: 'Szolgáltatóm neve',
            subtitle: 'Szakértelem rövid leírása'
          },
          isVisible: true,
          sortOrder: 1
        },
        {
          id: 'contact-1',
          type: 'contact',
          position: { x: 0, y: 2, width: 2, height: 2 },
          content: {
            phone: '+36 30 123 4567',
            email: 'info@szolgaltato.hu',
            address: 'Budapest'
          },
          isVisible: true,
          sortOrder: 2
        },
        {
          id: 'text-1',
          type: 'text',
          position: { x: 2, y: 2, width: 2, height: 2 },
          content: {
            title: 'Bemutatkozás',
            content: 'Itt írhatsz magadról...'
          },
          isVisible: true,
          sortOrder: 3
        }
      ];
      setModules(defaultModules);
    }
  }, [modules.length]);

  // Check if position is occupied
  const isPositionOccupied = useCallback((position: GridPosition, excludeId?: string) => {
    return modules.some(module => {
      if (excludeId && module.id === excludeId) return false;
      
      const moduleRight = module.position.x + module.position.width;
      const moduleBottom = module.position.y + module.position.height;
      const positionRight = position.x + position.width;
      const positionBottom = position.y + position.height;
      
      return !(
        position.x >= moduleRight ||
        positionRight <= module.position.x ||
        position.y >= moduleBottom ||
        positionBottom <= module.position.y
      );
    });
  }, [modules]);

  // Find available position
  const findAvailablePosition = useCallback((moduleTemplate: ModuleTemplate): GridPosition | null => {
    const { width, height } = moduleTemplate.defaultSize;
    
    for (let y = 0; y <= GRID_CONFIG.rows - height; y++) {
      for (let x = 0; x <= GRID_CONFIG.cols - width; x++) {
        const position = { x, y, width, height };
        if (!isPositionOccupied(position)) {
          return position;
        }
      }
    }
    return null;
  }, [isPositionOccupied]);

  // Get default content
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getDefaultContent = (type: ModuleType) => {
    switch (type) {
      case 'hero':
        return { title: 'Szolgáltató neve', subtitle: 'Szakértelem' };
      case 'text':
        return { title: 'Szövegblokk', content: 'Szöveg...' };
      case 'contact':
        return { phone: '+36 30 123 4567', email: 'info@example.hu', address: 'Budapest' };
      case 'price_list':
        return { 
          title: 'Árlista', 
          items: [
            { service: 'Alapszolgáltatás', price: '15000', unit: 'projekt' },
            { service: 'Prémium csomag', price: '25000', unit: 'projekt' }
          ] 
        };
      case 'stats':
        return { 
          items: [
            { label: 'Elégedett ügyfél', value: '100+', icon: '😊' },
            { label: 'Projekt', value: '200+', icon: '✅' },
            { label: 'Év tapasztalat', value: '5+', icon: '⭐' }
          ] 
        };
      case 'gallery':
        return { title: 'Képgaléria', images: [], layout: 'grid' };
      case 'video':
        return { title: 'Bemutatkozó videó', videoUrl: '', thumbnail: null };
      default:
        return {};
    }
  };

  // Remove module
  const removeModule = useCallback((moduleId: string) => {
    setModules(prev => prev.filter(m => m.id !== moduleId));
    if (selectedModule === moduleId) {
      setSelectedModule(null);
    }
  }, [selectedModule]);

  // Update module content
  const updateModuleContent = useCallback((moduleId: string, newContent: any) => {
    setModules(prev => prev.map(module =>
      module.id === moduleId
        ? { ...module, content: { ...module.content, ...newContent } }
        : module
    ));
  }, []);

  // Get grid position from mouse coordinates
  const getGridPositionFromMouse = useCallback((clientX: number, clientY: number) => {
    if (!gridRef.current) return null;
    
    const rect = gridRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const gridX = Math.floor(x / (GRID_CONFIG.cellWidth + GRID_CONFIG.gap));
    const gridY = Math.floor(y / (GRID_CONFIG.cellHeight + GRID_CONFIG.gap));
    
    return {
      x: Math.max(0, Math.min(gridX, GRID_CONFIG.cols - 1)),
      y: Math.max(0, Math.min(gridY, GRID_CONFIG.rows - 1))
    };
  }, []);

  // Handle drag start from palette
  const handlePaletteDragStart = useCallback((template: ModuleTemplate, e: React.DragEvent) => {
    setDraggedFromPalette(template);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', template.type);
  }, []);

  // Handle drag start from existing module
  const handleModuleDragStart = useCallback((module: ModuleData, e: React.DragEvent) => {
    setDraggedModule(module);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', module.id);
    
    // Calculate offset for smooth dragging
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, []);

  // Handle drag over grid
  const handleGridDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = draggedFromPalette ? 'copy' : 'move';
    
    const gridPos = getGridPositionFromMouse(e.clientX, e.clientY);
    if (!gridPos) return;
    
    let width, height;
    if (draggedFromPalette) {
      width = draggedFromPalette.defaultSize.width;
      height = draggedFromPalette.defaultSize.height;
    } else if (draggedModule) {
      width = draggedModule.position.width;
      height = draggedModule.position.height;
    } else {
      return;
    }
    
    // Ensure module fits in grid
    const adjustedWidth = Math.min(width, GRID_CONFIG.cols - gridPos.x);
    const adjustedHeight = Math.min(height, GRID_CONFIG.rows - gridPos.y);
    
    const position: GridPosition = {
      x: gridPos.x,
      y: gridPos.y,
      width: adjustedWidth,
      height: adjustedHeight
    };
    
    // Check if position is valid
    const excludeId = draggedModule?.id;
    if (!isPositionOccupied(position, excludeId)) {
      setDropIndicator(position);
    } else {
      setDropIndicator(null);
    }
  }, [draggedFromPalette, draggedModule, getGridPositionFromMouse, isPositionOccupied]);

  // Handle drop on grid
  const handleGridDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (!dropIndicator) return;
    
    if (draggedFromPalette) {
      // Add new module from palette
      if (draggedFromPalette.maxInstances) {
        const existingCount = modules.filter(m => m.type === draggedFromPalette.type).length;
        if (existingCount >= draggedFromPalette.maxInstances) {
          alert(`Csak ${draggedFromPalette.maxInstances} darab ${draggedFromPalette.name} modul adható hozzá.`);
          setDraggedFromPalette(null);
          setDropIndicator(null);
          return;
        }
      }
      
      const newModule: ModuleData = {
        id: `${draggedFromPalette.type}-${Date.now()}`,
        type: draggedFromPalette.type,
        position: dropIndicator,
        content: getDefaultContent(draggedFromPalette.type),
        isVisible: true,
        sortOrder: modules.length + 1
      };
      
      setModules(prev => [...prev, newModule]);
      setSelectedModule(newModule.id);
      
    } else if (draggedModule) {
      // Move existing module
      setModules(prev => prev.map(module =>
        module.id === draggedModule.id
          ? { ...module, position: dropIndicator }
          : module
      ));
    }
    
    setDraggedFromPalette(null);
    setDraggedModule(null);
    setDropIndicator(null);
  }, [dropIndicator, draggedFromPalette, draggedModule, modules, getDefaultContent]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggedFromPalette(null);
    setDraggedModule(null);
    setDropIndicator(null);
  }, []);

  // Render grid
  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < GRID_CONFIG.rows; y++) {
      for (let x = 0; x < GRID_CONFIG.cols; x++) {
        cells.push(
          <div
            key={`${x}-${y}`}
            style={{
              position: 'absolute',
              left: x * (GRID_CONFIG.cellWidth + GRID_CONFIG.gap),
              top: y * (GRID_CONFIG.cellHeight + GRID_CONFIG.gap),
              width: GRID_CONFIG.cellWidth,
              height: GRID_CONFIG.cellHeight,
              border: '1px dashed #e0e0e0',
              backgroundColor: '#fafafa'
            }}
          />
        );
      }
    }
    return cells;
  };

  // Render drop indicator
  const renderDropIndicator = () => {
    if (!dropIndicator) return null;
    
    return (
      <div
        style={{
          position: 'absolute',
          left: dropIndicator.x * (GRID_CONFIG.cellWidth + GRID_CONFIG.gap),
          top: dropIndicator.y * (GRID_CONFIG.cellHeight + GRID_CONFIG.gap),
          width: dropIndicator.width * GRID_CONFIG.cellWidth + (dropIndicator.width - 1) * GRID_CONFIG.gap,
          height: dropIndicator.height * GRID_CONFIG.cellHeight + (dropIndicator.height - 1) * GRID_CONFIG.gap,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          border: '2px dashed #3b82f6',
          borderRadius: '8px',
          pointerEvents: 'none',
          zIndex: 1000
        }}
      />
    );
  };

  // Render module
  const renderModule = (module: ModuleData) => {
    const { position } = module;
    const isSelected = selectedModule === module.id;
    const isDragging = draggedModule?.id === module.id;

    const style = {
      position: 'absolute' as const,
      left: position.x * (GRID_CONFIG.cellWidth + GRID_CONFIG.gap),
      top: position.y * (GRID_CONFIG.cellHeight + GRID_CONFIG.gap),
      width: position.width * GRID_CONFIG.cellWidth + (position.width - 1) * GRID_CONFIG.gap,
      height: position.height * GRID_CONFIG.cellHeight + (position.height - 1) * GRID_CONFIG.gap,
      backgroundColor: 'white',
      border: isSelected ? '2px solid #3b82f6' : '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '12px',
      cursor: 'move',
      boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
      opacity: isDragging ? 0.5 : 1,
      zIndex: isSelected ? 10 : 1
    };

    return (
      <div
        key={module.id}
        style={style}
        draggable
        onDragStart={(e) => handleModuleDragStart(module, e)}
        onDragEnd={handleDragEnd}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedModule(module.id);
        }}
      >
        {isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeModule(module.id);
            }}
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '24px',
              height: '24px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              fontSize: '12px',
              cursor: 'pointer',
              zIndex: 11
            }}
          >
            ×
          </button>
        )}
        
        <ModuleRenderer module={module} />
      </div>
    );
  };

  // Save profile
  const saveProfile = async () => {
    setIsLoading(true);
    try {
      console.log('Saving modules:', modules);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Profil sikeresen mentve!');
    } catch (error) {
      alert('Hiba történt a mentés során!');
    } finally {
      setIsLoading(false);
    }
  };

// TELJES saveModules javítás:
const loadExistingModules = async () => {
  setIsLoading(true);
  try {
    console.log('📥 Modulok betöltése...');
    
    const { profile, modules: backendModules } = await profileService.getMyProfileWithModules();
    
    console.log('📦 Backend modulok:', backendModules);
    
    if (backendModules && backendModules.length > 0) {
      // Backend -> Frontend formátum konvertálás
      const convertedModules: ModuleData[] = backendModules.map((backendModule: any) => ({
        id: backendModule.uuid || `module-${Date.now()}-${Math.random()}`,
        type: backendModule.module_type,
        position: {
          x: backendModule.position_x || 0,
          y: backendModule.position_y || 0,
          width: backendModule.width || 1,
          height: backendModule.height || 1
        },
        content: typeof backendModule.content === 'string' 
          ? JSON.parse(backendModule.content) 
          : backendModule.content || {},
        isVisible: backendModule.is_visible ?? true,
        sortOrder: backendModule.sort_order || 0
      }));
      
      console.log('✅ Konvertált modulok:', convertedModules);
      setModules(convertedModules);
      
      // Profile ID mentése preview-hoz
      if (profile?.id) {
        setUserProfileId(profile.id);
      }
    } else {
      console.log('📝 Nincs mentett modul, üres profil');
      setModules([]);
    }
  } catch (error) {
    console.error('❌ Modulok betöltési hiba:', error);
    // Don't show error for empty profile - it's normal for new users
    if (error || 'not found') {
      console.log('ℹ️ Új felhasználó - nincs még profil');
      setModules([]);
    } else {
      alert('Hiba történt a modulok betöltése során. Próbáld újra!');
    }
  } finally {
    setIsLoading(false);
  }
};

// Modulok mentése backend-re
const saveModules = async () => {
  if (modules.length === 0) {
    alert('Nincs modul a mentéshez!');
    return;
  }

  setIsLoading(true);
  try {
    console.log('🚀 Modulok mentése...', modules.length, 'db modul');
    
    const result = await profileService.saveModules(modules);
    
    console.log('✅ Mentés sikeres:', result);
    
    // Success feedback
    alert(`✅ ${modules.length} modul sikeresen elmentve!`);
    
    // Update profile ID for preview
    if (result.data?.profile_id) {
      setUserProfileId(result.data.profile_id);
    }
    
  } catch (error) {
  console.error('❌ Mentési hiba:', error);
  
  // ✅ Type-safe error message extraction
  const getErrorMsg = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    if (err && typeof err === 'object' && 'message' in err) {
      return String((err as any).message);
    }
    return 'Ismeretlen hiba történt';
  };
  
  const originalError = getErrorMsg(error);
  let errorMessage = 'Ismeretlen hiba történt a mentés során.';
  
  if (originalError.includes('404')) {
    errorMessage = 'Először hozz létre alapvető profilt a Profile Editor-ban!';
  } else if (originalError.includes('403')) {
    errorMessage = 'Nincs jogosultságod modulok mentéséhez. Csak szolgáltatók használhatják.';
  } else if (originalError.includes('400')) {
    errorMessage = 'Hibás modul adatok. Ellenőrizd a modulok tartalmát!';
  } else if (originalError) {
    errorMessage = originalError;
  }
  
  alert(`❌ Mentési hiba: ${errorMessage}`);
} finally {
  setIsLoading(false);
}
}
// Add this useEffect to load existing modules
useEffect(() => {
  loadExistingModules();
}, []);

 const handlePreviewClick = () => {
    if (userProfileId) {
      window.open(`/profile/${userProfileId}`, '_blank');
    } else {
      alert('Először mentsd el a profilt a preview megtekintéséhez!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 navbar-padding">
      {/* Navigation - Az új Navbar komponenst használjuk */}
      <Navbar />

    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', padding: '16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
              🎨 Moduláris Profil Szerkesztő
            </h1>
            <p style={{ color: '#666', margin: 0 }}>
              Húzd át a modulokat a rácsra és szabd személyre!
            </p>
          </div>
          
          <button
  onClick={saveModules}
  disabled={isLoading}
  style={{
    padding: '12px 24px',
    backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease'
  }}
>
  {isLoading ? '💾 Mentés...' : '💾 Mentés'}
</button>

                <button
                onClick={handlePreviewClick}
                disabled={!userProfileId}
                style={{
                  padding: '12px 24px',
                  backgroundColor: userProfileId ? '#10b981' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: userProfileId ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease'
                }}
              >
                👁️ Előnézet
              </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '250px 1fr 300px', gap: '24px' }}>
        
        {/* Module Palette */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0', height: 'fit-content' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>📦 Modulok</h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Húzd át a rácsra!</p>
          </div>
          
          <div style={{ padding: '16px' }}>
            {Object.entries(
              MODULE_TEMPLATES.reduce((acc, template) => {
                if (!acc[template.category]) acc[template.category] = [];
                acc[template.category].push(template);
                return acc;
              }, {} as Record<string, ModuleTemplate[]>)
            ).map(([category, templates]) => (
              <div key={category} style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#374151' }}>{category}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {templates.map(template => {
                    const canAdd = !template.maxInstances || 
                      modules.filter(m => m.type === template.type).length < template.maxInstances;
                    
                    return (
                      <div
                        key={template.type}
                        draggable={canAdd}
                        onDragStart={(e) => canAdd && handlePaletteDragStart(template, e)}
                        style={{
                          padding: '12px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                          backgroundColor: canAdd ? 'white' : '#f9fafb',
                          cursor: canAdd ? 'move' : 'not-allowed',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s',
                          opacity: canAdd ? 1 : 0.5
                        }}
                        onMouseEnter={(e) => {
                          if (canAdd) {
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                            e.currentTarget.style.borderColor = '#3b82f6';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (canAdd) {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.borderColor = '#e0e0e0';
                          }
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>{template.icon}</span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500' }}>{template.name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {template.defaultSize.width}×{template.defaultSize.height}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid Area */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>🎯 Profil Előnézet (4×8 rács)</h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              {modules.length} modul elhelyezve • Húzd át a modulokat!
            </p>
          </div>
          
          <div style={{ padding: '24px' }}>
            <div
              ref={gridRef}
              style={{
                position: 'relative',
                width: GRID_CONFIG.cols * GRID_CONFIG.cellWidth + (GRID_CONFIG.cols - 1) * GRID_CONFIG.gap,
                height: GRID_CONFIG.rows * GRID_CONFIG.cellHeight + (GRID_CONFIG.rows - 1) * GRID_CONFIG.gap,
                margin: '0 auto',
                border: '2px dashed #cbd5e1',
                borderRadius: '8px',
                backgroundColor: '#f8fafc'
              }}
              onDragOver={handleGridDragOver}
              onDrop={handleGridDrop}
              onDragLeave={() => setDropIndicator(null)}
              onClick={() => setSelectedModule(null)}
            >
              {renderGrid()}
              {renderDropIndicator()}
              {modules.map(renderModule)}
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0', height: 'fit-content' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0' }}>
            <h2 style={{ margin: 0, fontSize: '18px' }}>⚙️ Beállítások</h2>
          </div>
          
          <div style={{ padding: '16px' }}>
            {selectedModule ? (
              <ModuleSettings
                module={modules.find(m => m.id === selectedModule)!}
                onUpdate={(content) => updateModuleContent(selectedModule, content)}
                onRemove={() => removeModule(selectedModule)}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Válassz ki egy modult!</h3>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  Kattints egy modulra a rácsban a szerkesztéshez.
                </p>
              </div>
            )}
          </div>
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

// Module Settings Component
const ModuleSettings: React.FC<{
  module: ModuleData;
  onUpdate: (content: any) => void;
  onRemove: () => void;
}> = ({ module, onUpdate, onRemove }) => {
  const [localContent, setLocalContent] = useState(module.content);

  useEffect(() => {
    setLocalContent(module.content);
  }, [module.content]);

  const handleInputChange = (field: string, value: any) => {
    const newContent = { ...localContent, [field]: value };
    setLocalContent(newContent);
    onUpdate(newContent);
  };

  const handleArrayUpdate = (field: string, index: number, itemField: string, value: any) => {
    const array = localContent[field] || [];
    const newArray = [...array];
    newArray[index] = { ...newArray[index], [itemField]: value };
    const newContent = { ...localContent, [field]: newArray };
    setLocalContent(newContent);
    onUpdate(newContent);
  };

  const addArrayItem = (field: string, defaultItem: any) => {
    const array = localContent[field] || [];
    const newContent = { ...localContent, [field]: [...array, defaultItem] };
    setLocalContent(newContent);
    onUpdate(newContent);
  };

  const removeArrayItem = (field: string, index: number) => {
    const array = localContent[field] || [];
    const newContent = { ...localContent, [field]: array.filter((_: any, i: number) => i !== index) };
    setLocalContent(newContent);
    onUpdate(newContent);
  };

  const getModuleName = (type: ModuleType) => {
    const names = {
      hero: 'Hero Banner',
      text: 'Szövegblokk',
      contact: 'Kapcsolat',
      price_list: 'Árlista',
      stats: 'Statisztikák',
      gallery: 'Képgaléria',
      video: 'Videó',
      image: 'Kép',
      testimonial: 'Értékelések',
      social: 'Közösségi média'
    };
    return names[type] || 'Modul';
  };

  return (
    <div>
      <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1f2937' }}>
          {getModuleName(module.type)}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#6b7280', padding: '2px 6px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
            {module.position.width}×{module.position.height}
          </span>
          <button
            onClick={onRemove}
            style={{
              fontSize: '12px',
              color: '#dc2626',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 6px'
            }}
          >
            🗑️ Törlés
          </button>
        </div>
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {/* Hero Module Settings */}
        {module.type === 'hero' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                Főcím
              </label>
              <input
                type="text"
                value={localContent.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Szolgáltató neve"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                Alcím
              </label>
              <input
                type="text"
                value={localContent.subtitle || ''}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Szakértelem leírása"
              />
            </div>
          </div>
        )}

        {/* Text Module Settings */}
        {module.type === 'text' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                Cím
              </label>
              <input
                type="text"
                value={localContent.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Szekció címe"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                Szöveg
              </label>
              <textarea
                value={localContent.content || ''}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
                placeholder="Itt írhatsz magadról..."
              />
            </div>
          </div>
        )}

        {/* Contact Module Settings */}
        {module.type === 'contact' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                Telefon
              </label>
              <input
                type="tel"
                value={localContent.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="+36 30 123 4567"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                Email
              </label>
              <input
                type="email"
                value={localContent.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="info@example.hu"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                Cím
              </label>
              <input
                type="text"
                value={localContent.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Budapest"
              />
            </div>
          </div>
        )}

        {/* Price List Module Settings */}
        {module.type === 'price_list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                Árlista címe
              </label>
              <input
                type="text"
                value={localContent.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Árlista"
              />
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Szolgáltatások</label>
                <button
                  onClick={() => addArrayItem('items', { service: 'Új szolgáltatás', price: '0', unit: 'db' })}
                  style={{
                    fontSize: '12px',
                    color: '#3b82f6',
                    backgroundColor: 'transparent',
                    border: '1px solid #3b82f6',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer'
                  }}
                >
                  + Hozzáadás
                </button>
              </div>
              
              {(localContent.items || []).map((item: any, index: number) => (
                <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px', marginBottom: '8px', backgroundColor: '#f9fafb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        value={item.service || ''}
                        onChange={(e) => handleArrayUpdate('items', index, 'service', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px',
                          marginBottom: '6px'
                        }}
                        placeholder="Szolgáltatás neve"
                      />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="number"
                          value={item.price || ''}
                          onChange={(e) => handleArrayUpdate('items', index, 'price', e.target.value)}
                          style={{
                            flex: 1,
                            padding: '6px 8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                          placeholder="Ár"
                        />
                        <select
                          value={item.unit || 'db'}
                          onChange={(e) => handleArrayUpdate('items', index, 'unit', e.target.value)}
                          style={{
                            padding: '6px 8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          <option value="db">db</option>
                          <option value="óra">óra</option>
                          <option value="nap">nap</option>
                          <option value="m²">m²</option>
                          <option value="projekt">projekt</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => removeArrayItem('items', index)}
                      style={{
                        marginLeft: '8px',
                        fontSize: '12px',
                        color: '#dc2626',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Module Settings */}
        {module.type === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Statisztikák</label>
                <button
                  onClick={() => addArrayItem('items', { label: 'Új statisztika', value: '0', icon: '📊' })}
                  style={{
                    fontSize: '12px',
                    color: '#3b82f6',
                    backgroundColor: 'transparent',
                    border: '1px solid #3b82f6',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer'
                  }}
                >
                  + Hozzáadás
                </button>
              </div>
              
              {(localContent.items || []).map((item: any, index: number) => (
                <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px', marginBottom: '8px', backgroundColor: '#f9fafb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                        <input
                          type="text"
                          value={item.icon || ''}
                          onChange={(e) => handleArrayUpdate('items', index, 'icon', e.target.value)}
                          style={{
                            width: '40px',
                            padding: '6px 8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '12px',
                            textAlign: 'center'
                          }}
                          placeholder="📊"
                        />
                        <input
                          type="text"
                          value={item.value || ''}
                          onChange={(e) => handleArrayUpdate('items', index, 'value', e.target.value)}
                          style={{
                            width: '60px',
                            padding: '6px 8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                          placeholder="100+"
                        />
                      </div>
                      <input
                        type="text"
                        value={item.label || ''}
                        onChange={(e) => handleArrayUpdate('items', index, 'label', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                        placeholder="Statisztika címe"
                      />
                    </div>
                    <button
                      onClick={() => removeArrayItem('items', index)}
                      style={{
                        marginLeft: '8px',
                        fontSize: '12px',
                        color: '#dc2626',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Module Settings */}
        {module.type === 'gallery' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                Galéria címe
              </label>
              <input
                type="text"
                value={localContent.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Képgaléria"
              />
            </div>
            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📸</div>
              <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                Képfeltöltés funkció hamarosan...
              </p>
            </div>
          </div>
        )}

        {/* Video Module Settings */}
        {module.type === 'video' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                Videó címe
              </label>
              <input
                type="text"
                value={localContent.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Bemutatkozó videó"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                YouTube/Vimeo URL
              </label>
              <input
                type="url"
                value={localContent.videoUrl || ''}
                onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
    
  );
};

// Module Renderer Component
const ModuleRenderer: React.FC<{ module: ModuleData }> = ({ module }) => {
  const { type, content } = module;

  const commonStyle = {
    height: '100%',
    overflow: 'hidden'
  };

  switch (type) {
    case 'hero':
      return (
        <div style={{ 
          ...commonStyle, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          borderRadius: '6px', 
          textAlign: 'center' 
        }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
            {content.title || 'Szolgáltató neve'}
          </h2>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
            {content.subtitle || 'Szakértelem'}
          </p>
        </div>
      );
      
    case 'text':
      return (
        <div style={commonStyle}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
            {content.title || 'Szövegblokk'}
          </h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
            {content.content?.length > 100 
              ? content.content.substring(0, 100) + '...' 
              : content.content || 'Itt lesz a szöveg...'}
          </p>
        </div>
      );
      
    case 'contact':
      return (
        <div style={commonStyle}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>📞 Kapcsolat</h3>
          <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
            {content.phone && <div>📱 {content.phone}</div>}
            {content.email && <div>✉️ {content.email}</div>}
            {content.address && <div>📍 {content.address}</div>}
          </div>
        </div>
      );
      
    case 'price_list':
      return (
        <div style={commonStyle}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
            💰 {content.title || 'Árlista'}
          </h3>
          <div style={{ fontSize: '12px' }}>
            {content.items?.slice(0, 2).map((item: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.service}
                </span>
                <span style={{ fontWeight: '600', marginLeft: '8px' }}>
                  {item.price} Ft
                </span>
              </div>
            ))}
            {content.items?.length > 2 && (
              <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
                +{content.items.length - 2} további...
              </div>
            )}
          </div>
        </div>
      );
      
    case 'stats':
      return (
        <div style={{ ...commonStyle, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {content.items?.slice(0, 3).map((stat: any, i: number) => (
            <div key={i} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '16px' }}>{stat.icon}</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{stat.value}</div>
              <div style={{ fontSize: '10px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      );

    case 'gallery':
      return (
        <div style={{ ...commonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
          <div style={{ textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>🖼️</div>
            <div style={{ fontSize: '12px' }}>{content.title || 'Képgaléria'}</div>
          </div>
        </div>
      );
      
    case 'video':
      return (
        <div style={{ ...commonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1f2937', borderRadius: '6px' }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>▶️</div>
            <div style={{ fontSize: '12px' }}>{content.title || 'Videó'}</div>
          </div>
        </div>
      );
      
    default:
      return (
        <div style={{ ...commonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>📦</div>
            <div style={{ fontSize: '12px' }}>Modul</div>
          </div>
        </div>
      );
  }
};

export default ModularProfileEditor;