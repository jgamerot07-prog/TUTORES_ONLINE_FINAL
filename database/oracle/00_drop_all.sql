-- =====================================================================
-- Tutores On-Line | Script de limpieza (OPCIONAL)
-- Elimina todos los objetos del modelo si ya existian de una corrida previa.
-- Ejecutar SOLO si necesitas reiniciar el esquema desde cero.
-- =====================================================================

BEGIN
   FOR t IN (
      SELECT table_name FROM user_tables
      WHERE table_name IN (
         'NOTIFICACIONES', 'CALIFICACIONES', 'RESERVAS', 'DISPONIBILIDAD',
         'TUTOR_MATERIAS', 'MATERIAS', 'TUTORES', 'ESTUDIANTES', 'USUARIOS'
      )
   ) LOOP
      EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS PURGE';
   END LOOP;
END;
/
