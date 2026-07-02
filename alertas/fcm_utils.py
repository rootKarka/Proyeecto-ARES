import os
import logging
import firebase_admin
from firebase_admin import credentials, messaging

logger = logging.getLogger(__name__)

# Intentar inicializar Firebase Admin SDK de manera segura
firebase_initialized = False

try:
    # Verificamos si ya está inicializada la app por defecto
    firebase_admin.get_app()
    firebase_initialized = True
except ValueError:
    try:
        cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            firebase_initialized = True
            logger.info("Firebase Admin SDK inicializado usando certificado.")
        else:
            # Intentar inicialización por defecto (útil si usa credenciales del entorno)
            firebase_admin.initialize_app()
            firebase_initialized = True
            logger.info("Firebase Admin SDK inicializado por defecto.")
    except Exception as e:
        logger.warning(
            f"No se pudo inicializar Firebase Admin SDK (es posible que falten credenciales en Render/Local): {e}. "
            "El flujo de alertas continuará por WebSocket, pero no se enviarán notificaciones Push a FCM."
        )

def enviar_push_alerta(token_push, alerta):
    """
    Envía una notificación push FCM al operador asignado.
    """
    if not token_push:
        logger.warning("No se proporcionó token_push. Omitiendo notificación FCM.")
        return False

    if not firebase_initialized:
        logger.warning("Firebase Admin no está inicializado. Omitiendo envío de FCM.")
        return False

    try:
        # Construir el payload de datos para que MyFirebaseMessagingService en Kotlin lo guarde en Room
        message = messaging.Message(
            data={
                "title": f"🚨 Alerta {alerta.nivel} - {alerta.tipo}",
                "body": alerta.mensaje,
                "nivel": alerta.nivel,
                "tipo": alerta.tipo,
                "valor": str(alerta.valor_detectado),
                "alerta_id": str(alerta.id),
                "mision_id": str(alerta.mision_id or ""),
                "robot_id": str(alerta.robot_id or ""),
            },
            token=token_push,
        )
        
        response = messaging.send(message)
        logger.info(f"Notificación FCM enviada con éxito: {response}")
        return True
    except Exception as e:
        logger.error(f"Error al enviar notificación FCM para la alerta {alerta.id}: {e}")
        return False
