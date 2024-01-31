import { type NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { type Person } from '@/app/types';
import PeopleModel from '@/app/models/people';

export async function POST(request: NextRequest) {
	try {
		const session = await getSession();

		if (!session?.accessToken || !session.user) {
			console.log('Invalid or missing access token or user in the session');
			return NextResponse.json(
				{ error: 'Invalid or missing access token or user in the session' },
				{ status: 401 }
			);
		}

		const userId = session.user.sub as string;

		const { personId } = await request.json() as { personId: string };

		try {
			const person = await PeopleModel.findOne(
				{ people: { $elemMatch: { id: userId } } },
				{ 'people.$': 1 }
			).lean() as Person;

			if (!person) {
				return NextResponse.json({ error: 'Person not found' }, { status: 404 });
			}

			if (person) {
				await PeopleModel.updateOne(
					{ "people.id": userId },
					{ $push: { "people.$.friends": personId } }
				);
			}

			return NextResponse.json({message: 'friend added'}, {status: 201});

		} catch (error) {
			console.error('Error adding friend', error);

			const errorMessage =
				error instanceof Error && error.message
					? error.message
					: 'Failed to add friend';

			return NextResponse.json({ error: errorMessage }, { status: 500 });
		}
	} catch (error) {
		console.error('Failed to add friend', error);

		const errorMessage = error instanceof Error && error.message ? error.message : 'Failed to add friend';

		return NextResponse.json({error: errorMessage}, {status: 500});
	}
}
