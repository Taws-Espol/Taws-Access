## Escuela Superior Politécnica del Litoral

## Club Taws

## Especi
cación de Requisitos de Software

Sistema de Registro Biométrico y Gestión de Incidencias

Versión

1.1

Fecha

Junio 2026

Estado

Borrador revisado

Con
dencialidad

Uso interno  Club Estudiantil

## Equipo de Desarrollo

Javier Gutierrez

Adrian Fierro

Co-líder

Victor Morales

Andres Saltos

Nahin Cevallos

Melissa Suarez

Líder


## Historial de Revisiones

| Versión Fecha | Descripción | Autor |
| --- | --- | --- |
| 1.0 Mayo 2026 Documento inicial  borrador de |   | Equipo |
|   | requerimientos | completo |
| 1.1 | Junio 2026 Revisión de requisitos: módulo de | Equipo |
|   | limpieza (RF-LIM), módulo de | completo |
|   | incidencias (RF-INC), noticaciones |   |
|   | (RF-NOT) y stack tecnológico |   |
|   | actualizados según feedback del cliente |   |


## Contents


## 1 Introducción

## 1.1 Propósito

El presente documento constituye la Especi
cación de Requisitos de Software (ERS) del Sistema de Registro Biométrico y Gestión de Incidencias, desarrollado para el Club estudiantil de Tecnología TAWS. Su objetivo es describir de manera completa, precisa y veri
cable el comportamiento esperado del sistema, sirviendo como acuerdo formal entre el equipo de desarrollo y los usuarios 
nales.

Este documento está dirigido a los desarrolladores del proyecto, a los directivos del club y a cualquier evaluador académico o técnico que requiera comprender el alcance y las restricciones del sistema.

## 1.2 Alcance

El sistema, denominado internamente SERGI (Sistema de Registro Biométrico y Gestión de Incidencias), es una aplicación web que automatiza el control de acceso al local del club mediante reconocimiento facial. Registra el ingreso y salida de miembros, el inicio y n de cada jornada de limpieza, y el último integrante en abandonar las instalaciones.

Con base en dicho historial, el sistema permite a los directivos identi
car responsables ante incidencias tales como el local en condiciones inadecuadas, equipos dejados encendidos o daños materiales y aplicar sanciones económicas (multas). El ciclo completo de noti
cación se automatiza a través de mensajería instantánea mediante integración con la plataforma WhatsApp Business.

El sistema no incluye, en su versión inicial:

-  Gestión de pagos o cobro en línea de multas.

-  Reconocimiento de voz u otra modalidad biométrica distinta al reconocimiento facial.

-  Integración con sistemas externos a la universidad distintos a la plataforma de mensajería.


## 1.3 De
niciones, acrónimos y abreviaturas

| Término | Denición |
| --- | --- |
| ERS | Especicación de Requisitos de Software |
| SERGI | Sistema de Registro Biométrico y Gestión de Incidencias |
| RF | Requisito Funcional |
| RNF | Requisito No Funcional |
| Embedding facial Representación numérica (vector) del rostro de un usuario, |   |
|   | utilizada para su identicación sin almacenar la imagen original |
| Incidencia | Evento negativo detectado en el local del club tras la salida de |
|   | un miembro o grupo de miembros |
| Multa | Sanción económica aplicada a uno o varios miembros como |
|   | consecuencia de una incidencia conrmada |
| Directivo | Integrante del club con rol de autoridad, facultado para revisar |
|   | historiales y aplicar sanciones |
| Encargado de | Persona responsable de registrar el inicio y n de cada jornada |
| limpieza | de aseo del local |
| WhatsApp | Interfaz de programación provista por Meta para el envío |
| Business API | automatizado de mensajes a través de WhatsApp |

## 1.4 Referencias

-  IEEE Std 830-1998, IEEE Recommended Practice for Software Requirements Speci
cations.

-  Meta Platforms Inc. WhatsApp Business API Documentation, 2024.

-  Jelou Platform  Documentación de integración, 2024.

-  V. Muhler. face-api.js  JavaScript API for Face Recognition in the Browser and Node.js, 2022.

## 1.5 Visión general del documento

