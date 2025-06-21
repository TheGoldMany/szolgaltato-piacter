// frontend/src/hooks/useDocumentTitle.ts
// Dinamikus title változtatáshoz

import { useEffect } from 'react';

export const useDocumentTitle = (title: string, append: boolean = true) => {
  useEffect(() => {
    const baseName = 'Corvus';
    
    if (append && title) {
      document.title = `${title} | ${baseName}`;
    } else if (title) {
      document.title = title;
    } else {
      document.title = `${baseName} - Szolgáltató Piactér`;
    }
    
    return () => {
      document.title = `${baseName} - Szolgáltató Piactér`;
    };
  }, [title, append]);
};

// Használat példa:
// import { useDocumentTitle } from '../hooks/useDocumentTitle';
// 
// const LoginForm = () => {
//   useDocumentTitle('Bejelentkezés');
//   // Title lesz: "Bejelentkezés | Corvus"
// };