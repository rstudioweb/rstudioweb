/**
 * Model Domain Index
 * Barrel export for domain layer
 * Using Firestore implementation
 */

export * from './types';
export * from './schemas';
export {
	fetchAllModels,
	addModel,
	updateModel,
	deleteModel,
} from './firestore-services';
