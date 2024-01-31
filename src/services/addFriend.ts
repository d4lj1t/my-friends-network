import {baseApiUrl} from '@/app/constants';

type ErrorResponse = {
	error: string;
};

export const addFriend = async (personId: string) => {
	try {
		const res = await fetch(`${baseApiUrl}/api/people/addFriend`, {
			method: 'POST',
			headers: {
				'Content-type': 'application/json',
			},
			body: JSON.stringify({personId}),
		})

		if (!res.ok) {
			throw new Error(`HTTP error! Status: ${res.status}`);
		}

		return await res.json();
	} catch (error) {
		console.error('Error adding friend:', error);
		const errorMessage = error instanceof Error && error.message ? error.message : 'Failed to add friend';
		const errorResponse: ErrorResponse = {error: errorMessage};

		return errorResponse;
	}
};
