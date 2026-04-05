import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import * as XLSX from 'xlsx';

/**
 * Obtiene el directorio apropiado según la plataforma
 * Usamos Cache que es el directorio más seguro y compatible para generar 
 * archivos que luego se van a compartir o abrir sin problemas de permisos.
 */
function getSaveDirectory() {
  return Directory.Cache;
}

/**
 * Comparte el archivo después de guardarlo (mejor UX en móvil)
 */
async function shareFile(uri, filename) {
  try {
    await Share.share({
      title: filename,
      text: `Archivo: ${filename}`,
      url: uri,
      dialogTitle: 'Compartir archivo',
    });
  } catch (e) {
    // El usuario puede haber cancelado, no es error grave
    console.log('Share cancelled or failed:', e);
  }
}

/**
 * Guarda archivo en dispositivo (para APK)
 * o descarga normal (para web)
 */
export async function saveFile({ filename, data, contentType, blob }) {
  const isNative = Capacitor.isNativePlatform();
  
  if (isNative) {
    try {
      let base64Data;
      if (blob) {
        base64Data = await blobToBase64(blob);
      } else if (typeof data === 'string') {
        base64Data = btoa(unescape(encodeURIComponent(data)));
      } else {
        base64Data = data;
      }

      // Usar directorio Cache que NO requiere permisos y es compatible con Share
      const saveDir = getSaveDirectory();
      const path = filename; // Guardar directo en la raíz de Cache para evitar mkdir
      
      const result = await Filesystem.writeFile({
        path,
        data: base64Data,
        directory: saveDir,
        encoding: Encoding.Base64, // IMPORTANTE: Especificar encoding
      });

      const fileUri = await Filesystem.getUri({
        path,
        directory: saveDir,
      });

      // El archivo ya está listo para ser compartido o guardado por el usuario
      await shareFile(fileUri.uri, filename);

      return { success: true, uri: result.uri, path: result.path };
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
      // Obtener PDF como base64
      const pdfData = doc.output('datauristring');
      const base64 = pdfData.split(',')[1];
      
      // Usar directorio Cache que NO requiere permisos y es compatible con Share
      const saveDir = getSaveDirectory();
      const path = filename; // Guardar directo en la raíz de Cache para evitar mkdir
      
      const result = await Filesystem.writeFile({
        path,
        data: base64,
        directory: saveDir,
        encoding: Encoding.Base64,
      });

      const fileUri = await Filesystem.getUri({
        path,
        directory: saveDir,
      });

      // El archivo ya está listo para ser compartido o guardado por el usuario
      await shareFile(fileUri.uri, filename);
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
      // Generar Excel como array
      const excelData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelData], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const base64 = await blobToBase64(blob);
      
      // Usar directorio Cache que NO requiere permisos y es compatible con Share
      const saveDir = getSaveDirectory();
      const path = filename; // Guardar directo en la raíz de Cache para evitar mkdir
      
      const result = await Filesystem.writeFile({
        path,
        data: base64,
        directory: saveDir,
        encoding: Encoding.Base64,
      });

      const fileUri = await Filesystem.getUri({
        path,
        directory: saveDir,
      });

      // El archivo ya está listo para ser compartido o guardado por el usuario
      await shareFile(fileUri.uri, filename);

      return { success: true, uri: result.uri, path: result.path };
    } catch (error) {
      alert('❌ Error al generar Excel: ' + error.message);
      throw error;
    }
  } else {
    XLSX.writeFile(wb, filename);
  }
}
