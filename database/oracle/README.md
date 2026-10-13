# Base de datos — Oracle APEX / Oracle SQL

Scripts diseñados para Oracle Database 19c+ (compatibles con Oracle APEX SQL Workshop → SQL Commands / Scripts).

## Orden de ejecución obligatorio

1. `00_drop_all.sql` — (opcional) limpia el esquema si ya existían objetos de una corrida anterior.
2. `01_create_tables.sql` — crea las tablas, claves primarias, claves foráneas y restricciones CHECK.
3. `02_indexes.sql` — crea índices adicionales para columnas de búsqueda/filtrado frecuente.
4. `03_sample_data.sql` — inserta datos de prueba coherentes (usuarios, materias, disponibilidad, reservas, calificaciones).
5. `04_validation_queries.sql` — consultas de verificación (listados, joins, reportes) para comprobar que el modelo funciona.

## Cómo ejecutarlos en Oracle APEX

1. Entra a tu **Workspace** de Oracle APEX → **SQL Workshop** → **SQL Scripts**.
2. Sube o pega el contenido de cada archivo en el orden indicado (botón "Create" → pega el script → "Run").
3. Alternativamente, en **SQL Commands** puedes pegar y ejecutar cada bloque directamente.
4. Verifica en **Object Browser** que las 9 tablas se crearon y que las FK aparecen en el diagrama de "Database Diagram" (Utilities → Database Diagram) o en **App Builder → Data Workshop → ERD**.

> Importante: estos scripts están listos para ejecutarse, pero su ejecución real en una instancia Oracle **está pendiente de que el estudiante los corra en su propio workspace de Oracle APEX**. Esta sesión no tiene credenciales de Oracle y no afirma que la base de datos esté desplegada.

## Resumen del modelo

| Tabla | Responsabilidad |
|---|---|
| `USUARIOS` | Datos comunes de cualquier persona registrada (login, nombre, rol, contacto). Tabla raíz de la jerarquía de roles. |
| `ESTUDIANTES` | Extensión 1-a-1 de `USUARIOS` con atributos propios de un estudiante (nivel educativo, institución). |
| `TUTORES` | Extensión 1-a-1 de `USUARIOS` con atributos propios de un tutor (biografía, tarifa, experiencia, verificación). |
| `MATERIAS` | Catálogo de asignaturas que pueden enseñarse. |
| `TUTOR_MATERIAS` | Relación muchos-a-muchos entre `TUTORES` y `MATERIAS` (especialidades del tutor). |
| `DISPONIBILIDAD` | Franjas horarias que un tutor ofrece, por día de la semana y modalidad. |
| `RESERVAS` | Solicitudes/reservas de tutoría entre un estudiante y un tutor, con estado y modalidad. |
| `CALIFICACIONES` | Reseña y puntuación que un estudiante deja sobre una reserva ya completada. |
| `NOTIFICACIONES` | Avisos dirigidos a un usuario sobre cambios en sus reservas. |

Decisiones de diseño clave:

- Se separó `USUARIOS` de `ESTUDIANTES`/`TUTORES` (en vez de una sola tabla con columnas nulas según el rol) para evitar atributos vacíos, permitir que una misma cuenta pueda tener ambos roles en el futuro y mantener la integridad referencial de `RESERVAS` apuntando siempre a `ESTUDIANTES`/`TUTORES`, nunca directamente a `USUARIOS`.
- Las relaciones muchos-a-muchos (`TUTOR_MATERIAS`) usan tabla puente con clave compuesta para evitar duplicar especialidades.
- Los estados (`RESERVAS.ESTADO`, `USUARIOS.ROL`, etc.) usan `CHECK` en vez de tablas de lookup separadas porque son listas cerradas y estables; así se simplifica el modelo sin perder integridad.
- `CALIFICACIONES` tiene FK única a `RESERVAS` (una calificación por reserva) para impedir calificaciones duplicadas.
- Un índice único parcial (`UQ_RESERVA_TUTOR_HORARIO`) sobre tutor+fecha+hora para las reservas activas previene choques de horario a nivel de base de datos, no solo de aplicación.
