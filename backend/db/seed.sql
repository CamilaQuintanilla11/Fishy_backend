INSERT IGNORE INTO rol (id, nombre, gatename) VALUES
  (UUID(), 'admin', 'admin_gate'),
  (UUID(), 'usuario', 'user_gate');

INSERT IGNORE INTO estado (id, nombre) VALUES
  (UUID(), 'pendiente'),
  (UUID(), 'aprobado'),
  (UUID(), 'rechazado');

INSERT IGNORE INTO categoria (id, nombre) VALUES
  (UUID(), 'Recientes'),
  (UUID(), 'SMS'),
  (UUID(), 'URL'),
  (UUID(), 'Email'),
  (UUID(), 'Otros');

INSERT IGNORE INTO riesgo (id, nombre) VALUES
  (UUID(), 'Alto'),
  (UUID(), 'Bajo'),
  (UUID(), 'Medio');
  

INSERT INTO lecturas (id, titulo, contenido, orden) VALUES
(UUID(), 'Qué es una estafa digital',
  'Una estafa digital ocurre cuando alguien utiliza internet, aplicaciones o dispositivos electrónicos para engañar a una persona y obtener dinero, información personal o acceso a sus cuentas. Los estafadores pueden hacerse pasar por bancos, tiendas, empresas o personas conocidas. Para protegerte, desconfía de ofertas demasiado buenas, solicitudes inesperadas de dinero y mensajes que te presionen para actuar rápidamente. Antes de compartir información o realizar un pago, verifica que la fuente sea legítima.',
  1),
(UUID(), 'Phishing: correos y enlaces falsos',
  'El phishing es una técnica en la que los estafadores envían correos o mensajes que parecen provenir de organizaciones legítimas para robar contraseñas o datos bancarios. Suelen incluir enlaces a páginas falsas y advertencias urgentes sobre supuestos problemas con tu cuenta. Antes de abrir un enlace, revisa cuidadosamente la dirección del remitente y el sitio web. Evita ingresar tus datos desde enlaces inesperados y accede a tus cuentas escribiendo directamente la dirección oficial en tu navegador.',
  2),
(UUID(), 'Fraudes por mensaje (SMS y WhatsApp)',
  'Los fraudes por SMS y WhatsApp utilizan mensajes que pueden anunciar premios falsos, entregas pendientes, bloqueos de cuentas o supuestas emergencias de familiares. En ocasiones, los estafadores se hacen pasar por alguien conocido y solicitan dinero con urgencia. No compartas códigos de verificación, contraseñas ni información bancaria por mensaje. Si recibes una solicitud sospechosa, contacta a la persona o empresa por otro medio para confirmar que sea real. No abras enlaces ni descargues archivos de remitentes desconocidos.',
  3),
(UUID(), 'Qué hacer si ya caíste', 'Si crees que fuiste víctima de una estafa digital, actúa lo antes posible. Si compartiste datos bancarios o realizaste un pago, contacta a tu banco mediante sus canales oficiales para reportarlo y proteger tus cuentas. Cambia las contraseñas comprometidas y activa la autenticación de dos factores. Si compartiste un código de verificación, revisa la seguridad de la cuenta afectada. Guarda capturas de pantalla, mensajes y comprobantes como evidencia. También puedes reportar el incidente ante las autoridades correspondientes. Recuerda: pedir ayuda rápidamente puede reducir los daños y no tienes por qué sentir vergüenza por haber sido engañado.',
  4);