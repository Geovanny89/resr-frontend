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
      let base64Data;
      if (blob) {
        base64Data = await blobToBase64(blob);
      } else if (typeof data === 'string') {
        base64Data = btoa(unescape(encodeURIComponent(data)));
      } else {
        base64Data = data;
      }

      // Guardar en la carpeta de la App y luego notificar/compartir
      const path = `${filename}`;
      const result = await Filesystem.writeFile({
        path,
        data: base64Data,
        directory: Directory.Cache, // Usar Cache es más confiable para compartir
      });

      // Intentar compartir el archivo (esto permite al usuario guardarlo donde quiera)
      try {
        await Share.share({
          title: filename,
          text: `Archivo generado: ${filename}`,
          url: result.uri, // Compartir el URI del archivo guardado
          dialogTitle: 'Abrir o Guardar archivo',
        });
      } catch (shareError) {
        console.log('Share cancelled:', shareError);
      }

      return { success: true, uri: result.uri };
    } catch (error) {
      console.error('Error guardando archivo:', error);
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
      
      const path = `${filename}`;
      const result = await Filesystem.writeFile({
        path,
        data: base64,
        directory: Directory.Cache,
      });

      try {
        await Share.share({
          title: filename,
          text: `PDF generado: ${filename}`,
          url: result.uri,
          dialogTitle: 'Abrir o Guardar PDF',
        });
      } catch (shareError) {
        console.log('Share cancelled:', shareError);
      }
    } catch (error) {
      console.error('[savePDF] Error:', error);
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
      
      const path = `${filename}`;
      const result = await Filesystem.writeFile({
        path,
        data: base64,
        directory: Directory.Cache,
      });

      try {
        await Share.share({
          title: filename,
          text: `Excel generado: ${filename}`,
          url: result.uri,
          dialogTitle: 'Abrir o Guardar Excel',
        });
      } catch (shareError) {
        console.log('Share cancelled:', shareError);
      }
    } catch (error) {
      console.error('[saveExcel] Error:', error);
      alert('❌ Error al generar Excel: ' + error.message);
      throw error;
    }
  } else {
    XLSX.writeFile(wb, filename);
  }
}