El resto del documento se organiza de la siguiente manera: la sección 2 ofrece una descripción general del sistema, incluyendo perspectiva, funciones principales, características de los usuarios y restricciones. Las secciones 3 y 4 detallan los requisitos funcionales y no funcionales, respectivamente. La sección 5 presenta los casos de uso principales. La sección 6 describe el modelo de datos preliminar. La sección 7 propone la arquitectura técnica del sistema. La sección 8 de
ne el plan de desarrollo por fases.


## 2 Descripción General

## 2.1 Perspectiva del producto

El SERGI es un sistema nuevo, desarrollado desde cero, que no forma parte de un sistema mayor preexistente. Interactúa con una cámara IP o webcam instalada en la entrada del local del club, con la base de datos del sistema y con la plataforma de mensajería WhatsApp Business a través de una API externa.

La interfaz de usuario se accede desde cualquier navegador web moderno, sin necesidad de instalar software adicional en los dispositivos de los usuarios 
nales.

## 2.2 Funciones principales del sistema

El sistema provee las siguientes capacidades de alto nivel:

- 1. Registro automático de ingreso y salida de miembros mediante reconocimiento facial.

- 2. Registro del inicio y 
n de jornadas de limpieza por parte del encargado.

- 3. Identi
cación del último miembro en abandonar las instalaciones.

- 4. Gestión de incidencias: creación, asignación de responsables y seguimiento.

- 5. Aplicación y registro de multas por incidencias con
rmadas.

- 6. Envío automático de noti
caciones por WhatsApp a los involucrados.

- 7. Panel de auditoría con historial 
ltrable por fecha, persona y tipo de evento.

## 2.3 Características de los usuarios

| Rol | Descripción | Nivel | Permisos |
| --- | --- | --- | --- |
|   |   | técnico |   |
| Miembro | Integrante del club. Registra su | Básico | Consulta de su |
|   | acceso mediante reconocimiento |   | propio historial y |
|   | facial. |   | multas |
| Directivo | Autoridad del club. Revisa | Intermedio Acceso completo al |   |
|   | historiales, crea incidencias y |   | panel de auditoría |
|   | aplica multas. |   | y gestión de |
|   |   |   | sanciones |
| Encargado de | Persona responsable del aseo. | Básico | Registro de |
| limpieza | Registra inicio y n de jornada. |   | jornadas de |
|   |   |   | limpieza |
| Administrador | Responsable técnico. Gestiona | Avanzado Acceso total al |   |
| del sistema | usuarios, roles y conguración del |   | sistema, |
|   | sistema. |   | incluyendo |
|   |   |   | conguración y |
|   |   |   | respaldos |


## 2.4 Restricciones generales

-  El sistema debe operar en un entorno con conexión a Internet estable para el envío de noti
caciones.

-  El reconocimiento facial requiere iluminación mínima adecuada en la entrada del local.

-  Los datos biométricos (embeddings faciales) deben almacenarse de forma encriptada; no se guardarán imágenes originales de los usuarios.

-  El sistema debe cumplir con la Ley Orgánica de Protección de Datos Personales del Ecuador en cuanto al tratamiento de datos sensibles.

-  El presupuesto de infraestructura está limitado a los recursos disponibles del club; se priorizaron soluciones de bajo costo o de uso libre.

## 2.5 Supuestos y dependencias

-  Se asume que todos los miembros activos del club registraron su rostro en el sistema antes de la puesta en producción.

-  Se asume que el local cuenta con una cámara funcional con campo visual adecuado sobre la entrada.

-  El sistema depende de la disponibilidad de la API de WhatsApp Business.

-  Se asume que los directivos disponen de un dispositivo con navegador web moderno.

-  Se asume que existe un servidor o servicio de alojamiento disponible para la aplicación.


## 3 Requisitos Funcionales

Cada requisito funcional se identi
ca con el pre
jo RF seguido de un código de módulo y un número secuencial. La prioridad se clasi
ca en: Alta (imprescindible para el MVP), Media (importante pero diferible) y Baja (deseable en versiones futuras).

## 3.1 Módulo de Reconocimiento Facial (RF-BIO)

