import mongoose from 'mongoose';
import { mongoDbUri } from '@/app/constants';

const connectToMongoDb = async () => {
	try {
		if (!mongoDbUri) {
			throw new Error('MongoDB URI is not defined');
		}

		if (mongoose.connection.readyState === 1) {
			console.log('Already connected to MongoDB.');
			return;
		}

		await mongoose.connect(mongoDbUri);

		console.log('Connected to MongoDB.');
	} catch (error) {
		console.error('MongoDB connection error:', (error as Error).message);
	}
};

export default connectToMongoDb;
