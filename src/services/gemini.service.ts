import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';
import { User, Equipment, Space } from '../models';

export interface DashboardMetrics {
  pendingReservations: number;
  spacesOccupied: number;
  equipmentInUse: number;
  openReports: number;
}

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  
  constructor() {
    // En un entorno de navegador, `process.env` puede no estar disponible.
    // Esta comprobación robusta evita que la aplicación se bloquee si la variable de entorno no está definida,
    // permitiendo que el resto de la aplicación funcione.
    try {
      if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      } else {
        console.warn('La variable de entorno API_KEY no se encontró. Las características de IA estarán deshabilitadas.');
      }
    } catch (error) {
      console.error('Error al inicializar GeminiService:', error);
      // Aseguramos que `ai` es nulo si hay cualquier error.
      this.ai = null;
    }
  }

  async generateDashboardSummary(metrics: DashboardMetrics): Promise<string> {
    if (!this.ai) {
      console.error('GeminiService not initialized. Cannot generate summary.');
      throw new Error('No se pudo generar el resumen de IA.');
    }

    const prompt = `
      Eres un asistente de IA para el administrador de recursos de un campus tecnológico llamado INATEC.
      Tu tono debe ser profesional, conciso y ligeramente positivo.
      Analiza las siguientes métricas del día y genera un resumen en español en un párrafo corto (2-3 frases).
      No uses markdown, negritas, ni ningún formato especial.

      Métricas:
      - Solicitudes de reserva pendientes: ${metrics.pendingReservations}
      - Espacios actualmente ocupados: ${metrics.spacesOccupied}
      - Equipos actualmente en uso: ${metrics.equipmentInUse}
      - Reportes de incidencias abiertos: ${metrics.openReports}
    `;

    try {
      const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error generating summary with Gemini:', error);
      throw new Error('No se pudo generar el resumen de IA.');
    }
  }

  async generateUserAnalysis(users: User[]): Promise<string> {
    if (!this.ai) {
        console.error('GeminiService not initialized. Cannot generate user analysis.');
        throw new Error('No se pudo generar el análisis de usuarios.');
    }

    const adminCount = users.filter(u => u.role === 'Admin').length;
    const docenteCount = users.filter(u => u.role === 'Docente').length;

    const prompt = `
      Eres un asistente de IA para un administrador de sistemas en INATEC.
      Analiza los siguientes datos de usuarios y genera un resumen conciso en español (1-2 frases) sobre la composición del personal.
      Tu tono debe ser informativo y profesional. No uses markdown, negritas, ni ningún formato especial.

      Datos:
      - Número total de usuarios: ${users.length}
      - Administradores: ${adminCount}
      - Docentes: ${docenteCount}
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error generating user analysis with Gemini:', error);
      throw new Error('No se pudo generar el análisis de usuarios.');
    }
  }

  async generateEquipmentRecommendation(query: string, equipmentList: Equipment[]): Promise<{ recommendedEquipmentId: number; justification: string; }> {
    if (!this.ai) {
        console.error('GeminiService not initialized. Cannot generate equipment recommendation.');
        throw new Error('No se pudo obtener la recomendación de IA.');
    }
    
    const simplifiedList = equipmentList.map(e => ({
        id: e.id,
        name: e.name,
        description: e.description,
        status: e.status
    }));

    const prompt = `
        Eres un asistente de TI experto en el campus de INATEC. Un docente necesita una recomendación de equipo.
        Su solicitud es: "${query}".
        
        Analiza la siguiente lista de equipos disponibles y recomienda el MEJOR para la solicitud del docente.
        Solo considera equipos con estado "Disponible".
        Explica brevemente (en una frase) por qué es la mejor opción.
        
        Equipos disponibles:
        ${JSON.stringify(simplifiedList, null, 2)}
    `;

    try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        recommendedEquipmentId: { type: Type.NUMBER, description: "El ID del equipo recomendado." },
                        justification: { type: Type.STRING, description: "Una breve explicación en español de por qué se recomienda este equipo." }
                    },
                    required: ['recommendedEquipmentId', 'justification']
                }
            }
        });
        
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as { recommendedEquipmentId: number; justification: string; };

    } catch (error) {
        console.error('Error getting equipment recommendation from Gemini:', error);
        throw new Error('No se pudo obtener la recomendación de IA.');
    }
  }

  async generateSpaceAvailabilitySummary(space: Space, availability: { date: Date; reservations: any[] }[]): Promise<string> {
    if (!this.ai) {
        console.error('GeminiService not initialized. Cannot generate space summary.');
        throw new Error('No se pudo generar el análisis del espacio.');
    }

    const availabilitySummary = availability.map(day => {
        const date = day.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' });
        const reservationCount = day.reservations.length;
        return `${date}: ${reservationCount > 0 ? `${reservationCount} reserva(s)` : 'totalmente disponible'}`;
    }).join('\n');

    const prompt = `
        Eres un asistente de IA para un docente en el campus INATEC.
        Resume la siguiente información sobre un espacio en un párrafo corto y amigable (2-3 frases).
        Menciona sus características clave y su disponibilidad general para la próxima semana.
        Tu tono debe ser útil e informativo. No uses markdown.

        Información del Espacio:
        - Nombre: ${space.name}
        - Tipo: ${space.spaceTypeId === 1 ? 'Laboratorio' : space.spaceTypeId === 2 ? 'Aula' : 'Auditorio'}
        - Capacidad: ${space.capacity} personas
        - Descripción: ${space.description}

        Disponibilidad de la semana:
        ${availabilitySummary}
    `;

    try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text.trim();
    } catch (error) {
        console.error('Error generating space summary from Gemini:', error);
        throw new Error('No se pudo generar el análisis del espacio.');
    }
  }
}