| ID | Descripción | Prioridad |
| --- | --- | --- |
| RF-BIO- | El sistema deberá capturar el rostro del usuario en tiempo | Alta |
| 01 | real utilizando la cámara instalada en la entrada del club. |   |
| RF-BIO- | El sistema deberá comparar el rostro capturado contra | Alta |
| 02 | los embeddings almacenados y determinar la identidad del |   |
|   | usuario con un umbral de similitud congurable. |   |
| RF-BIO- | El sistema deberá registrar automáticamente el evento de | Alta |
| 03 | ingreso o salida una vez identicado el usuario. |   |
| RF-BIO- | El sistema deberá proveer un mecanismo de registro manual | Alta |
| 04 | (código PIN o QR) como contingencia ante fallos de la cámara |   |
|   | o condiciones de iluminación inadecuadas. |   |
| RF-BIO- | El sistema deberá permitir al administrador registrar el | Alta |
| 05 | embedding facial de nuevos miembros desde una interfaz |   |
|   | dedicada. |   |
| RF-BIO- | El sistema deberá noticar al directivo de turno cuando no se | Media |
| 06 | pueda identicar un rostro luego de tres intentos consecutivos. |   |
| RF-BIO- | Los embeddings faciales se almacenarán encriptados; el | Alta |
| 07 | sistema no guardará imágenes de los usuarios. |   |

## 3.2 Módulo de Control de Acceso (RF-ACC)

| ID | Descripción | Prioridad |
| --- | --- | --- |
| RF-ACC- | El sistema deberá registrar la fecha, hora exacta y modalidad | Alta |
| 01 | (facial o manual) de cada evento de ingreso y salida. |   |
| RF-ACC- | El sistema deberá mantener el estado de presencia de cada | Alta |
| 02 | miembro (dentro/fuera del local) en tiempo real. |   |
| RF-ACC- | El sistema deberá registrar automáticamente al último | Alta |
| 03 | miembro en salir del local como responsable de cierre, |   |
|   | guardando una fotografía en ese momento. |   |
| RF-ACC- | El sistema deberá permitir a los directivos consultar en | Media |
| 04 | tiempo real quiénes se encuentran dentro del local. |   |
| RF-ACC- | El sistema deberá generar una alerta si un miembro lleva | Baja |
| 05 | más de N horas dentro del local sin registrar salida (N |   |
|   | congurable). |   |


## 3.3 Módulo de Registro de Limpieza (RF-LIM)

| ID | Descripción | Prioridad |
| --- | --- | --- |
| RF-LIM- | El sistema deberá seleccionar automáticamente 5 miembros | Alta |
| 01 | aleatorios del club y asignarles la tarea de limpieza, |   |
|   | noticándoles por WhatsApp. |   |
| RF-LIM- | Cada miembro asignado deberá poder ingresar a la | Alta |
| 02 | plataforma y registrar la hora en que realizó la limpieza y |   |
|   | una fotografía de evidencia. |   |
| RF-LIM- | El sistema deberá almacenar el nombre del encargado | Alta |
| 03 | responsable, la hora de registro y la fotografía de evidencia |   |
|   | de cada jornada de limpieza. |   |
| RF-LIM- | El sistema deberá mostrar en el panel de auditoría el historial | Media |
| 04 | completo de jornadas de limpieza, ltrable por fecha y |   |
|   | encargado. |   |

## 3.4 Módulo de Gestión de Incidencias (RF-INC)

| ID | Descripción | Prioridad |
| --- | --- | --- |
| RF-INC- | El sistema deberá registrar automáticamente a la última | Alta |
| 01 | persona (o últimos 3) en salir del local, guardando una |   |
|   | fotografía en ese momento. |   |
| RF-INC- | Como directivo, se podrá acceder al último registro de cierre | Alta |
| 02 | (foto + miembro) en caso de detectar una incidencia. |   |
| RF-INC- | El sistema deberá permitir a un directivo crear una incidencia | Alta |
| 03 | indicando tipo, descripción y fecha. |   |
| RF-INC- | Los tipos de incidencia predenidos incluyen: local sucio, | Alta |
| 04 | equipo encendido, daño material y acceso no autorizado. |   |


## 3.5 Módulo de Noti
caciones (RF-NOT)

