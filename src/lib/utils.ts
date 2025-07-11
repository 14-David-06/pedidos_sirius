import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatPriority(priority: string) {
  const priorities = {
    alta: 'Alta',
    media: 'Media',
    baja: 'Baja',
  };
  return priorities[priority as keyof typeof priorities] || priority;
}

export function formatStatus(status: string) {
  const statuses = {
    pendiente: 'Pendiente',
    aprobado: 'Aprobado',
    rechazado: 'Rechazado',
    en_proceso: 'En Proceso',
    completado: 'Completado',
  };
  return statuses[status as keyof typeof statuses] || status;
}

export function getStatusColor(status: string) {
  const colors = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    aprobado: 'bg-green-100 text-green-800',
    rechazado: 'bg-red-100 text-red-800',
    en_proceso: 'bg-blue-100 text-blue-800',
    completado: 'bg-gray-100 text-gray-800',
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}

export function getPriorityColor(priority: string) {
  const colors = {
    alta: 'bg-red-100 text-red-800',
    media: 'bg-yellow-100 text-yellow-800',
    baja: 'bg-green-100 text-green-800',
  };
  return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}
