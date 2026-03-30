# APKs Generadas

Esta carpeta contiene las APKs generadas del sistema KDice Reservas.

## APK Global

- **Archivo**: `kdice-reservas.apk`
- **Nombre**: KDice Reservas
- **ID**: com.kdice.reservas
- **Tipo**: Universal (para todos los negocios)

## Características

- ✅ Logo personalizado (calendario con mano)
- ✅ Abre directamente en login
- ✅ Global para todos los negocios
- ✅ Colores naranja/rosa/morado
- ✅ Sistema de gestión de citas

## Instalación

1. Descarga el archivo APK
2. Transfiérelo a tu teléfono Android
3. Habilita "Fuentes desconocidas" en Ajustes > Seguridad
4. Instala el APK
5. Inicia sesión con tus credenciales de negocio

## Flujo de Usuario

1. **Instalación**: La app se instala como "KDice Reservas"
2. **Apertura**: Muestra login con logo circular
3. **Acceso**: Ingresa email y contraseña de tu negocio
4. **Dashboard**: Accede al panel de tu negocio específico

## Generación

Para generar una nueva APK:

```bash
npm run apk:global
```

Esto creará la APK en esta carpeta y también en `backend/uploads/`.