| ID | Descripción | Prioridad |
| --- | --- | --- |
| RF-NOT- | El sistema deberá enviar una noticación automática por | Alta |
| 01 | WhatsApp al miembro identicado como responsable de una |   |
|   | incidencia. |   |
| RF-NOT- | El sistema deberá noticar al directivo correspondiente | Alta |
| 02 | cuando se registre una nueva incidencia. |   |
| RF-NOT- | El sistema deberá noticar a los 5 miembros seleccionados | Alta |
| 03 | para la jornada de limpieza, indicando la tarea asignada. |   |
| RF-NOT- | El sistema deberá registrar el estado de cada noticación | Media |
| 04 | enviada (enviado, entregado, fallido). |   |
| RF-NOT- | El sistema deberá reintentar el envío de una noticación | Baja |
| 05 | fallida hasta tres veces con intervalo de cinco minutos. |   |

## 3.6 Módulo de Auditoría e Historial (RF-AUD)

| ID | Descripción | Prioridad |
| --- | --- | --- |
| RF-AUD- | El sistema deberá proveer un panel de auditoría accesible | Alta |
| 01 | únicamente para directivos y administradores. |   |
| RF-AUD- | El panel deberá permitir ltrar eventos por rango de fecha, | Alta |
| 02 | miembro, tipo de evento e incidencia. |   |
| RF-AUD- | El sistema deberá exportar el historial de eventos en formato | Media |
| 03 | CSV. |   |
| RF-AUD- | El sistema deberá conservar los registros de acceso por un | Alta |
| 04 | periodo mínimo de doce meses. |   |
| RF-AUD- | El sistema deberá registrar en una bitácora cada acción | Media |
| 05 | realizada por usuarios con rol de directivo o administrador. |   |


## 4 Requisitos No Funcionales

## 4.1 Rendimiento

-  RNF-REN-01: El tiempo de identi
cación facial desde la captura hasta el registro del evento no deberá superar los 15 segundos en condiciones normales de red y hardware.

-  RNF-REN-02: El sistema deberá soportar al menos 20 usuarios concurrentes sin degradación perceptible del servicio.

## 4.2 Disponibilidad y con
abilidad

-  RNF-DIS-01: El sistema deberá tener una disponibilidad mínima del 95% mensual, excluyendo ventanas de mantenimiento programado o periodos vacacionales de la universidad.

-  RNF-DIS-02: Ante la pérdida de conexión a Internet, el sistema deberá habilitar automáticamente el modo de contingencia (registro por PIN o QR) y sincronizar los datos pendientes al restablecer la conectividad.

-  RNF-DIS-03: El sistema deberá realizar respaldos automáticos de la base de datos con una frecuencia mínima diaria.

## 4.3 Seguridad y privacidad

-  RNF-SEG-01: La comunicación entre el cliente y el servidor se realizará exclusivamente a través de HTTPS (TLS 1.2 o superior).

-  RNF-SEG-02: El acceso a cada módulo estará controlado por un sistema de roles y permisos; ningún usuario podrá acceder a funcionalidades fuera de su rol asignado.

-  RNF-SEG-04: El sistema no almacenará imágenes de rostros; únicamente el embedding encriptado derivado de ellas.

## 4.4 Usabilidad

-  RNF-USA-01: La interfaz de registro de acceso deberá ser operativa sin interacción del usuario.

-  RNF-USA-02: El panel de auditoría deberá ser navegable por un directivo sin capacitación técnica previa, con un tiempo de aprendizaje estimado inferior a 30 minutos.

-  RNF-USA-03: El sistema deberá ser responsive y funcionar correctamente en dispositivos móviles con resolución mínima de 360 × 640 píxeles.

## 4.5 Mantenibilidad y escalabilidad

-  RNF-MAN-01: El código fuente deberá seguir una arquitectura por capas (presentación, lógica de negocio, acceso a datos) para facilitar el mantenimiento y la incorporación de nuevos módulos.


-  RNF-MAN-02: El sistema deberá estar documentado con comentarios de código y un manual técnico de despliegue.

-  RNF-ESC-01: La arquitectura deberá permitir escalar horizontalmente el servicio de reconocimiento facial sin rediseño mayor.


## 5 Casos de Uso Principales

Se describen a continuación los casos de uso de mayor relevancia para el sistema.

## 5.1 CU-01: Registro de ingreso por reconocimiento facial

