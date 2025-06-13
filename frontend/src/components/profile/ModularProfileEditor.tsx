// ModularProfileEditor.tsx - Javított verzió
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DragDropContext } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Layout from '../layout/Layout';
import Container from '../layout/Container';
import Card from '../common/Card';

// Ha a DndProvider import nem működik, próbáld ezt:
// import { DragDropContext } from 'react-dnd';
// Vagy egyszerűen kezdjük DnD nélkül és később adjuk hozzá

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
  style?: any;
}

type ModuleType = 
  | 'hero'
  | 'introduction' 
  | 'services'
  | 'gallery'
  | 'video'
  | 'contact'
  | 'reviews'
  | 'certificates'
  | 'timeline'
  | 'pricing'
  | 'stats';

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
    name: 'Hero Szekció',
    icon: '🎯',
    defaultSize: { width: 2, height: 2 },
    category: 'Bemutatkozás',
    description: 'Főcím, profilkép és rövid bemutatkozás',
    maxInstances: 1
  },
  {
    type: 'introduction',
    name: 'Bemutatkozás',
    icon: '📝',
    defaultSize: { width: 2, height: 2 },
    category: 'Bemutatkozás',
    description: 'Részletes bemutatkozó szöveg'
  },
  {
    type: 'services',
    name: 'Szolgáltatások',
    icon: '🛠️',
    defaultSize: { width: 2, height: 3 },
    category: 'Szolgáltatások',
    description: 'Szolgáltatások listája árral'
  },
  {
    type: 'gallery',
    name: 'Képgaléria',
    icon: '🖼️',
    defaultSize: { width: 2, height: 2 },
    category: 'Média',
    description: 'Munkák és projektek képei'
  },
  {
    type: 'video',
    name: 'Videó',
    icon: '🎥',
    defaultSize: { width: 2, height: 2 },
    category: 'Média',
    description: 'Bemutatkozó videó'
  },
  {
    type: 'contact',
    name: 'Kapcsolat',
    icon: '📞',
    defaultSize: { width: 1, height: 2 },
    category: 'Kapcsolat',
    description: 'Elérhetőségek'
  },
  {
    type: 'reviews',
    name: 'Értékelések',
    icon: '⭐',
    defaultSize: { width: 2, height: 2 },
    category: 'Hitelesség',
    description: 'Ügyfél értékelések'
  },
  {
    type: 'certificates',
    name: 'Tanúsítványok',
    icon: '🏆',
    defaultSize: { width: 1, height: 2 },
    category: 'Hitelesség',
    description: 'Szakmai tanúsítványok'
  },
  {
    type: 'stats',
    name: 'Statisztikák',
    icon: '📊',
    defaultSize: { width: 2, height: 1 },
    category: 'Bemutatkozás',
    description: 'Fontos számok és eredmények'
  }
];

const GRID_CONFIG = {
  desktop: { cols: 4, rows: 8, cellWidth: 280, cellHeight: 120 },
  tablet: { cols: 3, rows: 11, cellWidth: 240, cellHeight: 100 },
  mobile: { cols: 2, rows: 16, cellWidth: 160, cellHeight: 80 }
};

