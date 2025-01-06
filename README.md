# Combinador de Horarios UADE

Una aplicación web que ayuda a los estudiantes de UADE a generar todas las combinaciones posibles de horarios para sus materias.

## Características

- Agregar y editar materias con sus horarios disponibles
- Generar todas las combinaciones posibles de horarios
- Marcar combinaciones como favoritas
- Bloquear horarios específicos
- Configurar preferencias:
  - Máximo de materias por día
  - Evitar horarios "sandwich" (clases a la mañana y noche sin clases a la tarde)
- Interfaz moderna y fácil de usar

## Tecnologías

- React 18
- TypeScript
- Tailwind CSS
- Vite
- Lucide Icons

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar linter
npm run lint
```

## Uso

1. Configura tus preferencias (horarios bloqueados, máximo de materias por día, etc.)
2. Agrega tus materias:
   - Ingresa el nombre
   - Selecciona los horarios disponibles en la grilla
   - Confirma la materia
3. Repite el proceso para todas tus materias
4. Haz clic en "Generar Combinaciones"
5. Navega entre las combinaciones y marca tus favoritas

## Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.