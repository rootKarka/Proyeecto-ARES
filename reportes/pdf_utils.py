import io
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image as RLImage
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


def _estilos():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name='TituloARES', fontSize=18, leading=22, spaceAfter=10,
        textColor=colors.HexColor('#1d4ed8'), fontName='Helvetica-Bold'
    ))
    styles.add(ParagraphStyle(
        name='Subtitulo', fontSize=12, leading=16, spaceAfter=8,
        textColor=colors.HexColor('#374151'), fontName='Helvetica-Bold'
    ))
    styles.add(ParagraphStyle(name='TextoNormal', fontSize=10, leading=14))
    return styles


def _tabla_clave_valor(filas, col1=6, col2=10):
    tabla = Table(filas, colWidths=[col1 * cm, col2 * cm])
    tabla.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    return tabla


# ───────────────────────────────────────────────────────────
# PDF: Reporte de Actualización
# ───────────────────────────────────────────────────────────
def generar_pdf_actualizacion(reporte):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2 * cm, bottomMargin=2 * cm)
    styles = _estilos()
    el = []

    el.append(Paragraph("ARES — Reporte de Actualización", styles['TituloARES']))
    el.append(Paragraph(f"Misión: {reporte.mision.nombre}", styles['Subtitulo']))
    el.append(Spacer(1, 0.3 * cm))

    el.append(_tabla_clave_valor([
        ["Nivel de riesgo", reporte.nivel_riesgo.replace('_', ' ')],
        ["Autor", reporte.autor.nombre if reporte.autor else "—"],
        ["Fecha", reporte.created_at.strftime("%d/%m/%Y %H:%M")],
        ["Víctimas rescatadas", str(reporte.victimas_rescatadas)],
        ["Víctimas heridas", str(reporte.victimas_heridas)],
        ["Víctimas fallecidas", str(reporte.victimas_fallecidas)],
        ["Notificación enviada", "Sí" if reporte.notificacion_enviada else "No"],
    ]))
    el.append(Spacer(1, 0.4 * cm))

    el.append(Paragraph("Resumen de la situación", styles['Subtitulo']))
    el.append(Paragraph(reporte.resumen or "—", styles['TextoNormal']))
    el.append(Spacer(1, 0.3 * cm))

    if reporte.accion_recomendada:
        el.append(Paragraph("Acción recomendada", styles['Subtitulo']))
        el.append(Paragraph(reporte.accion_recomendada, styles['TextoNormal']))

    doc.build(el)
    buffer.seek(0)
    return buffer


# ───────────────────────────────────────────────────────────
# PDF: Reporte Final (combina las 3 tablas)
# ───────────────────────────────────────────────────────────
def generar_pdf_final(reporte, evidencias, bitacora):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2 * cm, bottomMargin=2 * cm)
    styles = _estilos()
    el = []

    el.append(Paragraph("ARES — Reporte Final de Misión", styles['TituloARES']))
    el.append(Paragraph(f"Misión: {reporte.mision.nombre}", styles['Subtitulo']))
    el.append(Spacer(1, 0.3 * cm))

    el.append(_tabla_clave_valor([
        ["Estado de generación", reporte.estado_generacion],
        ["Duración (min)", str(reporte.duracion_minutos)],
        ["Tiempo de respuesta (min)", str(reporte.tiempo_respuesta_minutos)],
        ["Nivel de riesgo máximo", reporte.nivel_riesgo_maximo or "—"],
        ["Generado por", reporte.generado_por.nombre if reporte.generado_por else "—"],
        ["Fecha de generación", reporte.created_at.strftime("%d/%m/%Y %H:%M")],
    ]))
    el.append(Spacer(1, 0.4 * cm))

    # Víctimas
    el.append(Paragraph("Víctimas", styles['Subtitulo']))
    tv = Table([
        ["Rescatadas", "Heridas", "Fallecidas", "Sin confirmar"],
        [str(reporte.victimas_rescatadas), str(reporte.victimas_heridas),
         str(reporte.victimas_fallecidas), str(reporte.victimas_sin_confirmar)],
    ], colWidths=[4 * cm] * 4)
    tv.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1d4ed8')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    el.append(tv)
    el.append(Spacer(1, 0.4 * cm))

    # Alertas
    el.append(Paragraph("Alertas y sensores", styles['Subtitulo']))
    el.append(_tabla_clave_valor([
        ["Total de alertas", str(reporte.total_alertas)],
        ["Alertas críticas", str(reporte.alertas_criticas)],
        ["Alertas de advertencia", str(reporte.alertas_advertencia)],
        ["Total de lecturas", str(reporte.total_lecturas)],
    ]))
    el.append(Spacer(1, 0.3 * cm))

    if reporte.resumen_sensores:
        filas = [["Sensor", "Mínimo", "Máximo", "Promedio", "Unidad"]]
        for s in reporte.resumen_sensores:
            filas.append([
                s.get('sensor', ''), str(s.get('min', '')), str(s.get('max', '')),
                str(s.get('promedio', '')), s.get('unidad', '')
            ])
        ts = Table(filas, colWidths=[4 * cm, 3 * cm, 3 * cm, 3 * cm, 3 * cm])
        ts.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1d4ed8')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
            ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        el.append(ts)
        el.append(Spacer(1, 0.4 * cm))

    # Telemetría
    el.append(Paragraph("Telemetría del robot", styles['Subtitulo']))
    el.append(_tabla_clave_valor([
        ["Batería inicio", f"{reporte.bateria_inicio}%"],
        ["Batería fin", f"{reporte.bateria_fin}%"],
        ["Distancia recorrida", f"{reporte.distancia_recorrida_m} m"],
        ["Señal promedio (RSSI)", f"{reporte.promedio_senal_rssi} dBm"],
    ]))
    el.append(Spacer(1, 0.4 * cm))

    # Bitácora
    el.append(Paragraph("Bitácora de la misión", styles['Subtitulo']))
    if bitacora:
        for b in bitacora:
            autor = b.usuario.nombre if b.usuario else "—"
            fecha = b.fecha.strftime("%d/%m %H:%M")
            texto = f"<b>[{b.tipo_entrada}]</b> {fecha} — {autor}: {b.contenido}"
            el.append(Paragraph(texto, styles['TextoNormal']))
            el.append(Spacer(1, 0.15 * cm))
    else:
        el.append(Paragraph("Sin entradas registradas.", styles['TextoNormal']))
    el.append(Spacer(1, 0.4 * cm))

    # Evidencias fotográficas
    el.append(Paragraph("Evidencias fotográficas", styles['Subtitulo']))
    fotos = [e for e in evidencias if e.tipo == 'FOTO' and e.archivo]
    if fotos:
        for foto in fotos:
            try:
                ruta = foto.archivo.path
                if os.path.exists(ruta):
                    el.append(RLImage(ruta, width=10 * cm, height=7 * cm, kind='proportional'))
                    origen = "Robot" if foto.robot else "Operador"
                    pie = f"{origen} — {foto.fecha_captura.strftime('%d/%m %H:%M')} — {foto.descripcion or ''}"
                    el.append(Paragraph(pie, styles['TextoNormal']))
                    el.append(Spacer(1, 0.3 * cm))
            except Exception:
                continue
    else:
        el.append(Paragraph("Sin evidencias fotográficas.", styles['TextoNormal']))

    doc.build(el)
    buffer.seek(0)
    return buffer