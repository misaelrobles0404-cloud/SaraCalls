# 🧠 Guía de Memoria de IA: Cómo Sara Reconoce a tus Clientes

Esta guía explica el funcionamiento técnico y conceptual de la "Memoria" de Sara, permitiéndole ofrecer una experiencia ultra-personalizada y humana.

## 1. ¿Qué es la Memoria de Sara?
A diferencia de los asistentes de voz tradicionales, Sara no empieza cada llamada desde cero. Su memoria se divide en dos capas principales:

### A. Memoria de Corto Plazo (Contexto de Llamada)
Sara mantiene el hilo de la conversación actual. Si un cliente dice "Ese plato que mencionaste", Sara sabe exactamente a qué plato se refiere mediante el análisis sintáctico en tiempo real de **Retell AI**.

### B. Memoria de Largo Plazo (Persistencia en Base de Datos)
Aquí es donde ocurre la magia. Sara utiliza tu base de datos en **Supabase** para:
- **Identificar al Cliente**: Cruzando el número de teléfono entrante con la tabla `leads` o `clients`.
- **Historial de Interacciones**: Sara puede saber si es la primera vez que llaman o si son clientes frecuentes.
- **Preferencias**: Si el cliente ya ha pedido antes, Sara puede sugerir "lo de siempre".

## 2. Cómo se implementa técnicamente

### Flujo de Datos
1. **Llamada Entrante**: El webhook de Retell AI captura el `from_number`.
2. **Búsqueda**: Se realiza una consulta automática a la tabla `leads`.
3. **Inyección de Prompt**: Si el cliente existe, el sistema inyecta una variable al prompt de Sara:
   > *"Estás hablando con Juan Pérez, es un cliente frecuente que prefiere su corte degradado."*
4. **Respuesta**: Sara saluda: *"¡Hola Juan! Qué bueno escucharte otra vez, ¿te agendamos el mismo corte de la última vez?"*

## 3. Configuración para el Usuario
Para que la memoria funcione correctamente, asegúrate de:
1. Tener configurado el **Webhook URL** en el dashboard.
2. Mantener actualizada la tabla de **Leads** (Sara lo hace automáticamente al final de cada llamada exitosa).
3. Configurar los `Custom Tools` en la consola de Retell AI para "Buscar Cliente".

---
> [!TIP]
> Una IA que recuerda es una IA que vende. El 70% de los clientes prefieren servicios que demuestran conocer su historial.