const ModularProfileEditor: React.FC = () => {
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showModulePalette, setShowModulePalette] = useState(true);
  
  const gridRef = useRef<HTMLDivElement>(null);

  // Check if position is available
  const isPositionAvailable = useCallback((position: GridPosition, excludeId?: string): boolean => {
    const { cols, rows } = GRID_CONFIG[currentDevice];
    
    if (position.x < 0 || position.y < 0 || 
        position.x + position.width > cols || 
        position.y + position.height > rows) {
      return false;
    }

    return !modules.some(module => {
      if (module.id === excludeId) return false;
      
      const modulePos = module.position;
      return !(
        position.x >= modulePos.x + modulePos.width ||
        position.x + position.width <= modulePos.x ||
        position.y >= modulePos.y + modulePos.height ||
        position.y + position.height <= modulePos.y
      );
    });
  }, [modules, currentDevice]);

  // Find next available position
  const findAvailablePosition = useCallback((size: { width: number; height: number }): GridPosition | null => {
    const { cols, rows } = GRID_CONFIG[currentDevice];
    
    for (let y = 0; y <= rows - size.height; y++) {
      for (let x = 0; x <= cols - size.width; x++) {
        const position = { x, y, width: size.width, height: size.height };
        if (isPositionAvailable(position)) {
          return position;
        }
      }
    }
    return null;
  }, [isPositionAvailable, currentDevice]);

  // Add module
  const addModule = useCallback((template: ModuleTemplate) => {
    // Check instance limit
    if (template.maxInstances) {
      const existingInstances = modules.filter(m => m.type === template.type).length;
      if (existingInstances >= template.maxInstances) {
        alert(`Csak ${template.maxInstances} darab ${template.name} modul helyezhető el!`);
        return;
      }
    }

    const position = findAvailablePosition(template.defaultSize);
    
    if (!position) {
      alert('Nincs elegendő hely a modulhoz a rácsban!');
      return;
    }

    const newModule: ModuleData = {
      id: `module_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: template.type,
      position,
      content: getDefaultContent(template.type),
      style: {}
    };

    setModules(prev => [...prev, newModule]);
    setSelectedModule(newModule.id);
  }, [findAvailablePosition, modules]);

  // Get default content for module
  const getDefaultContent = (type: ModuleType): any => {
    switch (type) {
      case 'hero':
        return {
          title: 'Szolgáltató Neve',
          subtitle: 'Szakma/Szakterület',
          description: 'Rövid bemutatkozás és értékajánlat.',
          profileImage: null
        };
      case 'introduction':
        return {
          title: 'Rólam',
          text: 'Mutatkozz be részletesebben! Írd le tapasztalataidat, módszereidet és azt, hogy miért téged válasszanak.'
        };
      case 'services':
        return {
          title: 'Szolgáltatásaim',
          services: [
            { name: 'Alapszolgáltatás', price: '15.000 Ft', description: 'Leírás...' },
            { name: 'Prémium csomag', price: '25.000 Ft', description: 'Leírás...' }
          ]
        };
      case 'contact':
        return {
          title: 'Kapcsolat',
          phone: '+36 30 123 4567',
          email: 'email@example.com',
          website: 'https://example.com',
          address: 'Budapest'
        };
      case 'stats':
        return {
          stats: [
            { label: 'Elégedett ügyfél', value: '150+', icon: '😊' },
            { label: 'Befejezett projekt', value: '200+', icon: '✅' },
            { label: 'Év tapasztalat', value: '5+', icon: '⭐' },
            { label: 'Átlag értékelés', value: '4.9', icon: '🏆' }
          ]
        };
      case 'reviews':
        return {
          title: 'Mit mondanak rólam',
          averageRating: 4.8,
          totalReviews: 47,
          reviews: [
            { name: 'Kiss János', rating: 5, text: 'Kiváló szakember!', date: '2024-11-15' },
            { name: 'Nagy Anna', rating: 5, text: 'Nagyon elégedett vagyok!', date: '2024-11-10' }
          ]
        };
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

  // Group modules by category
  const modulesByCategory = MODULE_TEMPLATES.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, ModuleTemplate[]>);

  // Check if module can be added
  const canAddModule = (template: ModuleTemplate): boolean => {
    if (!template.maxInstances) return true;
    const existingCount = modules.filter(m => m.type === template.type).length;
    return existingCount < template.maxInstances;
  };

  return (
    <Layout>
      <Container className="py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">🎨 Moduláris Profil Szerkesztő</h1>
              <p className="text-gray-600">
                Hozd létre egyedi profilodat modulokkal! {modules.length}/20 modul
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`btn btn-sm ${previewMode ? 'btn-secondary' : 'btn-outline'}`}
              >
                {previewMode ? '✏️ Szerkesztés' : '👁️ Előnézet'}
              </button>
              
              <button className="btn btn-primary btn-sm">
                💾 Mentés
              </button>
            </div>
          </div>

          {/* Device Switcher */}
          <div className="flex gap-2 mb-4">
            {(['desktop', 'tablet', 'mobile'] as const).map(device => (
              <button
                key={device}
                onClick={() => setCurrentDevice(device)}
                className={`btn btn-sm ${currentDevice === device ? 'btn-primary' : 'btn-outline'}`}
              >
                {device === 'desktop' ? '🖥️ Desktop' : 
                 device === 'tablet' ? '📱 Tablet' : 
                 '📱 Mobil'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          
          {/* Module Palette */}
          {!previewMode && showModulePalette && (
            <div className="w-80 max-h-screen overflow-y-auto">
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">📦 Modul Paletta</h3>
                  <button
                    onClick={() => setShowModulePalette(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-6">
                  {Object.entries(modulesByCategory).map(([category, templates]) => (
                    <div key={category}>
                      <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                        {category === 'Bemutatkozás' ? '👋' :
                         category === 'Média' ? '🎬' :
                         category === 'Szolgáltatások' ? '💼' :
                         category === 'Kapcsolat' ? '📞' : '🏆'}
                        {category}
                      </h4>
                      <div className="space-y-2">
                        {templates.map(template => {
                          const isDisabled = !canAddModule(template);
                          const existingCount = modules.filter(m => m.type === template.type).length;
                          
                          return (
                            <div
                              key={template.type}
                              onClick={isDisabled ? undefined : () => addModule(template)}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                isDisabled 
                                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed' 
                                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-2xl">{template.icon}</span>
                                <div className="flex-1">
                                  <div className="font-medium text-sm flex items-center gap-2">
                                    {template.name}
                                    {template.maxInstances && (
                                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                        {existingCount}/{template.maxInstances}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {template.description}
                                  </div>
                                  <div className="text-xs text-blue-600 mt-1">
                                    {template.defaultSize.width}×{template.defaultSize.height}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Toggle Palette Button */}
          {!previewMode && !showModulePalette && (
            <button
              onClick={() => setShowModulePalette(true)}
              className="fixed left-4 top-1/2 transform -translate-y-1/2 btn btn-primary btn-sm z-10 shadow-lg"
            >
              📦
            </button>
          )}

          {/* Grid Editor */}
          <div className="flex-1">
            <Card className="p-0 overflow-hidden">
              
              {/* Grid Info */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-gray-600">
                  <span>
                    Rács: {GRID_CONFIG[currentDevice].cols}×{GRID_CONFIG[currentDevice].rows} 
                    ({modules.length} modul)
                  </span>
                  <span>
                    Cella: {GRID_CONFIG[currentDevice].cellWidth}×{GRID_CONFIG[currentDevice].cellHeight}px
                  </span>
                </div>
              </div>

              {/* Grid Canvas */}
              <div className="p-6">
                <div
                  ref={gridRef}
                  className="relative border-2 border-dashed border-gray-300 bg-white mx-auto"
                  style={{
                    width: GRID_CONFIG[currentDevice].cols * GRID_CONFIG[currentDevice].cellWidth,
                    height: GRID_CONFIG[currentDevice].rows * GRID_CONFIG[currentDevice].cellHeight,
                    maxWidth: '100%'
                  }}
                >
                  
                  {/* Grid Lines */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Vertical lines */}
                    {Array.from({ length: GRID_CONFIG[currentDevice].cols + 1 }).map((_, i) => (
                      <div
                        key={`v-${i}`}
                        className="absolute top-0 bottom-0 border-l border-gray-200"
                        style={{ left: i * GRID_CONFIG[currentDevice].cellWidth }}
                      />
                    ))}
                    {/* Horizontal lines */}
                    {Array.from({ length: GRID_CONFIG[currentDevice].rows + 1 }).map((_, i) => (
                      <div
                        key={`h-${i}`}
                        className="absolute left-0 right-0 border-t border-gray-200"
                        style={{ top: i * GRID_CONFIG[currentDevice].cellHeight }}
                      />
                    ))}
                  </div>

                  {/* Modules */}
                  {modules.map(module => (
                    <ModuleComponent
                      key={module.id}
                      module={module}
                      isSelected={selectedModule === module.id}
                      isPreview={previewMode}
                      cellWidth={GRID_CONFIG[currentDevice].cellWidth}
                      cellHeight={GRID_CONFIG[currentDevice].cellHeight}
                      onSelect={() => setSelectedModule(module.id)}
                      onRemove={() => removeModule(module.id)}
                    />
                  ))}

                  {/* Empty State */}
                  {modules.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <div className="text-4xl mb-4">🎨</div>
                        <h3 className="text-lg font-medium mb-2">Üres profil</h3>
                        <p className="text-sm">
                          Kezdj hozzá modulok hozzáadásával a bal oldali palettáról!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Module Inspector */}
        {selectedModule && !previewMode && (
          <div className="mt-6">
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">⚙️ Modul Beállítások</h3>
                <button
                  onClick={() => removeModule(selectedModule)}
                  className="btn btn-danger btn-sm"
                >
                  🗑️ Törlés
                </button>
              </div>
              <ModuleInspector
                module={modules.find(m => m.id === selectedModule)!}
                onUpdate={(updatedModule) => {
                  setModules(prev => prev.map(m => 
                    m.id === selectedModule ? updatedModule : m
                  ));
                }}
              />
            </Card>
          </div>
        )}

      </Container>
    </Layout>
  );
};

// Module Component
interface ModuleComponentProps {
  module: ModuleData;
  isSelected: boolean;
  isPreview: boolean;
  cellWidth: number;
  cellHeight: number;
  onSelect: () => void;
  onRemove: () => void;
}

const ModuleComponent: React.FC<ModuleComponentProps> = ({
  module,
  isSelected,
  isPreview,
  cellWidth,
  cellHeight,
  onSelect,
  onRemove
}) => {
  const style = {
    position: 'absolute' as const,
    left: module.position.x * cellWidth,
    top: module.position.y * cellHeight,
    width: module.position.width * cellWidth,
    height: module.position.height * cellHeight,
    zIndex: isSelected ? 10 : 1
  };

  return (
    <div
      style={style}
      onClick={onSelect}
      className={`
        border-2 rounded-lg overflow-hidden cursor-pointer transition-all
        ${isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-300'}
        ${isPreview ? '' : 'hover:border-blue-400'}
      `}
    >
      {/* Module Header (Edit mode only) */}
      {!isPreview && (
        <div className="absolute top-0 right-0 z-20 flex gap-1 p-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="w-6 h-6 bg-red-500 text-white rounded text-xs hover:bg-red-600 flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      )}

      {/* Module Content */}
      <div className="w-full h-full p-3 bg-white">
        <ModuleRenderer module={module} isPreview={isPreview} />
      </div>
    </div>
  );
};

// Module Content Renderer
interface ModuleRendererProps {
  module: ModuleData;
  isPreview: boolean;
}

const ModuleRenderer: React.FC<ModuleRendererProps> = ({ module, isPreview }) => {
  switch (module.type) {
    case 'hero':
      return (
        <div className="text-center h-full flex flex-col justify-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2"></div>
          <h3 className="font-bold text-lg">{module.content.title}</h3>
          <p className="text-sm text-gray-600">{module.content.subtitle}</p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{module.content.description}</p>
        </div>
      );
    
    case 'introduction':
      return (
        <div className="h-full">
          <h4 className="font-semibold mb-2">{module.content.title || '📝 Bemutatkozás'}</h4>
          <p className="text-sm text-gray-600 line-clamp-4">{module.content.text}</p>
        </div>
      );
    
    case 'services':
      return (
        <div className="h-full">
          <h4 className="font-semibold mb-2">{module.content.title || '🛠️ Szolgáltatások'}</h4>
          <div className="space-y-2">
            {module.content.services?.slice(0, 3).map((service: any, index: number) => (
              <div key={index} className="text-sm">
                <div className="font-medium">{service.name}</div>
                <div className="text-blue-600 text-xs">{service.price}</div>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'contact':
      return (
        <div className="h-full">
          <h4 className="font-semibold mb-2">{module.content.title || '📞 Kapcsolat'}</h4>
          <div className="text-sm space-y-1">
            <div>📱 {module.content.phone}</div>
            <div>✉️ {module.content.email}</div>
            {module.content.website && <div>🌐 Weboldal</div>}
          </div>
        </div>
      );
    
    case 'stats':
      return (
        <div className="h-full">
          <h4 className="font-semibold mb-2">📊 Statisztikák</h4>
          <div className="grid grid-cols-2 gap-2">
            {module.content.stats?.slice(0, 4).map((stat: any, index: number) => (
              <div key={index} className="text-center">
                <div className="text-lg font-bold text-blue-600">{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'gallery':
      return (
        <div className="h-full">
          <h4 className="font-semibold mb-2">🖼️ Galéria</h4>
          <div className="grid grid-cols-2 gap-2 h-20">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      );

    case 'reviews':
      return (
        <div className="h-full">
          <h4 className="font-semibold mb-2">⭐ Értékelések</h4>
          <div className="text-sm">
            <div className="flex items-center gap-1 mb-2">
              <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
              <span className="font-medium">{module.content.averageRating || 4.8}</span>
              <span className="text-gray-500">({module.content.totalReviews || 47})</span>
            </div>
            {module.content.reviews?.slice(0, 1).map((review: any, index: number) => (
              <div key={index} className="text-xs text-gray-600">
                "{review.text}" - {review.name}
              </div>
            ))}
          </div>
        </div>
      );
    
    default:
      return (
        <div className="h-full flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-2xl mb-2">🧩</div>
            <div className="text-sm">{module.type}</div>
          </div>
        </div>
      );
  }
};

// Module Inspector for editing
interface ModuleInspectorProps {
  module: ModuleData;
  onUpdate: (module: ModuleData) => void;
}

const ModuleInspector: React.FC<ModuleInspectorProps> = ({ module, onUpdate }) => {
  const updateContent = (newContent: any) => {
    onUpdate({
      ...module,
      content: { ...module.content, ...newContent }
    });
  };

  switch (module.type) {
    case 'hero':
      return (
        <div className="space-y-4">
          <div>
            <label className="form-label">Cím</label>
            <input
              className="input-field"
              value={module.content.title || ''}
              onChange={(e) => updateContent({ title: e.target.value })}
              placeholder="Szolgáltató neve"
            />
          </div>
          <div>
            <label className="form-label">Alcím</label>
            <input
              className="input-field"
              value={module.content.subtitle || ''}
              onChange={(e) => updateContent({ subtitle: e.target.value })}
              placeholder="Szakma/szakterület"
            />
          </div>
          <div>
            <label className="form-label">Rövid leírás</label>
            <textarea
              className="input-field"
              value={module.content.description || ''}
              onChange={(e) => updateContent({ description: e.target.value })}
              placeholder="Rövid bemutatkozás..."
              rows={3}
            />
          </div>
        </div>
      );
    
    case 'introduction':
      return (
        <div className="space-y-4">
          <div>
            <label className="form-label">Címsor</label>
            <input
              className="input-field"
              value={module.content.title || ''}
              onChange={(e) => updateContent({ title: e.target.value })}
              placeholder="Rólam"
            />
          </div>
          <div>
            <label className="form-label">Bemutatkozó szöveg</label>
            <textarea
              className="input-field"
              value={module.content.text || ''}
              onChange={(e) => updateContent({ text: e.target.value })}
              placeholder="Mutatkozz be részletesebben..."
              rows={5}
            />
          </div>
        </div>
      );
    
    case 'services':
      return (
        <div className="space-y-4">
          <div>
            <label className="form-label">Címsor</label>
            <input
              className="input-field"
              value={module.content.title || ''}
              onChange={(e) => updateContent({ title: e.target.value })}
              placeholder="Szolgáltatásaim"
            />
          </div>
          <div>
            <label className="form-label">Szolgáltatások</label>
            {module.content.services?.map((service: any, index: number) => (
              <div key={index} className="border rounded-lg p-3 mb-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    className="input-field"
                    value={service.name || ''}
                    onChange={(e) => {
                      const newServices = [...module.content.services];
                      newServices[index] = { ...service, name: e.target.value };
                      updateContent({ services: newServices });
                    }}
                    placeholder="Szolgáltatás neve"
                  />
                  <input
                    className="input-field"
                    value={service.price || ''}
                    onChange={(e) => {
                      const newServices = [...module.content.services];
                      newServices[index] = { ...service, price: e.target.value };
                      updateContent({ services: newServices });
                    }}
                    placeholder="Ár"
                  />
                </div>
                <textarea
                  className="input-field mt-2"
                  value={service.description || ''}
                  onChange={(e) => {
                    const newServices = [...module.content.services];
                    newServices[index] = { ...service, description: e.target.value };
                    updateContent({ services: newServices });
                  }}
                  placeholder="Szolgáltatás leírása"
                  rows={2}
                />
                <button
                  onClick={() => {
                    const newServices = module.content.services.filter((_: any, i: number) => i !== index);
                    updateContent({ services: newServices });
                  }}
                  className="btn btn-danger btn-sm mt-2"
                >
                  Törlés
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newServices = [...(module.content.services || []), { name: '', price: '', description: '' }];
                updateContent({ services: newServices });
              }}
              className="btn btn-outline w-full"
            >
              + Új szolgáltatás
            </button>
          </div>
        </div>
      );
    
    case 'contact':
      return (
        <div className="space-y-4">
          <div>
            <label className="form-label">Címsor</label>
            <input
              className="input-field"
              value={module.content.title || ''}
              onChange={(e) => updateContent({ title: e.target.value })}
              placeholder="Kapcsolat"
            />
          </div>
          <div>
            <label className="form-label">Telefonszám</label>
            <input
              className="input-field"
              value={module.content.phone || ''}
              onChange={(e) => updateContent({ phone: e.target.value })}
              placeholder="+36 30 123 4567"
            />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input
              className="input-field"
              type="email"
              value={module.content.email || ''}
              onChange={(e) => updateContent({ email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="form-label">Weboldal</label>
            <input
              className="input-field"
              value={module.content.website || ''}
              onChange={(e) => updateContent({ website: e.target.value })}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="form-label">Cím</label>
            <input
              className="input-field"
              value={module.content.address || ''}
              onChange={(e) => updateContent({ address: e.target.value })}
              placeholder="Budapest, V. kerület"
            />
          </div>
        </div>
      );
    
    case 'stats':
      return (
        <div className="space-y-4">
          <div>
            <label className="form-label">Statisztikák</label>
            {module.content.stats?.map((stat: any, index: number) => (
              <div key={index} className="border rounded-lg p-3 mb-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    className="input-field"
                    value={stat.label || ''}
                    onChange={(e) => {
                      const newStats = [...module.content.stats];
                      newStats[index] = { ...stat, label: e.target.value };
                      updateContent({ stats: newStats });
                    }}
                    placeholder="Címke"
                  />
                  <input
                    className="input-field"
                    value={stat.value || ''}
                    onChange={(e) => {
                      const newStats = [...module.content.stats];
                      newStats[index] = { ...stat, value: e.target.value };
                      updateContent({ stats: newStats });
                    }}
                    placeholder="Érték"
                  />
                  <input
                    className="input-field"
                    value={stat.icon || ''}
                    onChange={(e) => {
                      const newStats = [...module.content.stats];
                      newStats[index] = { ...stat, icon: e.target.value };
                      updateContent({ stats: newStats });
                    }}
                    placeholder="Emoji ikon"
                  />
                </div>
                <button
                  onClick={() => {
                    const newStats = module.content.stats.filter((_: any, i: number) => i !== index);
                    updateContent({ stats: newStats });
                  }}
                  className="btn btn-danger btn-sm mt-2"
                >
                  Törlés
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newStats = [...(module.content.stats || []), { label: '', value: '', icon: '📊' }];
                updateContent({ stats: newStats });
              }}
              className="btn btn-outline w-full"
            >
              + Új statisztika
            </button>
          </div>
        </div>
      );
    
    case 'reviews':
      return (
        <div className="space-y-4">
          <div>
            <label className="form-label">Címsor</label>
            <input
              className="input-field"
              value={module.content.title || ''}
              onChange={(e) => updateContent({ title: e.target.value })}
              placeholder="Mit mondanak rólam"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Átlag értékelés</label>
              <input
                className="input-field"
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={module.content.averageRating || ''}
                onChange={(e) => updateContent({ averageRating: parseFloat(e.target.value) })}
                placeholder="4.8"
              />
            </div>
            <div>
              <label className="form-label">Értékelések száma</label>
              <input
                className="input-field"
                type="number"
                value={module.content.totalReviews || ''}
                onChange={(e) => updateContent({ totalReviews: parseInt(e.target.value) })}
                placeholder="47"
              />
            </div>
          </div>
          <div>
            <label className="form-label">Kiemelt értékelések</label>
            {module.content.reviews?.map((review: any, index: number) => (
              <div key={index} className="border rounded-lg p-3 mb-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                  <input
                    className="input-field"
                    value={review.name || ''}
                    onChange={(e) => {
                      const newReviews = [...module.content.reviews];
                      newReviews[index] = { ...review, name: e.target.value };
                      updateContent({ reviews: newReviews });
                    }}
                    placeholder="Ügyfél neve"
                  />
                  <select
                    className="input-field"
                    value={review.rating || 5}
                    onChange={(e) => {
                      const newReviews = [...module.content.reviews];
                      newReviews[index] = { ...review, rating: parseInt(e.target.value) };
                      updateContent({ reviews: newReviews });
                    }}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                    <option value={4}>⭐⭐⭐⭐ (4)</option>
                    <option value={3}>⭐⭐⭐ (3)</option>
                    <option value={2}>⭐⭐ (2)</option>
                    <option value={1}>⭐ (1)</option>
                  </select>
                </div>
                <textarea
                  className="input-field"
                  value={review.text || ''}
                  onChange={(e) => {
                    const newReviews = [...module.content.reviews];
                    newReviews[index] = { ...review, text: e.target.value };
                    updateContent({ reviews: newReviews });
                  }}
                  placeholder="Értékelés szövege"
                  rows={2}
                />
                <button
                  onClick={() => {
                    const newReviews = module.content.reviews.filter((_: any, i: number) => i !== index);
                    updateContent({ reviews: newReviews });
                  }}
                  className="btn btn-danger btn-sm mt-2"
                >
                  Törlés
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newReviews = [...(module.content.reviews || []), { 
                  name: '', 
                  rating: 5, 
                  text: '', 
                  date: new Date().toISOString().split('T')[0] 
                }];
                updateContent({ reviews: newReviews });
              }}
              className="btn btn-outline w-full"
            >
              + Új értékelés
            </button>
          </div>
        </div>
      );
    
    default:
      return (
        <div className="text-center text-gray-500 py-8">
          <div className="text-2xl mb-2">⚙️</div>
          <h4 className="font-medium mb-2">Modul beállítások</h4>
          <p className="text-sm">Ez a modul típus még nem támogatja a részletes szerkesztést.</p>
          <p className="text-xs text-gray-400 mt-2">Típus: {module.type}</p>
        </div>
      );
  }
};

export default ModularProfileEditor;