| Campo | Descripción |
| --- | --- |
| Identicador | CU-01 |
| Nombre | Registro de ingreso por reconocimiento facial |
| Actor principal Miembro del club |   |
| Objetivo | Permitir el registro automático del ingreso de un miembro |
|   | mediante reconocimiento facial. |
| Precondición | El miembro tiene su embedding facial registrado en el sistema. |
|   | La cámara se encuentra operativa. |
| Flujo principal | 1. El miembro se posiciona frente a la cámara de acceso. |
|   | 2. El sistema captura un fotograma del rostro. |
|   | 3. El sistema procesa la imagen y genera el embedding facial. |
|   | 4. El sistema compara el embedding generado con los embeddings |
|   | almacenados. |
|   | 5. El sistema identica al miembro cuando la similitud supera el |
|   | umbral congurado. |
|   | 6. El sistema registra el evento de ingreso con fecha, hora y |
|   | modalidad de acceso. |
|   | 7. El sistema actualiza el estado de presencia del miembro a |
|   | dentro del local. |
|   | 8. El sistema muestra una conrmación visual del registro exitoso. |
| Flujo alternativo | 4a. Si la similitud facial no supera el umbral, el sistema solicita |
|   | un nuevo intento de reconocimiento. |
|   | 4b. Si se producen tres intentos fallidos consecutivos, el sistema |
|   | habilita el modo de contingencia mediante PIN o código QR. |
|   | 4c. Si la cámara no se encuentra disponible, el sistema activa |
|   | automáticamente el modo de contingencia. |
| Postcondición | El evento de ingreso queda almacenado en el historial de accesos. |
|   | El estado de presencia del miembro queda actualizado. La |
|   | bitácora de auditoría registra la operación realizada. |
| Prioridad | Alta |


## 5.2 CU-02: Aplicación de multa por incidencia

| Campo | Descripción |
| --- | --- |
| Identicador | CU-02 |
| Nombre | Aplicación de multa por incidencia |
| Actor principal Directivo |   |
| Objetivo | Permitir al directivo registrar una multa asociada a una incidencia |
|   | y noticar automáticamente al miembro sancionado. |
| Precondición | Existe una incidencia previamente registrada en el sistema. La |
|   | incidencia posee al menos un responsable asignado o sugerido. El |
|   | directivo se encuentra autenticado en el sistema. |
| Flujo principal | 1. El directivo accede al módulo de incidencias. |
|   | 2. El sistema muestra el listado de incidencias registradas. |
|   | 3. El directivo selecciona la incidencia correspondiente. |
|   | 4. El sistema muestra la información de la incidencia, el historial |
|   | de accesos y el responsable de cierre sugerido. |
|   | 5. El directivo conrma o modica la asignación de |
|   | responsabilidad. |
|   | 6. El directivo ingresa el monto y la descripción de la multa. |
|   | 7. El sistema registra la multa asociada al miembro responsable. |
|   | 8. El sistema actualiza el estado de la incidencia. |
|   | 9. El sistema genera y envía automáticamente una noticación |
|   | por WhatsApp al miembro sancionado. |
| Flujo alternativo | 5a. El directivo puede asignar la responsabilidad a múltiples |
|   | miembros relacionados con la incidencia. |
|   | 9a. Si el envío de la noticación falla, el sistema reintentará el |
|   | envío hasta tres veces con intervalos congurados. |
|   | 9b. Si todos los intentos fallan, el sistema registrará el evento en |
|   | la bitácora de auditoría con estado fallido. |
| Postcondición | La multa queda registrada en el historial disciplinario del |
|   | miembro. La incidencia queda actualizada con la información |
|   | de la sanción aplicada. El estado de la noticación queda |
|   | almacenado en el sistema. |
| Prioridad | Alta |


## 5.3 CU-03: Consulta del panel de auditoría

