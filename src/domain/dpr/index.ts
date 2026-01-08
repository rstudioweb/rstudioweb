/**
 * DPR Domain Index
 * Barrel export for domain layer
 * Using Firestore implementation
 */

export * from './types';
export { fetchAllDPR, addDPR, updateDPR, deleteDPR } from './firestore-services';
