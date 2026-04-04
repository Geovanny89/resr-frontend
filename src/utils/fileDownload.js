import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import * as XLSX from 'xlsx';

/**
 * Guarda archivo en dispositivo (para APK)
 * o descarga normal (para web)
 */
export async function saveFile({ filename, data, contentType, blob }) {
  const isNative = Capacitor.isNativePlatform();
  
  if (isNative) {
    try {
      // Solicitar permisos de almacenamiento
      try {
        const status = await Filesystem.checkPermissions();
        if (status.publicStorage !== 'granted') {
          await Filesystem.requestPermissions();
        }
      } catch (e) {
        console.warn('Error checking permissions:', e);
      }

      let base64Data;
      if (blob) {
        base64Data = await blobToBase64(blob);
      } else if (typeof data === 'string') {
        base64Data = btoa(unescape(encodeURIComponent(data)));
      } else {
        base64Data = data;
      }

      // Android 10+ usa External (Downloads) en lugar de Documents
      const path = `${filename}`;
      const result = await Filesystem.writeFile({
        path,
        data: base64Data,
        directory: Directory.External,
        recursive: true,
      });

      // Informar al usuario que se guardó
      alert(`✅ Archivo descargado: ${filename}\nGuardado en tu carpeta de documentos.`);

      // Opcionalmente, permitir compartir/abrir
      try {
        await Share.share({
          title: filename,
          text: `Abrir archivo generado: ${filename}`,
          url: result.uri,
          dialogTitle: '¿Qué deseas hacer con el archivo?',
        });
      } catch (shareError) {
        console.log('Share cancelled:', shareError);
      }

      return { success: true, uri: result.uri };
    } catch (error) {
      alert('❌ Error: ' + error.message);
      throw error;
    }
  } else {
    // Web: descarga normal
    if (blob) {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
    return { success: true };
  }
}

/**
 * Convierte Blob a Base64
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Guarda PDF desde jsPDF
 */
export async function savePDF(doc, filename) {
  const isNative = Capacitor.isNativePlatform();
  
  if (isNative) {
    try {
      // Solicitar permisos
      try {
        const status = await Filesystem.checkPermissions();
        if (status.publicStorage !== 'granted') {
          await Filesystem.requestPermissions();
        }
      } catch (e) {
        console.warn('Error checking permissions:', e);
      }

      // Obtener PDF como base64
      const pdfData = doc.output('datauristring');
      const base64 = pdfData.split(',')[1];
      
      // Android 10+ usa External (Downloads)
      const path = `${filename}`;
      const result = await Filesystem.writeFile({
        path,
        data: base64,
        directory: Directory.External,
        recursive: true,
      });

      alert(`✅ PDF descargado: ${filename}\nGuardado en tu carpeta de documentos.`);

      try {
        await Share.share({
          title: filename,
          text: `Abrir PDF generado: ${filename}`,
          url: result.uri,
          dialogTitle: '¿Qué deseas hacer con el PDF?',
        });
      } catch (shareError) {
        console.log('Share cancelled:', shareError);
      }
    } catch (error) {
      alert('❌ Error al generar PDF: ' + error.message);
      throw error;
    }
  } else {
    doc.save(filename);
  }
}

/**
 * Guarda Excel desde XLSX
 */
export async function saveExcel(wb, filename) {
  const isNative = Capacitor.isNativePlatform();
  
  if (isNative) {
    try {
      // Solicitar permisos
      try {
        const status = await Filesystem.checkPermissions();
        if (status.publicStorage !== 'granted') {
          await Filesystem.requestPermissions();
        }
      } catch (e) {
        console.warn('Error checking permissions:', e);
      }

      // Generar Excel como array
      const excelData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelData], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const base64 = await blobToBase64(blob);
      
      // Android 10+ usa External (Downloads)
      const path = `${filename}`;
      const result = await Filesystem.writeFile({
        path,
        data: base64,
        directory: Directory.External,
        recursive: true,
      });

      alert(`✅ Excel descargado: ${filename}\nGuardado en tu carpeta de documentos.`);

      try {
        await Share.share({
          title: filename,
          text: `Abrir Excel generado: ${filename}`,
          url: result.uri,
          dialogTitle: '¿Qué deseas hacer con el Excel?',
        });
      } catch (shareError) {
        console.log('Share cancelled:', shareError);
      }
    } catch (error) {
      alert('❌ Error al generar Excel: ' + error.message);
      throw error;
    }
  } else {
    XLSX.writeFile(wb, filename);
  }
}