| Campo | Descripción |
| --- | --- |
| Identicador | CU-03 |
| Nombre | Consulta del panel de auditoría |
| Actor principal Directivo / Administrador |   |
| Objetivo | Permitir a usuarios autorizados consultar y exportar el historial |
|   | de eventos registrados por el sistema. |
| Precondición | El usuario ha iniciado sesión en el sistema. El usuario posee |
|   | permisos de acceso al módulo de auditoría. |
| Flujo principal | 1. El usuario accede al panel de auditoría. |
|   | 2. El sistema muestra las opciones de ltrado disponibles. |
|   | 3. El usuario selecciona los ltros deseados (rango de fechas, |
|   | miembro, tipo de evento o incidencia). |
|   | 4. El sistema recupera los registros correspondientes. |
|   | 5. El sistema muestra los resultados en orden cronológico |
|   | descendente. |
|   | 6. El usuario selecciona un registro para visualizar su detalle. |
|   | 7. Opcionalmente, el usuario solicita la exportación de los |
|   | resultados. |
|   | 8. El sistema genera y descarga el archivo en formato CSV. |
| Flujo alternativo | 4a. Si no existen registros para los ltros seleccionados, el sistema |
|   | muestra un mensaje informativo indicando que no se encontraron |
|   | resultados. |
|   | 8a. Si ocurre un error durante la generación del archivo CSV, el |
|   | sistema notica el fallo al usuario. |
| Postcondición | El usuario visualiza el historial solicitado. Si se realizó una |
|   | exportación, el archivo CSV queda disponible para descarga. |
| Prioridad | Alta |


## 6 Modelo de Datos Preliminar

Se describen a continuación las entidades principales del sistema con sus atributos clave. El diagrama entidad-relación completo se presenta en el Anexo B.

## 6.1 Entidades principales

Todas las entidades del sistema incluirán campos de auditoría (status, created_at, created_by, updated_at, updated_by) para mantener trazabilidad sobre la creación y modi
cación de los registros.


| Entidad | Atributos principales Descripción |   |
| --- | --- | --- |
| Miembro | id, nombre, apellido, | Representa a cualquier integrante |
|   | correo, telefono, | del club con acceso al sistema. |
|   | rol_id, estado, |   |
|   | embedding_encriptado, |   |
|   | fecha_registro |   |
| Rol | id, nombre, descripcion | Dene los roles y niveles de acceso |
|   |   | disponibles dentro del sistema. |
| EventoAcceso | id, miembro_id, tipo, | Registro atómico de cada ingreso o |
|   | modalidad, | salida del local. |
|   | hora_ingreso, |   |
|   | confianza_facial |   |
| JornadaLimpieza | id, encargado_id, | Registro de cada jornada de aseo |
|   | inicio_timestamp, | realizada en el local. |
|   | fin_timestamp, |   |
|   | observaciones, |   |
|   | evidencia_url |   |
| Incidencia | id, tipo, descripcion, | Evento negativo reportado en el |
|   | evidencia_url, | local del club. |
|   | fecha_deteccion, |   |
|   | directivo_id |   |
| IncidenciaResponsableid, | incidencia_id, | Relaciona una incidencia con uno |
|   | miembro_id, | o varios miembros considerados |
|   | tipo_responsabilidad | responsables o involucrados. |
| Multa | id, incidencia_id, | Sanción económica derivada de una |
|   | miembro_id, monto, | incidencia conrmada. |
|   | descripcion, |   |
|   | fecha_aplicacion, |   |
|   | estado, fecha_pago, |   |
|   | numero_comprobante, |   |
|   | fecha_vencimiento |   |
| Noticación | id, destinatario_id, | Registro de cada mensaje enviado |
|   | tipo, mensaje, canal, | por el sistema. |
|   | timestamp_envio, |   |
|   | intentos |   |
| Apelación | id, multa_id, | Solicitud de revisión de una multa |
|   | miembro_id, | por parte del miembro afectado. |
|   | descripcion, fecha, |   |
|   | respuesta_directivo, |   |
|   | fecha_respuesta, |   |
|   | directivo_respuesta_id |   |
| BitácoraAuditoría | id, usuario_id, accion, | Registro histórico de las acciones |
|   | tabla_afectada, | realizadas por usuarios dentro del |
|   | registro_id, | sistema, con nes de auditoría y |
|   | descripcion | trazabilidad. |


## 7 Arquitectura Técnica Propuesta

## 7.1 Visión general

El sistema sigue una arquitectura de tres capas desacopladas: una capa de presentación (frontend web) , una capa de lógica de negocio (API REST) y una capa de datos (base de datos relacional). El módulo de reconocimiento facial puede ejecutarse en el servidor o en el cliente según las restricciones de hardware disponibles.

