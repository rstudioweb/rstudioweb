/**
 * MPR Domain Index
 * Barrel export for MPR domain layer
 * Using Firestore implementation
 */

export * from './types';
export { fetchAllMPR, addMPR, updateMPR } from './firestore-services';