## 7.2 Stack tecnológico candidato

| Capa | Tecnología | Justicación |
| --- | --- | --- |
|   | candidata |   |
| Frontend | React + Vite + | Al existir un backend dedicado con |
|   | Shadcn/ui | Node/Express, el frontend actúa como cliente |
|   |   | puro que consume la API REST. React + Vite |
|   |   | ofrece un entorno de desarrollo rápido y una |
|   |   | build optimizada para producción. Shadcn/ui |
|   |   | provee componentes para el dashboard de |
|   |   | directivos sin añadir dependencias pesadas. |
| Backend / API Node.js + Express |   | Stack conocido por todo el grupo, idóneo para |
|   | + TypeScript | gestionar concurrentemente el reconocimiento |
|   |   | facial. TypeScript garantiza la mantenibilidad. |
|   |   | Durante el desarrollo se usa un 2-step build: |
|   |   | primero se hace build del frontend, y después |
|   |   | se sirven estáticamente esos archivos desde |
|   |   | Express. Así se necesita 1 server + 1 db. |
| Reconocimiento | MediaPipe (cliente) | Arquitectura híbrida basada en microservicios: |
| facial | + DeepFace | MediaPipe detecta y recorta el rostro en el |
|   | (servidor) | cliente. DeepFace extrae el embedding y lo |
|   |   | compara en el servidor, ejecútándose como |
|   |   | un microservicio independiente en Python |
|   |   | encapsulado con Docker, el cual se comunicará |
|   |   | con la API principal en Node.js. Esto |
|   |   | garantiza máxima precisión biométrica y |
|   |   | escalabilidad. |
| Base de datos PostgreSQL |   | Herramienta Open-Source, sin límite de |
|   |   | tamaño, compatible con Docker/Linux. |
| Noticaciones API directa de |   | Se usará la API directa de WhatsApp para |
|   | WhatsApp | enviar mensajes. Se reconoce que Jelou |
|   | Business | facilita el trabajo, pero no se necesita más |
|   |   | funcionalidad que el envío de mensajes. |
| Infraestructura Server de Taws + |   | Se usará el servidor propio del club Taws. |
|   | Docker | Los contenedores facilitan el despliegue |
|   |   | reproducible y el escalado horizontal. |


## A Diagrama de Casos de Uso

*Figure 1: Diagrama de casos de uso  Sistema de Gestión de Club*

## Los actores identi
cados son:

-  Miembro del club: Registrar ingreso (incluye Reconocimiento facial; extiende Modo contingencia PIN/QR).

-  Directivo / Administrador: Gestionar incidencias (incluye Registrar multa, Noti
car sanción); Consultar auditoría (incluye Filtrar registros, Exportar reporte CSV).


## B Diagrama Entidad-Relación

*Figure 2: Diagrama Entidad-Relación  SERGI*

Las entidades principales y sus relaciones son las descritas en la Sección 6. Las relaciones clave entre entidades son:

-  Rol → Miembro: un rol agrupa a varios miembros (1:N) .

-  Miembro → EventoAcceso: un miembro genera múltiples eventos (1:N).

-  Miembro → JornadaLimpieza: un miembro puede ser encargado de múltiples jornadas (1:N).

-  Incidencia → IncidenciaResponsable → Miembro: relación N:M entre incidencias y miembros.

-  Incidencia → Multa: una incidencia puede originar múltiples multas (1:N).

-  Multa → Apelación: una multa puede tener una apelación (1:1 opcional).

-  Miembro → Noti
cación: un miembro puede recibir múltiples noti
caciones (1:N).


## C Plantillas de Noti
cación WhatsApp

Las plantillas de mensajes para cada tipo de noti
cación se de
nirán durante la Fase 1 de desarrollo y se documentarán en esta sección. Los tipos de noti
cación previstos son:

-  Noti
cación de nueva incidencia al directivo.

-  Noti
cación de asignación de responsabilidad al miembro.

-  Noti
cación de multa aplicada al miembro (monto, motivo, plazo de pago).

-  Noti
cación de con
rmación de apelación recibida.

-  Noti
cación de resolución de apelación.
